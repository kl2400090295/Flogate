import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapProps {
  center: [number, number];
  zoom?: number;
  className?: string;
  onMapReady?: (map: L.Map) => void;
  children?: React.ReactNode;
}

export function Map({ center, zoom = 10, className = "", onMapReady, children }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView(center, zoom);

    // Add OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    globalMapInstance = map;
    mapInstanceRef.current = map;

    // Call onMapReady callback
    if (onMapReady) {
      onMapReady(map);
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        globalMapInstance = null;
      }
    };
  }, [center, zoom, onMapReady]);

  return (
    <div className={`h-full w-full ${className}`} ref={mapRef} data-testid="leaflet-map" style={{ zIndex: 10 }}>
      {children}
    </div>
  );
}

// Global map instance ref that MapMarker and MapCircle components will access
let globalMapInstance: L.Map | null = null;

export function MapMarker({
  position,
  title,
  color = "red",
  onClick,
}: {
  position: [number, number];
  title: string;
  color?: "red" | "blue" | "green" | "orange";
  onClick?: () => void;
}) {
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!globalMapInstance) return;

    const marker = L.marker(position).addTo(globalMapInstance);
    marker.bindPopup(title);

    if (onClick) {
      marker.on("click", onClick);
    }

    markerRef.current = marker;

    return () => {
      if (marker) {
        marker.remove();
      }
    };
  }, [position, title, onClick]);

  return null;
}

export function MapCircle({
  center,
  radius,
  color = "#3388ff",
  fillColor,
  fillOpacity = 0.3,
  popup,
}: {
  center: [number, number];
  radius: number;
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
  popup?: string;
}) {
  const circleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!globalMapInstance) return;

    const circle = L.circle(center, {
      color,
      fillColor: fillColor || color,
      fillOpacity,
      radius,
    }).addTo(globalMapInstance);

    if (popup) {
      circle.bindPopup(popup);
    }

    circleRef.current = circle;

    return () => {
      if (circle) {
        circle.remove();
      }
    };
  }, [center, radius, color, fillColor, fillOpacity, popup]);

  return null;
}
