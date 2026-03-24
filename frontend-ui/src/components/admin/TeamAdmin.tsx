"use client";

import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaUserAlt, FaUpload, FaSpinner } from "react-icons/fa";
import API_BASE from "@/lib/apiBase";
import { adminFetch } from "@/lib/adminFetch";

type TeamMember = {
    id?: number;
    name: string;
    role: string;
    description: string;
    skills: string;
    avatar_url: string;
    order: number;
    active: boolean;
};

const BACKEND_URL = API_BASE;

const TeamAdmin: React.FC = () => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("file", file);

            const res = await adminFetch(`${BACKEND_URL}/api/upload`, {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                if (editingMember) {
                    setEditingMember({ ...editingMember, avatar_url: data.url });
                }
            }
        } catch (err) {
            console.error("Error uploading file:", err);
        } finally {
            setUploading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const res = await adminFetch(`${BACKEND_URL}/api/team/all`);
            if (res.ok) {
                const data = await res.json();
                setMembers(data);
            }
        } catch (err) {
            console.error("Error fetching team:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (member: TeamMember) => {
        const method = member.id ? "PUT" : "POST";
        const url = member.id ? `${BACKEND_URL}/api/team/${member.id}` : `${BACKEND_URL}/api/team/`;

        try {
            const res = await adminFetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(member),
            });

            if (res.ok) {
                fetchMembers();
                setEditingMember(null);
                setIsAdding(false);
            }
        } catch (err) {
            console.error("Error saving member:", err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Seguro que deseas eliminar este miembro?")) return;
        try {
            const res = await adminFetch(`${BACKEND_URL}/api/team/${id}`, { method: "DELETE" });
            if (res.ok) fetchMembers();
        } catch (err) {
            console.error("Error deleting member:", err);
        }
    };

    return (
        <div className="p-6 bg-slate-900/50 rounded-3xl border border-white/10">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">Gestión de Equipo</h2>
                <button
                    onClick={() => {
                        setEditingMember({ name: "", role: "", description: "", skills: "", avatar_url: "", order: 0, active: true });
                        setIsAdding(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <FaPlus /> Añadir Miembro
                </button>
            </div>

            {loading ? (
                <p className="text-slate-400">Cargando...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {members.map((member) => (
                        <div key={member.id} className="bg-slate-800/80 p-5 rounded-2xl border border-white/5 group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-700">
                                    {member.avatar_url ? (
                                        <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-500"><FaUserAlt /></div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">{member.name}</h3>
                                    <p className="text-slate-400 text-sm">{member.role}</p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setEditingMember(member)}
                                    className="p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    onClick={() => member.id && handleDelete(member.id)}
                                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {(editingMember || isAdding) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/10 p-8 rounded-[2rem] max-w-lg w-full">
                        <h3 className="text-xl font-bold text-white mb-6">
                            {editingMember?.id ? "Editar Miembro" : "Añadir Miembro"}
                        </h3>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Nombre"
                                className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-white"
                                value={editingMember?.name || ""}
                                onChange={(e) => setEditingMember({ ...editingMember!, name: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Rol"
                                className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-white"
                                value={editingMember?.role || ""}
                                onChange={(e) => setEditingMember({ ...editingMember!, role: e.target.value })}
                            />
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="URL Avatar"
                                    className="flex-1 bg-slate-800 border border-white/10 rounded-xl p-3 text-white"
                                    value={editingMember?.avatar_url || ""}
                                    onChange={(e) => setEditingMember({ ...editingMember!, avatar_url: e.target.value })}
                                />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    accept="image/*"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="px-4 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors disabled:opacity-50"
                                >
                                    {uploading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                                </button>
                            </div>
                            <textarea
                                placeholder="Descripción"
                                className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-white h-24"
                                value={editingMember?.description || ""}
                                onChange={(e) => setEditingMember({ ...editingMember!, description: e.target.value })}
                            />
                            <div className="flex justify-end gap-4 mt-8">
                                <button
                                    onClick={() => { setEditingMember(null); setIsAdding(false); }}
                                    className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => editingMember && handleSave(editingMember)}
                                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                                >
                                    <FaSave /> Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamAdmin;
