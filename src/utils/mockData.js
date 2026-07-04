export const generateMockGeoData = (count = 5000) => {
  const cuisines = ['Italian', 'Mexican', 'Japanese', 'American', 'Indian', 'French', 'Vegan', 'Thai'];
  const cities = ['Downtown', 'Green Valley', 'Waterfront', 'Uptown', 'Westside'];
  
  // Center roughly around a major city area (e.g., San Francisco for demo)
  const baseLat = 37.7749;
  const baseLng = -122.4194;

  const features = Array.from({ length: count }).map((_, id) => {
    // Distribute differently based on "city" region to simulate clusters
    const cityIndex = Math.floor(Math.random() * cities.length);
    const city = cities[cityIndex];
    
    // Offset based on city to create clusters
    const latOffset = (Math.random() - 0.5) * 0.1 + (cityIndex * 0.02);
    const lngOffset = (Math.random() - 0.5) * 0.1 - (cityIndex * 0.02);

    const rating = (Math.random() * 2 + 3).toFixed(1); // Ratings 3.0 - 5.0
    const priceTier = Math.floor(Math.random() * 4) + 1; // 1 to 4

    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [baseLng + lngOffset, baseLat + latOffset],
      },
      properties: {
        id: `rest-${id}`,
        name: `Restaurant ${id}`,
        cuisine: cuisines[Math.floor(Math.random() * cuisines.length)],
        city: city,
        rating: parseFloat(rating),
        priceTier: priceTier,
      }
    };
  });

  return {
    type: 'FeatureCollection',
    features,
  };
};

export const aggregateLocalityData = (geoData) => {
  const localities = {};
  
  geoData.features.forEach(feature => {
    const p = feature.properties;
    if (!localities[p.city]) {
      localities[p.city] = { count: 0, totalRating: 0, totalPrice: 0, ratings: [], prices: [] };
    }
    localities[p.city].count += 1;
    localities[p.city].totalRating += p.rating;
    localities[p.city].totalPrice += p.priceTier;
    localities[p.city].ratings.push(p.rating);
    localities[p.city].prices.push(p.priceTier);
  });

  return Object.keys(localities).map(city => ({
    city,
    count: localities[city].count,
    avgRating: (localities[city].totalRating / localities[city].count).toFixed(2),
    avgPrice: (localities[city].totalPrice / localities[city].count).toFixed(2),
  }));
};
