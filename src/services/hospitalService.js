export const fetchHospitalsFromOverpass = async (bounds) => {
    try {
        const south = bounds.getSouth();
        const west = bounds.getWest();
        const north = bounds.getNorth();
        const east = bounds.getEast();

        // Overpass Query
        const query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](${south},${west},${north},${east});
        way["amenity"="hospital"](${south},${west},${north},${east});
        relation["amenity"="hospital"](${south},${west},${north},${east});
      );
      out body;
      >;
      out skel qt;
    `;

        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();

        // Process results (focusing on nodes/centers for simplicity)
        const hospitals = data.elements
            .filter(el => el.tags && el.tags.name) // Only valid named hospitals
            .map(el => ({
                id: el.id,
                name: el.tags.name,
                address: formatAddress(el.tags),
                lat: el.lat || (el.center && el.center.lat), // For nodes or centers
                lng: el.lon || (el.center && el.center.lon)
            }))
            .filter(h => h.lat && h.lng) // Ensure coords exist
            .slice(0, 20); // Limit to 20 for performance

        return hospitals;

    } catch (error) {
        console.error("Error fetching hospitals:", error);
        return null; // Signals to use fallback
    }
};

const formatAddress = (tags) => {
    if (!tags) return "Address unavailable";
    const street = tags['addr:street'] || '';
    const number = tags['addr:housenumber'] || '';
    const city = tags['addr:city'] || '';
    if (street && city) return `${number} ${street}, ${city}`;
    return city || "Address unavailable";
};
