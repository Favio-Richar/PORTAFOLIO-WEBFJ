'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import API_BASE from "@/lib/apiBase";

const DEFAULT_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '56971464296';
const TIMEZONE_LABEL = 'America/Santiago';

const API = {
  services: '/api/asesoria/services',
  providers: '/api/asesoria/providers',
  availability: '/api/asesoria/availability',
  bookings: '/api/asesoria/bookings',
  contact: '/api/contact',
} as const;

type MeetingProvider = 'google_meet' | 'teams' | 'jitsi';

type AdvisoryService = {
  id: string;
  name: string;
  duration_min: number;
  price_clp: number;
  highlights: string[];
  active?: boolean;
};

type AvailabilityResponse = {
  slots: string[];
  timezone?: string;
};

type BookingResponse = {
  booking_id: string;
  status: string;
  meeting_link?: string | null;
  message?: string;
};

type ProviderOption = {
  id: MeetingProvider;
  label: string;
  enabled: boolean;
};

type ReservationContext = {
  source: string;
  reserveType: string;
  reserveName: string;
  reservePrice: string;
};

type CalendarDay = {
  iso: string;
  day: number;
  inMonth: boolean;
  isPast: boolean;
  isToday: boolean;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatCLP(value: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Math.max(0, Number(value || 0)));
}

function normalizePhone(value?: string | null) {
  return String(value || '').replace(/[^\d]/g, '');
}

function normalizeText(value?: string | null) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' }).format(date);
}

function weekdaySun0ToMon0(daySun0: number) {
  return daySun0 === 0 ? 6 : daySun0 - 1;
}

function isPastDate(isoDate: string) {
  const today = formatISODate(new Date());
  return new Date(`${isoDate}T00:00:00`) < new Date(`${today}T00:00:00`);
}

function buildMonthGrid(monthDate: Date): CalendarDay[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const firstWeekdayMon0 = weekdaySun0ToMon0(first.getDay());
  const start = new Date(year, month, 1 - firstWeekdayMon0);
  const todayISO = formatISODate(new Date());

  const cells: CalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const iso = formatISODate(date);
    cells.push({
      iso,
      day: date.getDate(),
      inMonth: date.getMonth() === month,
      isPast: isPastDate(iso),
      isToday: iso === todayISO,
    });
  }
  return cells;
}

async function requestJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const raw = await response.text();

  let parsed: unknown = null;
  if (raw) {
    if (contentType.includes('application/json')) {
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new Error('Respuesta JSON invalida del servidor.');
      }
    } else if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
  }

  if (!response.ok) {
    const detail =
      parsed && typeof parsed === 'object' && 'detail' in parsed && typeof (parsed as { detail?: unknown }).detail === 'string'
        ? String((parsed as { detail: string }).detail)
        : `${response.status} ${response.statusText}`;
    throw new Error(detail);
  }

  return parsed as T;
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cx(
        'group rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-slate-950/85 backdrop-blur-xl shadow-[0_20px_90px_rgba(15,23,42,0.5)] transition-all duration-500 hover:-translate-y-1 hover:border-amber-300/30 hover:shadow-[0_28px_100px_rgba(251,191,36,0.18)]',
        className
      )}
    >
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 py-2 text-sm">
      <span className="text-slate-300/90">{label}</span>
      <span className="text-right font-semibold text-white">{value}</span>
    </div>
  );
}

function GoogleMeetIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="3" y="6" width="12" height="12" rx="3" fill="#34A853" />
      <path d="M15 10.2L21 7.5V16.5L15 13.8V10.2Z" fill="#4285F4" />
      <rect x="6.4" y="9.2" width="5.2" height="5.6" rx="1.2" fill="#FBBC04" />
      <path d="M9.8 6L12.7 9.2H8.4L6 6H9.8Z" fill="#EA4335" />
    </svg>
  );
}

function TeamsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="17.7" cy="8.2" r="2.1" fill="#7B83EB" />
      <circle cx="18.5" cy="15.5" r="2.3" fill="#8B92F6" />
      <rect x="6.8" y="6.5" width="9.8" height="11" rx="2.2" fill="#5059C9" />
      <rect x="3.2" y="8.1" width="8.6" height="8.2" rx="1.8" fill="#6264A7" />
      <path d="M6.5 10.2H8.7V14H10.1V10.2H12.2V9H6.5V10.2Z" fill="#FFFFFF" />
    </svg>
  );
}

function JitsiIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#0064FF" />
      <path d="M7 9l7 0l0 6l-7 0z" fill="white" />
      <path d="M14 10l3 -2l0 8l-3 -2z" fill="white" />
    </svg>
  );
}

function ProviderIcon({ provider, className }: { provider: MeetingProvider; className?: string }) {
  if (provider === 'google_meet') return <GoogleMeetIcon className={className} />;
  if (provider === 'teams') return <TeamsIcon className={className} />;
  return <JitsiIcon className={className} />;
}

function AsesoriaPageContent() {
  const bookRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [services, setServices] = useState<AdvisoryService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const [selectedServiceId, setSelectedServiceId] = useState('');
  const selectedService = useMemo(() => services.find((item) => item.id === selectedServiceId) || null, [services, selectedServiceId]);

  const [month, setMonth] = useState(() => {
    const now = new Date();
    now.setDate(1);
    return now;
  });
  const monthGrid = useMemo(() => buildMonthGrid(month), [month]);
  const [monthAvailabilityMap, setMonthAvailabilityMap] = useState<Record<string, number>>({});
  const [monthAvailabilityLoading, setMonthAvailabilityLoading] = useState(false);

  const [selectedDateISO, setSelectedDateISO] = useState(() => formatISODate(addDays(new Date(), 1)));
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [notes, setNotes] = useState('');
  const [meetingProvider, setMeetingProvider] = useState<MeetingProvider>('google_meet');
  const [rem24, setRem24] = useState(true);
  const [rem1, setRem1] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<BookingResponse | null>(null);

  const [resolvedWhatsappPhone, setResolvedWhatsappPhone] = useState(normalizePhone(DEFAULT_WHATSAPP));
  const [reservationContext, setReservationContext] = useState<ReservationContext | null>(null);
  const [prefillApplied, setPrefillApplied] = useState(false);

  const [providers, setProviders] = useState<ProviderOption[]>([
    { id: 'google_meet', label: 'Google Meet', enabled: false },
    { id: 'teams', label: 'Teams', enabled: false },
    { id: 'jitsi', label: 'Jitsi Meet', enabled: false },
  ]);

  const hasEnabledProvider = useMemo(() => providers.some((provider) => provider.enabled), [providers]);

  const whatsappLink = useMemo(() => {
    const text = encodeURIComponent(
      [
        'Hola, quiero reservar una asesoria.',
        selectedService ? `Servicio: ${selectedService.name}` : '',
        selectedDateISO ? `Fecha: ${selectedDateISO}` : '',
        selectedTime ? `Hora: ${selectedTime}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    );
    return `https://wa.me/${normalizePhone(resolvedWhatsappPhone || DEFAULT_WHATSAPP)}?text=${text}`;
  }, [resolvedWhatsappPhone, selectedDateISO, selectedService, selectedTime]);

  useEffect(() => {
    requestJSON<{ whatsapp?: string | null; phone?: string | null }>(API.contact)
      .then((data) => {
        const next = normalizePhone(data?.whatsapp || data?.phone || DEFAULT_WHATSAPP);
        if (next) setResolvedWhatsappPhone(next);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    requestJSON<ProviderOption[]>(API.providers)
      .then((rows) => {
        const next = Array.isArray(rows) ? rows : [];
        if (!next.length) return;
        setProviders(next);
        const firstEnabled = next.find((provider) => provider.enabled);
        if (firstEnabled) setMeetingProvider(firstEnabled.id);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const reserveName = String(params.get('reserve_name') || '').trim();
    if (!reserveName) {
      setReservationContext(null);
      return;
    }
    setReservationContext({
      source: String(params.get('source') || 'web'),
      reserveType: String(params.get('reserve_type') || 'asesoria'),
      reserveName,
      reservePrice: String(params.get('reserve_price') || ''),
    });
    setPrefillApplied(false);
  }, [searchParams]);

  useEffect(() => {
    setServicesLoading(true);
    setServicesError(null);
    requestJSON<AdvisoryService[]>(API.services)
      .then((data) => {
        const list = Array.isArray(data) ? data.filter((item) => item.active !== false) : [];
        if (!list.length) throw new Error('No hay asesorias activas.');
        setServices(list);
        setSelectedServiceId((prev) => (prev && list.some((item) => item.id === prev) ? prev : list[0].id));
      })
      .catch((error) => setServicesError(error instanceof Error ? error.message : 'No se pudo cargar asesorias.'))
      .finally(() => setServicesLoading(false));
  }, []);

  useEffect(() => {
    if (!reservationContext || prefillApplied || !services.length) return;
    const target = normalizeText(reservationContext.reserveName);
    const match = services.find((service) => normalizeText(service.name).includes(target) || target.includes(normalizeText(service.name)));
    if (match && match.id !== selectedServiceId) {
      setSelectedServiceId(match.id);
    }
    setNotes((prev) => prev || `Quiero reservar: ${reservationContext.reserveName}.`);
    setPrefillApplied(true);
  }, [prefillApplied, reservationContext, selectedServiceId, services]);

  useEffect(() => {
    if (!selectedServiceId) return;
    let active = true;
    setMonthAvailabilityLoading(true);

    const inMonthDates = monthGrid.filter((day) => day.inMonth && !day.isPast).map((day) => day.iso);
    Promise.all(
      inMonthDates.map(async (isoDate) => {
        try {
          const response = await requestJSON<AvailabilityResponse>(
            `${API.availability}?date=${encodeURIComponent(isoDate)}&service_id=${encodeURIComponent(selectedServiceId)}`
          );
          const count = Array.isArray(response?.slots) ? response.slots.length : 0;
          return [isoDate, count] as const;
        } catch {
          return [isoDate, 0] as const;
        }
      })
    )
      .then((entries) => {
        if (!active) return;
        const map: Record<string, number> = {};
        entries.forEach(([isoDate, count]) => {
          map[isoDate] = count;
        });
        setMonthAvailabilityMap(map);

        const selectedCount = map[selectedDateISO] ?? 0;
        if (!selectedCount) {
          const firstAvailable = entries.find((entry) => entry[1] > 0)?.[0];
          if (firstAvailable) setSelectedDateISO(firstAvailable);
        }
      })
      .finally(() => {
        if (active) setMonthAvailabilityLoading(false);
      });

    return () => {
      active = false;
    };
  }, [monthGrid, selectedDateISO, selectedServiceId]);

  useEffect(() => {
    if (!selectedServiceId || !selectedDateISO) return;
    setAvailabilityLoading(true);
    setAvailabilityError(null);
    setSelectedTime('');

    requestJSON<AvailabilityResponse>(
      `${API.availability}?date=${encodeURIComponent(selectedDateISO)}&service_id=${encodeURIComponent(selectedServiceId)}`
    )
      .then((response) => setSlots(Array.isArray(response?.slots) ? response.slots : []))
      .catch((error) => {
        setSlots([]);
        setAvailabilityError(error instanceof Error ? error.message : 'No se pudo consultar disponibilidad.');
      })
      .finally(() => setAvailabilityLoading(false));
  }, [selectedDateISO, selectedServiceId]);

  const canSubmit =
    Boolean(selectedServiceId) &&
    Boolean(selectedDateISO) &&
    Boolean(selectedTime) &&
    hasEnabledProvider &&
    providers.some((provider) => provider.id === meetingProvider && provider.enabled) &&
    name.trim().length >= 2 &&
    /\S+@\S+\.\S+/.test(email.trim()) &&
    phone.trim().length >= 8 &&
    notes.trim().length >= 8 &&
    acceptTerms;

  async function submitBooking() {
    if (!canSubmit || !selectedService || submitLoading) return;
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const response = await requestJSON<BookingResponse>(API.bookings, {
        method: 'POST',
        body: JSON.stringify({
          service_id: selectedService.id,
          date: selectedDateISO,
          time: selectedTime,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          company: company.trim() || null,
          notes: notes.trim(),
          meeting_provider: meetingProvider,
          reminders: { h24: rem24, h1: rem1 },
        }),
      });
      // --- FILTRO B2B DE PAGO ADELANTADO ---
      // Si la asesoría tiene un precio mayor a $0, se redirige para pago.
      if (selectedService.price_clp > 0) {
        try {
          const paymentRes = await fetch(`${API_BASE}/api/payments/create-checkout-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product_name: `Asesoria: ${selectedService.name} - ${selectedDateISO} ${selectedTime}`,
              price_amount: selectedService.price_clp,
              currency: 'clp',
              success_url: window.location.origin + `/gracias?booking_id=${response.booking_id}`,
              cancel_url: window.location.origin + `/asesoria`,
            })
          });
          const paymentData = await paymentRes.json();
          if (paymentData.url) {
            window.location.href = paymentData.url;
            return; // Detiene la ejecución aquí
          } else {
            alert("Error: No se pudo generar el enlace de pago seguro.");
            return; // Impide llegar a /gracias
          }
        } catch (e) {
          console.error("Error al redirigir al checkout:", e);
          alert("Error de conexión con la pasarela de pagos.");
          return; // Impide llegar a /gracias
        }
      }

      setSubmitSuccess(response);
      router.push('/gracias');

      setSlots((prev) => prev.filter((slot) => slot !== selectedTime));
      setMonthAvailabilityMap((prev) => ({
        ...prev,
        [selectedDateISO]: Math.max(0, (prev[selectedDateISO] || 0) - 1),
      }));
      setSelectedTime('');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No se pudo crear la reserva.');
    } finally {
      setSubmitLoading(false);
    }
  }

  const weekLabels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#061a2e] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_35%)]" />

      <section className="reveal-up relative z-10 border-b border-amber-200/10">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex rounded-full border border-amber-300/40 bg-amber-500/10 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-200">
              Sistema de reservas real
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight !text-[#39A9FF] drop-shadow-[0_10px_30px_rgba(14,165,233,0.45)] md:text-6xl">
              Agenda tu asesoría estratégica
            </h1>
            <p className="mt-4 text-slate-300/95">
              Diagnóstico para automatización, sistemas y soporte, con agenda real y disponibilidad en tiempo real.
            </p>
            <button
              onClick={() => bookRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="mt-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-slate-950 shadow-[0_12px_38px_rgba(251,146,60,0.45)] transition duration-300 hover:scale-[1.02]"
            >
              Reservar ahora
            </button>
          </div>
        </div>
      </section>

      <section ref={bookRef} className="reveal-up delay-1 relative z-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="space-y-5 lg:col-span-8">
            <Card className="p-5">
              <h3 className="text-xl font-black">1) Selecciona asesoria</h3>
              {servicesLoading ? <p className="mt-3 text-sm text-slate-300">Cargando servicios...</p> : null}
              {servicesError ? (
                <p className="mt-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{servicesError}</p>
              ) : null}
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedServiceId(service.id)}
                    className={cx(
                      'rounded-2xl border p-4 text-left transition-all duration-300',
                      selectedServiceId === service.id
                        ? 'border-amber-300/60 bg-gradient-to-br from-amber-500/20 to-orange-500/10 shadow-[0_12px_30px_rgba(251,191,36,0.2)]'
                        : 'border-white/10 bg-white/5 hover:-translate-y-0.5 hover:border-amber-300/35 hover:bg-amber-500/10'
                    )}
                  >
                    <p className="font-black text-white">{service.name}</p>
                    <p className="mt-2 text-amber-100/95">
                      {formatCLP(service.price_clp)} - {service.duration_min} min
                    </p>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-xl font-black">2) Fecha y hora (calendario real)</h3>
              <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                      className="rounded-xl border border-amber-300/30 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-amber-100 transition hover:border-amber-200/50 hover:bg-amber-500/20"
                    >
                      Anterior
                    </button>
                    <p className="bg-gradient-to-r from-cyan-200 to-amber-200 bg-clip-text text-sm font-black uppercase tracking-[0.14em] text-transparent">
                      {monthLabel(month)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                      className="rounded-xl border border-amber-300/30 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-amber-100 transition hover:border-amber-200/50 hover:bg-amber-500/20"
                    >
                      Siguiente
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase tracking-[0.14em] text-slate-300/80">
                    {weekLabels.map((label) => (
                      <div key={label}>{label}</div>
                    ))}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.12em] text-slate-300/90">
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-500/10 px-2 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Disponibles
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-rose-300/30 bg-rose-500/10 px-2 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-300" /> Sin cupo
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-500/10 px-2 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-300" /> Seleccionado
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-7 gap-2">
                    {monthGrid.map((day) => {
                      const count = monthAvailabilityMap[day.iso];
                      const hasCount = typeof count === 'number';
                      const hasAvailability = hasCount && count > 0;
                      const disabled =
                        !day.inMonth || day.isPast || (hasCount && count === 0) || (!hasCount && monthAvailabilityLoading);
                      return (
                        <button
                          key={day.iso}
                          type="button"
                          disabled={disabled}
                          onClick={() => setSelectedDateISO(day.iso)}
                          className={cx(
                            'group relative h-11 rounded-xl border text-sm font-semibold transition-all duration-300',
                            disabled
                              ? 'cursor-not-allowed border-white/5 bg-slate-900/60 text-white/25'
                              : 'border-slate-600/70 bg-slate-900/65 text-white hover:-translate-y-0.5 hover:border-amber-300/50 hover:bg-amber-500/10',
                            day.isToday && !disabled && 'ring-1 ring-emerald-300/60',
                            selectedDateISO === day.iso && !disabled && 'border-amber-300 bg-gradient-to-br from-amber-500/30 to-orange-500/20 text-amber-50',
                            !day.inMonth && 'opacity-40'
                          )}
                        >
                          <span>{day.day}</span>
                          {day.inMonth && !day.isPast ? (
                            <span
                              className={cx(
                                'absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.35)]',
                                hasAvailability && 'bg-emerald-300',
                                hasCount && count === 0 && 'bg-rose-300/60',
                                !hasCount && monthAvailabilityLoading && 'animate-pulse bg-cyan-300/70'
                              )}
                            />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-200">
                    Horarios disponibles - {selectedDateISO}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">Zona horaria: {TIMEZONE_LABEL}</p>
                  {availabilityLoading ? <p className="mt-3 text-sm text-slate-300">Consultando horarios...</p> : null}
                  {availabilityError ? (
                    <p className="mt-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                      {availabilityError}
                    </p>
                  ) : null}
                  {!availabilityLoading && !availabilityError && slots.length === 0 ? (
                    <p className="mt-3 rounded-xl border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                      No hay horas disponibles para este dia.
                    </p>
                  ) : null}
                  <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={cx(
                          'rounded-xl border px-3 py-2 text-sm font-semibold transition-all duration-300',
                          selectedTime === slot
                            ? 'border-amber-300/80 bg-gradient-to-r from-amber-500/25 to-orange-500/20 text-amber-50'
                            : 'border-white/15 bg-slate-900/65 hover:-translate-y-0.5 hover:border-amber-300/50 hover:bg-amber-500/10'
                        )}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="inline-flex rounded-xl bg-amber-300 px-3 py-1 text-xl font-black text-black">3) Datos y confirmacion</h3>
              <p className="mt-3 text-sm text-slate-300/90">
                Completa tus datos reales para enviar la confirmacion y el enlace de reunion a tu correo.
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">Nombre completo *</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Favio Jimenez Barrenechea"
                    className="w-full rounded-xl border border-white/15 bg-slate-900/65 px-3 py-2 text-sm transition focus:border-amber-300/60 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">Correo de contacto *</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ej: contacto@tuempresa.cl"
                    className="w-full rounded-xl border border-white/15 bg-slate-900/65 px-3 py-2 text-sm transition focus:border-amber-300/60 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">Telefono / WhatsApp *</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej: +56 9 1234 5678"
                    className="w-full rounded-xl border border-white/15 bg-slate-900/65 px-3 py-2 text-sm transition focus:border-amber-300/60 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">Empresa (opcional)</span>
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Ej: Next Level Software Pro"
                    className="w-full rounded-xl border border-white/15 bg-slate-900/65 px-3 py-2 text-sm transition focus:border-amber-300/60 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
                  />
                </label>
              </div>
              <label className="mt-3 block space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">Objetivo de la asesoria *</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Describe brevemente el problema principal y el resultado que buscas."
                  className="w-full rounded-xl border border-white/15 bg-slate-900/65 px-3 py-2 text-sm transition focus:border-amber-300/60 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
                />
              </label>

              {!hasEnabledProvider ? (
                <p className="mt-3 rounded-xl border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                  No hay plataformas configuradas en backend. Configura Google Meet o Teams para habilitar reservas.
                </p>
              ) : null}

              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">Plataforma de reunion</p>
              <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    disabled={!provider.enabled}
                    onClick={() => provider.enabled && setMeetingProvider(provider.id)}
                    className={cx(
                      'flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-black uppercase transition-all duration-300',
                      !provider.enabled && 'cursor-not-allowed opacity-50',
                      provider.id === 'google_meet' &&
                      meetingProvider === provider.id &&
                      provider.enabled &&
                      'border-[#34A853]/65 bg-gradient-to-r from-[#34A853]/20 to-[#4285F4]/20 text-[#E8F6EC] shadow-[0_8px_28px_rgba(52,168,83,0.25)]',
                      provider.id === 'google_meet' &&
                      (meetingProvider !== provider.id || !provider.enabled) &&
                      'border-white/15 bg-slate-900/65 hover:border-[#34A853]/45 hover:bg-[#34A853]/12',
                      provider.id === 'teams' &&
                      meetingProvider === provider.id &&
                      provider.enabled &&
                      'border-[#6264A7]/70 bg-gradient-to-r from-[#6264A7]/25 to-[#7B83EB]/20 text-[#E6E8FF] shadow-[0_8px_28px_rgba(98,100,167,0.3)]',
                      provider.id === 'teams' &&
                      (meetingProvider !== provider.id || !provider.enabled) &&
                      'border-white/15 bg-slate-900/65 hover:border-[#6264A7]/45 hover:bg-[#6264A7]/12',
                      provider.id === 'jitsi' &&
                      meetingProvider === provider.id &&
                      provider.enabled &&
                      'border-[#0064FF]/70 bg-gradient-to-r from-[#0064FF]/25 to-[#00C2FF]/20 text-[#E6F3FF] shadow-[0_8px_28px_rgba(0,100,255,0.3)]',
                      provider.id === 'jitsi' &&
                      (meetingProvider !== provider.id || !provider.enabled) &&
                      'border-white/15 bg-slate-900/65 hover:border-[#0064FF]/45 hover:bg-[#0064FF]/12'
                    )}
                  >
                    <ProviderIcon provider={provider.id} className="h-4 w-4" />
                    <span>{provider.label}</span>
                  </button>
                ))}
              </div>

              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">Recordatorios automaticos</p>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/65 px-3 py-2 text-sm">
                  <span>Recordatorio 24h</span>
                  <input type="checkbox" checked={rem24} onChange={(e) => setRem24(e.target.checked)} />
                </label>
                <label className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/65 px-3 py-2 text-sm">
                  <span>Recordatorio 1h</span>
                  <input type="checkbox" checked={rem1} onChange={(e) => setRem1(e.target.checked)} />
                </label>
              </div>

              <label className="mt-3 flex items-start gap-2 text-sm">
                <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-1" />
                <span>Acepto terminos y confirmo los datos de la reserva.</span>
              </label>

              {submitError ? (
                <p className="mt-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{submitError}</p>
              ) : null}
              {submitSuccess ? (
                <div className="mt-3 space-y-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
                  <p>
                    Reserva creada: {submitSuccess.booking_id} ({submitSuccess.status})
                  </p>
                  {submitSuccess.message ? <p>{submitSuccess.message}</p> : null}
                  {submitSuccess.meeting_link ? (
                    <a
                      href={submitSuccess.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-lg border border-emerald-300/40 bg-emerald-500/20 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-emerald-100"
                    >
                      Abrir enlace de reunion
                    </a>
                  ) : null}
                </div>
              ) : null}

              <button
                disabled={!canSubmit || submitLoading}
                onClick={submitBooking}
                className={cx(
                  'mt-4 w-full rounded-2xl px-5 py-3 text-sm font-black uppercase tracking-[0.16em] transition-all duration-300',
                  canSubmit && !submitLoading
                    ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-slate-950 shadow-[0_12px_36px_rgba(251,146,60,0.45)] hover:scale-[1.01]'
                    : 'bg-white/20 text-white/50'
                )}
              >
                {submitLoading ? 'Creando reserva...' : 'Confirmar reserva'}
              </button>
            </Card>
          </div>

          <div className="reveal-up delay-2 lg:col-span-4">
            <div className="sticky top-24 space-y-5">
              <Card className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">Resumen de reserva</p>
                {reservationContext ? (
                  <p className="mt-2 rounded-xl border border-amber-300/25 bg-amber-500/10 px-2 py-1 text-xs">
                    Solicitud: {reservationContext.reserveName}
                  </p>
                ) : null}
                <div className="mt-2">
                  <SummaryRow label="Servicio" value={selectedService?.name || '-'} />
                  <SummaryRow label="Duracion" value={selectedService ? `${selectedService.duration_min} min` : '-'} />
                  <SummaryRow label="Precio" value={selectedService ? formatCLP(selectedService.price_clp) : '-'} />
                  <SummaryRow label="Fecha" value={selectedDateISO || '-'} />
                  <SummaryRow label="Hora" value={selectedTime || '-'} />
                  <SummaryRow label="Plataforma" value={providers.find((item) => item.id === meetingProvider)?.label || '-'} />
                </div>
              </Card>

              <Card className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-300">Canal directo</p>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex w-full justify-center rounded-xl border border-emerald-300/40 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-100 transition-all duration-300 hover:scale-[1.01] hover:border-emerald-300/70"
                >
                  Abrir WhatsApp
                </a>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .reveal-up {
          animation: revealUp 700ms ease both;
        }
        .reveal-up.delay-1 {
          animation-delay: 120ms;
        }
        .reveal-up.delay-2 {
          animation-delay: 240ms;
        }
        @keyframes revealUp {
          from {
            opacity: 0;
            transform: translate3d(0, 16px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}

function AsesoriaPageFallback() {
  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-slate-200 backdrop-blur-xl">
        Cargando agenda de asesoria...
      </div>
    </div>
  );
}

export default function AsesoriaPage() {
  return (
    <Suspense fallback={<AsesoriaPageFallback />}>
      <AsesoriaPageContent />
    </Suspense>
  );
}
