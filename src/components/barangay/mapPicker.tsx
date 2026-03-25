"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in Leaflet + Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface MapPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

function LocationMarker({ lat, lng, onChange }: MapPickerProps) {
  const map = useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  const isValidPos = lat != null && lng != null && !isNaN(Number(lat)) && !isNaN(Number(lng));

  return isValidPos ? (
    <Marker position={[Number(lat), Number(lng)]} />
  ) : null;
}

// Helper to update map center when props change (e.g. initial load)
function ChangeView({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    const [lat, lng] = center;
    if (lat != null && lng != null && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
      map.setView(center, zoom || map.getZoom());
      // Force a resize check in case the dialog is still animating
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  const defaultCenter: [number, number] = [10.480145612851203, 122.99927501599376];
  const center: [number, number] = lat !== null && lng !== null ? [lat, lng] : defaultCenter;

  const defaultZoom = 12;
  const zoom = lat !== null && lng !== null ? 15 : defaultZoom;

  return (
    <div className="h-full w-full rounded-md border overflow-hidden relative z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker lat={lat} lng={lng} onChange={onChange} />
        <ChangeView center={center} zoom={zoom} />
      </MapContainer>
      <div className="absolute bottom-2 right-2 z-[1000] bg-white/80 backdrop-blur-sm p-1 px-2 rounded text-[10px] border shadow-sm pointer-events-none">
        Click on map to set location
      </div>
    </div>
  );
}
