import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

// Component to handle map events
function MapEvents({ onBoundsChange }) {
  const map = useMapEvents({
    moveend: () => {
      onBoundsChange(map.getBounds());
    },
    zoomend: () => {
      onBoundsChange(map.getBounds());
    }
  });

  // Trigger once on load to populate initial list
  useEffect(() => {
    if (onBoundsChange) {
      onBoundsChange(map.getBounds());
    }
  }, []); // Run once when map is ready

  return null;
}

export default function HospitalMap({
  hospitals,
  center,
  onBoundsChange,
  selectedHospital,
  onSelectHospital,
  userLocation
}) {
  const defaultCenter = [28.7041, 77.1025];
  const mapCenter = center ? [parseFloat(center[0]), parseFloat(center[1])] : defaultCenter;
  const mapRef = useRef(null);
  const lastActionRef = useRef(null);

  // Custom marker icons
  const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    shadowSize: [41, 41]
  });

  const selectedIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    iconSize: [35, 51],
    iconAnchor: [17, 51],
    popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    shadowSize: [51, 51]
  });

  // ONE-TIME movement for selection & deselection (no locking)
  useEffect(() => {
    if (!mapRef.current) return;

    // SELECT hospital → zoom in ONCE
    if (selectedHospital && lastActionRef.current !== selectedHospital.id) {
      mapRef.current.flyTo(
        [selectedHospital.lat, selectedHospital.lng],
        16,
        { duration: 0.8 }
      );
      lastActionRef.current = selectedHospital.id;
    }

    // DESELECT hospital → zoom out ONCE
    if (!selectedHospital && lastActionRef.current !== "reset") {
      mapRef.current.flyTo(mapCenter, 13, { duration: 0.8 });
      lastActionRef.current = "reset";
    }
  }, [selectedHospital, mapCenter]);

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={true}
        dragging={true}
        doubleClickZoom={true}
        zoomControl={true}
        style={{ height: "100%", width: "100%" }}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
        }}
        eventHandlers={{
          click: () => {
            if (onSelectHospital) onSelectHospital(null);
          }
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {onBoundsChange && <MapEvents onBoundsChange={onBoundsChange} />}

        {/* Render Hospital Markers */}
        {hospitals && hospitals.map((hospital) => (
          <Marker
            key={hospital.id}
            position={[hospital.lat, hospital.lng]}
            icon={selectedHospital && selectedHospital.id === hospital.id ? selectedIcon : defaultIcon}
            eventHandlers={{
              click: (e) => {
                if (onSelectHospital) {
                  if (selectedHospital && selectedHospital.id === hospital.id) {
                    onSelectHospital(null);
                  } else {
                    onSelectHospital(hospital);
                  }
                }
                e.originalEvent.cancelBubble = true;
              }
            }}
          >
            <Popup>
              <strong>{hospital.name}</strong><br />
              {hospital.address}
            </Popup>
          </Marker>
        ))}

        {/* Render User Location Marker */}
        {center && (
          <Marker position={mapCenter} icon={defaultIcon}>
            <Popup>Your Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
