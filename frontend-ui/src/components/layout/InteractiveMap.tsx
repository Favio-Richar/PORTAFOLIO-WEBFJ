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
    popupTitle?: string;
    popupStreet?: string;
    popupArea?: string;
    popupSchedule?: string;
    directionsUrl?: string;
}

export default function InteractiveMap({
    center,
    zoom = 13,
    popupTitle = "FJ Digital Systems",
    popupStreet = "Av. Sta. Rosa 3573",
    popupArea = "San Miguel, Región Metropolitana",
    popupSchedule = "Lun–Vie 08:00–19:00",
    directionsUrl,
}: InteractiveMapProps) {
    useEffect(() => {
        // This ensures Leaflet only runs on the client
    }, []);

    return (
        <div className="w-full h-full min-h-[400px] relative !rounded-none overflow-hidden">
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
                        <div className="p-2 text-slate-900">
                            <h4 className="text-[15px] font-black tracking-tight text-slate-900 mb-1">{popupTitle}</h4>
                            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500 font-bold mb-2">Santiago · Chile</p>
                            <p className="text-sm text-slate-800 font-semibold leading-snug">{popupStreet}</p>
                            <p className="text-sm text-slate-600 font-medium mt-1 leading-snug">{popupArea}</p>
                            <span className="inline-block mt-3 px-2.5 py-1 text-[10px] uppercase tracking-wide text-emerald-800 bg-emerald-100 rounded-sm font-bold border border-emerald-200">
                                Horario: {popupSchedule}
                            </span>
                            {directionsUrl ? (
                                <a
                                    href={directionsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-block mt-3 ml-2 px-2.5 py-1 text-[10px] uppercase tracking-wide text-blue-800 bg-blue-100 rounded-sm hover:bg-blue-200 transition-colors font-bold border border-blue-200"
                                >
                                    Cómo llegar
                                </a>
                            ) : null}
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}
