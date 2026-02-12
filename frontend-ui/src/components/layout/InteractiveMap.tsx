"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Fix for Leaflet marker icons in Next.js
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface InteractiveMapProps {
    center: [number, number];
    zoom?: number;
}

export default function InteractiveMap({ center, zoom = 13 }: InteractiveMapProps) {
    useEffect(() => {
        // This ensures Leaflet only runs on the client
    }, []);

    return (
        <div className="w-full h-full min-h-[400px] relative rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
            <MapContainer
                {...({
                    center: center,
                    zoom: zoom,
                    scrollWheelZoom: false,
                    className: "w-full h-full z-0",
                    attributionControl: false
                } as any)}
            >
                <TileLayer
                    {...({
                        url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    } as any)}
                />
                <Marker
                    {...({
                        position: center,
                        icon: icon
                    } as any)}
                >
                    <Popup
                        {...({
                            className: "elite-popup"
                        } as any)}
                    >
                        <div className="p-2 font-bold text-slate-900">
                            <h4 className="text-sm uppercase tracking-widest text-blue-600 mb-1">Base de Operaciones</h4>
                            <p className="text-xs text-slate-600 font-medium">Santiago, Chile</p>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>

            {/* TECH OVERLAY (Brighter) */}
            <div className="absolute inset-0 pointer-events-none border-[1px] border-white/20 rounded-[3rem] z-10" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-blue-500/5 to-transparent z-10" />
        </div>
    );
}
