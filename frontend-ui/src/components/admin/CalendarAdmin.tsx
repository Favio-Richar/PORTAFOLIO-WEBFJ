"use client";

import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt, FaPlus, FaTrash, FaEdit, FaTimes, FaChevronLeft,
  FaChevronRight, FaBell, FaStar, FaBriefcase, FaFlag, FaCheck,
  FaRegCalendarCheck, FaRegClock, FaTag, FaSpinner, FaSync
} from "react-icons/fa";
import { adminFetch } from "@/lib/adminFetch";

// ─── Types ────────────────────────────────────────────────────────────────────
type EventType = "work" | "reminder" | "important" | "personal" | "deadline";

interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  type: EventType;
  time?: string;
  completed?: boolean;
}

const EVENT_COLORS: Record<EventType, { bg: string; border: string; text: string; icon: React.ReactNode; label: string }> = {
  work:      { bg: "rgba(99,102,241,0.15)",  border: "#6366f1", text: "#818cf8", icon: <FaBriefcase size={10}/>, label: "Trabajo"    },
  reminder:  { bg: "rgba(251,191,36,0.15)",  border: "#fbbf24", text: "#fbbf24", icon: <FaBell size={10}/>,     label: "Recordatorio"},
  important: { bg: "rgba(239,68,68,0.15)",   border: "#ef4444", text: "#f87171", icon: <FaFlag size={10}/>,     label: "Importante"  },
  personal:  { bg: "rgba(34,197,94,0.15)",   border: "#22c55e", text: "#4ade80", icon: <FaStar size={10}/>,     label: "Personal"    },
  deadline:  { bg: "rgba(249,115,22,0.15)",  border: "#f97316", text: "#fb923c", icon: <FaRegClock size={10}/>, label: "Deadline"    },
};

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const WEEKDAYS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

const MONTH_BACKGROUNDS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&fit=crop", // Jan
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=400&fit=crop", // Feb 
  "https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=400&fit=crop", // Mar 
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400&fit=crop", // Apr
  "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=400&fit=crop", // May
  "https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?q=80&w=400&fit=crop", // Jun
  "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=400&fit=crop", // Jul
  "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=400&fit=crop", // Aug
  "https://images.unsplash.com/photo-1483401757487-2ced3fa77952?q=80&w=400&fit=crop", // Sep
  "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=400&fit=crop", // Oct
  "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=400&fit=crop", // Nov
  "https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=400&fit=crop", // Dec
];

const HOLIDAYS: Record<string, { label: string, icon: string, color: string }> = {
  "01-01": { label: "Año Nuevo", icon: "🎆", color: "#fbbf24" },
  "02-14": { label: "San Valentín", icon: "❤️", color: "#f43f5e" },
  "03-08": { label: "Día de la Mujer", icon: "👩", color: "#c084fc" },
  "05-01": { label: "Trabajador", icon: "👷", color: "#fb923c" },
  "09-18": { label: "Fiestas", icon: "🍷", color: "#ef4444" },
  "10-31": { label: "Halloween", icon: "🎃", color: "#f97316" },
  "12-24": { label: "Nochebuena", icon: "⛄", color: "#38bdf8" },
  "12-25": { label: "Navidad", icon: "🎄", color: "#22c55e" },
  "12-31": { label: "Fin de Año", icon: "🥂", color: "#facc15" }
};

const STORAGE_KEY = "admin_calendar_events";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function toIso(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
function todayIso() {
  const d = new Date();
  return toIso(d.getFullYear(), d.getMonth(), d.getDate());
}

// ─── Mini Month Component ─────────────────────────────────────────────────────
function MiniMonth({
  year, month, events, selectedDate, onSelectDate
}: {
  year: number; month: number;
  events: CalendarEvent[];
  selectedDate: string | null;
  onSelectDate: (d: string) => void;
}) {
  const days = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = todayIso();
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let i = 1; i <= days; i++) cells.push(i);
  while (cells.length < 42) cells.push(null); // Exactly 6 weeks perfectly aligned

  return (
    <div style={{ 
      border: "1px solid rgba(255,255,255,0.08)", 
      borderRadius: 16, 
      boxShadow: "0 10px 40px -10px rgba(0,0,0,0.7)",
      position: "relative",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      overflow: "hidden",
      cursor: "pointer",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      transform: selectedDate && selectedDate.startsWith(toIso(year, month, 1).slice(0, 7)) ? "scale(1.02) translateY(-4px)" : "scale(1)"
    }}>
      {/* Background Image Layer */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(${MONTH_BACKGROUNDS[month]})`,
        backgroundSize: "cover", backgroundPosition: "center",
        opacity: 0.35, zIndex: 0,
        transition: "opacity 0.4s",
        filter: "blur(2px) saturate(1.5)"
      }} />
      {/* Overlay Gradient for readability */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(15,23,42,0.6) 0%, rgba(15,23,42,0.95) 100%)",
        zIndex: 1
      }} />
      
      {/* Content wrapper */}
      <div style={{ position: "relative", zIndex: 2, padding: "18px 16px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <p style={{ color: "#fff", fontWeight: 900, fontSize: 16, textAlign: "center", margin: "0 0 16px 0", letterSpacing: "0.15em", textTransform: "uppercase", textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
          {MONTHS[month]}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 8 }}>
          {WEEKDAYS.map(w => (
            <span key={w} style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, textAlign: "center", fontWeight: 900, textTransform: "uppercase" }}>{w[0]}</span>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5, flexGrow: 1, gridTemplateRows: "repeat(6, 1fr)" }}>
          {cells.map((day, i) => {
            if (!day) return <div key={i} style={{ minHeight: 38 }} />;
            const iso = toIso(year, month, day);
            const holidayKey = `${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const holiday = HOLIDAYS[holidayKey];
            const dayEvents = events.filter(e => e.date === iso);
            const isToday = iso === today;
            const isSelected = iso === selectedDate;
            const dotColors = [...new Set(dayEvents.map(e => EVENT_COLORS[e.type].border))].slice(0, 3);

            return (
              <button
                key={i}
                onClick={() => onSelectDate(iso)}
                onDoubleClick={() => onSelectDate(iso)} 
                title={holiday ? holiday.label : undefined}
                style={{
                  position: "relative",
                  background: isSelected ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : isToday ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.02)",
                  border: isSelected ? "1px solid #a5b4fc" : isToday ? "1px solid rgba(99,102,241,0.6)" : holiday ? `1px solid ${holiday.color}40` : "1px solid transparent",
                  borderRadius: 8,
                  color: isSelected ? "#fff" : isToday ? "#a5b4fc" : holiday ? holiday.color : "rgba(255,255,255,0.85)",
                  fontSize: 12,
                  fontWeight: isToday || isSelected || holiday ? 800 : 500,
                  cursor: "pointer",
                  padding: "6px 2px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: isSelected ? "0 4px 15px rgba(99,102,241,0.5)" : "none",
                  transform: isSelected ? "scale(1.15)" : "scale(1)",
                  zIndex: isSelected ? 10 : 1,
                  backdropFilter: "blur(4px)"
                }}
                onMouseEnter={(e) => { 
                  if (!isSelected) {
                    e.currentTarget.style.background = holiday ? `${holiday.color}20` : "rgba(255,255,255,0.1)";
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.zIndex = "5";
                  }
                }}
                onMouseLeave={(e) => { 
                  if (!isSelected) {
                    e.currentTarget.style.background = isToday ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.02)";
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.zIndex = "1";
                  }
                }}
              >
                {day}
                {holiday && !isSelected && (
                  <span style={{ fontSize: 10, position: "absolute", top: -6, right: -6, background: "rgba(0,0,0,0.6)", borderRadius: "50%", padding: 3, boxShadow: `0 0 10px ${holiday.color}` }}>{holiday.icon}</span>
                )}
                {dotColors.length > 0 && (
                  <div style={{ display: "flex", gap: 2, height: 4, marginTop: 2 }}>
                    {dotColors.map((c, idx) => (
                      <span key={idx} style={{ width: 4, height: 4, borderRadius: "50%", background: isSelected ? "#fff" : c, display: "block", boxShadow: isSelected ? "none" : `0 0 4px ${c}` }} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Event Modal ──────────────────────────────────────────────────────────────
function EventModal({
  date, event, onSave, onClose
}: {
  date: string;
  event?: CalendarEvent | null;
  onSave: (e: CalendarEvent) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [type, setType] = useState<EventType>(event?.type || "work");
  const [time, setTime] = useState(event?.time || "");
  const [completed, setCompleted] = useState(event?.completed || false);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: event?.id || Date.now().toString(),
      date,
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      time: time || undefined,
      completed,
    });
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{
        background: "linear-gradient(135deg,#0f172a,#1e293b)",
        border: "1px solid rgba(99,102,241,0.3)",
        borderRadius: 16, padding: 28, width: 440, maxWidth: "95vw",
        boxShadow: "0 25px 60px rgba(0,0,0,0.5)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 16 }}>
            {event ? "Editar Evento" : "Nuevo Evento"} — {date}
          </h3>
          <button onClick={onClose} style={{ color: "#64748b", background: "none", border: "none", cursor: "pointer" }}>
            <FaTimes size={16} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título del evento *"
            autoFocus
            style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14,
              outline: "none", width: "100%"
            }}
          />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descripción (opcional)"
            rows={3}
            style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 13,
              outline: "none", resize: "vertical", fontFamily: "inherit"
            }}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ color: "#64748b", fontSize: 11, display: "block", marginBottom: 6 }}>TIPO</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as EventType)}
                style={{
                  background: "rgba(255,255,255,0.05)", border: `1px solid ${EVENT_COLORS[type].border}`,
                  borderRadius: 8, padding: "9px 12px", color: EVENT_COLORS[type].text,
                  fontSize: 13, width: "100%", outline: "none"
                }}
              >
                {(Object.entries(EVENT_COLORS) as [EventType, typeof EVENT_COLORS[EventType]][]).map(([k, v]) => (
                  <option key={k} value={k} style={{ background: "#1e293b" }}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ color: "#64748b", fontSize: 11, display: "block", marginBottom: 6 }}>HORA</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8, padding: "9px 12px", color: "#e2e8f0", fontSize: 13,
                  width: "100%", outline: "none"
                }}
              />
            </div>
          </div>
          {event && (
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "#94a3b8", fontSize: 13 }}>
              <input type="checkbox" checked={completed} onChange={e => setCompleted(e.target.checked)}
                style={{ accentColor: "#22c55e", width: 16, height: 16 }}
              />
              Marcar como completado
            </label>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              onClick={handleSave}
              style={{
                flex: 1, background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                border: "none", borderRadius: 8, color: "#fff", fontWeight: 700,
                fontSize: 13, padding: "11px 20px", cursor: "pointer"
              }}
            >
              {event ? "Guardar Cambios" : "Crear Evento"}
            </button>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, color: "#94a3b8", padding: "11px 16px", cursor: "pointer", fontSize: 13
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Calendar Admin ───────────────────────────────────────────────────────
export default function CalendarAdmin() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(todayIso());
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [filter, setFilter] = useState<EventType | "all">("all");

  const [isLoading, setIsLoading] = useState(true);

  // Load from API
  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const res = await adminFetch("/api/calendar/");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (e) {
      console.error("Error loading events", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleSaveEvent = async (evt: CalendarEvent) => {
    try {
      const isEditing = !!editingEvent && editingEvent.id === evt.id;
      // Filter out temporary string IDs if it's a new event 
      // (the backend will generate an integer ID)
      const payload: any = {
        date: evt.date,
        title: evt.title,
        description: evt.description,
        type: evt.type,
        time: evt.time,
        completed: evt.completed
      };

      const endpoint = isEditing ? `/api/calendar/${evt.id}` : "/api/calendar/";
      const method = isEditing ? "PUT" : "POST";

      const res = await adminFetch(endpoint, {
        method,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await loadEvents();
        setShowModal(false);
        setEditingEvent(null);
      } else {
         const err = await res.json();
         alert("Error al guardar: " + (err.detail || "Error desconocido"));
      }
    } catch (e) {
      console.error(e);
      alert("Error de red.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este evento definitivamente?")) return;
    try {
      const res = await adminFetch(`/api/calendar/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEvents(events.filter(e => e.id !== id));
      } else {
        alert("No se pudo eliminar el evento.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleComplete = async (id: string) => {
    const evt = events.find(e => e.id === id);
    if (!evt) return;
    try {
      // Optimizacion local rapida
      setEvents(events.map(e => e.id === id ? { ...e, completed: !e.completed } : e));
      const res = await adminFetch(`/api/calendar/${id}`, {
        method: "PUT",
        body: JSON.stringify({ completed: !evt.completed })
      });
      if (!res.ok) {
         // Revert on fail
         await loadEvents();
      }
    } catch (e) {
      console.error(e);
      await loadEvents();
    }
  };

  const selectedEvents = events
    .filter(e => e.date === selectedDate && (filter === "all" || e.type === filter))
    .sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  const upcomingEvents = events
    .filter(e => e.date >= todayIso() && !e.completed)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  return (
    <div className="calendar-admin-container" style={{ minHeight: "100vh", color: "#e2e8f0" }}>
      <style>{`
        .calendar-admin-container {
          padding: 24px 28px;
        }
        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
          padding: 16px 24px;
          background: linear-gradient(135deg, rgba(30,41,59,0.7), rgba(15,23,42,0.4));
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 20px;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .header-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(15,23,42,0.6);
          padding: 6px 8px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.04);
        }
        .main-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          align-items: start;
        }
        .months-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        
        @media (max-width: 1200px) {
          .months-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .main-grid {
            grid-template-columns: 1fr 280px;
          }
        }
        @media (max-width: 900px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
          .header-container {
             flex-direction: column;
             align-items: center;
             text-align: center;
          }
          .header-left {
             flex-direction: column;
             text-align: center;
          }
          .header-controls {
             flex-wrap: wrap;
             justify-content: center;
          }
        }
        @media (max-width: 600px) {
          .calendar-admin-container {
             padding: 12px;
          }
          .months-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .header-controls {
             flex-direction: column;
             width: 100%;
             align-items: stretch;
          }
        }
      `}</style>

      {/* Premium Glassmorphic Header */}
      <div className="header-container">
        <div className="header-left">
          <div style={{
            background: "linear-gradient(135deg, #4f46e5, #ec4899)",
            borderRadius: 14, padding: "12px", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 20px rgba(236,72,153,0.3)"
          }}>
            <FaCalendarAlt size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, background: "linear-gradient(to right, #fff, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.03em" }}>Calendario</h1>
            <p style={{ color: "#94a3b8", fontSize: 13, margin: "4px 0 0 0", fontWeight: 500, letterSpacing: "0.02em" }}>Gestión empresarial de eventos, citas y recordatorios</p>
          </div>
        </div>

        <div className="header-controls">
          {/* Year Selector */}
          <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 4, border: "1px solid rgba(255,255,255,0.02)" }}>
            <button onClick={() => setViewYear(y => y - 1)} style={{ background: "transparent", border: "none", borderRadius: 6, color: "#94a3b8", padding: "8px 12px", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
              <FaChevronLeft size={14} />
            </button>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 18, minWidth: 64, textAlign: "center", letterSpacing: "0.1em" }}>{viewYear}</span>
            <button onClick={() => setViewYear(y => y + 1)} style={{ background: "transparent", border: "none", borderRadius: 6, color: "#94a3b8", padding: "8px 12px", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
              <FaChevronRight size={14} />
            </button>
          </div>

          <button onClick={() => { setEditingEvent(null); setShowModal(true); }} style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", padding: "10px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 14, boxShadow: "0 4px 15px rgba(99,102,241,0.4)", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            <FaPlus size={14} /> Nuevo Evento
          </button>
          
          <button onClick={loadEvents} disabled={isLoading} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#cbd5e1", padding: "10px 14px", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
            <FaSync size={14} className={isLoading ? "spin-icon" : ""} />
          </button>
        </div>
      </div>

      <div className="main-grid">
        {/* Year Grid */}
        <div>
          <div className="months-grid">
            {Array.from({ length: 12 }, (_, m) => (
              <div
                key={m}
                onClick={() => {
                  const today = new Date();
                  const d = toIso(viewYear, m, today.getMonth() === m && today.getFullYear() === viewYear ? today.getDate() : 1);
                  setSelectedDate(d);
                }}
                style={{ cursor: "pointer", height: "100%" }}
              >
                <MiniMonth
                  year={viewYear}
                  month={m}
                  events={events}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Selected Day Events */}
          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14, padding: 18
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <p style={{ color: "#a5b4fc", fontSize: 12, fontWeight: 700, margin: 0 }}>FECHA SELECCIONADA</p>
                <p style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 800, margin: 0 }}>{selectedDate || "—"}</p>
              </div>
              <button
                onClick={() => { setEditingEvent(null); setShowModal(true); }}
                style={{
                  background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
                  borderRadius: 8, color: "#818cf8", padding: "6px 10px", cursor: "pointer", fontSize: 12
                }}
              >
                <FaPlus size={11} />
              </button>
            </div>

            {/* Filter tabs */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {(["all", ...Object.keys(EVENT_COLORS)] as Array<"all"|EventType>).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    background: filter === f ? (f === "all" ? "rgba(99,102,241,0.2)" : EVENT_COLORS[f as EventType].bg) : "rgba(255,255,255,0.03)",
                    border: `1px solid ${filter === f ? (f === "all" ? "#6366f1" : EVENT_COLORS[f as EventType].border) : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 6, color: filter === f ? (f === "all" ? "#818cf8" : EVENT_COLORS[f as EventType].text) : "#475569",
                    padding: "4px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer"
                  }}
                >
                  {f === "all" ? "Todos" : EVENT_COLORS[f as EventType].label}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 340, overflowY: "auto" }}>
              {selectedEvents.length === 0 ? (
                <div style={{ 
                  textAlign: "center", padding: "34px 20px", 
                  background: "linear-gradient(180deg, rgba(30,41,59,0.3) 0%, rgba(15,23,42,0.6) 100%)",
                  borderRadius: 12, border: "1px dashed rgba(255,255,255,0.08)",
                  boxShadow: "inset 0 4px 20px rgba(0,0,0,0.2)"
                }}>
                  <FaCalendarAlt size={32} style={{ marginBottom: 14, color: "#64748b", opacity: 0.5 }} />
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#cbd5e1", margin: "0 0 6px 0" }}>Día libre de eventos</p>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 18px 0" }}>Selecciona un día en el calendario y usa este botón para agendar citas, recordatorios o deadlines.</p>
                  <button onClick={() => { setEditingEvent(null); setShowModal(true); }} 
                    style={{ 
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", 
                      borderRadius: 8, color: "#fff", padding: "10px 20px", cursor: "pointer", 
                      fontSize: 13, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 8,
                      boxShadow: "0 4px 15px rgba(99,102,241,0.4)"
                    }}>
                    <FaPlus size={12} /> Agendar en este día
                  </button>
                </div>
              ) : selectedEvents.map(evt => (
                <div
                  key={evt.id}
                  style={{
                    background: EVENT_COLORS[evt.type].bg,
                    border: `1px solid ${EVENT_COLORS[evt.type].border}`,
                    borderRadius: 10, padding: "10px 12px",
                    opacity: evt.completed ? 0.5 : 1
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ color: EVENT_COLORS[evt.type].text }}>{EVENT_COLORS[evt.type].icon}</span>
                        <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 700, textDecoration: evt.completed ? "line-through" : "none" }}>
                          {evt.title}
                        </span>
                      </div>
                      {evt.time && <p style={{ color: "#64748b", fontSize: 11, margin: 0 }}>⏰ {evt.time}</p>}
                      {evt.description && <p style={{ color: "#94a3b8", fontSize: 12, margin: "4px 0 0" }}>{evt.description}</p>}
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => handleToggleComplete(evt.id)}
                        style={{ background: evt.completed ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.05)", border: "none", borderRadius: 6, color: evt.completed ? "#4ade80" : "#475569", padding: "4px 6px", cursor: "pointer" }}>
                        <FaCheck size={10} />
                      </button>
                      <button onClick={() => { setEditingEvent(evt); setShowModal(true); }}
                        style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 6, color: "#475569", padding: "4px 6px", cursor: "pointer" }}>
                        <FaEdit size={10} />
                      </button>
                      <button onClick={() => handleDelete(evt.id)}
                        style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 6, color: "#ef4444", padding: "4px 6px", cursor: "pointer" }}>
                        <FaTrash size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14, padding: 18
          }}>
            <p style={{ color: "#a5b4fc", fontSize: 12, fontWeight: 700, marginBottom: 14 }}>PRÓXIMOS EVENTOS</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {upcomingEvents.length === 0 ? (
                <p style={{ color: "#334155", fontSize: 12, textAlign: "center", padding: "12px 0" }}>Sin eventos próximos</p>
              ) : upcomingEvents.map(evt => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedDate(evt.date)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                    padding: "8px 10px", borderRadius: 8,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    transition: "all 0.15s"
                  }}
                >
                  <span style={{ color: EVENT_COLORS[evt.type].text }}>{EVENT_COLORS[evt.type].icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600, margin: 0 }}>{evt.title}</p>
                    <p style={{ color: "#475569", fontSize: 11, margin: 0 }}>{evt.date}{evt.time ? ` · ${evt.time}` : ""}</p>
                  </div>
                  <span style={{
                    background: EVENT_COLORS[evt.type].bg,
                    border: `1px solid ${EVENT_COLORS[evt.type].border}`,
                    borderRadius: 5, color: EVENT_COLORS[evt.type].text, fontSize: 9, padding: "2px 6px", fontWeight: 700
                  }}>
                    {EVENT_COLORS[evt.type].label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "TOTAL EVENTOS", value: events.length, color: "#818cf8", bg: "rgba(129,140,248,0.15)", border: "rgba(129,140,248,0.3)" },
              { label: "COMPLETADOS", value: events.filter(e => e.completed).length, color: "#4ade80", bg: "rgba(74,222,128,0.15)", border: "rgba(74,222,128,0.3)" },
              { label: "PENDIENTES", value: events.filter(e => !e.completed && e.date >= todayIso()).length, color: "#fbbf24", bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.3)" },
              { label: "VENCIDOS", value: events.filter(e => !e.completed && e.date < todayIso()).length, color: "#f87171", bg: "rgba(248,113,113,0.15)", border: "rgba(248,113,113,0.3)" },
            ].map(s => (
              <div key={s.label} style={{
                background: "linear-gradient(145deg, rgba(30,41,59,0.3), rgba(15,23,42,0.5))", 
                border: `1px solid rgba(255,255,255,0.05)`, 
                borderLeft: `3px solid ${s.color}`,
                borderRadius: 12, padding: "14px",
                display: "flex", flexDirection: "column", gap: 4,
                boxShadow: `0 4px 15px -8px ${s.bg}`,
              }}>
                <p style={{ color: s.color, fontSize: 24, fontWeight: 900, margin: 0, lineHeight: 1 }}>{s.value}</p>
                <p style={{ color: "#94a3b8", fontSize: 10, margin: 0, fontWeight: 700, letterSpacing: "0.05em" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <EventModal
          date={selectedDate || todayIso()}
          event={editingEvent}
          onSave={handleSaveEvent}
          onClose={() => { setShowModal(false); setEditingEvent(null); }}
        />
      )}
    </div>
  );
}
