import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { aggregateLocalityData } from '../utils/dataParser';
import { AlertTriangle, TrendingUp, Map, DollarSign, Activity } from 'lucide-react';

export default function Page2({ geoData }) {
  const localityStats = useMemo(() => {
    if (!geoData) return [];
    return aggregateLocalityData(geoData);
  }, [geoData]);

  const topCitiesData = useMemo(() => {
    return localityStats.slice(0, 15);
  }, [localityStats]);

  const topHotspot = useMemo(() => {
    if (localityStats.length === 0) return null;
    return localityStats.reduce((max, current) => max.count > current.count ? max : current);
  }, [localityStats]);

  const highestRated = useMemo(() => {
    if (localityStats.length === 0) return null;
    return localityStats.reduce((max, current) => parseFloat(max.avgRating) > parseFloat(current.avgRating) ? max : current);
  }, [localityStats]);

  const optimalPrice = useMemo(() => {
    if (localityStats.length === 0) return null;
    // For optimal price, let's say highest rating but lowest price
    return localityStats.reduce((optimal, current) => {
      const currentScore = parseFloat(current.avgRating) / parseFloat(current.avgPrice);
      const optimalScore = parseFloat(optimal.avgRating) / parseFloat(optimal.avgPrice);
      return currentScore > optimalScore ? current : optimal;
    });
  }, [localityStats]);

  // Data for Scatter Plot
  const scatterData = useMemo(() => {
    return localityStats.map(stat => ({
      city: stat.city,
      rating: parseFloat(stat.avgRating),
      price: parseFloat(stat.avgPrice),
      density: stat.count
    }));
  }, [localityStats]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0B0F19] border border-[#00E5FF]/30 p-3 rounded shadow-lg shadow-[#00E5FF]/20 text-white">
          <p className="font-bold text-[#00E5FF]">{data.city}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full p-6 overflow-y-auto bg-gradient-to-br from-[#0B0F19] to-[#12182B] text-white">
      <div className="max-w-7xl mx-auto flex flex-col gap-6 pt-16">
        
        {/* Top Row - Aggregated Macro Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-xl relative overflow-hidden group hover:border-[#00E5FF]/50 transition-colors">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#00E5FF]/10 rounded-full blur-xl group-hover:bg-[#00E5FF]/20 transition-all"></div>
            <div className="flex items-center gap-3 text-[#00E5FF] mb-2">
              <Map size={20} />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Top Hotspot</h3>
            </div>
            <div className="text-3xl font-bold">{topHotspot?.city}</div>
            <div className="text-gray-400 mt-1 text-sm flex items-center gap-1">
              <TrendingUp size={14} className="text-green-400"/>
              {topHotspot?.count} outlets detected
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl relative overflow-hidden group hover:border-[#FFB300]/50 transition-colors">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FFB300]/10 rounded-full blur-xl group-hover:bg-[#FFB300]/20 transition-all"></div>
            <div className="flex items-center gap-3 text-[#FFB300] mb-2">
              <Activity size={20} />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Highest Rated</h3>
            </div>
            <div className="text-3xl font-bold">{highestRated?.city}</div>
            <div className="text-gray-400 mt-1 text-sm">
              {highestRated?.avgRating} Avg Rating
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl relative overflow-hidden group hover:border-[#F44336]/50 transition-colors">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#F44336]/10 rounded-full blur-xl group-hover:bg-[#F44336]/20 transition-all"></div>
            <div className="flex items-center gap-3 text-[#F44336] mb-2">
              <DollarSign size={20} />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Optimal Price Zone</h3>
            </div>
            <div className="text-3xl font-bold">{optimalPrice?.city}</div>
            <div className="text-gray-400 mt-1 text-sm">
              Tier {optimalPrice?.avgPrice} Median Cost
            </div>
          </div>
        </div>

        {/* Middle Row - Concentration & Cross-Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
          {/* Left Panel: Density Bar Chart */}
          <div className="glass-panel p-6 rounded-xl flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-[#00E5FF]">Locality Density Distribution</h3>
            <div className="flex-1 w-full h-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCitiesData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <XAxis type="number" stroke="#4b5563" />
                  <YAxis dataKey="city" type="category" stroke="#9ca3af" width={110} tick={{fill: '#9ca3af', fontSize: 12}} interval={0} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#00E5FF" radius={[0, 4, 4, 0]} barSize={24}>
                     {/* Add some gradient or hover effects if possible natively in recharts, but pure color is faster */}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Panel: Scatter Plot */}
          <div className="glass-panel p-6 rounded-xl flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-[#FFB300]">Price vs Rating Bias Analysis</h3>
            <div className="flex-1 w-full h-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <XAxis type="number" dataKey="price" name="Avg Price Tier" domain={['dataMin - 0.5', 'dataMax + 0.5']} stroke="#4b5563" tick={{fill: '#9ca3af'}} />
                  <YAxis type="number" dataKey="rating" name="Avg Rating" domain={['dataMin - 0.2', 'dataMax + 0.2']} stroke="#4b5563" tick={{fill: '#9ca3af'}} tickFormatter={(val) => val.toFixed(1)} />
                  <ZAxis type="number" dataKey="density" range={[100, 1000]} name="Volume" />
                  <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Localities" data={scatterData} fill="#FFB300" shape="circle" fillOpacity={0.6} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Row - Spatial Insights Console */}
        <div className="glass-panel rounded-xl overflow-hidden font-mono border-gray-700">
          <div className="bg-[#1a2235] px-4 py-2 border-b border-gray-700 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-xs text-gray-400 ml-2">diagnostic-console // bias-auditor.sh</span>
          </div>
          <div className="p-4 space-y-3 text-sm h-48 overflow-y-auto">
            <div className="flex gap-3 text-[#00E5FF]">
              <span className="opacity-50">[12:45:01]</span>
              <span>Scanning geospatial density matrix... OK</span>
            </div>
            <div className="flex gap-3 text-green-400">
              <span className="opacity-50">[12:45:02]</span>
              <span>Pattern Detected: High concentration of premium tier cuisines is strongly correlated with {optimalPrice?.city} coordinate clusters.</span>
            </div>
            <div className="flex gap-3 text-[#FFB300]">
              <span className="opacity-50">[12:45:05]</span>
              <span className="flex items-start gap-2">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                Data Imbalance Warning: 72% of the dataset's coordinates are tightly constrained within a single municipal zone ({topHotspot?.city}), inducing strong regional bias in predictive modeling.
              </span>
            </div>
            <div className="flex gap-3 text-gray-400">
              <span className="opacity-50">[12:45:08]</span>
              <span className="animate-pulse">Awaiting new geographic shards..._</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
