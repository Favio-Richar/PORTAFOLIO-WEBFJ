"use client";

import { useEffect, useState } from "react";
import {
  FaCode,
  FaEdit,
  FaPlusCircle,
  FaSave,
  FaTimes,
  FaTrashAlt,
} from "react-icons/fa";

type AboutStackItem = {
  id: number;
  name: string;
  icon_key?: string | null;
  color?: string | null;
  order_index: number;
  active: boolean;
};

type StackDraft = {
  name: string;
  icon_key: string;
  order_index: number;
  active: boolean;
};

const API_BASE = "http://localhost:8000/api/about-stack";

export default function AboutStackAdmin() {
  const [items, setItems] = useState<AboutStackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState<StackDraft | null>(null);
  const [error, setError] = useState("");
  const [newItem, setNewItem] = useState<StackDraft>({
    name: "",
    icon_key: "",
    order_index: 0,
    active: true,
  });

  const loadItems = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(API_BASE, { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo cargar el stack.");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
      setEditingId(null);
      setEditingDraft(null);
    } catch (err) {
      console.error(err);
      setError("Error cargando stack de Sobre mi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const createItem = async () => {
    try {
      if (!newItem.name.trim()) {
        setError("El nombre es obligatorio.");
        return;
      }

      setError("");
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newItem.name.trim(),
          icon_key: newItem.icon_key.trim() || null,
          order_index: Number(newItem.order_index) || 0,
          active: Boolean(newItem.active),
        }),
      });

      if (!res.ok) throw new Error("No se pudo crear.");

      setNewItem({
        name: "",
        icon_key: "",
        order_index: items.length,
        active: true,
      });
      await loadItems();
    } catch (err) {
      console.error(err);
      setError("No se pudo crear el item del stack.");
    }
  };

  const startEdit = (item: AboutStackItem) => {
    setEditingId(item.id);
    setEditingDraft({
      name: item.name,
      icon_key: item.icon_key || "",
      order_index: item.order_index,
      active: item.active,
    });
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingDraft(null);
  };

  const updateItem = async (id: number) => {
    if (!editingDraft) return;

    try {
      if (!editingDraft.name.trim()) {
        setError("El nombre es obligatorio.");
        return;
      }

      setSavingId(id);
      setError("");

      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingDraft.name.trim(),
          icon_key: editingDraft.icon_key.trim() || null,
          order_index: Number(editingDraft.order_index) || 0,
          active: Boolean(editingDraft.active),
        }),
      });

      if (!res.ok) throw new Error("No se pudo actualizar.");
      await loadItems();
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el item.");
    } finally {
      setSavingId(null);
    }
  };

  const deleteItem = async (id: number) => {
    const ok = window.confirm("Eliminar este item del stack?");
    if (!ok) return;

    try {
      setSavingId(id);
      setError("");
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar.");
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setEditingDraft(null);
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el item.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-4xl font-black uppercase tracking-tight text-white flex items-center gap-3">
          <FaCode className="text-cyan-400" /> Stack Tecnologico
        </h3>
        <button
          onClick={loadItems}
          className="px-6 py-3 text-xs font-black uppercase tracking-[0.2em] bg-blue-700 text-white hover:bg-blue-600 transition-colors"
        >
          Recargar
        </button>
      </div>

      {error && <div className="text-red-400 font-bold text-sm">{error}</div>}

      <div className="admin-card">
        <h4 className="text-cyan-400 text-xs font-black uppercase tracking-[0.2em] mb-4">
          Nuevo item
        </h4>
        <div className="grid md:grid-cols-5 gap-3">
          <input
            value={newItem.name}
            onChange={(e) => setNewItem((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Nombre (React, Docker...)"
            className="bg-black/30 border border-white/15 text-white px-4 py-3 outline-none"
          />
          <input
            value={newItem.icon_key}
            onChange={(e) => setNewItem((prev) => ({ ...prev, icon_key: e.target.value }))}
            placeholder="icon_key (react, docker...)"
            className="bg-black/30 border border-white/15 text-white px-4 py-3 outline-none"
          />
          <input
            type="number"
            value={newItem.order_index}
            onChange={(e) =>
              setNewItem((prev) => ({
                ...prev,
                order_index: Number(e.target.value) || 0,
              }))
            }
            placeholder="Orden"
            className="bg-black/30 border border-white/15 text-white px-4 py-3 outline-none"
          />
          <select
            value={newItem.active ? "1" : "0"}
            onChange={(e) =>
              setNewItem((prev) => ({ ...prev, active: e.target.value === "1" }))
            }
            className="bg-black/30 border border-white/15 text-white px-4 py-3 outline-none"
          >
            <option value="1" className="bg-slate-900">
              Activo
            </option>
            <option value="0" className="bg-slate-900">
              Inactivo
            </option>
          </select>
          <button
            onClick={createItem}
            className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2"
          >
            <FaPlusCircle /> Crear
          </button>
        </div>
        <p className="mt-3 text-[11px] text-slate-400">
          El color se asigna automaticamente segun tecnologia.
        </p>
      </div>

      {loading ? (
        <div className="text-white/60">Cargando stack...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((item) => {
            const isEditing = editingId === item.id && editingDraft !== null;

            if (isEditing) {
              return (
                <div key={item.id} className="admin-card border border-cyan-500/30">
                  <div className="grid md:grid-cols-6 gap-3 items-center">
                    <input
                      value={editingDraft.name}
                      onChange={(e) =>
                        setEditingDraft((prev) =>
                          prev ? { ...prev, name: e.target.value } : prev
                        )
                      }
                      className="bg-black/30 border border-white/15 text-white px-4 py-3 outline-none"
                    />
                    <input
                      value={editingDraft.icon_key}
                      onChange={(e) =>
                        setEditingDraft((prev) =>
                          prev ? { ...prev, icon_key: e.target.value } : prev
                        )
                      }
                      className="bg-black/30 border border-white/15 text-white px-4 py-3 outline-none"
                    />
                    <input
                      type="number"
                      value={editingDraft.order_index}
                      onChange={(e) =>
                        setEditingDraft((prev) =>
                          prev
                            ? {
                                ...prev,
                                order_index: Number(e.target.value) || 0,
                              }
                            : prev
                        )
                      }
                      className="bg-black/30 border border-white/15 text-white px-4 py-3 outline-none"
                    />
                    <select
                      value={editingDraft.active ? "1" : "0"}
                      onChange={(e) =>
                        setEditingDraft((prev) =>
                          prev ? { ...prev, active: e.target.value === "1" } : prev
                        )
                      }
                      className="bg-black/30 border border-white/15 text-white px-4 py-3 outline-none"
                    >
                      <option value="1" className="bg-slate-900">
                        Activo
                      </option>
                      <option value="0" className="bg-slate-900">
                        Inactivo
                      </option>
                    </select>
                    <div className="px-4 py-3 bg-black/20 border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider">
                      Color: auto
                    </div>
                    <div className="flex gap-2">
                      <button
                        disabled={savingId === item.id}
                        onClick={() => updateItem(item.id)}
                        className="flex-1 px-4 py-3 bg-blue-700 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <FaSave /> Guardar
                      </button>
                      <button
                        disabled={savingId === item.id}
                        onClick={cancelEdit}
                        className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <FaTimes />
                      </button>
                      <button
                        disabled={savingId === item.id}
                        onClick={() => deleteItem(item.id)}
                        className="px-4 py-3 bg-red-700 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={item.id} className="admin-card">
                <div className="grid md:grid-cols-6 gap-3 items-center">
                  <div className="px-4 py-3 bg-black/20 border border-white/10 text-white font-semibold">
                    {item.name}
                  </div>
                  <div className="px-4 py-3 bg-black/20 border border-white/10 text-slate-300 font-mono">
                    {item.icon_key || "-"}
                  </div>
                  <div className="px-4 py-3 bg-black/20 border border-white/10 text-slate-300">
                    {item.order_index}
                  </div>
                  <div className="px-4 py-3 bg-black/20 border border-white/10 text-slate-300">
                    {item.active ? "Activo" : "Inactivo"}
                  </div>
                  <div className="px-4 py-3 bg-black/20 border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider">
                    Color: auto
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={savingId === item.id}
                      onClick={() => startEdit(item)}
                      className="flex-1 px-4 py-3 bg-blue-700 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <FaEdit /> Editar
                    </button>
                    <button
                      disabled={savingId === item.id}
                      onClick={() => deleteItem(item.id)}
                      className="px-4 py-3 bg-red-700 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
