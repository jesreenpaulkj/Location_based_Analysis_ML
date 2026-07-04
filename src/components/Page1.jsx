import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Map, { Source, Layer, Popup } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { SlidersHorizontal, MapPin } from 'lucide-react';

export default function Page1({ geoData }) {
  const [minRating, setMinRating] = useState(0.0);
  const [selectedCity, setSelectedCity] = useState('All');
  const [hoverInfo, setHoverInfo] = useState(null);
  const mapRef = useRef(null);

  const cities = useMemo(() => {
    if (!geoData) return [];
    const uniqueCities = new Set(geoData.features.map(f => f.properties.city).filter(Boolean));
    return Array.from(uniqueCities).sort();
  }, [geoData]);

  // Filter data optimally
  const filteredData = useMemo(() => {
    if (!geoData) return null;
    return {
      type: 'FeatureCollection',
      features: geoData.features.filter(f => {
        const matchRating = f.properties.rating >= minRating;
        const matchCity = selectedCity === 'All' || f.properties.city === selectedCity;
        return matchRating && matchCity;
      })
    };
  }, [geoData, minRating, selectedCity]);

  // Layer Configurations
  const clusterLayer = {
    id: 'clusters',
    type: 'circle',
    source: 'restaurants',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': ['step', ['get', 'point_count'], '#00E5FF', 50, '#FFB300', 150, '#F44336'],
      'circle-radius': ['step', ['get', 'point_count'], 15, 50, 20, 150, 25],
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff'
    }
  };

  const clusterCountLayer = {
    id: 'cluster-count',
    type: 'symbol',
    source: 'restaurants',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12
    },
    paint: {
      'text-color': '#1f2937'
    }
  };

  const unclusteredPointLayer = {
    id: 'unclustered-point',
    type: 'circle',
    source: 'restaurants',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#00E5FF',
      'circle-radius': 6,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff'
    }
  };

  const onHover = useCallback(event => {
    const {
      features,
      point: { x, y }
    } = event;
    const hoveredFeature = features && features[0];

    // if clustered, we might not have properties for hover popup in a simple way
    if (hoveredFeature && hoveredFeature.properties && !hoveredFeature.properties.cluster) {
      setHoverInfo({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
        feature: hoveredFeature
      });
    } else {
      setHoverInfo(null);
    }
  }, []);

  useEffect(() => {
    if (selectedCity === 'All' || !filteredData || filteredData.features.length === 0) return;
    
    let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
    filteredData.features.forEach(f => {
      const [lng, lat] = f.geometry.coordinates;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    });

    if (mapRef.current && minLng !== Infinity) {
      if (minLng === maxLng) { minLng -= 0.01; maxLng += 0.01; }
      if (minLat === maxLat) { minLat -= 0.01; maxLat += 0.01; }
      mapRef.current.fitBounds(
        [[minLng, minLat], [maxLng, maxLat]],
        { padding: 50, duration: 1500, maxZoom: 13 }
      );
    }
  }, [selectedCity, filteredData]);

  return (
    <div className="relative w-full h-full">
      {/* WebGL Map */}
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: -122.4194,
          latitude: 37.7749,
          zoom: 11
        }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        interactiveLayerIds={['unclustered-point']}
        onMouseMove={onHover}
        onMouseLeave={() => setHoverInfo(null)}
      >
        {filteredData && (
          <Source
            id="restaurants"
            type="geojson"
            data={filteredData}
            cluster={true}
            clusterMaxZoom={14}
            clusterRadius={50}
          >
            <Layer {...clusterLayer} />
            <Layer {...clusterCountLayer} />
            <Layer {...unclusteredPointLayer} />
          </Source>
        )}
        
        {hoverInfo && (
          <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            offset={15}
            closeButton={false}
            closeOnClick={false}
            className="high-perf-popup"
            anchor="bottom"
          >
            <div className="bg-[#0B0F19] border border-[#00E5FF]/30 p-3 rounded shadow-lg shadow-[#00E5FF]/20 text-white min-w-[150px]">
              <h4 className="font-bold text-sm mb-1">{hoverInfo.feature.properties.name}</h4>
              <div className="flex justify-between text-xs mt-2">
                <span className="bg-[#00E5FF]/10 text-[#00E5FF] px-2 py-0.5 rounded-full border border-[#00E5FF]/20">
                  {hoverInfo.feature.properties.cuisine}
                </span>
                <span className="text-[#FFB300] font-semibold flex items-center">
                  ★ {hoverInfo.feature.properties.rating}
                </span>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Floating Glass Sidebar */}
      <div className="absolute top-6 left-6 w-80 glass-panel rounded-xl p-6 shadow-2xl flex flex-col gap-6 z-10 transition-transform">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-1">
            <MapPin className="text-[#00E5FF]" size={20} /> GeoEngine
          </h2>
          <p className="text-sm text-gray-400">Real-time density controls</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#00E5FF] uppercase tracking-wider flex justify-between">
            Min Rating Filter 
            <span className="text-white">{minRating}</span>
          </label>
          <input
            type="range"
            min="0.0"
            max="5.0"
            step="0.1"
            value={minRating}
            onChange={(e) => setMinRating(parseFloat(e.target.value))}
            className="w-full accent-[#00E5FF] h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#FFB300] uppercase tracking-wider">
            City Cluster
          </label>
          <select 
            className="w-full bg-[#0B0F19]/50 border border-gray-700 rounded-md p-2 text-white text-sm focus:border-[#FFB300] outline-none"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="All">All Clusters</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            WebGL Accelerated Rendering Active
          </div>
          <div className="text-[10px] text-gray-500 mt-1 pl-4">
            Rendering {filteredData ? filteredData.features.length : 0} nodes
          </div>
        </div>
      </div>
    </div>
  );
}
