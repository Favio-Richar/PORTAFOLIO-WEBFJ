"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaBan,
  FaCalendarAlt,
  FaCalendarCheck,
  FaCalendarDay,
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaEnvelopeOpenText,
  FaHistory,
  FaLink,
  FaRedoAlt,
  FaSave,
  FaSyncAlt,
  FaTimesCircle,
  FaTrashAlt,
} from "react-icons/fa";
import API_BASE from "@/lib/apiBase";
import { adminFetch } from "@/lib/adminFetch";

const BACKEND_URL = API_BASE;

type MeetingProvider = "google_meet" | "zoom" | "teams" | "jitsi" | "whereby" | "other";
type BookingStatus = "pending" | "confirmed" | "cancelled" | "rescheduled";
type SupportedMeetingProvider = "google_meet" | "teams" | "jitsi";

type AdminBooking = {
  id: string;
  service_id?: number | null;
  service_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  date: string;
  time: string;
  status: BookingStatus;
  meeting_provider: MeetingProvider;
  meeting_link?: string | null;
  reminders_h24?: boolean;
  reminders_h1?: boolean;
  reminder_h24_sent_at?: string | null;
  reminder_h1_sent_at?: string | null;
  created_at?: string;
};

type WeekdayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
type DailyAvailability = { enabled: boolean; start: string; end: string };
type WeeklyAvailability = Record<WeekdayKey, DailyAvailability>;
type WeeklyAvailabilityApiDay = { weekday: number; enabled: boolean; start_time: string; end_time: string };
type MeetingProviderPublic = { id: SupportedMeetingProvider; label: string; enabled: boolean };
type BlockedSlot = { id: number; date: string; time: string; reason?: string | null; active: boolean; created_at?: string };
type AvailabilityApiResponse = { slots: string[]; timezone?: string };
type RescheduleSelection = { bookingId: string; originalDate: string; originalTime: string };
type AgendaMode = "day" | "week";
type AgendaScope = "active" | "all";
type ReminderRunResult = {
  run_at: string;
  automatic_enabled: boolean;
  window_minutes: number;
  scanned: number;
  sent_h24: number;
  sent_h1: number;
  errors: number;
};
type ReminderStatusResponse = {
  automatic_enabled: boolean;
  poll_seconds: number;
  window_minutes: number;
  last_run_at?: string | null;
  last_result?: ReminderRunResult | null;
  worker_running?: boolean;
};

const WEEKDAY_LABELS: ReadonlyArray<readonly [WeekdayKey, string]> = [
  ["mon", "Lunes"],
  ["tue", "Martes"],
  ["wed", "Miercoles"],
  ["thu", "Jueves"],
  ["fri", "Viernes"],
  ["sat", "Sabado"],
  ["sun", "Domingo"],
] as const;

const DEFAULT_WEEKLY_AVAILABILITY: WeeklyAvailability = {
  mon: { enabled: true, start: "09:00", end: "18:00" },
  tue: { enabled: true, start: "09:00", end: "18:00" },
  wed: { enabled: true, start: "09:00", end: "18:00" },
  thu: { enabled: true, start: "09:00", end: "18:00" },
  fri: { enabled: true, start: "09:00", end: "18:00" },
  sat: { enabled: true, start: "10:00", end: "13:00" },
  sun: { enabled: false, start: "00:00", end: "00:00" },
};

const WEEKDAY_NUMBER: Record<WeekdayKey, number> = {
  mon: 0,
  tue: 1,
  wed: 2,
  thu: 3,
  fri: 4,
  sat: 5,
  sun: 6,
};

const WEEKDAY_FROM_NUMBER: Record<number, WeekdayKey> = {
  0: "mon",
  1: "tue",
  2: "wed",
  3: "thu",
  4: "fri",
  5: "sat",
  6: "sun",
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseISODate(value: string) {
  const [y, m, d] = String(value || "").split("-").map((part) => Number(part));
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}

function normalizeDateInput(value: string): string | null {
  const raw = String(value || "").trim();
  if (!raw) return null;

  let year = 0;
  let month = 0;
  let day = 0;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split("-").map((part) => Number(part));
    year = y;
    month = m;
    day = d;
  } else if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
    const [d, m, y] = raw.split("-").map((part) => Number(part));
    year = y;
    month = m;
    day = d;
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [d, m, y] = raw.split("/").map((part) => Number(part));
    year = y;
    month = m;
    day = d;
  } else {
    return null;
  }

  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function normalizeTimeInput(value: string): string | null {
  const raw = String(value || "").trim();
  const match = /^(\d{1,2}):(\d{2})$/.exec(raw);
  if (!match) return null;

  const hh = Number(match[1]);
  const mm = Number(match[2]);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;

  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function startOfWeekMonday(date: Date) {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(date, diff);
}

function formatAgendaDateLabel(dateIso: string) {
  const date = parseISODate(dateIso);
  return date.toLocaleDateString("es-CL", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function formatLocalDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await adminFetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const raw = await response.text();
    let detail = `HTTP ${response.status} on ${path}`;
    try {
      if (raw) {
        const parsed = JSON.parse(raw) as { detail?: string };
        if (parsed?.detail) detail = parsed.detail;
      }
    } catch {
      if (raw) detail = raw;
    }
    throw new Error(detail);
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

function statusClasses(status: BookingStatus) {
  if (status === "confirmed") return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200";
  if (status === "cancelled") return "border-rose-400/20 bg-rose-500/10 text-rose-200";
  if (status === "rescheduled") return "border-violet-400/20 bg-violet-500/10 text-violet-200";
  return "border-sky-400/20 bg-sky-500/10 text-sky-200";
}

function agendaStatusLabel(status: BookingStatus) {
  if (status === "confirmed") return "Confirmada";
  if (status === "cancelled") return "Cancelada";
  if (status === "rescheduled") return "Reprogramada";
  return "Pendiente";
}

function agendaBadgeClasses(status: BookingStatus) {
  if (status === "confirmed") return "border-emerald-400/40 bg-emerald-500/20 text-emerald-100";
  if (status === "cancelled") return "border-rose-400/40 bg-rose-500/20 text-rose-100";
  if (status === "rescheduled") return "border-violet-400/40 bg-violet-500/20 text-violet-100";
  return "border-sky-400/40 bg-sky-500/20 text-sky-100";
}

function agendaItemClasses(status: BookingStatus) {
  if (status === "confirmed") return "border-emerald-400/25 bg-gradient-to-br from-emerald-500/12 to-[#071726]";
  if (status === "cancelled") return "border-rose-400/25 bg-gradient-to-br from-rose-500/12 to-[#190a16]";
  if (status === "rescheduled") return "border-violet-400/25 bg-gradient-to-br from-violet-500/12 to-[#120a1f]";
  return "border-sky-400/25 bg-gradient-to-br from-sky-500/12 to-[#071425]";
}

function agendaDotClasses(status: BookingStatus) {
  if (status === "confirmed") return "bg-emerald-300";
  if (status === "cancelled") return "bg-rose-300";
  if (status === "rescheduled") return "bg-violet-300";
  return "bg-sky-300";
}

function reminderState(
  booking: AdminBooking,
  lane: "h24" | "h1"
): { label: string; className: string; sentAt?: string | null } {
  const enabled = lane === "h24" ? Boolean(booking.reminders_h24) : Boolean(booking.reminders_h1);
  const sentAt = lane === "h24" ? booking.reminder_h24_sent_at : booking.reminder_h1_sent_at;

  if (!enabled) {
    return {
      label: "Desactivado",
      className: "border-slate-400/25 bg-slate-500/10 text-slate-200",
      sentAt: null,
    };
  }
  if (sentAt) {
    return {
      label: "Enviado",
      className: "border-emerald-400/35 bg-emerald-500/15 text-emerald-100",
      sentAt,
    };
  }
  if (booking.status === "cancelled") {
    return {
      label: "Cancelada",
      className: "border-rose-400/35 bg-rose-500/15 text-rose-100",
      sentAt: null,
    };
  }
  return {
    label: "Pendiente",
    className: "border-amber-400/35 bg-amber-500/15 text-amber-100",
    sentAt: null,
  };
}

export default function AdvisoriesAdmin() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingKey, setSavingKey] = useState("");

  const [blockDate, setBlockDate] = useState(() => formatISODate(addDays(new Date(), 1)));
  const [blockTime, setBlockTime] = useState("10:00");
  const [blockReason, setBlockReason] = useState("Bloqueo interno");
  const [providerOptions, setProviderOptions] = useState<MeetingProviderPublic[]>([]);

  const [rescheduleBookingId, setRescheduleBookingId] = useState("");
  const [rescheduleServiceId, setRescheduleServiceId] = useState<number | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState(() => formatISODate(addDays(new Date(), 1)));
  const [rescheduleTime, setRescheduleTime] = useState("10:00");
  const [rescheduleProvider, setRescheduleProvider] = useState<SupportedMeetingProvider>("google_meet");
  const [rescheduleNotes, setRescheduleNotes] = useState("");
  const [rescheduleNotifyClient, setRescheduleNotifyClient] = useState(true);
  const [rescheduleAvailableTimes, setRescheduleAvailableTimes] = useState<string[]>([]);
  const [rescheduleTimesLoading, setRescheduleTimesLoading] = useState(false);
  const [rescheduleSelection, setRescheduleSelection] = useState<RescheduleSelection | null>(null);
  const [agendaMode, setAgendaMode] = useState<AgendaMode>("day");
  const [agendaScope, setAgendaScope] = useState<AgendaScope>("active");
  const [agendaDate, setAgendaDate] = useState(() => formatISODate(new Date()));
  const [reminderStatus, setReminderStatus] = useState<ReminderStatusResponse | null>(null);
  const blockDatePickerRef = useRef<HTMLInputElement | null>(null);
  const blockTimePickerRef = useRef<HTMLInputElement | null>(null);

  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailability>(DEFAULT_WEEKLY_AVAILABILITY);
  const todayIso = useMemo(() => formatISODate(new Date()), []);

  const pendingCount = useMemo(() => bookings.filter((item) => item.status === "pending").length, [bookings]);
  const confirmedCount = useMemo(() => bookings.filter((item) => item.status === "confirmed").length, [bookings]);
  const cancelledCount = useMemo(() => bookings.filter((item) => item.status === "cancelled").length, [bookings]);
  const hasEnabledRescheduleProvider = useMemo(
    () => providerOptions.some((provider) => provider.enabled),
    [providerOptions]
  );
  const selectedRescheduleBooking = useMemo(
    () => bookings.find((item) => item.id === rescheduleBookingId) || null,
    [bookings, rescheduleBookingId]
  );
  const isRescheduleTimeAvailable = useMemo(
    () => Boolean(rescheduleTime) && rescheduleAvailableTimes.includes(rescheduleTime),
    [rescheduleAvailableTimes, rescheduleTime]
  );
  const canSubmitReschedule = useMemo(
    () =>
      Boolean(
        rescheduleBookingId &&
        rescheduleServiceId &&
        rescheduleDate &&
        rescheduleTime &&
        !rescheduleTimesLoading &&
        hasEnabledRescheduleProvider &&
        isRescheduleTimeAvailable
      ),
    [
      hasEnabledRescheduleProvider,
      isRescheduleTimeAvailable,
      rescheduleBookingId,
      rescheduleDate,
      rescheduleServiceId,
      rescheduleTime,
      rescheduleTimesLoading,
    ]
  );
  const agendaDates = useMemo(() => {
    if (agendaMode === "day") return [agendaDate];
    const start = startOfWeekMonday(parseISODate(agendaDate));
    return Array.from({ length: 7 }, (_, index) => formatISODate(addDays(start, index)));
  }, [agendaDate, agendaMode]);
  const agendaDateSet = useMemo(() => new Set(agendaDates), [agendaDates]);
  const agendaBookings = useMemo(() => {
    return bookings
      .filter((booking) => {
        if (!agendaDateSet.has(booking.date)) return false;
        if (agendaScope === "active" && booking.status === "cancelled") return false;
        return true;
      })
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }, [agendaDateSet, agendaScope, bookings]);
  const agendaStats = useMemo(
    () => ({
      total: agendaBookings.length,
      pending: agendaBookings.filter((item) => item.status === "pending").length,
      confirmed: agendaBookings.filter((item) => item.status === "confirmed").length,
      rescheduled: agendaBookings.filter((item) => item.status === "rescheduled").length,
      cancelled: agendaBookings.filter((item) => item.status === "cancelled").length,
    }),
    [agendaBookings]
  );
  const agendaByDate = useMemo(
    () =>
      agendaDates.map((date) => ({
        date,
        items: agendaBookings.filter((item) => item.date === date),
      })),
    [agendaBookings, agendaDates]
  );
  const reminderHistoryRows = useMemo(() => bookings.slice(0, 60), [bookings]);
  const reminderHistoryStats = useMemo(() => {
    let h24Sent = 0;
    let h1Sent = 0;
    let h24Pending = 0;
    let h1Pending = 0;

    reminderHistoryRows.forEach((booking) => {
      if (booking.reminders_h24) {
        if (booking.reminder_h24_sent_at) h24Sent += 1;
        else if (booking.status !== "cancelled") h24Pending += 1;
      }
      if (booking.reminders_h1) {
        if (booking.reminder_h1_sent_at) h1Sent += 1;
        else if (booking.status !== "cancelled") h1Pending += 1;
      }
    });

    return {
      rows: reminderHistoryRows.length,
      h24Sent,
      h1Sent,
      pending: h24Pending + h1Pending,
    };
  }, [reminderHistoryRows]);

  const loadReminderStatus = useCallback(async () => {
    try {
      const status = await apiRequest<ReminderStatusResponse>("/api/admin/reminders/status", { method: "GET" });
      setReminderStatus(status);
    } catch {
      setReminderStatus(null);
    }
  }, []);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const [bookingData, weeklyData, blockedData, providersData] = await Promise.all([
        apiRequest<AdminBooking[]>("/api/admin/bookings", { method: "GET" }),
        apiRequest<WeeklyAvailabilityApiDay[]>("/api/admin/weekly-availability", { method: "GET" }),
        apiRequest<BlockedSlot[]>("/api/admin/blocked-slots?active_only=true", { method: "GET" }),
        apiRequest<MeetingProviderPublic[]>("/api/asesoria/providers", { method: "GET" }),
      ]);

      if (Array.isArray(bookingData)) {
        setBookings(bookingData);
      } else {
        setBookings([]);
      }

      if (Array.isArray(blockedData)) {
        setBlockedSlots(blockedData);
      } else {
        setBlockedSlots([]);
      }

      if (Array.isArray(providersData)) {
        const clean = providersData.filter((item): item is MeetingProviderPublic => item?.id === "google_meet" || item?.id === "teams" || item?.id === "jitsi");
        setProviderOptions(clean);
        const firstEnabled = clean.find((item) => item.enabled);
        if (firstEnabled) setRescheduleProvider(firstEnabled.id);
      }

      if (Array.isArray(weeklyData) && weeklyData.length > 0) {
        setWeeklyAvailability((prev) => {
          const next = { ...prev };
          weeklyData.forEach((day) => {
            const key = WEEKDAY_FROM_NUMBER[day.weekday];
            if (!key) return;
            next[key] = {
              enabled: Boolean(day.enabled),
              start: String(day.start_time || "09:00"),
              end: String(day.end_time || "18:00"),
            };
          });
          return next;
        });
      }
    } catch (err) {
      setBookings([]);
      setBlockedSlots([]);
      setError(err instanceof Error ? err.message : "No se pudo leer datos de reservas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings().catch(() => void 0);
    loadReminderStatus().catch(() => void 0);
  }, [loadBookings, loadReminderStatus]);

  useEffect(() => {
    if (!rescheduleBookingId || !rescheduleDate || !rescheduleServiceId) {
      setRescheduleAvailableTimes([]);
      setRescheduleTimesLoading(false);
      return;
    }

    let active = true;
    setRescheduleTimesLoading(true);

    apiRequest<AvailabilityApiResponse>(
      `/api/asesoria/availability?date=${encodeURIComponent(rescheduleDate)}&service_id=${encodeURIComponent(String(rescheduleServiceId))}`,
      { method: "GET" }
    )
      .then((response) => {
        if (!active) return;
        const slots = Array.isArray(response?.slots) ? response.slots : [];
        const mergedSlots = [...slots];
        if (
          rescheduleSelection &&
          rescheduleSelection.bookingId === rescheduleBookingId &&
          rescheduleSelection.originalDate === rescheduleDate &&
          rescheduleSelection.originalTime &&
          !mergedSlots.includes(rescheduleSelection.originalTime)
        ) {
          mergedSlots.unshift(rescheduleSelection.originalTime);
        }
        setRescheduleAvailableTimes(mergedSlots);
        setRescheduleTime((prev) => {
          if (mergedSlots.includes(prev)) return prev;
          return mergedSlots[0] || "";
        });
      })
      .catch(() => {
        if (!active) return;
        setRescheduleAvailableTimes([]);
        setRescheduleTime("");
      })
      .finally(() => {
        if (active) setRescheduleTimesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [rescheduleBookingId, rescheduleDate, rescheduleServiceId, rescheduleSelection]);

  const updateBookingStatus = useCallback(async (id: string, status: BookingStatus) => {
    setSavingKey(`status-${id}-${status}`);
    setNotice("");
    try {
      await apiRequest(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setBookings((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
      setNotice(`Reserva ${id} actualizada a ${status}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar estado.");
    } finally {
      setSavingKey("");
    }
  }, []);

  const resendConfirmation = useCallback(async (bookingId: string) => {
    setSavingKey(`resend-${bookingId}`);
    setNotice("");
    try {
      await apiRequest("/api/admin/resend-confirmation", {
        method: "POST",
        body: JSON.stringify({ booking_id: bookingId }),
      });
      setNotice(`Confirmacion reenviada para la reserva ${bookingId}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo reenviar la confirmacion.");
    } finally {
      setSavingKey("");
    }
  }, []);

  const runRemindersNow = useCallback(async () => {
    setSavingKey("run-reminders");
    setNotice("");
    setError("");
    try {
      const result = await apiRequest<ReminderRunResult>("/api/admin/reminders/run-now", {
        method: "POST",
      });
      setNotice(
        `Recordatorios ejecutados: ${result.sent_h24} (24h), ${result.sent_h1} (1h). Escaneadas: ${result.scanned}. Errores: ${result.errors}.`
      );
      await loadReminderStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron ejecutar recordatorios.");
    } finally {
      setSavingKey("");
    }
  }, [loadReminderStatus]);

  const viewBooking = useCallback((booking: AdminBooking) => {
    setError("");
    setAgendaMode("day");
    setAgendaScope("all");
    setAgendaDate(booking.date);

    if (booking.meeting_link) {
      window.open(booking.meeting_link, "_blank", "noopener,noreferrer");
      setNotice(`Abriendo enlace de reunion para ${booking.id}.`);
      return;
    }

    setNotice(`Mostrando ${booking.id} en agenda (${booking.date} ${booking.time}).`);
  }, []);

  const showBookingHistory = useCallback((booking: AdminBooking) => {
    setError("");
    setAgendaMode("day");
    setAgendaScope("all");
    setAgendaDate(booking.date);

    const h24 = reminderState(booking, "h24");
    const h1 = reminderState(booking, "h1");
    const h24Summary = h24.sentAt ? `${h24.label} (${formatLocalDateTime(h24.sentAt)})` : h24.label;
    const h1Summary = h1.sentAt ? `${h1.label} (${formatLocalDateTime(h1.sentAt)})` : h1.label;
    setNotice(`Historial ${booking.id}: 24h ${h24Summary} | 1h ${h1Summary}.`);
  }, []);

  const deleteBooking = useCallback(
    async (booking: AdminBooking) => {
      const confirmed = window.confirm(
        `Eliminar ${booking.id} borrara la reserva de forma permanente de la base de datos. Deseas continuar?`
      );
      if (!confirmed) return;

      setSavingKey(`delete-${booking.id}`);
      setNotice("");
      setError("");

      try {
        await apiRequest(`/api/admin/bookings/${booking.id}`, { method: "DELETE" });
        setBookings((prev) => prev.filter((item) => item.id !== booking.id));
        if (rescheduleBookingId === booking.id) {
          setRescheduleBookingId("");
          setRescheduleServiceId(null);
          setRescheduleSelection(null);
          setRescheduleAvailableTimes([]);
        }
        setNotice(`Reserva ${booking.id} eliminada de forma permanente.`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo eliminar la reserva.");
      } finally {
        setSavingKey("");
      }
    },
    [rescheduleBookingId]
  );

  const openRescheduleForm = useCallback(
    (booking: AdminBooking) => {
      setError("");
      setNotice("");
      setRescheduleBookingId(booking.id);
      setRescheduleServiceId(typeof booking.service_id === "number" ? booking.service_id : null);
      setRescheduleDate(booking.date);
      setRescheduleTime(booking.time);
      setRescheduleSelection({
        bookingId: booking.id,
        originalDate: booking.date,
        originalTime: booking.time,
      });
      let normalizedProvider: SupportedMeetingProvider = "google_meet";
      if (booking.meeting_provider === "teams") normalizedProvider = "teams";
      else if (booking.meeting_provider === "jitsi") normalizedProvider = "jitsi";

      const preferredProvider =
        providerOptions.find((item) => item.id === normalizedProvider && item.enabled)?.id ||
        providerOptions.find((item) => item.enabled)?.id ||
        "google_meet";
      setRescheduleProvider(preferredProvider);
      setRescheduleNotes("");
      setRescheduleNotifyClient(true);
      setRescheduleAvailableTimes([]);
    },
    [providerOptions]
  );

  const clearRescheduleForm = useCallback(() => {
    setRescheduleBookingId("");
    setRescheduleServiceId(null);
    setRescheduleDate(formatISODate(addDays(new Date(), 1)));
    setRescheduleTime("10:00");
    setRescheduleNotes("");
    setRescheduleNotifyClient(true);
    setRescheduleAvailableTimes([]);
    setRescheduleTimesLoading(false);
    setRescheduleSelection(null);
  }, []);

  const submitReschedule = useCallback(async () => {
    if (!rescheduleBookingId || !rescheduleDate || !rescheduleTime) return;

    setSavingKey(`reschedule-${rescheduleBookingId}`);
    setNotice("");
    setError("");
    try {
      const response = await apiRequest<{
        ok: boolean;
        id: string;
        status: BookingStatus;
        date: string;
        time: string;
        meeting_provider: MeetingProvider;
        meeting_link?: string | null;
        detail?: string;
        email_sent?: boolean;
      }>(`/api/admin/bookings/${rescheduleBookingId}/reschedule`, {
        method: "POST",
        body: JSON.stringify({
          date: rescheduleDate,
          time: rescheduleTime,
          meeting_provider: rescheduleProvider,
          notify_client: rescheduleNotifyClient,
          notes: rescheduleNotes.trim() || null,
        }),
      });

      setBookings((prev) =>
        prev.map((item) =>
          item.id === response.id
            ? {
              ...item,
              date: response.date,
              time: response.time,
              status: response.status,
              meeting_provider: response.meeting_provider,
              meeting_link: response.meeting_link || item.meeting_link,
            }
            : item
        )
      );

      const emailHint = rescheduleNotifyClient
        ? response.email_sent
          ? " Confirmacion reenviada al cliente."
          : " Reserva reprogramada, pero no se pudo enviar correo."
        : "";
      setNotice(`Reserva ${response.id} reprogramada a ${response.date} ${response.time}.${emailHint}`);
      clearRescheduleForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo reprogramar la reserva.");
    } finally {
      setSavingKey("");
    }
  }, [
    clearRescheduleForm,
    rescheduleBookingId,
    rescheduleDate,
    rescheduleNotifyClient,
    rescheduleNotes,
    rescheduleProvider,
    rescheduleTime,
  ]);

  const blockSlot = useCallback(async () => {
    const normalizedDate = normalizeDateInput(blockDate);
    const normalizedTime = normalizeTimeInput(blockTime);
    if (!normalizedDate || !normalizedTime) {
      setError("Fecha u hora invalida. Usa DD-MM-YYYY o YYYY-MM-DD, y hora HH:MM.");
      return;
    }

    setSavingKey("block-slot");
    setNotice("");
    setError("");
    try {
      const created = await apiRequest<BlockedSlot>("/api/admin/blocked-slots", {
        method: "POST",
        body: JSON.stringify({
          date: normalizedDate,
          time: normalizedTime,
          reason: blockReason.trim() || "Bloqueo",
        }),
      });
      if (created?.id) {
        setBlockedSlots((prev) => {
          if (prev.some((item) => item.id === created.id)) return prev;
          return [created, ...prev].sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
        });
      }
      setBlockDate(normalizedDate);
      setBlockTime(normalizedTime);
      setNotice(`Horario bloqueado: ${normalizedDate} ${normalizedTime}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el bloqueo.");
    } finally {
      setSavingKey("");
    }
  }, [blockDate, blockReason, blockTime]);

  const openNativeDatePicker = useCallback(() => {
    const input = blockDatePickerRef.current;
    if (!input) return;
    const pickerInput = input as HTMLInputElement & { showPicker?: () => void };
    if (typeof pickerInput.showPicker === "function") pickerInput.showPicker();
    else input.focus();
  }, []);

  const openNativeTimePicker = useCallback(() => {
    const input = blockTimePickerRef.current;
    if (!input) return;
    const pickerInput = input as HTMLInputElement & { showPicker?: () => void };
    if (typeof pickerInput.showPicker === "function") pickerInput.showPicker();
    else input.focus();
  }, []);

  const unblockSlot = useCallback(async (slotId: number) => {
    setSavingKey(`unblock-${slotId}`);
    setNotice("");
    setError("");
    try {
      await apiRequest(`/api/admin/blocked-slots/${slotId}`, { method: "DELETE" });
      setBlockedSlots((prev) => prev.filter((item) => item.id !== slotId));
      setNotice(`Bloqueo ${slotId} eliminado.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo desbloquear el horario.");
    } finally {
      setSavingKey("");
    }
  }, []);

  const saveWeeklyAvailability = useCallback(async () => {
    setSavingKey("weekly-save");
    setNotice("");
    setError("");
    try {
      const days = (Object.keys(WEEKDAY_NUMBER) as WeekdayKey[]).map((key) => ({
        weekday: WEEKDAY_NUMBER[key],
        enabled: Boolean(weeklyAvailability[key].enabled),
        start_time: weeklyAvailability[key].start,
        end_time: weeklyAvailability[key].end,
      }));

      await apiRequest("/api/admin/weekly-availability", {
        method: "PUT",
        body: JSON.stringify({ days }),
      });
      setNotice("Disponibilidad semanal guardada en BD.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar disponibilidad semanal.");
    } finally {
      setSavingKey("");
    }
  }, [weeklyAvailability]);

  return (
    <div className="space-y-6 fade-in-up">
      <section className="border border-white/10 bg-[#070b14]/70 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <FaCalendarCheck className="text-cyan-300" />
              Reservas de Asesorias
            </h2>
            <p className="text-white/65 mt-2 text-sm">
              Modulo real para gestionar reservas, estados y bloqueos sin login local en pagina publica.
            </p>
          </div>
          <button
            onClick={() => loadBookings()}
            disabled={loading}
            className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] border border-white/20 bg-white/5 text-white hover:bg-white/10 disabled:opacity-60 inline-flex items-center gap-2"
          >
            <FaSyncAlt />
            {loading ? "Cargando..." : "Actualizar"}
          </button>
        </div>
      </section>

      {(error || notice) && (
        <section className="grid gap-3">
          {error ? <div className="border border-amber-500/30 bg-amber-500/10 text-amber-200 px-4 py-3 text-sm">{error}</div> : null}
          {notice ? <div className="border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 px-4 py-3 text-sm">{notice}</div> : null}
        </section>
      )}

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Reservas" value={bookings.length} color="blue" />
        <StatCard title="Pendientes" value={pendingCount} color="amber" />
        <StatCard title="Confirmadas" value={confirmedCount} color="emerald" />
        <StatCard title="Canceladas" value={cancelledCount} color="rose" />
      </section>

      <section className="border border-emerald-400/25 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.14),rgba(7,11,20,0.95)_46%)] p-5 space-y-4 shadow-[0_0_45px_rgba(16,185,129,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-black flex items-center gap-2">
              <FaCalendarAlt className="text-emerald-300" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-cyan-200 to-teal-100">
                Agenda operativa (dia/semana)
              </span>
            </h3>
            <p className="text-xs text-emerald-50/80 mt-1">
              Vista de trabajo para equipo: estado de reservas, prioridad y accion directa en cada bloque.
            </p>
          </div>
          <button
            onClick={() => setAgendaDate(todayIso)}
            type="button"
            className="px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] border border-emerald-300/40 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25"
          >
            Ir a hoy
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="border border-emerald-300/25 bg-[#071925]/70 p-3">
            <p className="text-[11px] uppercase tracking-widest text-emerald-100/70 font-bold mb-2">Modo</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAgendaMode("day")}
                className={`px-3 py-2 text-xs font-black uppercase tracking-[0.12em] border ${agendaMode === "day"
                    ? "border-emerald-300/60 bg-emerald-500/30 text-emerald-50 shadow-[0_0_16px_rgba(16,185,129,0.25)]"
                    : "border-white/15 bg-white/5 text-white/75 hover:bg-white/10"
                  }`}
              >
                Dia
              </button>
              <button
                type="button"
                onClick={() => setAgendaMode("week")}
                className={`px-3 py-2 text-xs font-black uppercase tracking-[0.12em] border ${agendaMode === "week"
                    ? "border-emerald-300/60 bg-emerald-500/30 text-emerald-50 shadow-[0_0_16px_rgba(16,185,129,0.25)]"
                    : "border-white/15 bg-white/5 text-white/75 hover:bg-white/10"
                  }`}
              >
                Semana
              </button>
            </div>
          </div>

          <label className="border border-emerald-300/25 bg-[#071925]/70 p-3 space-y-2 block">
            <span className="text-[11px] uppercase tracking-widest text-emerald-100/70 font-bold">Fecha base</span>
            <input
              type="date"
              value={agendaDate}
              onChange={(event) => setAgendaDate(event.target.value)}
              className="w-full bg-black/30 border border-emerald-200/25 text-emerald-50 px-3 py-2 text-sm outline-none"
            />
          </label>

          <label className="border border-emerald-300/25 bg-[#071925]/70 p-3 space-y-2 block">
            <span className="text-[11px] uppercase tracking-widest text-emerald-100/70 font-bold">Filtro</span>
            <select
              value={agendaScope}
              onChange={(event) => setAgendaScope(event.target.value as AgendaScope)}
              className="w-full bg-black/30 border border-emerald-200/25 text-emerald-50 px-3 py-2 text-sm outline-none"
            >
              <option value="active">Solo activas (sin canceladas)</option>
              <option value="all">Todas</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          <MiniStat title="Total" value={agendaStats.total} tone="blue" />
          <MiniStat title="Pendientes" value={agendaStats.pending} tone="amber" />
          <MiniStat title="Confirmadas" value={agendaStats.confirmed} tone="emerald" />
          <MiniStat title="Reprogramadas" value={agendaStats.rescheduled} tone="violet" />
          <MiniStat title="Canceladas" value={agendaStats.cancelled} tone="rose" />
        </div>

        <div className="flex flex-wrap gap-2">
          <AgendaLegend status="confirmed" />
          <AgendaLegend status="pending" />
          <AgendaLegend status="rescheduled" />
          <AgendaLegend status="cancelled" />
        </div>

        <div className={`${agendaMode === "week" ? "grid sm:grid-cols-2 xl:grid-cols-4 gap-3" : "space-y-3"}`}>
          {agendaByDate.map(({ date, items }) => (
            <article
              key={date}
              className={`border bg-[#041122]/80 p-3 backdrop-blur-sm ${date === todayIso ? "border-emerald-300/45 ring-1 ring-emerald-300/25" : "border-emerald-400/20"
                }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-sm font-black text-emerald-50 uppercase tracking-[0.08em]">{formatAgendaDateLabel(date)}</p>
                <span className="text-[11px] text-emerald-100/65">{items.length} reservas</span>
              </div>

              {!items.length ? (
                <p className="text-xs text-emerald-100/55 border border-emerald-300/20 bg-black/20 px-2 py-2">
                  Sin reservas para esta fecha.
                </p>
              ) : (
                <div className="space-y-2">
                  {items.map((booking) => (
                    <div key={`${date}-${booking.id}`} className={`relative overflow-hidden border p-2.5 ${agendaItemClasses(booking.status)}`}>
                      <span className={`absolute inset-x-0 top-0 h-[2px] ${agendaDotClasses(booking.status)}`} />
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-base font-black text-cyan-100">{booking.time}</p>
                        <span className={`px-2 py-1 border rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] ${agendaBadgeClasses(booking.status)}`}>
                          {agendaStatusLabel(booking.status)}
                        </span>
                      </div>
                      <p className="text-sm text-white font-semibold mt-1">{booking.customer_name}</p>
                      <p className="text-xs text-white/75">{booking.service_name}</p>
                      <p className="text-[11px] uppercase tracking-[0.1em] text-white/50 mt-1">
                        {booking.meeting_provider === "google_meet"
                          ? "Google Meet"
                          : booking.meeting_provider === "teams"
                            ? "Teams"
                            : booking.meeting_provider}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => openRescheduleForm(booking)}
                          className="px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] border border-violet-300/35 bg-violet-500/20 text-violet-100 hover:bg-violet-500/30"
                        >
                          Reagendar
                        </button>
                        {booking.meeting_link ? (
                          <a
                            href={booking.meeting_link}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] border border-emerald-300/35 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30"
                          >
                            Abrir reunion
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="border border-cyan-300/20 bg-[#061224]/85 p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <FaHistory className="text-cyan-300" />
              Historial Pro de Recordatorios
            </h3>
            <p className="text-xs text-white/60 mt-1">
              Seguimiento real por reserva: estado de recordatorio 24h/1h y marca de envio.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="border border-white/10 bg-black/20 px-3 py-2">
              <p className="text-white/55 uppercase tracking-[0.12em] text-[10px]">Reservas</p>
              <p className="font-black mt-1 text-cyan-100">{reminderHistoryStats.rows}</p>
            </div>
            <div className="border border-emerald-400/25 bg-emerald-500/10 px-3 py-2">
              <p className="text-emerald-100/70 uppercase tracking-[0.12em] text-[10px]">24h enviados</p>
              <p className="font-black mt-1 text-emerald-100">{reminderHistoryStats.h24Sent}</p>
            </div>
            <div className="border border-emerald-400/25 bg-emerald-500/10 px-3 py-2">
              <p className="text-emerald-100/70 uppercase tracking-[0.12em] text-[10px]">1h enviados</p>
              <p className="font-black mt-1 text-emerald-100">{reminderHistoryStats.h1Sent}</p>
            </div>
            <div className="border border-amber-400/25 bg-amber-500/10 px-3 py-2">
              <p className="text-amber-100/70 uppercase tracking-[0.12em] text-[10px]">Pendientes</p>
              <p className="font-black mt-1 text-amber-100">{reminderHistoryStats.pending}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border border-white/10 bg-black/20">
          <table className="w-full min-w-[1180px] text-sm">
            <thead className="bg-white/5 text-white/70 uppercase tracking-[0.14em] text-[11px]">
              <tr>
                <th className="text-left px-3 py-3">Reserva</th>
                <th className="text-left px-3 py-3">Cliente</th>
                <th className="text-left px-3 py-3">Fecha/Hora</th>
                <th className="text-left px-3 py-3">Recordatorio 24h</th>
                <th className="text-left px-3 py-3">Recordatorio 1h</th>
                <th className="text-left px-3 py-3">Creada</th>
                <th className="text-right px-3 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!reminderHistoryRows.length ? (
                <tr>
                  <td className="px-3 py-8 text-center text-white/60" colSpan={7}>
                    No hay reservas para mostrar historial.
                  </td>
                </tr>
              ) : (
                reminderHistoryRows.map((booking) => {
                  const h24 = reminderState(booking, "h24");
                  const h1 = reminderState(booking, "h1");
                  return (
                    <tr key={`reminder-${booking.id}`} className="border-t border-white/10 text-white/85 align-top">
                      <td className="px-3 py-3">
                        <p className="font-black text-cyan-100">{booking.id}</p>
                        <p className={`inline-block mt-1 px-2 py-1 border rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] ${statusClasses(booking.status)}`}>
                          {booking.status}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-semibold text-white">{booking.customer_name}</p>
                        <p className="text-white/55 text-xs">{booking.customer_email}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-semibold text-white">{booking.date}</p>
                        <p className="text-cyan-100/90">{booking.time}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-block px-2 py-1 border rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] ${h24.className}`}>
                          {h24.label}
                        </span>
                        <p className="text-xs text-white/55 mt-1">{h24.sentAt ? formatLocalDateTime(h24.sentAt) : "-"}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-block px-2 py-1 border rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] ${h1.className}`}>
                          {h1.label}
                        </span>
                        <p className="text-xs text-white/55 mt-1">{h1.sentAt ? formatLocalDateTime(h1.sentAt) : "-"}</p>
                      </td>
                      <td className="px-3 py-3 text-xs text-white/65">{formatLocalDateTime(booking.created_at)}</td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end flex-wrap gap-2">
                          <button
                            onClick={() => viewBooking(booking)}
                            type="button"
                            className="px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] border border-blue-400/35 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30"
                            title={booking.meeting_link ? "Ver enlace de reunion" : "Ver en agenda"}
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => openRescheduleForm(booking)}
                            type="button"
                            className="px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] border border-violet-400/35 bg-violet-500/20 text-violet-100 hover:bg-violet-500/30"
                            title="Editar reserva"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => showBookingHistory(booking)}
                            type="button"
                            className="px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] border border-cyan-400/35 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30"
                            title="Ver historial de recordatorios"
                          >
                            Historial
                          </button>
                          <button
                            onClick={() => deleteBooking(booking)}
                            type="button"
                            disabled={savingKey === `delete-${booking.id}`}
                            className="px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] border border-rose-400/35 bg-rose-500/20 text-rose-100 hover:bg-rose-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                            title="Borrar reserva definitivamente"
                          >
                            Borrar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <article className="xl:col-span-8 border border-white/10 bg-[#070b14]/70 p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-xl font-black text-white">Listado de reservas</h3>
            <p className="text-xs text-cyan-300/80 font-semibold tracking-[0.08em] uppercase">
              Panel operativo de reservas sincronizadas
            </p>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="h-12 bg-white/5 animate-pulse border border-white/10" />
              ))}
            </div>
          ) : !bookings.length ? (
            <div className="border border-white/10 bg-black/20 px-4 py-10 text-center text-sm text-white/65">
              No hay reservas registradas.
            </div>
          ) : (
            <div className="overflow-x-auto border border-white/10 bg-black/20">
              <table className="w-full min-w-[880px] text-sm">
                <thead className="bg-white/5 text-white/70 uppercase tracking-[0.14em] text-[11px]">
                  <tr>
                    <th className="text-left px-3 py-3">Cliente</th>
                    <th className="text-left px-3 py-3">Fecha</th>
                    <th className="text-left px-3 py-3">Hora</th>
                    <th className="text-left px-3 py-3">Servicio</th>
                    <th className="text-left px-3 py-3">Estado</th>
                    <th className="text-right px-3 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-t border-white/10 text-white/85">
                      <td className="px-3 py-3">
                        <p className="font-semibold text-white">{booking.customer_name}</p>
                        <p className="text-white/55 text-xs">{booking.customer_email}</p>
                      </td>
                      <td className="px-3 py-3">{booking.date}</td>
                      <td className="px-3 py-3">{booking.time}</td>
                      <td className="px-3 py-3">{booking.service_name}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-1 border rounded-full text-xs font-semibold capitalize ${statusClasses(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => updateBookingStatus(booking.id, "confirmed")}
                            disabled={savingKey === `status-${booking.id}-confirmed`}
                            className="p-2 border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-60"
                            title="Confirmar"
                          >
                            <FaCheckCircle />
                          </button>
                          <button
                            onClick={() => openRescheduleForm(booking)}
                            disabled={savingKey === `reschedule-${booking.id}`}
                            className="p-2 border border-violet-400/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 disabled:opacity-60"
                            title="Reprogramar"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.id, "cancelled")}
                            disabled={savingKey === `status-${booking.id}-cancelled`}
                            className="p-2 border border-rose-400/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 disabled:opacity-60"
                            title="Marcar como cancelada"
                          >
                            <FaTimesCircle />
                          </button>
                          <button
                            onClick={() => deleteBooking(booking)}
                            disabled={savingKey === `delete-${booking.id}`}
                            className="p-2 border border-rose-500/45 bg-rose-600/20 text-rose-200 hover:bg-rose-600/30 disabled:opacity-60 disabled:cursor-not-allowed"
                            title="Borrar reserva definitivamente"
                          >
                            <FaTrashAlt />
                          </button>
                          <button
                            onClick={() => resendConfirmation(booking.id)}
                            disabled={savingKey === `resend-${booking.id}`}
                            className="p-2 border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-60"
                            title="Reenviar confirmacion"
                          >
                            <FaEnvelopeOpenText />
                          </button>
                          {booking.meeting_link ? (
                            <a
                              href={booking.meeting_link}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 border border-blue-400/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"
                              title="Abrir enlace de reunion"
                            >
                              <FaLink />
                            </a>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <aside className="xl:col-span-4 space-y-5">
          <article className="border border-emerald-400/20 bg-[linear-gradient(180deg,rgba(16,185,129,0.12),rgba(7,11,20,0.85))] p-5 space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <FaEnvelopeOpenText className="text-emerald-300" />
              Recordatorios automaticos
            </h3>
            <p className="text-xs text-white/70">
              Control de envio de correos 24h y 1h antes. No requiere tocar credenciales ahora; quedara activo cuando las cargues.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="border border-white/10 bg-black/25 px-3 py-2">
                <p className="text-white/55 uppercase tracking-[0.12em] text-[10px]">Automatico</p>
                <p className={`font-black mt-1 ${reminderStatus?.automatic_enabled ? "text-emerald-200" : "text-amber-200"}`}>
                  {reminderStatus?.automatic_enabled ? "Activo" : "Desactivado"}
                </p>
              </div>
              <div className="border border-white/10 bg-black/25 px-3 py-2">
                <p className="text-white/55 uppercase tracking-[0.12em] text-[10px]">Worker</p>
                <p className={`font-black mt-1 ${reminderStatus?.worker_running ? "text-emerald-200" : "text-amber-200"}`}>
                  {reminderStatus?.worker_running ? "En ejecucion" : "Detenido"}
                </p>
              </div>
              <div className="border border-white/10 bg-black/25 px-3 py-2">
                <p className="text-white/55 uppercase tracking-[0.12em] text-[10px]">Intervalo</p>
                <p className="font-black mt-1 text-cyan-200">{reminderStatus?.poll_seconds ?? "-"} s</p>
              </div>
              <div className="border border-white/10 bg-black/25 px-3 py-2">
                <p className="text-white/55 uppercase tracking-[0.12em] text-[10px]">Ventana</p>
                <p className="font-black mt-1 text-cyan-200">{reminderStatus?.window_minutes ?? "-"} min</p>
              </div>
            </div>

            <div className="border border-white/10 bg-black/25 p-3 text-xs text-white/75 space-y-1">
              <p>
                <span className="text-white/50">Ultima ejecucion:</span> {formatLocalDateTime(reminderStatus?.last_run_at)}
              </p>
              <p>
                <span className="text-white/50">Enviados 24h:</span> {reminderStatus?.last_result?.sent_h24 ?? 0}
              </p>
              <p>
                <span className="text-white/50">Enviados 1h:</span> {reminderStatus?.last_result?.sent_h1 ?? 0}
              </p>
              <p>
                <span className="text-white/50">Errores:</span> {reminderStatus?.last_result?.errors ?? 0}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={runRemindersNow}
                disabled={savingKey === "run-reminders"}
                className="flex-1 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] border border-emerald-300/40 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {savingKey === "run-reminders" ? "Ejecutando..." : "Ejecutar ahora"}
              </button>
              <button
                onClick={() => loadReminderStatus()}
                type="button"
                className="px-4 py-2 text-xs font-black uppercase tracking-[0.16em] border border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                Refrescar
              </button>
            </div>
          </article>

          <article className="border border-white/10 bg-[#070b14]/70 p-5 space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <FaCalendarDay className="text-violet-300" />
              Reagendar reserva
            </h3>
            <p className="text-xs text-white/60">
              Selecciona una reserva desde la tabla (icono lapiz) y asigna nueva fecha, hora y plataforma.
            </p>
            {!hasEnabledRescheduleProvider ? (
              <div className="border border-amber-500/30 bg-amber-500/10 text-amber-200 px-3 py-2 text-xs">
                Google Meet/Teams no estan configurados en backend. Configura credenciales para reprogramar.
              </div>
            ) : null}

            <div className="space-y-3">
              {!selectedRescheduleBooking ? (
                <div className="border border-cyan-400/25 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200">
                  Selecciona una reserva en la tabla (boton lapiz) para cargar datos reales y reagendar sin errores.
                </div>
              ) : (
                <div className="border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/75 space-y-1">
                  <p>
                    <span className="text-white/50">Cliente:</span> {selectedRescheduleBooking.customer_name}
                  </p>
                  <p>
                    <span className="text-white/50">Servicio:</span> {selectedRescheduleBooking.service_name}
                  </p>
                  <p>
                    <span className="text-white/50">Actual:</span> {selectedRescheduleBooking.date} {selectedRescheduleBooking.time}
                  </p>
                </div>
              )}

              <label className="space-y-1 block">
                <span className="text-[11px] uppercase tracking-widest text-white/60 font-bold">Codigo reserva</span>
                <div className="flex gap-2">
                  <input
                    value={rescheduleBookingId}
                    readOnly
                    placeholder="Selecciona desde tabla"
                    className="w-full bg-black/30 border border-white/15 text-white/85 px-3 py-2 text-sm outline-none"
                  />
                  <button
                    onClick={clearRescheduleForm}
                    type="button"
                    className="px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] border border-white/20 bg-white/5 text-white hover:bg-white/10"
                  >
                    Limpiar
                  </button>
                </div>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-1 block">
                  <span className="text-[11px] uppercase tracking-widest text-white/60 font-bold">Nueva fecha</span>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(event) => setRescheduleDate(event.target.value)}
                    className="w-full bg-black/30 border border-white/15 text-white px-3 py-2 text-sm outline-none"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-[11px] uppercase tracking-widest text-white/60 font-bold">Hora disponible</span>
                  <select
                    value={rescheduleTime}
                    onChange={(event) => setRescheduleTime(event.target.value)}
                    disabled={!rescheduleBookingId || rescheduleTimesLoading || !rescheduleAvailableTimes.length}
                    className="w-full bg-black/30 border border-white/15 text-white px-3 py-2 text-sm outline-none disabled:opacity-60"
                  >
                    {!rescheduleAvailableTimes.length ? (
                      <option value="">
                        {rescheduleTimesLoading ? "Buscando horarios..." : "Sin horarios para este dia"}
                      </option>
                    ) : null}
                    {rescheduleAvailableTimes.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                        {rescheduleSelection &&
                          rescheduleSelection.bookingId === rescheduleBookingId &&
                          rescheduleSelection.originalDate === rescheduleDate &&
                          rescheduleSelection.originalTime === slot
                          ? " (hora actual)"
                          : ""}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="text-[11px] text-white/60 border border-white/10 bg-black/20 px-3 py-2">
                {rescheduleTimesLoading
                  ? "Consultando disponibilidad real..."
                  : rescheduleAvailableTimes.length
                    ? `${rescheduleAvailableTimes.length} horarios disponibles para la fecha seleccionada.`
                    : "No hay horarios disponibles. Cambia la fecha para reagendar."}
              </div>

              <label className="space-y-1 block">
                <span className="text-[11px] uppercase tracking-widest text-white/60 font-bold">Plataforma</span>
                <select
                  value={rescheduleProvider}
                  onChange={(event) => setRescheduleProvider(event.target.value as SupportedMeetingProvider)}
                  className="w-full bg-black/30 border border-white/15 text-white px-3 py-2 text-sm outline-none"
                >
                  {providerOptions.map((provider) => (
                    <option key={provider.id} value={provider.id} disabled={!provider.enabled}>
                      {provider.label} {!provider.enabled ? "(No configurado)" : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 block">
                <span className="text-[11px] uppercase tracking-widest text-white/60 font-bold">Nota de reprogramacion (opcional)</span>
                <textarea
                  value={rescheduleNotes}
                  onChange={(event) => setRescheduleNotes(event.target.value)}
                  rows={2}
                  className="w-full bg-black/30 border border-white/15 text-white px-3 py-2 text-sm outline-none"
                  placeholder="Motivo de cambio para contexto interno."
                />
              </label>

              <label className="flex items-center justify-between text-xs text-white/75 border border-white/10 bg-black/20 px-3 py-2">
                <span>Notificar al cliente por correo</span>
                <input
                  type="checkbox"
                  checked={rescheduleNotifyClient}
                  onChange={(event) => setRescheduleNotifyClient(event.target.checked)}
                />
              </label>

              <button
                onClick={submitReschedule}
                disabled={!canSubmitReschedule || savingKey === `reschedule-${rescheduleBookingId}`}
                className="w-full px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-violet-600 text-white hover:bg-violet-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                <FaRedoAlt />
                {savingKey === `reschedule-${rescheduleBookingId}` ? "Reprogramando..." : "Guardar reprogramacion"}
              </button>
            </div>
          </article>

          <article className="border border-white/10 bg-[#070b14]/70 p-5 space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <FaBan className="text-amber-300" />
              Bloquear horario
            </h3>
            <p className="text-xs text-white/60">Guarda bloqueos en /api/admin/blocked-slots.</p>
            <div className="space-y-3">
              <label className="space-y-1 block">
                <span className="text-[11px] uppercase tracking-widest text-white/60 font-bold">Fecha</span>
                <div className="relative flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={blockDate}
                    onChange={(event) => setBlockDate(event.target.value)}
                    placeholder="DD-MM-YYYY o YYYY-MM-DD"
                    className="w-full bg-black/30 border border-white/15 text-white px-3 py-2 text-sm outline-none"
                  />
                  <button
                    onClick={openNativeDatePicker}
                    type="button"
                    className="px-3 border border-cyan-300/35 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25"
                    title="Abrir calendario"
                  >
                    <FaCalendarAlt />
                  </button>
                  <input
                    ref={blockDatePickerRef}
                    type="date"
                    value={normalizeDateInput(blockDate) || ""}
                    onChange={(event) => setBlockDate(event.target.value)}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="absolute h-0 w-0 opacity-0 pointer-events-none"
                  />
                </div>
              </label>
              <label className="space-y-1 block">
                <span className="text-[11px] uppercase tracking-widest text-white/60 font-bold">Hora</span>
                <div className="relative flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={blockTime}
                    onChange={(event) => setBlockTime(event.target.value)}
                    placeholder="HH:MM"
                    className="w-full bg-black/30 border border-white/15 text-white px-3 py-2 text-sm outline-none"
                  />
                  <button
                    onClick={openNativeTimePicker}
                    type="button"
                    className="px-3 border border-cyan-300/35 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25"
                    title="Abrir selector de hora"
                  >
                    <FaClock />
                  </button>
                  <input
                    ref={blockTimePickerRef}
                    type="time"
                    value={normalizeTimeInput(blockTime) || ""}
                    onChange={(event) => setBlockTime(event.target.value)}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="absolute h-0 w-0 opacity-0 pointer-events-none"
                  />
                </div>
              </label>
              <label className="space-y-1 block">
                <span className="text-[11px] uppercase tracking-widest text-white/60 font-bold">Motivo</span>
                <input
                  value={blockReason}
                  onChange={(event) => setBlockReason(event.target.value)}
                  className="w-full bg-black/30 border border-white/15 text-white px-3 py-2 text-sm outline-none"
                  placeholder="Bloqueo interno"
                />
              </label>
              <button
                onClick={blockSlot}
                disabled={savingKey === "block-slot"}
                className="w-full px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-amber-600 text-white hover:bg-amber-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                <FaClock />
                {savingKey === "block-slot" ? "Guardando..." : "Bloquear horario"}
              </button>
            </div>

            <div className="border-t border-white/10 pt-3">
              <p className="text-[11px] uppercase tracking-widest text-white/60 font-bold mb-2">Bloqueos activos</p>
              {!blockedSlots.length ? (
                <p className="text-xs text-white/55">No hay bloqueos activos.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-auto pr-1">
                  {blockedSlots.map((slot) => (
                    <div key={slot.id} className="border border-white/10 bg-black/20 p-2 text-xs text-white/80">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold text-white">{slot.date} - {slot.time}</p>
                          <p className="text-white/60">{slot.reason || "Sin motivo"}</p>
                        </div>
                        <button
                          onClick={() => unblockSlot(slot.id)}
                          disabled={savingKey === `unblock-${slot.id}`}
                          className="p-2 border border-rose-400/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 disabled:opacity-60"
                          title="Desbloquear"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </article>

          <article className="border border-white/10 bg-[#070b14]/70 p-5 space-y-4">
            <h3 className="text-lg font-black text-white">Disponibilidad semanal (UI)</h3>
            <p className="text-xs text-white/60">Conectado a BD real mediante /api/admin/weekly-availability.</p>
            <div className="space-y-2">
              {WEEKDAY_LABELS.map(([key, label]) => {
                const row = weeklyAvailability[key];
                return (
                  <div key={key} className="border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/80 font-semibold">{label}</span>
                      <label className="flex items-center gap-2 text-xs text-white/70">
                        <span>Activo</span>
                        <input
                          type="checkbox"
                          checked={row.enabled}
                          onChange={(event) =>
                            setWeeklyAvailability((prev) => ({
                              ...prev,
                              [key]: { ...prev[key], enabled: event.target.checked },
                            }))
                          }
                        />
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        value={row.start}
                        onChange={(event) =>
                          setWeeklyAvailability((prev) => ({
                            ...prev,
                            [key]: { ...prev[key], start: event.target.value },
                          }))
                        }
                        className="w-full bg-black/30 border border-white/15 text-white px-2 py-1 text-xs outline-none"
                      />
                      <input
                        type="time"
                        value={row.end}
                        onChange={(event) =>
                          setWeeklyAvailability((prev) => ({
                            ...prev,
                            [key]: { ...prev[key], end: event.target.value },
                          }))
                        }
                        className="w-full bg-black/30 border border-white/15 text-white px-2 py-1 text-xs outline-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={saveWeeklyAvailability}
              disabled={savingKey === "weekly-save"}
              className="w-full px-4 py-2 text-xs font-black uppercase tracking-[0.2em] bg-blue-600 text-white hover:bg-blue-500 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FaSave />
              {savingKey === "weekly-save" ? "Guardando..." : "Guardar disponibilidad"}
            </button>
          </article>
        </aside>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: "blue" | "amber" | "emerald" | "rose";
}) {
  const colorStyles: Record<typeof color, string> = {
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    rose: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  };

  return (
    <div className={`border p-4 ${colorStyles[color]}`}>
      <p className="text-xs uppercase tracking-widest opacity-70">{title}</p>
      <p className="text-3xl font-black mt-1">{value}</p>
    </div>
  );
}

function MiniStat({
  title,
  value,
  tone,
}: {
  title: string;
  value: number;
  tone: "blue" | "amber" | "emerald" | "violet" | "rose";
}) {
  const toneStyles: Record<typeof tone, string> = {
    blue: "border-blue-400/35 bg-gradient-to-br from-blue-500/20 to-[#071425] text-blue-100",
    amber: "border-amber-400/35 bg-gradient-to-br from-amber-500/20 to-[#211409] text-amber-100",
    emerald: "border-emerald-400/35 bg-gradient-to-br from-emerald-500/20 to-[#062118] text-emerald-100",
    violet: "border-violet-400/35 bg-gradient-to-br from-violet-500/20 to-[#140a24] text-violet-100",
    rose: "border-rose-400/35 bg-gradient-to-br from-rose-500/20 to-[#240b17] text-rose-100",
  };

  return (
    <div className={`border px-3 py-2 shadow-[0_8px_24px_rgba(2,6,23,0.35)] ${toneStyles[tone]}`}>
      <p className="text-[11px] uppercase tracking-widest opacity-80 font-bold">{title}</p>
      <p className="text-xl font-black leading-tight mt-1">{value}</p>
    </div>
  );
}

function AgendaLegend({ status }: { status: BookingStatus }) {
  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 border text-[10px] font-black uppercase tracking-[0.12em] ${agendaBadgeClasses(status)}`}>
      <span className={`h-2 w-2 rounded-full ${agendaDotClasses(status)}`} />
      {agendaStatusLabel(status)}
    </div>
  );
}
