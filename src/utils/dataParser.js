import Papa from 'papaparse';

export const fetchAndParseData = async () => {
  return new Promise((resolve, reject) => {
    Papa.parse('/dataset.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const features = [];
        results.data.forEach(row => {
          const lat = parseFloat(row.Latitude);
          const lng = parseFloat(row.Longitude);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            features.push({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [lng, lat],
              },
              properties: {
                id: row['Restaurant ID'],
                name: row['Restaurant Name'],
                cuisine: row['Cuisines'] || 'Unknown',
                city: row['City'],
                rating: parseFloat(row['Aggregate rating']) || 0,
                priceTier: parseInt(row['Price range']) || 1,
                votes: parseInt(row['Votes']) || 0
              }
            });
          }
        });

        resolve({
          type: 'FeatureCollection',
          features,
        });
      },
      error: (error) => reject(error)
    });
  });
};

export const aggregateLocalityData = (geoData) => {
  const localities = {};
  
  geoData.features.forEach(feature => {
    const p = feature.properties;
    if (!p.city) return; // Skip if no city
    
    if (!localities[p.city]) {
      localities[p.city] = { count: 0, totalRating: 0, totalPrice: 0 };
    }
    localities[p.city].count += 1;
    localities[p.city].totalRating += p.rating;
    localities[p.city].totalPrice += p.priceTier;
  });

  return Object.keys(localities).map(city => ({
    city,
    count: localities[city].count,
    avgRating: (localities[city].totalRating / localities[city].count).toFixed(2),
    avgPrice: (localities[city].totalPrice / localities[city].count).toFixed(2),
  })).sort((a, b) => b.count - a.count); // Sort by density
};
