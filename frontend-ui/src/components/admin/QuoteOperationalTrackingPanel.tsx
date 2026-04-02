"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FaExternalLinkAlt, FaRedo, FaClipboard, FaMoneyBillWave, FaBolt, FaEye, FaUpload, FaCheckCircle, FaTimesCircle, FaProjectDiagram } from "react-icons/fa";
import { adminFetch } from "@/lib/adminFetch";

export type ProjectStageKey = "payment_50" | "kickoff" | "system_progress" | "development" | "qa" | "delivery";
type ExecutionStageKey = Exclude<ProjectStageKey, "payment_50">;

type HistoryRow = { action: string; created_at: string };

type TrackingStageRow = {
  id: string;
  label: string;
  status: "completed" | "current" | "pending";
  date?: string | null;
  summary?: string | null;
  next_step?: string | null;
  progress_percent?: number | null;
};

type TrackingState = {
  progress_percent?: number;
  stages?: TrackingStageRow[];
} | null;

type StageFieldConfig = {
  noteLabel: string;
  notePlaceholder: string;
  reportLabel: string;
  reportPlaceholder: string;
  evidenceLabel: string;
  evidencePlaceholder: string;
  evidenceHint: string;
};

const formatStageDate = (value?: string | null): string => {
  if (!value) return "Sin fecha registrada";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Sin fecha registrada";
  return parsed.toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

function trackingStageStatusLabel(status: TrackingStageRow["status"]): string {
  if (status === "completed") return "Hecha";
  if (status === "current") return "En curso";
  return "Pendiente";
}

function trackingStageStatusClass(status: TrackingStageRow["status"]): string {
  if (status === "completed") return "bg-emerald-100 text-emerald-900 border border-emerald-200";
  if (status === "current") return "bg-sky-100 text-sky-900 border border-sky-200";
  return "bg-slate-100 text-slate-800 border border-slate-200";
}

function getStageFieldConfig(stageId?: string): StageFieldConfig {
  if (stageId === "kickoff") {
    return {
      noteLabel: "Nota interna de kickoff",
      notePlaceholder: "Responsables, accesos, agenda, acuerdos internos",
      reportLabel: "Resumen visible de kickoff",
      reportPlaceholder: "Resumen ejecutivo para el cliente: reunion inicial, alcance validado, responsables y calendario",
      evidenceLabel: "Evidencias de kickoff",
      evidencePlaceholder: "URLs de fotos o videos del kickoff, una por linea o separadas por coma",
      evidenceHint: "Adjunta al menos una foto o video del kickoff para justificar esta etapa.",
    };
  }
  if (stageId === "system_progress") {
    return {
      noteLabel: "Nota interna de avance",
      notePlaceholder: "Detalles del sistema, componentes trabajados o notas de diseño",
      reportLabel: "Reporte visible de avance",
      reportPlaceholder: "Muestra al cliente los primeros entregables, pantallas o estructura funcional",
      evidenceLabel: "Evidencias de avance",
      evidencePlaceholder: "URLs de capturas, mockups o videos del avance del sistema",
      evidenceHint: "Adjunta al menos una foto o video del avance visual o estructural.",
    };
  }
  if (stageId === "development") {
    return {
      noteLabel: "Nota tecnica interna",
      notePlaceholder: "Modulo trabajado, decision tecnica, bloqueo o dependencia",
      reportLabel: "Reporte visible de desarrollo",
      reportPlaceholder: "Explica al cliente que se construyo, integro o configuro en esta fase",
      evidenceLabel: "Evidencias de desarrollo",
      evidencePlaceholder: "URLs de capturas, demos o videos del avance construido",
      evidenceHint: "Adjunta al menos una foto o video del avance desarrollado.",
    };
  }
  if (stageId === "qa") {
    return {
      noteLabel: "Nota interna de QA",
      notePlaceholder: "Checklist, incidencias, correcciones o validaciones pendientes",
      reportLabel: "Reporte visible de validacion",
      reportPlaceholder: "Indica al cliente que se probo, que se valido y el estado de calidad",
      evidenceLabel: "Evidencias de QA",
      evidencePlaceholder: "URLs de pruebas, capturas o videos del proceso de validacion",
      evidenceHint: "Adjunta al menos una foto o video del proceso de QA o validacion.",
    };
  }
  if (stageId === "delivery") {
    return {
      noteLabel: "Nota interna de entrega",
      notePlaceholder: "Acta, credenciales entregadas, despliegue o cierre administrativo",
      reportLabel: "Resumen visible de entrega",
      reportPlaceholder: "Describe lo entregado, accesos, capacitacion o cierre del proyecto",
      evidenceLabel: "Evidencias de entrega",
      evidencePlaceholder: "URLs de fotos, video demo o respaldo final entregado al cliente",
      evidenceHint: "Adjunta al menos una foto o video de la entrega final.",
    };
  }
  return {
    noteLabel: "Nota interna",
    notePlaceholder: "Observacion breve interna",
    reportLabel: "Reporte visible",
    reportPlaceholder: "Resumen visible para el cliente",
    evidenceLabel: "Evidencias",
    evidencePlaceholder: "URLs de evidencias, una por linea o separadas por coma",
    evidenceHint: "Adjunta al menos una foto o video para justificar el avance.",
  };
}

export interface QuoteOperationalTrackingPanelProps {
  proposalId: number;
  quoteNumber: string;
  publicToken?: string | null;
  status: string;
}

const EXECUTION_STAGES: { id: ExecutionStageKey; label: string }[] = [
  { id: "kickoff", label: "Inicio del proyecto (kickoff)" },
  { id: "system_progress", label: "Avance de sistema" },
  { id: "development", label: "Desarrollo" },
  { id: "qa", label: "Validación y QA" },
  { id: "delivery", label: "Entrega final" },
];

function stageSuggestedProgress(stageId?: string): number {
  if (stageId === "kickoff") return 30;
  if (stageId === "system_progress") return 50;
  if (stageId === "development") return 75;
  if (stageId === "qa") return 90;
  if (stageId === "delivery") return 100;
  return 20;
}

function statusBadgeClass(s: string): string {
  switch (s) {
    case "Approved":
      return "bg-emerald-100 text-emerald-900 ring-2 ring-emerald-500/20 shadow-sm";
    case "Sent":
      return "bg-sky-100 text-sky-900 ring-2 ring-sky-500/20 shadow-sm";
    case "Pending":
      return "bg-amber-100 text-amber-900 ring-2 ring-amber-500/20 shadow-sm";
    case "Rejected":
      return "bg-rose-100 text-rose-900 ring-2 ring-rose-500/20 shadow-sm";
    case "Expired":
      return "bg-slate-200 text-slate-800 ring-2 ring-slate-400/20 shadow-sm";
    default:
      return "bg-slate-100 text-slate-800 border border-slate-200";
  }
}

function statusLabelEs(s: string): string {
  const m: Record<string, string> = {
    Pending: "Cotizacion en Borrador",
    Sent: "Propuesta Enviada",
    Approved: "Proyecto Aprobado",
    Rejected: "Proyecto Rechazado",
    Expired: "Propuesta Expirada",
  };
  return m[s] || s;
}

export default function QuoteOperationalTrackingPanel({
  proposalId,
  quoteNumber,
  publicToken,
  status,
}: QuoteOperationalTrackingPanelProps) {
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [tracking, setTracking] = useState<TrackingState>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState(status);
  const [statusDraft, setStatusDraft] = useState<"Pending" | "Sent" | "Expired">(() =>
    status === "Pending" || status === "Sent" || status === "Expired" ? status : "Pending",
  );
  const [savingStatus, setSavingStatus] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [updatingProject, setUpdatingProject] = useState(false);

  const [paymentRef, setPaymentRef] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  const [kickoffDate, setKickoffDate] = useState("");
  const [kickoffNote, setKickoffNote] = useState("");

  const [execNote, setExecNote] = useState("");
  const [execReport, setExecReport] = useState("");
  const [execMediaUrls, setExecMediaUrls] = useState("");
  const [execProgress, setExecProgress] = useState(60);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [proposalData, setProposalData] = useState<any>(null);

  useEffect(() => {
    setLocalStatus(status);
    if (status === "Pending" || status === "Sent" || status === "Expired") {
      setStatusDraft(status);
    }
  }, [proposalId, status]);

  const loadDetail = useCallback(async () => {
    setLoadingDetail(true);
    setLoadError(null);
    try {
      const res = await adminFetch(`/api/proposals/${proposalId}`);
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        setLoadError("No se pudo cargar el detalle técnico del seguimiento.");
        setHistory([]);
        setTracking(null);
        return;
      }
      const hist = Array.isArray(data.history) ? data.history : [];
      setHistory(hist as HistoryRow[]);
      setTracking((data.tracking as TrackingState) ?? null);
      setProposalData(data.proposal || data);
      const p = data.proposal ?? data;
      if (p?.status && typeof p.status === "string") {
        setLocalStatus(p.status);
        if (p.status === "Pending" || p.status === "Sent" || p.status === "Expired") {
          setStatusDraft(p.status as any);
        }
      }
    } catch (err) {
      console.error(err);
      setLoadError("Error de comunicación con el servidor central.");
      setHistory([]);
      setTracking(null);
    } finally {
      setLoadingDetail(false);
    }
  }, [proposalId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const currentStageRow = useMemo(
    () => tracking?.stages?.find((s) => s.status === "current"),
    [tracking?.stages],
  );

  useEffect(() => {
    const stages = tracking?.stages || [];
    if (!stages.length) {
      setSelectedStageId(null);
      return;
    }
    setSelectedStageId((prev) => {
      if (prev && stages.some((stage) => stage.id === prev)) return prev;
      return currentStageRow?.id || stages[0]?.id || null;
    });
  }, [tracking?.stages, currentStageRow?.id]);

  const selectedStageRow = useMemo(
    () => tracking?.stages?.find((stage) => stage.id === selectedStageId) || currentStageRow || tracking?.stages?.[0] || null,
    [tracking?.stages, selectedStageId, currentStageRow],
  );

  const selectedStageIsCurrent = selectedStageRow?.id === currentStageRow?.id;
  const selectedExecutionStage = selectedStageRow && ["kickoff", "system_progress", "development", "qa", "delivery"].includes(selectedStageRow.id)
    ? (selectedStageRow.id as ExecutionStageKey)
    : null;
  const stageFieldConfig = useMemo(() => getStageFieldConfig(selectedStageRow?.id), [selectedStageRow?.id]);

  useEffect(() => {
    if (!selectedExecutionStage || !selectedStageRow) return;
    const nextProgress =
      typeof selectedStageRow.progress_percent === "number"
        ? selectedStageRow.progress_percent
        : selectedStageRow.status === "completed"
          ? 100
          : typeof tracking?.progress_percent === "number" && selectedStageIsCurrent
            ? tracking.progress_percent
            : stageSuggestedProgress(selectedExecutionStage);
    setExecProgress(Math.max(0, Math.min(100, nextProgress)));
    setUploadError("");
  }, [selectedExecutionStage, selectedStageRow, tracking?.progress_percent, selectedStageIsCurrent]);

  const allStagesDone = useMemo(
    () =>
      Boolean(
        tracking?.stages?.length &&
          tracking.stages.every((s) => s.status === "completed"),
      ),
    [tracking?.stages],
  );

  const phaseFormUnlocked = localStatus === "Approved";

  const saveOperationalStatus = async () => {
    if (statusDraft === localStatus) return;
    setSavingStatus(true);
    try {
      const res = await adminFetch(`/api/proposals/${proposalId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: statusDraft }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert((err as { detail?: string })?.detail || "Error al actualizar estado.");
        return;
      }
      setLocalStatus(statusDraft);
      await loadDetail();
    } catch (e) {
      console.error(e);
      alert("Error al guardar cambios de estado.");
    } finally {
      setSavingStatus(false);
    }
  };

  const markExpired = async () => {
    if (!confirm("Atencion: ¿Desea marcar esta cotización activa como expirada?")) return;
    setSavingStatus(true);
    try {
      const res = await adminFetch(`/api/proposals/${proposalId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "Expired" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert((err as { detail?: string })?.detail || "No se pudo marcar como expirada.");
        return;
      }
      setLocalStatus("Expired");
      setStatusDraft("Expired");
      await loadDetail();
    } finally {
      setSavingStatus(false);
    }
  };

  const copyUrl = async (path: string) => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      alert("Enlace oficial copiado satisfactoriamente.");
    } catch {
      prompt("Enlace de seguimiento:", url);
    }
  };

  const postStage = async (
    stage: ProjectStageKey,
    body: { note?: string; report?: string; media_urls?: string[]; progress_percent?: number; complete_stage?: boolean },
    setLoading: (v: boolean) => void,
  ) => {
    setLoading(true);
    try {
      const resp = await adminFetch(`/api/proposals/${proposalId}/project-progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage,
          note: body.note || undefined,
          report: body.report || undefined,
          media_urls: body.media_urls,
          progress_percent: typeof body.progress_percent === "number" ? body.progress_percent : undefined,
          client_visible: true,
          complete_stage: body.complete_stage ?? true,
        }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        alert((err as { detail?: string })?.detail || "Fallo en el registro del hito operativo.");
        return;
      }
      setPaymentRef("");
      setPaymentNote("");
      setKickoffDate("");
      setKickoffNote("");
      setExecNote("");
      setExecReport("");
      setExecMediaUrls("");
      setExecProgress(stageSuggestedProgress(currentStageRow?.id));
      await loadDetail();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const rejectClientPayment = async () => {
    if (!window.confirm("¿Seguro que deseas rechazar este comprobante? Se notificará al sistema y el cliente podrá subir uno nuevo.")) return;
    setUpdatingPayment(true);
    try {
      const res = await adminFetch(`/api/proposals/${proposalId}/reject-payment`, { method: "POST" });
      if (res.ok) {
        alert("Comprobante rechazado correctamente.");
        void loadDetail();
      } else {
        alert("Error al rechazar el comprobante.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión.");
    } finally {
      setUpdatingPayment(false);
    }
  };

  const submitPaymentConfirm = async () => {
    const parts = [paymentRef.trim() ? `Referencia Bancaria: ${paymentRef.trim()}` : "", paymentNote.trim()].filter(
      Boolean,
    );
    const note = parts.join("\n") || "Confirmacion administrativa de abono de inicio (50%).";
    void postStage("payment_50", { note, complete_stage: true }, setUpdatingPayment);
  };

  const approveClientPayment = async () => {
    if (!confirm("¿Confirma que el pago ha sido validado correctamente en la cuenta bancaria?")) return;
    setUpdatingPayment(true);
    try {
      const res = await adminFetch(`/api/proposals/${proposalId}/approve-payment`, {
        method: "POST"
      });
      if (res.ok) {
        alert("Pago aprobado. El proyecto ha pasado a fase de Kickoff.");
        await loadDetail();
      }
    } catch (err) {
      console.error(err);
      alert("Error al aprobar el pago.");
    } finally {
      setUpdatingPayment(true);
    }
  };

  const submitExecution = (completeStage: boolean) => {
    const sid = currentStageRow?.id;
    if (!sid || !["kickoff", "system_progress", "development", "qa", "delivery"].includes(sid)) return;
    
    if (sid === "kickoff") {
      if (!kickoffDate) {
         alert("Es obligatorio establecer la fecha de arranque operativo.");
         return;
      }
      const finalNote = `Agendamiento oficial: ${kickoffDate}.\n\n${kickoffNote}`.trim();
      const mediaUrls = execMediaUrls.split(/\n|,/).map(u => u.trim()).filter(Boolean);
      void postStage("kickoff", {
          note: finalNote,
          report: `Kickoff exitoso. Proyecto programado formalmente para el ${kickoffDate}. Preparando el entorno FJ Digital.`,
          media_urls: mediaUrls,
          complete_stage: true,
      }, setUpdatingProject);
      return;
    }

    const mediaUrls = execMediaUrls.split(/\n|,/).map(u => u.trim()).filter(Boolean);
    if (mediaUrls.length === 0) {
      alert("Es requisito adjuntar al menos una evidencia visual (foto/video) para validar el progreso.");
      return;
    }
    void postStage(sid as ExecutionStageKey, {
        note: execNote || undefined,
        report: execReport || undefined,
        media_urls: mediaUrls,
        progress_percent: completeStage ? undefined : execProgress,
        complete_stage: completeStage,
    }, setUpdatingProject);
  };

  const uploadExecutionEvidence = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError("");
    setUploadingEvidence(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
          throw new Error("Formato no permitido. Use solo fotografias o videos.");
        }
        const formData = new FormData();
        formData.append("file", file);
        const resp = await adminFetch("/api/upload", { method: "POST", body: formData });
        if (!resp.ok) {
          const payload = await resp.json().catch(() => ({}));
          throw new Error((payload as any)?.detail || "Error en la subida a CDN.");
        }
        const payload = await resp.json();
        const url = String(payload?.url || "").trim();
        if (!url) throw new Error("Falla de retorno de URL desde el servidor.");
        uploadedUrls.push(url);
      }
      setExecMediaUrls(prev => {
        const cur = prev.trim();
        return cur ? `${cur}\n${uploadedUrls.join("\n")}` : uploadedUrls.join("\n");
      });
    } catch (err: any) {
      console.error(err);
      setUploadError(err?.message || "Fallo critico al procesar archivos.");
    } finally {
      setUploadingEvidence(false);
    }
  };

  const statusHint = (() => {
    const sk = localStatus;
    if (sk === "Pending") {
      return { tone: "amber" as const, title: "Estado: BORRADOR", body: "Propuesta comercial en edicion. Envie el email para notificar al cliente desde el panel principal." };
    }
    if (sk === "Sent") {
      return { tone: "blue" as const, title: "Estado: ENVIADA", body: "El cliente ha recibido el enlace. El sistema aguarda su aprobacion digital." };
    }
    if (sk === "Rejected") {
      return { tone: "slate" as const, title: "Estado: RECHAZADA", body: "El proyecto ha sido desestimado por el cliente en el portal administrativo." };
    }
    if (sk === "Expired") {
      return { tone: "slate" as const, title: "Estado: EXPIRADA", body: "La vigencia comercial ha terminado. Requiere nueva intervencion de ventas." };
    }
    return null;
  })();

  return (
    <div className="rounded-2xl border border-slate-300 bg-white shadow-2xl overflow-hidden">
      {/* HEADER: ALTO CONTRASTE Y RESPONSIVO */}
      <div className="bg-[#0f172a] px-6 py-8 md:px-12 md:py-12 text-white relative flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        <div className="flex-1">
           <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-3 underline underline-offset-8 decoration-slate-600">CENTRAL DE OPERACIONES — GESTIÓN REAL</p>
           <div>
             <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-2">Seguimiento Operativo</h2>
             <p className="text-sm md:text-base text-slate-300 font-bold">
               FOLIO <span className="text-[#849a3f]">{quoteNumber}</span> | PROCESO DE INGENIERÍA INTERNA
             </p>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 no-print w-full md:w-auto">
            <button type="button" onClick={() => void loadDetail()} disabled={loadingDetail}
              className="w-full sm:w-auto px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all disabled:opacity-30">
              <FaRedo className={loadingDetail ? "animate-spin" : ""} size={14} /> Sincronizar central
            </button>
            {publicToken && (
               <button type="button" onClick={() => void copyUrl(`/cotizacion/${publicToken}`)}
                 className="w-full sm:w-auto px-5 py-3 bg-[#849a3f] hover:bg-[#95ae47] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg">
                 <FaClipboard size={14} /> Copiar Enlace Público
               </button>
            )}
        </div>
      </div>

      <div className="p-8 md:p-12 space-y-10">
        {loadError && (
          <div className="rounded-xl border border-red-500 bg-red-50 p-6 text-sm font-black text-red-900 shadow-inner flex items-center gap-4">
             <FaTimesCircle className="shrink-0" size={24} /> {loadError}
          </div>
        )}

        {/* BLOQUE ESTADO COMERCIAL */}
        <div className="flex flex-col gap-6 rounded-2xl border border-slate-300 bg-[#f8fafc] p-8 md:flex-row md:items-center md:justify-between shadow-sm">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 border-l-4 border-slate-900 pl-3 mb-4">Estado Comercial Actual</p>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <span className={`inline-flex items-center rounded-lg px-5 py-2 text-xs font-black uppercase tracking-widest ${statusBadgeClass(localStatus)}`}>
                {statusLabelEs(localStatus)}
              </span>
              {(localStatus === "Approved" || localStatus === "Rejected") && (
                <span className="text-xs font-bold text-slate-800 bg-slate-200/50 px-3 py-1 rounded">Modo Solo Lectura (Origen: Cliente)</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 md:items-end">
            {(localStatus === "Pending" || localStatus === "Sent" || localStatus === "Expired") && (
              <div className="flex flex-wrap items-center gap-3">
                <select value={statusDraft} onChange={(e) => setStatusDraft(e.target.value as any)}
                  className="h-12 rounded-xl border-2 border-slate-300 bg-white px-5 text-sm font-black text-slate-900 focus:border-black focus:ring-0">
                  <option value="Pending">MODO BORRADOR</option>
                  <option value="Sent">ENVIADA POR EMAIL</option>
                  <option value="Expired">MARCAR EXPIRADA</option>
                </select>
                <button type="button" disabled={savingStatus || statusDraft === localStatus} onClick={() => void saveOperationalStatus()}
                  className="h-12 rounded-xl bg-black px-8 text-xs font-black text-white hover:bg-slate-800 transition-all uppercase tracking-widest disabled:opacity-20 shadow-lg">
                  {savingStatus ? "Sincronizando..." : "Actualizar Estado"}
                </button>
              </div>
            )}
            {localStatus === "Approved" && (
              <button type="button" onClick={() => void markExpired()} disabled={savingStatus}
                className="text-[11px] font-black text-red-700 uppercase tracking-widest border-b-2 border-red-200 hover:border-red-600 transition-all">
                Cerrar Ciclo — Marcar como Expirada
              </button>
            )}
          </div>
        </div>

        {statusHint && (
          <div className={`rounded-2xl border-2 p-8 text-sm shadow-sm ${
              statusHint.tone === "amber" ? "border-amber-300 bg-amber-50 text-amber-950" : 
              statusHint.tone === "blue" ? "border-sky-300 bg-sky-50 text-sky-950" : 
              "border-slate-300 bg-slate-50 text-slate-900"
            }`}>
            <p className="text-lg font-black uppercase tracking-tight mb-2 underline">{statusHint.title}</p>
            <p className="font-bold leading-relaxed">{statusHint.body}</p>
          </div>
        )}

        {/* AVANCE GLOBAL: ALTO CONTRASTE */}
        <div className="rounded-2xl border-2 border-slate-300 p-8 bg-white shadow-sm overflow-hidden relative">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">Métrica de Finalización Operativa</p>
            <p className="text-4xl font-black tabular-nums text-black">{tracking?.progress_percent ?? 0}%</p>
          </div>
          <div className="h-5 w-full bg-slate-100 rounded-full border border-slate-200 p-1">
            <div className="h-full rounded-full bg-black transition-all duration-700 ease-out" 
                 style={{ width: `${Math.max(0, Math.min(100, Number(tracking?.progress_percent || 0)))}%` }} />
          </div>
        </div>

        {/* ROADMAP DE ETAPAS */}
        {phaseFormUnlocked && tracking?.stages && tracking.stages.length > 0 && (
          <section className="rounded-2xl border-2 border-slate-300 bg-white shadow-xl overflow-hidden">
            <div className="bg-slate-900 px-8 py-6 text-white flex items-center justify-between border-b-2 border-slate-800">
               <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Timeline de Producción</p>
                  <h3 className="text-xl font-black tracking-tight">Administración de Hitos</h3>
               </div>
               <FaProjectDiagram className="opacity-20 text-4xl" />
            </div>

            <div className="p-8 space-y-4">
                <div className="p-6 bg-[#f8fafc] border-2 border-slate-200 rounded-xl mb-8">
                   <p className="text-sm font-black text-slate-900 leading-relaxed uppercase tracking-tight mb-1">Instrucciones Operativas:</p>
                   <p className="text-sm font-bold text-slate-700">Seleccione una etapa para reportar avances técnicos, subir evidencias o marcar hitos como completados. Los cambios se reflejan instantáneamente en el portal del cliente.</p>
                </div>

                <div className="grid gap-4">
                   {tracking.stages.map((stage, idx) => {
                      const isCurrent = stage.status === "current";
                      const isCompleted = stage.status === "completed";
                      const isSelected = selectedStageId === stage.id;
                      
                      return (
                        <div key={stage.id} onClick={() => setSelectedStageId(stage.id)}
                          className={`cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 relative ${
                            isSelected ? "border-black bg-white ring-4 ring-slate-100 shadow-xl" : 
                            isCurrent ? "border-sky-500 bg-sky-50 shadow-inner" : 
                            "border-slate-200 bg-white hover:border-slate-400"
                          }`}>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                             <div className="flex items-start sm:items-center gap-5">
                                <div className={`h-12 w-12 shrink-0 flex items-center justify-center rounded-lg font-black text-xl border-2 ${
                                   isCompleted ? "bg-emerald-500 border-emerald-600 text-white" : 
                                   isCurrent ? "bg-black border-black text-white" : 
                                   "bg-slate-100 border-slate-200 text-slate-900"
                                }`}>
                                   {isCompleted ? "✓" : idx + 1}
                                </div>
                                <div>
                                   <p className={`text-base md:text-lg font-black uppercase tracking-tighter ${isCompleted ? "text-slate-900" : "text-black"}`}>{stage.label}</p>
                                   <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                                      <span className={`w-fit text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded shadow-sm ${
                                         isCompleted ? "bg-emerald-100 text-emerald-900" : isCurrent ? "bg-black text-white" : "bg-slate-200 text-slate-700"
                                      }`}>
                                         {trackingStageStatusLabel(stage.status)}
                                      </span>
                                      {stage.date && <span className="text-[10px] md:text-[11px] font-bold text-slate-500">Sincronización: {formatStageDate(stage.date)}</span>}
                                   </div>
                                </div>
                             </div>
                             <button type="button" className={`w-full sm:w-auto h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                isSelected ? "bg-black text-white shadow-lg" : "bg-white text-black border-2 border-slate-200 hover:border-black"
                             }`}>
                                {isSelected ? "Seleccionada" : "Ver Detalles"}
                             </button>
                          </div>
                        </div>
                      );
                   })}
                </div>
            </div>

            {/* FORMULARIO DE ACCIÓN: ALTO CONTRASTE */}
            <div className="bg-slate-50 border-t-2 border-slate-300 p-8 md:p-12">
               <div className="max-w-4xl mx-auto">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="h-10 w-10 flex items-center justify-center bg-black text-white rounded-lg shadow-lg"><FaBolt /></div>
                     <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tighter">Panel de Acción: {selectedStageRow?.label}</h3>
                  </div>

                  {selectedStageIsCurrent ? (
                     <div className="space-y-10 group">
                        {selectedStageId === "payment_50" ? (
                           <div className="grid gap-10 md:grid-cols-2 p-6 md:p-8 bg-white border-2 border-slate-300 rounded-3xl shadow-sm">
                              {/* Lado Izquierdo: Comprobante del Cliente */}
                              <div className="space-y-6">
                                 <h4 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                    <FaMoneyBillWave className="text-[#849a3f]" /> Gestión de Abono Inicial
                                 </h4>
                                 <p className="font-bold text-slate-500 text-sm leading-relaxed">
                                    El sistema requiere la validación del 50% para activar la ingeniería del proyecto.
                                    Puede registrarlo manualmente o validar el comprobante subido por el cliente.
                                 </p>

                                 {proposalData?.payment_receipt_url && (
                                   <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 shadow-sm">
                                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3">Comprobante Detectado</p>
                                      <div className="flex items-center gap-4">
                                         <a href={proposalData.payment_receipt_url} target="_blank" className="h-16 w-16 bg-white border border-emerald-200 rounded-lg flex items-center justify-center text-emerald-500 hover:scale-105 transition-all shadow-sm">
                                            <FaEye size={24} />
                                         </a>
                                         <div className="flex-1">
                                            <p className="text-xs font-black text-emerald-900 uppercase">{proposalData.payment_method?.toUpperCase() || 'TRANSFERENCIA'}</p>
                                            <p className="text-[11px] font-bold text-emerald-600">Estado: {proposalData.payment_status === 'verifying' ? 'Esperando Aprobación' : 'Validado'}</p>
                                         </div>
                                      </div>
                                      {proposalData.payment_status === 'verifying' && (
                                          <div className="flex flex-col gap-2 mt-4">
                                             <button onClick={approveClientPayment} disabled={updatingPayment} className="w-full h-12 bg-emerald-600 text-white font-black rounded-lg text-xs tracking-widest uppercase hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2">
                                                <FaCheckCircle /> VALIDAR Y ACTIVAR PROYECTO
                                             </button>
                                             <button onClick={rejectClientPayment} disabled={updatingPayment} className="w-full h-10 border-2 border-rose-200 text-rose-600 font-bold rounded-lg text-[10px] tracking-widest uppercase hover:bg-rose-50 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                                                <FaTimesCircle /> Rechazar Comprobante
                                             </button>
                                          </div>
                                       )}
                                   </div>
                                 )}
                              </div>

                              {/* Lado Derecho: Registro Manual */}
                              <div className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-6 space-y-4">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Registro Manual (Interno)</p>
                                 <input type="text" placeholder="ID de transacción / Referencia..." value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} className="w-full h-12 rounded-xl border-2 border-slate-300 px-5 text-sm font-bold text-slate-900 focus:border-black outline-none" />
                                 <textarea placeholder="Notas administrativas internas..." value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} className="w-full h-24 rounded-xl border-2 border-slate-300 p-4 text-sm font-bold text-slate-800 focus:border-black outline-none resize-none" />
                                 <button onClick={submitPaymentConfirm} disabled={updatingPayment || selectedStageRow?.status === "completed"} className="w-full h-14 bg-black text-white font-black rounded-xl text-xs tracking-[0.2em] uppercase hover:bg-slate-800 disabled:opacity-20 shadow-lg transition-all">
                                    {updatingPayment ? "Ejecutando..." : "Confirmar Validación Manual"}
                                 </button>
                              </div>
                           </div>
                        ) : selectedExecutionStage ? (
                            <div className="space-y-8 bg-white border-2 border-slate-300 p-6 md:p-10 rounded-2xl shadow-sm">
                              {selectedStageRow?.id === "kickoff" && (
                                 <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-900 mb-2 block">Fecha Oficial de Kickoff</label>
                                    <input type="date" value={kickoffDate} onChange={e => setKickoffDate(e.target.value)}
                                       className="w-full h-14 bg-slate-50 border-2 border-slate-300 rounded-xl px-5 font-black text-slate-950" />
                                 </div>
                              )}
                              
                              <div className="grid gap-8 lg:grid-cols-2">
                                 <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-900 mb-2 block">Nota Interna (Bitácora)</label>
                                    <textarea value={execNote} onChange={e => setExecNote(e.target.value)} placeholder="Tareas tecnicas realizadas, bloqueos, configuraciones..."
                                       className="w-full h-40 bg-slate-50 border-2 border-slate-300 rounded-xl p-5 font-bold text-slate-950 placeholder:text-slate-500 focus:border-black outline-none resize-none" />
                                 </div>
                                 <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-900 mb-2 block">Informe Visible al Cliente</label>
                                    <textarea value={execReport} onChange={e => setExecReport(e.target.value)} placeholder="¿Que debe saber el cliente hoy? Explica el avance de forma profesional..."
                                       className="w-full h-40 bg-slate-50 border-2 border-slate-300 rounded-xl p-5 font-bold text-slate-950 placeholder:text-slate-500 focus:border-black outline-none resize-none" />
                                 </div>
                              </div>

                              <div>
                                 <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block italic">URLs de Evidencia (Separadas por coma o línea)</label>
                                 <textarea value={execMediaUrls} onChange={e => setExecMediaUrls(e.target.value)} placeholder="https://multimedia.com/foto1.jpg, https://multimedia.com/video1.mp4"
                                    className="w-full h-24 bg-slate-50 border-2 border-slate-300 rounded-xl p-4 md:p-5 font-mono text-[10px] text-slate-900 focus:border-black outline-none resize-none" />
                                 <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between bg-[#1e293b] text-white p-5 rounded-2xl gap-4">
                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                       <label className="w-full sm:w-auto h-12 px-6 bg-white text-black text-[10px] font-black uppercase flex items-center justify-center gap-2 rounded-xl cursor-pointer hover:bg-slate-200 transition-all">
                                          <FaUpload /> {uploadingEvidence ? "SUBIENDO..." : "SUBIR DESDE PC"}
                                          <input type="file" multiple accept="image/*,video/*" className="hidden" disabled={uploadingEvidence} onChange={e => void uploadExecutionEvidence(e.target.files)} />
                                       </label>
                                       <p className="text-[9px] font-bold text-slate-400 text-center sm:text-left">Formatos permitidos: JPG, PNG, MP4</p>
                                    </div>
                                    {uploadError && <span className="text-red-400 text-[10px] font-black uppercase text-center">{uploadError}</span>}
                                 </div>
                              </div>

                              <div className="pt-6 border-t-2 border-slate-100 flex flex-col lg:flex-row gap-4">
                                 <button onClick={() => submitExecution(false)} disabled={updatingProject}
                                    className="w-full h-16 bg-slate-800 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-slate-900 shadow-lg disabled:opacity-30">
                                    {selectedStageRow?.id === "kickoff" ? "Registrar Avance de Kickoff" : `GUARDAR AVANCE PARCIAL (${execProgress}%)`}
                                 </button>
                                 <button onClick={() => submitExecution(true)} disabled={updatingProject}
                                    className="w-full h-16 bg-[#849a3f] text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:opacity-90 shadow-lg disabled:opacity-30">
                                    {selectedStageRow?.id === "kickoff" ? "Completar Inicio de Proyecto" : "FINALIZAR ESTA ETAPA (100%)"}
                                 </button>
                              </div>
                           </div>
                        ) : null}
                     </div>
                  ) : (
                     <div className="bg-white border-2 border-slate-300 p-10 rounded-2xl shadow-inner flex flex-col items-center justify-center text-center">
                        <FaCheckCircle className="text-slate-900 mb-4 opacity-50" size={60} />
                        <h4 className="text-2xl font-black text-slate-950 uppercase tracking-tighter mb-4">Etapa Administrada</h4>
                        <p className="text-sm font-bold text-slate-700 max-w-sm">Este hito ha sido cerrado o se encuentra en modo histórico. Para modificarlo, debe ser la etapa activa del proyecto.</p>
                     </div>
                  )}
               </div>
            </div>
         </section>
        )}
      </div>
    </div>
  );
}
