"use client";

import { useState, useEffect } from "react";
import { FaPhone, FaSave } from "react-icons/fa";
import type { ContactData } from "@/lib/data/contact";

interface Props {
    contact: ContactData;
    onSave: (data: ContactData) => void;
}

export default function ContactAdmin({ contact: initialContact, onSave }: Props) {
    const [contact, setContact] = useState(initialContact);

    // Sincronizar estado local
    useEffect(() => {
        setContact(initialContact);
    }, [initialContact]);

    const handleSave = async () => {
        try {
            await fetch("http://localhost:8000/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(contact)
            });
            alert("Contacto guardado en la base de datos ✅");
        } catch (error) {
            alert("Error al guardar contacto");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="text-4xl font-black text-white uppercase tracking-tighter">
                    <FaPhone className="inline mr-3 text-cyan-500" /> Información de Contacto
                </h3>
                <button onClick={handleSave} className="px-10 py-5 rounded-full btn-primary btn-alive btn-shimmer flex items-center gap-3 text-xs font-black uppercase">
                    <FaSave /> Guardar Cambios
                </button>
            </div>

            <div className="glass-card-pro p-12 border border-white/10 rounded-[4rem]">
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-cyan-400 text-xs font-black uppercase tracking-widest mb-3">Email</label>
                        <input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-cyan-500 transition-all"
                            placeholder="correo@ejemplo.com" />
                    </div>
                    <div>
                        <label className="block text-cyan-400 text-xs font-black uppercase tracking-widest mb-3">Teléfono</label>
                        <input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-cyan-500 transition-all"
                            placeholder="+56 9 1234 5678" />
                    </div>
                    <div>
                        <label className="block text-cyan-400 text-xs font-black uppercase tracking-widest mb-3">LinkedIn URL</label>
                        <input value={contact.linkedin} onChange={(e) => setContact({ ...contact, linkedin: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-cyan-500 transition-all"
                            placeholder="https://linkedin.com/in/..." />
                    </div>
                    <div>
                        <label className="block text-cyan-400 text-xs font-black uppercase tracking-widest mb-3">GitHub URL</label>
                        <input value={contact.github} onChange={(e) => setContact({ ...contact, github: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-cyan-500 transition-all"
                            placeholder="https://github.com/..." />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-cyan-400 text-xs font-black uppercase tracking-widest mb-3">Ubicación</label>
                        <input value={contact.location} onChange={(e) => setContact({ ...contact, location: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-cyan-500 transition-all"
                            placeholder="Chile" />
                    </div>
                </div>
            </div>
        </div>
    );
}
