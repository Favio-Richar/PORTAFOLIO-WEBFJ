"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaFilter,
  FaDownload,
  FaEnvelopeOpenText,
  FaPaperPlane,
  FaRedo,
  FaSave,
  FaTrash,
  FaUserCheck,
  FaUserSlash,
  FaUsers,
} from "react-icons/fa";
import API_BASE from "@/lib/apiBase";
import { adminFetch } from "@/lib/adminFetch";

type SubscriberStatus = "pending" | "active" | "unsubscribed" | "bounced" | "blocked";
type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "failed";
type TargetMode = "all" | "tags" | "selected";

type CampaignContentItem = {
  source_type: string;
  source_id: number;
  title: string;
  summary?: string | null;
  details?: string | null;
  url?: string | null;
  image_url?: string | null;
  sort_index?: number;
};

type CampaignContentCatalog = {
  blog: CampaignContentItem[];
  projects: CampaignContentItem[];
  service_plans: CampaignContentItem[];
  service_extras: CampaignContentItem[];
  service_combos: CampaignContentItem[];
  advisories: CampaignContentItem[];
};

type SubscriberOption = {
  id: number;
  email: string;
  full_name?: string | null;
  status: SubscriberStatus;
  source: string;
  tags: string[];
};

type RecipientPreview = {
  total: number;
  items: Array<{
    id: number;
    email: string;
    full_name?: string | null;
    source: string;
  }>;
};

type CampaignProcessDueResult = {
  processed: number;
  errors: number;
};

type Subscriber = {
  id: number;
  email: string;
  full_name?: string | null;
  status: SubscriberStatus;
  source: string;
  tags: string[];
  notes?: string | null;
  subscribed_at: string;
  unsubscribed_at?: string | null;
  last_sent_at?: string | null;
  created_at: string;
  updated_at: string;
};

type Campaign = {
  id: number;
  name: string;
  subject: string;
  preview_text?: string | null;
  content_html: string;
  content_text?: string | null;
  status: CampaignStatus;
  target_mode: TargetMode;
  target_tags: string[];
  content_items: CampaignContentItem[];
  include_subscriber_ids: number[];
  exclude_subscriber_ids: number[];
  estimated_recipients: number;
  scheduled_for?: string | null;
  sent_at?: string | null;
  total_recipients: number;
  total_sent: number;
  total_failed: number;
  created_at: string;
  updated_at: string;
};

type Delivery = {
  id: number;
  campaign_id: number;
  subscriber_id?: number | null;
  email: string;
  status: "queued" | "sent" | "failed" | "skipped";
  error_message?: string | null;
  provider_message_id?: string | null;
  sent_at?: string | null;
  created_at: string;
};

type SubscribersPage = {
  items: Subscriber[];
  total: number;
  page: number;
  page_size: number;
};

type NewsletterOverview = {
  total_subscribers: number;
  pending_subscribers: number;
  active_subscribers: number;
  unsubscribed_subscribers: number;
  bounced_subscribers: number;
  blocked_subscribers: number;
  total_campaigns: number;
  draft_campaigns: number;
  scheduled_campaigns: number;
  sent_campaigns: number;
  total_deliveries: number;
  sent_deliveries: number;
  failed_deliveries: number;
};

const SUBSCRIBERS_API = `${API_BASE}/api/subscribers`;
const PAGE_SIZE = 25;
const CATALOG_PAGE_SIZE = 12;

const EMPTY_CAMPAIGN_FORM = {
  id: null as number | null,
  name: "",
  subject: "",
  preview_text: "",
  content_html:
    "<h1>Hola {{nombre}}</h1><p>Aqui va tu contenido de newsletter.</p><p>Gracias por estar suscrito.</p>",
  content_text: "",
  target_mode: "all" as TargetMode,
  target_tags: "",
  content_items: [] as CampaignContentItem[],
  include_subscriber_ids: [] as number[],
  exclude_subscriber_ids: [] as number[],
  scheduled_for: "",
};

function toTags(input: string): string[] {
  return input
    .split(/,|\n|;/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

async function parseApi<T>(response: Response): Promise<T> {
  const raw = await response.text();
  let payload: unknown = {};
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = {};
    }
  }

  if (!response.ok) {
    const detail =
      typeof payload === "object" &&
      payload &&
      "detail" in payload &&
      typeof (payload as { detail?: unknown }).detail === "string"
        ? (payload as { detail: string }).detail
        : "No se pudo completar la solicitud.";
    throw new Error(detail);
  }

  return payload as T;
}

function fmtDate(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("es-CL");
}

function badgeClass(status: string): string {
  if (status === "active" || status === "sent") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }
  if (status === "pending") {
    return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
  }
  if (status === "draft" || status === "scheduled") {
    return "border-blue-500/30 bg-blue-500/10 text-blue-300";
  }
  if (status === "sending" || status === "queued") {
    return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
  }
  if (status === "unsubscribed" || status === "blocked") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  }
  return "border-rose-500/30 bg-rose-500/10 text-rose-300";
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    active: "Activo",
    pending: "Pendiente",
    unsubscribed: "Baja",
    bounced: "Rebote",
    blocked: "Bloqueado",
    draft: "Borrador",
    scheduled: "Programada",
    sending: "Enviando",
    sent: "Enviada",
    failed: "Fallida",
    queued: "En cola",
    skipped: "Saltado",
  };
  return map[status] || status;
}

function targetModeLabel(mode: TargetMode): string {
  const map: Record<TargetMode, string> = {
    all: "Todos los activos",
    tags: "Solo por tags",
    selected: "Solo seleccionados",
  };
  return map[mode] || mode;
}

function sourceTypeLabel(sourceType: string): string {
  const map: Record<string, string> = {
    blog: "Blog",
    project: "Proyectos",
    service_plan: "Servicios Planes",
    service_extra: "Servicios Extras",
    service_combo: "Servicios Combos",
    advisory: "Asesorías",
  };
  return map[sourceType] || sourceType;
}

function excerptText(value?: string | null, maxLen = 180): string {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= maxLen) return normalized;
  return `${normalized.slice(0, maxLen - 3).trim()}...`;
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function toLocalInputFromDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(
    date.getHours()
  )}:${pad2(date.getMinutes())}`;
}

function toLocalDateTimeInput(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return toLocalInputFromDate(date);
}

function toIsoFromLocalDateTime(value?: string | null): string | null {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export default function SubscribersAdmin() {
  const [tab, setTab] = useState<"subscribers" | "campaigns" | "deliveries">("subscribers");

  const [overview, setOverview] = useState<NewsletterOverview | null>(null);
  const [subscribersPage, setSubscribersPage] = useState<SubscribersPage>({
    items: [],
    total: 0,
    page: 1,
    page_size: PAGE_SIZE,
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | SubscriberStatus>("all");
  const [page, setPage] = useState(1);

  const [campaignForm, setCampaignForm] = useState(EMPTY_CAMPAIGN_FORM);
  const [contentCatalog, setContentCatalog] = useState<CampaignContentCatalog>({
    blog: [],
    projects: [],
    service_plans: [],
    service_extras: [],
    service_combos: [],
    advisories: [],
  });
  const [subscriberOptions, setSubscriberOptions] = useState<SubscriberOption[]>([]);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [recipientPreview, setRecipientPreview] = useState<RecipientPreview | null>(null);
  const [showAdvancedHtml, setShowAdvancedHtml] = useState(false);
  const [detailItem, setDetailItem] = useState<CampaignContentItem | null>(null);
  const [catalogPageByGroup, setCatalogPageByGroup] = useState<Record<string, number>>({
    blog: 1,
    projects: 1,
    service_plans: 1,
    service_extras: 1,
    service_combos: 1,
    advisories: 1,
  });

  const [loadingBoot, setLoadingBoot] = useState(true);
  const [busyKey, setBusyKey] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const scheduleDateTimeRef = useRef<HTMLInputElement | null>(null);
  const scheduleDateRef = useRef<HTMLInputElement | null>(null);
  const scheduleTimeRef = useRef<HTMLInputElement | null>(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(subscribersPage.total / PAGE_SIZE)),
    [subscribersPage.total]
  );

  const fetchOverview = useCallback(async () => {
    const res = await adminFetch(`${SUBSCRIBERS_API}/admin/overview`, { cache: "no-store" });
    const data = await parseApi<NewsletterOverview>(res);
    setOverview(data);
  }, []);

  const fetchSubscribers = useCallback(async () => {
    const params = new URLSearchParams({
      q: query,
      status: statusFilter,
      page: String(page),
      page_size: String(PAGE_SIZE),
    });

    const res = await adminFetch(`${SUBSCRIBERS_API}/admin/subscribers?${params.toString()}`, {
      cache: "no-store",
    });
    const data = await parseApi<SubscribersPage>(res);
    setSubscribersPage(data);
  }, [page, query, statusFilter]);

  const fetchCampaigns = useCallback(async () => {
    const res = await adminFetch(`${SUBSCRIBERS_API}/admin/campaigns`, { cache: "no-store" });
    const data = await parseApi<Campaign[]>(res);
    setCampaigns(data);
  }, []);

  const fetchContentCatalog = useCallback(async () => {
    const res = await adminFetch(`${SUBSCRIBERS_API}/admin/content-catalog`, { cache: "no-store" });
    const data = await parseApi<CampaignContentCatalog>(res);
    setContentCatalog(data);
  }, []);

  const fetchSubscriberOptions = useCallback(async () => {
    const params = new URLSearchParams({
      status: "active",
      limit: "1000",
    });
    const res = await adminFetch(`${SUBSCRIBERS_API}/admin/subscribers/options?${params.toString()}`, {
      cache: "no-store",
    });
    const data = await parseApi<SubscriberOption[]>(res);
    setSubscriberOptions(data);
  }, []);

  const fetchDeliveries = useCallback(async (campaignId: number) => {
    const res = await adminFetch(`${SUBSCRIBERS_API}/admin/campaigns/${campaignId}/deliveries`, {
      cache: "no-store",
    });
    const data = await parseApi<Delivery[]>(res);
    setDeliveries(data);
  }, []);

  const previewRecipients = useCallback(async () => {
    const res = await adminFetch(`${SUBSCRIBERS_API}/admin/recipients/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_mode: campaignForm.target_mode,
        target_tags: toTags(campaignForm.target_tags),
        include_subscriber_ids: campaignForm.include_subscriber_ids,
        exclude_subscriber_ids: campaignForm.exclude_subscriber_ids,
      }),
    });
    const data = await parseApi<RecipientPreview>(res);
    setRecipientPreview(data);
  }, [campaignForm.exclude_subscriber_ids, campaignForm.include_subscriber_ids, campaignForm.target_mode, campaignForm.target_tags]);

  const processDueCampaigns = useCallback(async (silent = false) => {
    const res = await adminFetch(`${SUBSCRIBERS_API}/admin/campaigns/process-due`, {
      method: "POST",
    });
    const data = await parseApi<CampaignProcessDueResult>(res);

    if (!silent && data.processed > 0) {
      setNotice(`Programacion automatica: ${data.processed} campana(s) enviada(s) por calendario.`);
    }
    if (!silent && data.errors > 0) {
      setError(`Se detectaron ${data.errors} error(es) al procesar campañas programadas.`);
    }
    return data;
  }, []);

  const refreshPanel = useCallback(async () => {
    try {
      setBusyKey("refresh-all");
      setError("");
      setNotice("");
      await Promise.all([
        fetchOverview(),
        fetchSubscribers(),
        fetchCampaigns(),
        fetchContentCatalog(),
        fetchSubscriberOptions(),
      ]);
      if (selectedCampaignId && tab === "deliveries") {
        await fetchDeliveries(selectedCampaignId);
      }
      setNotice("Panel de suscriptores sincronizado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo sincronizar suscripciones.");
    } finally {
      setBusyKey("");
    }
  }, [
    fetchCampaigns,
    fetchContentCatalog,
    fetchDeliveries,
    fetchOverview,
    fetchSubscriberOptions,
    fetchSubscribers,
    selectedCampaignId,
    tab,
  ]);

  useEffect(() => {
    let mounted = true;
    const boot = async () => {
      setLoadingBoot(true);
      setError("");
      try {
        await Promise.all([
          fetchOverview(),
          fetchCampaigns(),
          fetchSubscribers(),
          fetchContentCatalog(),
          fetchSubscriberOptions(),
        ]);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "No se pudo cargar el modulo.");
        }
      } finally {
        if (mounted) setLoadingBoot(false);
      }
    };
    void boot();
    return () => {
      mounted = false;
    };
  }, [fetchCampaigns, fetchContentCatalog, fetchOverview, fetchSubscriberOptions, fetchSubscribers]);

  useEffect(() => {
    if (loadingBoot) return;
    void fetchSubscribers().catch((err) => {
      setError(err instanceof Error ? err.message : "Error cargando suscriptores.");
    });
  }, [fetchSubscribers, loadingBoot]);

  useEffect(() => {
    if (!selectedCampaignId && campaigns.length > 0) {
      setSelectedCampaignId(campaigns[0].id);
    }
  }, [campaigns, selectedCampaignId]);

  useEffect(() => {
    if (tab !== "deliveries" || !selectedCampaignId) return;
    void fetchDeliveries(selectedCampaignId).catch((err) => {
      setError(err instanceof Error ? err.message : "Error cargando historial de envios.");
    });
  }, [fetchDeliveries, selectedCampaignId, tab]);

  useEffect(() => {
    if (tab !== "subscribers") return;
    const intervalId = window.setInterval(() => {
      void Promise.all([fetchOverview(), fetchSubscribers()]).catch(() => {});
    }, 15000);
    return () => window.clearInterval(intervalId);
  }, [fetchOverview, fetchSubscribers, tab]);

  useEffect(() => {
    if (tab !== "campaigns" && tab !== "deliveries") return;
    const intervalId = window.setInterval(() => {
      void Promise.all([fetchOverview(), fetchCampaigns()]).catch(() => {});
      if (selectedCampaignId && tab === "deliveries") {
        void fetchDeliveries(selectedCampaignId).catch(() => {});
      }
    }, 45000);
    return () => window.clearInterval(intervalId);
  }, [fetchCampaigns, fetchDeliveries, fetchOverview, selectedCampaignId, tab]);

  const updateSubscriberStatus = async (subscriber: Subscriber, nextStatus: SubscriberStatus) => {
    try {
      setBusyKey(`subscriber-status-${subscriber.id}-${nextStatus}`);
      setError("");
      setNotice("");
      const res = await adminFetch(`${SUBSCRIBERS_API}/admin/subscribers/${subscriber.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      await parseApi<Subscriber>(res);
      await Promise.all([fetchOverview(), fetchSubscribers()]);
      setNotice(`Estado actualizado: ${subscriber.email} -> ${statusLabel(nextStatus)}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar estado.");
    } finally {
      setBusyKey("");
    }
  };

  const deleteSubscriber = async (subscriber: Subscriber) => {
    if (!window.confirm(`Eliminar suscriptor ${subscriber.email}?`)) return;
    try {
      setBusyKey(`subscriber-delete-${subscriber.id}`);
      setError("");
      setNotice("");
      const res = await adminFetch(`${SUBSCRIBERS_API}/admin/subscribers/${subscriber.id}`, {
        method: "DELETE",
      });
      await parseApi<{ ok: boolean }>(res);
      await Promise.all([fetchOverview(), fetchSubscribers()]);
      setNotice("Suscriptor eliminado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar suscriptor.");
    } finally {
      setBusyKey("");
    }
  };

  const exportSubscribers = async () => {
    try {
      setBusyKey("subscriber-export");
      setError("");
      setNotice("");
      const params = new URLSearchParams({
        status: statusFilter,
      });
      const res = await adminFetch(`${SUBSCRIBERS_API}/admin/subscribers/export?${params.toString()}`);
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(
          typeof payload === "object" &&
            payload &&
            "detail" in payload &&
            typeof (payload as { detail?: unknown }).detail === "string"
            ? (payload as { detail: string }).detail
            : "No se pudo exportar CSV."
        );
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `newsletter-subscribers-${Date.now()}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      setNotice("CSV exportado correctamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo exportar CSV.");
    } finally {
      setBusyKey("");
    }
  };

  const saveCampaign = async () => {
    if (!campaignForm.name.trim() || !campaignForm.subject.trim() || !campaignForm.content_html.trim()) {
      setError("Nombre, asunto y contenido HTML son obligatorios.");
      return;
    }
    const normalizedTargetTags = toTags(campaignForm.target_tags);
    if (campaignForm.target_mode === "tags" && normalizedTargetTags.length === 0) {
      setError("Si usas 'Solo por tags', debes escribir al menos un tag objetivo.");
      return;
    }
    if (campaignForm.target_mode === "selected" && campaignForm.include_subscriber_ids.length === 0) {
      setError("Si usas 'Solo seleccionados', debes incluir al menos un suscriptor.");
      return;
    }

    const scheduledIso = toIsoFromLocalDateTime(campaignForm.scheduled_for);
    if (campaignForm.scheduled_for && !scheduledIso) {
      setError("La fecha/hora programada no es válida.");
      return;
    }
    if (scheduledIso && Date.parse(scheduledIso) <= Date.now() + 60_000) {
      setError("La fecha programada debe ser al menos 1 minuto en el futuro.");
      return;
    }

    try {
      const isEdit = Boolean(campaignForm.id);
      setBusyKey(isEdit ? `campaign-save-${campaignForm.id}` : "campaign-create");
      setError("");
      setNotice("");

      const endpoint = isEdit
        ? `${SUBSCRIBERS_API}/admin/campaigns/${campaignForm.id}`
        : `${SUBSCRIBERS_API}/admin/campaigns`;
      const method = isEdit ? "PUT" : "POST";

      const res = await adminFetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: campaignForm.name.trim(),
          subject: campaignForm.subject.trim(),
          preview_text: campaignForm.preview_text.trim() || null,
          content_html: campaignForm.content_html.trim(),
          content_text: campaignForm.content_text.trim() || null,
          target_mode: campaignForm.target_mode,
          target_tags: campaignForm.target_mode === "tags" ? normalizedTargetTags : [],
          content_items: campaignForm.content_items.map((item, index) => ({
            source_type: item.source_type,
            source_id: item.source_id,
            title: item.title,
            summary: item.summary || null,
            details: item.details || null,
            url: item.url || null,
            image_url: item.image_url || null,
            sort_index: index,
          })),
          include_subscriber_ids: campaignForm.include_subscriber_ids,
          exclude_subscriber_ids: campaignForm.exclude_subscriber_ids,
          scheduled_for: scheduledIso,
        }),
      });
      const savedCampaign = await parseApi<Campaign>(res);
      await Promise.all([fetchOverview(), fetchCampaigns()]);
      setCampaignForm(EMPTY_CAMPAIGN_FORM);
      setRecipientPreview(null);
      if (savedCampaign.status === "scheduled" && savedCampaign.scheduled_for) {
        setNotice(`Campaña programada para ${fmtDate(savedCampaign.scheduled_for)}.`);
      } else {
        if (isEdit) {
          setNotice("Campaña actualizada.");
        } else if (savedCampaign.status === "sent") {
          setNotice(
            `Campaña creada y enviada ahora. Total: ${savedCampaign.total_recipients}, enviados: ${savedCampaign.total_sent}, fallidos: ${savedCampaign.total_failed}.`
          );
        } else if (savedCampaign.status === "failed") {
          setNotice("Campaña creada, pero el envío inmediato falló. Revisa destinatarios/configuración.");
        } else {
          setNotice("Campaña creada.");
        }
      }
      setTab("campaigns");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar campana.");
    } finally {
      setBusyKey("");
    }
  };

  const editCampaign = (campaign: Campaign) => {
    setCampaignForm({
      id: campaign.id,
      name: campaign.name,
      subject: campaign.subject,
      preview_text: campaign.preview_text || "",
      content_html: campaign.content_html,
      content_text: campaign.content_text || "",
      target_mode: campaign.target_mode,
      target_tags: campaign.target_tags.join(", "),
      content_items: (campaign.content_items || []).map((item) => {
        const catalogItem = catalogItemMap.get(`${item.source_type}:${item.source_id}`);
        return {
          ...item,
          summary: catalogItem?.summary || item.summary || null,
          details: catalogItem?.details || item.details || item.summary || null,
          url: catalogItem?.url || item.url || null,
          image_url: catalogItem?.image_url || item.image_url || null,
        };
      }),
      include_subscriber_ids: campaign.include_subscriber_ids || [],
      exclude_subscriber_ids: campaign.exclude_subscriber_ids || [],
      scheduled_for: toLocalDateTimeInput(campaign.scheduled_for),
    });
    setTab("campaigns");
    setNotice("");
    setError("");
    setRecipientPreview(null);
  };

  const isContentSelected = useCallback(
    (sourceType: string, sourceId: number) =>
      campaignForm.content_items.some(
        (item) => item.source_type === sourceType && item.source_id === sourceId
      ),
    [campaignForm.content_items]
  );

  const toggleContentItem = useCallback(
    (item: CampaignContentItem) => {
      setCampaignForm((prev) => {
        const exists = prev.content_items.some(
          (row) => row.source_type === item.source_type && row.source_id === item.source_id
        );
        if (exists) {
          return {
            ...prev,
            content_items: prev.content_items.filter(
              (row) => !(row.source_type === item.source_type && row.source_id === item.source_id)
            ),
          };
        }
        return {
          ...prev,
          content_items: [...prev.content_items, item],
        };
      });
    },
    []
  );

  const toggleIncludeSubscriber = useCallback((subscriberId: number) => {
    setCampaignForm((prev) => {
      const includes = new Set(prev.include_subscriber_ids);
      if (includes.has(subscriberId)) {
        includes.delete(subscriberId);
      } else {
        includes.add(subscriberId);
      }
      const excludes = prev.exclude_subscriber_ids.filter((id) => id !== subscriberId);
      return {
        ...prev,
        include_subscriber_ids: Array.from(includes),
        exclude_subscriber_ids: excludes,
      };
    });
  }, []);

  const toggleExcludeSubscriber = useCallback((subscriberId: number) => {
    setCampaignForm((prev) => {
      const excludes = new Set(prev.exclude_subscriber_ids);
      if (excludes.has(subscriberId)) {
        excludes.delete(subscriberId);
      } else {
        excludes.add(subscriberId);
      }
      const includes = prev.include_subscriber_ids.filter((id) => id !== subscriberId);
      return {
        ...prev,
        include_subscriber_ids: includes,
        exclude_subscriber_ids: Array.from(excludes),
      };
    });
  }, []);

  const setScheduledDatePart = useCallback((datePart: string) => {
    setCampaignForm((prev) => {
      if (!datePart) return { ...prev, scheduled_for: "" };
      const currentTime = prev.scheduled_for?.slice(11, 16) || "09:00";
      return { ...prev, scheduled_for: `${datePart}T${currentTime}` };
    });
  }, []);

  const setScheduledTimePart = useCallback((timePart: string) => {
    setCampaignForm((prev) => {
      if (!timePart) return prev;
      const baseDate = prev.scheduled_for?.slice(0, 10) || toLocalInputFromDate(new Date()).slice(0, 10);
      return { ...prev, scheduled_for: `${baseDate}T${timePart}` };
    });
  }, []);

  const scheduleWithOffsetMinutes = useCallback((minutes: number) => {
    const date = new Date();
    date.setSeconds(0, 0);
    date.setMinutes(date.getMinutes() + minutes);
    setCampaignForm((prev) => ({
      ...prev,
      scheduled_for: toLocalInputFromDate(date),
    }));
  }, []);

  const clearScheduledDate = useCallback(() => {
    setCampaignForm((prev) => ({ ...prev, scheduled_for: "" }));
  }, []);

  const openNativePicker = useCallback((inputRef: { current: HTMLInputElement | null }) => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    try {
      const pickerInput = input as HTMLInputElement & { showPicker?: () => void };
      if (typeof pickerInput.showPicker === "function") {
        pickerInput.showPicker();
      }
    } catch {
      // Fallback to native focus only when showPicker is not available.
    }
  }, []);

  const filteredSubscriberOptions = useMemo(() => {
    const q = recipientSearch.trim().toLowerCase();
    if (!q) return subscriberOptions;
    return subscriberOptions.filter(
      (item) =>
        item.email.toLowerCase().includes(q) ||
        String(item.full_name || "")
          .toLowerCase()
          .includes(q)
    );
  }, [recipientSearch, subscriberOptions]);

  const filteredSubscriberIds = useMemo(
    () => filteredSubscriberOptions.map((item) => item.id),
    [filteredSubscriberOptions]
  );

  const filteredSubscriberIdSet = useMemo(() => new Set(filteredSubscriberIds), [filteredSubscriberIds]);

  const scheduledDatePart = campaignForm.scheduled_for ? campaignForm.scheduled_for.slice(0, 10) : "";
  const scheduledTimePart = campaignForm.scheduled_for ? campaignForm.scheduled_for.slice(11, 16) : "";
  const scheduleMinValue = toLocalInputFromDate(new Date(Date.now() + 60_000));
  const hasScheduledDate = Boolean(toIsoFromLocalDateTime(campaignForm.scheduled_for));

  const scheduledHumanText = useMemo(() => {
    const parsed = toIsoFromLocalDateTime(campaignForm.scheduled_for);
    if (!parsed) return "";
    const date = new Date(parsed);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("es-CL", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  }, [campaignForm.scheduled_for]);

  const includeVisibleSubscribers = useCallback(() => {
    if (!filteredSubscriberIds.length) return;
    setCampaignForm((prev) => {
      const includes = new Set(prev.include_subscriber_ids);
      filteredSubscriberIds.forEach((id) => includes.add(id));
      const excludes = prev.exclude_subscriber_ids.filter((id) => !filteredSubscriberIdSet.has(id));
      return {
        ...prev,
        target_mode: "selected",
        include_subscriber_ids: Array.from(includes),
        exclude_subscriber_ids: excludes,
      };
    });
    setNotice(`Incluidos ${filteredSubscriberIds.length} suscriptores visibles.`);
  }, [filteredSubscriberIds, filteredSubscriberIdSet]);

  const excludeVisibleSubscribers = useCallback(() => {
    if (!filteredSubscriberIds.length) return;
    setCampaignForm((prev) => {
      const excludes = new Set(prev.exclude_subscriber_ids);
      filteredSubscriberIds.forEach((id) => excludes.add(id));
      const includes = prev.include_subscriber_ids.filter((id) => !filteredSubscriberIdSet.has(id));
      return {
        ...prev,
        include_subscriber_ids: includes,
        exclude_subscriber_ids: Array.from(excludes),
      };
    });
    setNotice(`Excluidos ${filteredSubscriberIds.length} suscriptores visibles.`);
  }, [filteredSubscriberIds, filteredSubscriberIdSet]);

  const selectAllActiveSubscribers = useCallback(() => {
    setCampaignForm((prev) => ({
      ...prev,
      target_mode: "all",
      include_subscriber_ids: [],
      exclude_subscriber_ids: [],
    }));
    setNotice(`Modo "Todos los activos" habilitado (${subscriberOptions.length} activos).`);
  }, [subscriberOptions.length]);

  const clearRecipientRules = useCallback(() => {
    setCampaignForm((prev) => ({
      ...prev,
      include_subscriber_ids: [],
      exclude_subscriber_ids: [],
    }));
    setNotice("Reglas de inclusión/exclusión limpiadas.");
  }, []);

  const catalogGroups = useMemo(
    () =>
      [
        { key: "blog", label: "Blog", items: contentCatalog.blog },
        { key: "projects", label: "Proyectos", items: contentCatalog.projects },
        { key: "service_plans", label: "Servicios Planes", items: contentCatalog.service_plans },
        { key: "service_extras", label: "Servicios Extras", items: contentCatalog.service_extras },
        { key: "service_combos", label: "Servicios Combos", items: contentCatalog.service_combos },
        { key: "advisories", label: "Asesorias", items: contentCatalog.advisories },
      ] as const,
    [contentCatalog]
  );

  const catalogItemMap = useMemo(() => {
    const map = new Map<string, CampaignContentItem>();
    for (const group of catalogGroups) {
      for (const item of group.items) {
        map.set(`${item.source_type}:${item.source_id}`, item);
      }
    }
    return map;
  }, [catalogGroups]);

  const deleteCampaign = async (campaign: Campaign) => {
    if (!window.confirm(`Eliminar campana "${campaign.name}"?`)) return;
    try {
      setBusyKey(`campaign-delete-${campaign.id}`);
      setError("");
      setNotice("");
      const res = await adminFetch(`${SUBSCRIBERS_API}/admin/campaigns/${campaign.id}`, {
        method: "DELETE",
      });
      await parseApi<{ ok: boolean }>(res);
      await Promise.all([fetchOverview(), fetchCampaigns()]);
      if (selectedCampaignId === campaign.id) {
        setSelectedCampaignId(null);
        setDeliveries([]);
      }
      setNotice("Campana eliminada.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar campana.");
    } finally {
      setBusyKey("");
    }
  };

  const sendTestCampaign = async (campaign: Campaign) => {
    const email = window.prompt("Correo para prueba:");
    if (!email?.trim()) return;

    try {
      setBusyKey(`campaign-test-${campaign.id}`);
      setError("");
      setNotice("");
      const res = await adminFetch(`${SUBSCRIBERS_API}/admin/campaigns/${campaign.id}/send-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const payload = await parseApi<{ ok: boolean; message?: string }>(res);
      setNotice(payload.message || `Prueba enviada a ${email.trim()}.`);
      await fetchOverview();
      if (selectedCampaignId === campaign.id && tab === "deliveries") {
        await fetchDeliveries(campaign.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar correo de prueba.");
    } finally {
      setBusyKey("");
    }
  };

  const sendCampaignNow = async (campaign: Campaign) => {
    if (!window.confirm(`Enviar campana "${campaign.name}" ahora?`)) return;

    try {
      setBusyKey(`campaign-send-${campaign.id}`);
      setError("");
      setNotice("");
      const res = await adminFetch(`${SUBSCRIBERS_API}/admin/campaigns/${campaign.id}/send-now`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: campaign.status === "sent" }),
      });
      const payload = await parseApi<{
        campaign_id: number;
        total_recipients: number;
        total_sent: number;
        total_failed: number;
        status: string;
      }>(res);
      await Promise.all([fetchOverview(), fetchCampaigns()]);
      setSelectedCampaignId(campaign.id);
      setTab("deliveries");
      await fetchDeliveries(campaign.id);
      setNotice(
        `Envio terminado. Total: ${payload.total_recipients}, enviados: ${payload.total_sent}, fallidos: ${payload.total_failed}.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar campana.");
    } finally {
      setBusyKey("");
    }
  };

  if (loadingBoot) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <section className="rounded-[1.75rem] border border-cyan-500/20 bg-slate-900/40 p-6 shadow-[0_0_40px_rgba(6,182,212,0.08)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-300">
              <FaUsers /> Sistema de newsletter
            </p>
            <h2 className="text-4xl font-black uppercase tracking-tight text-white">Suscriptores Admin</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              Gestion completa para captar, segmentar y enviar contenido a suscriptores como un flujo real de empresa.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => void processDueCampaigns()}
              disabled={busyKey === "refresh-all"}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-400/35 bg-cyan-500/15 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaPaperPlane />
              Procesar programadas
            </button>
            <button
              onClick={() => void refreshPanel()}
              disabled={busyKey === "refresh-all"}
              className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/95 px-7 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-slate-950 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaRedo className={busyKey === "refresh-all" ? "animate-spin" : ""} />
              Sincronizar datos
            </button>
          </div>
        </div>

        {overview && (
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
            <StatCard label="Total" value={overview.total_subscribers} tone="blue" />
            <StatCard label="Pendientes" value={overview.pending_subscribers} tone="amber" />
            <StatCard label="Activos" value={overview.active_subscribers} tone="emerald" />
            <StatCard label="Bajas" value={overview.unsubscribed_subscribers} tone="amber" />
            <StatCard label="Campanas" value={overview.total_campaigns} tone="indigo" />
            <StatCard label="Programadas" value={overview.scheduled_campaigns} tone="indigo" />
            <StatCard label="Envios OK" value={overview.sent_deliveries} tone="cyan" />
            <StatCard label="Fallidos" value={overview.failed_deliveries} tone="rose" />
          </div>
        )}
      </section>

      {(error || notice) && (
        <div className="space-y-2">
          {error ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}
          {notice ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {notice}
            </div>
          ) : null}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {[
          { id: "subscribers", label: "Suscriptores" },
          { id: "campaigns", label: "Campanas" },
          { id: "deliveries", label: "Historial de envios" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as "subscribers" | "campaigns" | "deliveries")}
            className={`rounded-full border px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] transition ${
              tab === item.id
                ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-200"
                : "border-white/15 bg-slate-900/40 text-slate-400 hover:border-cyan-500/30 hover:text-cyan-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "subscribers" ? (
        <section className="space-y-4 rounded-[1.5rem] border border-white/10 bg-slate-900/45 p-5">
          <p className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200">
            Suscriptores captados automaticamente desde formularios publicos. No hay alta manual en esta vista.
          </p>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
            <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-3">
              <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 md:col-span-2">
                Buscar
                <input
                  value={query}
                  onChange={(event) => {
                    setPage(1);
                    setQuery(event.target.value);
                  }}
                  placeholder="email o nombre"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-3 text-sm text-white outline-none focus:border-cyan-500/50"
                />
              </label>

              <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Estado
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setPage(1);
                    setStatusFilter(event.target.value as "all" | SubscriberStatus);
                  }}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-3 text-sm text-white outline-none focus:border-cyan-500/50"
                >
                  <option value="all">Todos</option>
                  <option value="pending">Pendientes</option>
                  <option value="active">Activos</option>
                  <option value="unsubscribed">Bajas</option>
                  <option value="bounced">Rebote</option>
                  <option value="blocked">Bloqueados</option>
                </select>
              </label>
            </div>

            <button
              onClick={() => void exportSubscribers()}
              disabled={busyKey === "subscriber-export"}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/90 px-4 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FaDownload />
              Exportar CSV
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-left">
              <thead className="bg-white/5">
                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Fuente</th>
                  <th className="px-4 py-3">Registro</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {subscribersPage.items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400">
                      No hay suscriptores con los filtros actuales.
                    </td>
                  </tr>
                ) : (
                  subscribersPage.items.map((subscriber) => (
                    <tr key={subscriber.id} className="text-sm text-slate-200">
                      <td className="px-4 py-4 align-top">
                        <div className="font-semibold text-white">{subscriber.email}</div>
                        <div className="text-xs text-slate-400">{subscriber.full_name || "Sin nombre"}</div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${badgeClass(subscriber.status)}`}
                        >
                          {statusLabel(subscriber.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top text-xs uppercase tracking-[0.14em] text-slate-400">
                        {subscriber.source}
                      </td>
                      <td className="px-4 py-4 align-top text-xs text-slate-400">{fmtDate(subscriber.subscribed_at)}</td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => void updateSubscriberStatus(subscriber, "active")}
                            disabled={busyKey === `subscriber-status-${subscriber.id}-active`}
                            className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300"
                          >
                            Activo
                          </button>
                          <button
                            onClick={() => void updateSubscriberStatus(subscriber, "unsubscribed")}
                            disabled={busyKey === `subscriber-status-${subscriber.id}-unsubscribed`}
                            className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300"
                          >
                            Baja
                          </button>
                          <button
                            onClick={() => void updateSubscriberStatus(subscriber, "blocked")}
                            disabled={busyKey === `subscriber-status-${subscriber.id}-blocked`}
                            className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-rose-300"
                          >
                            Bloquear
                          </button>
                          <button
                            onClick={() => void deleteSubscriber(subscriber)}
                            disabled={busyKey === `subscriber-delete-${subscriber.id}`}
                            className="rounded-md border border-white/20 bg-black/40 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300 hover:border-rose-500/50 hover:text-rose-300"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <p>
              Mostrando pagina {subscribersPage.page} de {totalPages} | Total: {subscribersPage.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={subscribersPage.page <= 1}
                className="rounded-md border border-white/20 px-3 py-1 font-bold uppercase tracking-[0.16em] text-slate-200 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={subscribersPage.page >= totalPages}
                className="rounded-md border border-white/20 px-3 py-1 font-bold uppercase tracking-[0.16em] text-slate-200 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {tab === "campaigns" ? (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr),420px]">
          <div className="space-y-4 rounded-[1.5rem] border border-amber-500/20 bg-slate-900/45 p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="inline-flex items-center rounded-md bg-amber-400 px-3 py-1 text-sm font-black uppercase tracking-[0.22em] text-black shadow-[0_0_20px_rgba(251,191,36,0.35)]">
                {campaignForm.id ? "Editar campana multicanal" : "Nueva campana multicanal"}
              </h3>
              {campaignForm.id ? (
                <button
                  onClick={() => {
                    setCampaignForm(EMPTY_CAMPAIGN_FORM);
                    setRecipientPreview(null);
                  }}
                  className="rounded-md border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300"
                >
                  Limpiar
                </button>
              ) : null}
            </div>

            <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200">
              Nombre interno
              <input
                value={campaignForm.name}
                onChange={(event) => setCampaignForm((prev) => ({ ...prev, name: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-3 text-sm text-white outline-none focus:border-amber-400/60"
                placeholder="Newsletter marzo B2B"
              />
            </label>

            <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200">
              Asunto
              <input
                value={campaignForm.subject}
                onChange={(event) => setCampaignForm((prev) => ({ ...prev, subject: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-3 text-sm text-white outline-none focus:border-amber-400/60"
                placeholder="Tendencias para tu empresa"
              />
            </label>

            <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200">
              Preview text
              <input
                value={campaignForm.preview_text}
                onChange={(event) => setCampaignForm((prev) => ({ ...prev, preview_text: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-3 text-sm text-white outline-none focus:border-amber-400/60"
                placeholder="Texto corto que aparece en la bandeja"
              />
            </label>

            <div
              className={`grid gap-3 ${
                campaignForm.target_mode === "tags" ? "grid-cols-2" : "grid-cols-1"
              }`}
            >
              <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200">
                Segmentacion
                <select
                  value={campaignForm.target_mode}
                  onChange={(event) => {
                    const nextMode = event.target.value as TargetMode;
                    setCampaignForm((prev) => ({
                      ...prev,
                      target_mode: nextMode,
                      target_tags: nextMode === "tags" ? prev.target_tags : "",
                    }));
                  }}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-3 text-sm text-white outline-none focus:border-amber-400/60"
                >
                  <option value="all">Todos los activos</option>
                  <option value="tags">Solo por tags</option>
                  <option value="selected">Solo seleccionados</option>
                </select>
              </label>

              {campaignForm.target_mode === "tags" ? (
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200">
                  Tags objetivo
                  <input
                    value={campaignForm.target_tags}
                    onChange={(event) =>
                      setCampaignForm((prev) => ({ ...prev, target_tags: event.target.value }))
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-3 text-sm text-white outline-none focus:border-amber-400/60"
                    placeholder="vip, b2b"
                  />
                </label>
              ) : null}
            </div>

            <div className="space-y-2 rounded-xl border border-amber-500/30 bg-black/30 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300">
                  Programar envio automatico
                </p>
                {scheduledHumanText ? (
                  <span className="rounded-md border border-amber-500/40 bg-amber-500/15 px-2 py-1 text-[10px] font-semibold text-amber-200">
                    {scheduledHumanText}
                  </span>
                ) : null}
              </div>

              <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200">
                Fecha y hora (calendario + reloj)
                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr),180px,140px]">
                  <div className="relative">
                    <FaCalendarAlt className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-amber-300/90" />
                    <input
                      ref={scheduleDateTimeRef}
                      type="datetime-local"
                      min={scheduleMinValue}
                      value={campaignForm.scheduled_for}
                      onChange={(event) =>
                        setCampaignForm((prev) => ({ ...prev, scheduled_for: event.target.value }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/50 py-3 pl-10 pr-3 text-sm text-white outline-none focus:border-amber-400/60"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      ref={scheduleDateRef}
                      type="date"
                      value={scheduledDatePart}
                      onChange={(event) => setScheduledDatePart(event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-3 text-sm text-white outline-none focus:border-amber-400/60"
                    />
                    <button
                      type="button"
                      onClick={() => openNativePicker(scheduleDateRef)}
                      className="shrink-0 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-200"
                    >
                      Calendario
                    </button>
                  </div>
                  <div className="relative">
                    <FaClock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-amber-300/90" />
                    <div className="flex items-center gap-2">
                      <input
                        ref={scheduleTimeRef}
                        type="time"
                        value={scheduledTimePart}
                        onChange={(event) => setScheduledTimePart(event.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/50 py-3 pl-10 pr-3 text-sm text-white outline-none focus:border-amber-400/60"
                      />
                      <button
                        type="button"
                        onClick={() => openNativePicker(scheduleTimeRef)}
                        className="shrink-0 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-200"
                      >
                        Reloj
                      </button>
                    </div>
                  </div>
                </div>
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => openNativePicker(scheduleDateTimeRef)}
                  className="rounded-md border border-amber-400/40 bg-amber-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-100"
                >
                  Abrir fecha + hora
                </button>
                <button
                  type="button"
                  onClick={() => scheduleWithOffsetMinutes(10)}
                  className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200"
                >
                  +10 min
                </button>
                <button
                  type="button"
                  onClick={() => scheduleWithOffsetMinutes(60)}
                  className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200"
                >
                  +1 hora
                </button>
                <button
                  type="button"
                  onClick={() => scheduleWithOffsetMinutes(24 * 60)}
                  className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200"
                >
                  +24 horas
                </button>
                <button
                  type="button"
                  onClick={clearScheduledDate}
                  className="rounded-md border border-white/20 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-200"
                >
                  Limpiar fecha
                </button>
              </div>

              <p className="text-[11px] normal-case tracking-normal text-slate-500">
                Si defines fecha/hora, la campaña queda en estado <strong className="text-slate-300">programada</strong>{" "}
                y se enviará automáticamente por el scheduler del backend.
              </p>
            </div>

            <div className="space-y-3 rounded-xl border border-white/10 bg-black/25 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300">
                  Catalogo visual por modulo
                </p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-cyan-300">
                  Seleccionados: <strong>{campaignForm.content_items.length}</strong>
                </p>
              </div>
              <p className="text-xs text-slate-400">
                Haz clic en una tarjeta para seleccionar/quitar. Tambien puedes usar los botones del pie.
              </p>

              <div className="space-y-3">
                {catalogGroups.map((group) => {
                  const totalGroupPages = Math.max(1, Math.ceil(group.items.length / CATALOG_PAGE_SIZE));
                  const currentGroupPage = Math.min(
                    Math.max(1, catalogPageByGroup[group.key] || 1),
                    totalGroupPages
                  );
                  const sliceStart = (currentGroupPage - 1) * CATALOG_PAGE_SIZE;
                  const visibleItems = group.items.slice(sliceStart, sliceStart + CATALOG_PAGE_SIZE);

                  return (
                    <div key={group.key} className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">{group.label}</p>
                        <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                          {group.items.length} disponibles
                        </span>
                      </div>

                      {group.items.length === 0 ? (
                        <p className="text-xs text-slate-500">Sin elementos en este modulo.</p>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 2xl:grid-cols-4">
                            {visibleItems.map((item, itemIndex) => {
                              const selected = isContentSelected(item.source_type, item.source_id);
                              return (
                                <article
                                  key={`${group.key}-${item.source_type}-${item.source_id}-${sliceStart + itemIndex}`}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => toggleContentItem(item)}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                      event.preventDefault();
                                      toggleContentItem(item);
                                    }
                                  }}
                                  className={`group flex h-[292px] cursor-pointer flex-col overflow-hidden rounded-2xl border text-left transition ${
                                    selected
                                      ? "border-cyan-400/60 bg-gradient-to-b from-cyan-500/15 to-slate-950/70 shadow-[0_0_28px_rgba(6,182,212,0.16)]"
                                      : "border-white/10 bg-gradient-to-b from-slate-900/60 to-slate-950/90 hover:border-cyan-500/35"
                                  }`}
                                >
                                  <div className="relative h-28 shrink-0 overflow-hidden border-b border-white/10">
                                    {item.image_url ? (
                                      <img
                                        src={item.image_url}
                                        alt={item.title}
                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                      />
                                    ) : (
                                      <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_55%),linear-gradient(120deg,rgba(15,23,42,1),rgba(8,47,73,0.55))]" />
                                    )}
                                    <span className="absolute left-2 top-2 rounded-full border border-white/20 bg-slate-950/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-200">
                                      {group.label}
                                    </span>
                                  </div>

                                  <div className="flex flex-1 flex-col p-3">
                                    <p className="h-[48px] overflow-hidden text-base font-bold leading-tight text-slate-100">
                                      {item.title}
                                    </p>
                                    <p className="mt-2 h-[50px] overflow-hidden text-sm leading-snug text-slate-300/90">
                                      {excerptText(item.summary || item.details, 135) || "Contenido listo para campaña."}
                                    </p>
                                    <div className="mt-auto border-t border-white/10 pt-3">
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            setDetailItem(item);
                                          }}
                                          className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-100"
                                        >
                                          Ver detalle
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            toggleContentItem(item);
                                          }}
                                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] transition ${
                                            selected
                                              ? "border-emerald-400/45 bg-emerald-500/15 text-emerald-200 hover:border-emerald-300/60"
                                              : "border-cyan-400/35 bg-cyan-500/10 text-cyan-200 hover:border-cyan-300/60"
                                          }`}
                                        >
                                          {selected ? "Quitar campaña" : "Agregar campaña"}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </article>
                              );
                            })}
                          </div>

                          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                            <div className="space-y-0.5">
                              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                                Página {currentGroupPage} de {totalGroupPages}
                              </p>
                              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                                Mostrando {sliceStart + 1}-{Math.min(sliceStart + visibleItems.length, group.items.length)} de{" "}
                                {group.items.length}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setCatalogPageByGroup((prev) => ({
                                    ...prev,
                                    [group.key]: Math.max(1, currentGroupPage - 1),
                                  }))
                                }
                                disabled={currentGroupPage <= 1}
                                className="rounded-md border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-200 disabled:cursor-not-allowed disabled:opacity-45"
                              >
                                Anterior
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setCatalogPageByGroup((prev) => ({
                                    ...prev,
                                    [group.key]: Math.min(totalGroupPages, currentGroupPage + 1),
                                  }))
                                }
                                disabled={currentGroupPage >= totalGroupPages}
                                className="rounded-md border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-200 disabled:cursor-not-allowed disabled:opacity-45"
                              >
                                Siguiente
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {campaignForm.content_items.length > 0 ? (
                <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-2">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-200">
                    Contenido de esta campana
                  </p>
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {campaignForm.content_items.map((item, selectedIndex) => (
                      <div
                        key={`selected-${item.source_type}-${item.source_id}-${selectedIndex}`}
                        className="flex items-center justify-between rounded-md border border-white/10 bg-black/30 px-2 py-1"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          {item.image_url ? (
                            <div
                              className="h-8 w-10 shrink-0 rounded border border-white/10 bg-cover bg-center"
                              style={{ backgroundImage: `url(${item.image_url})` }}
                            />
                          ) : null}
                          <p className="truncate text-xs text-slate-100">{item.title}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailItem(item)}
                            className="text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-300"
                          >
                            Detalle
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleContentItem(item)}
                            className="text-[10px] font-bold uppercase tracking-[0.12em] text-rose-300"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setShowAdvancedHtml((prev) => !prev)}
              className="rounded-lg border border-white/20 px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300"
            >
              {showAdvancedHtml ? "Ocultar editor HTML" : "Mostrar editor HTML avanzado"}
            </button>

            {showAdvancedHtml ? (
              <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                HTML avanzado
                <textarea
                  value={campaignForm.content_html}
                  onChange={(event) => setCampaignForm((prev) => ({ ...prev, content_html: event.target.value }))}
                  className="mt-2 h-52 w-full resize-y rounded-xl border border-white/10 bg-black/50 px-3 py-3 text-sm text-white outline-none focus:border-cyan-500/50"
                />
              </label>
            ) : null}

            <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Texto plano (opcional)
              <textarea
                value={campaignForm.content_text}
                onChange={(event) => setCampaignForm((prev) => ({ ...prev, content_text: event.target.value }))}
                className="mt-2 h-28 w-full resize-y rounded-xl border border-white/10 bg-black/50 px-3 py-3 text-sm text-white outline-none focus:border-cyan-500/50"
                placeholder="Version texto para clientes de correo simples."
              />
            </label>

            <div className="space-y-2 rounded-xl border border-white/10 bg-black/25 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300">
                  Seleccion de suscriptores
                </p>
                <button
                  type="button"
                  onClick={() => void previewRecipients()}
                  className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-200"
                >
                  Previsualizar
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllActiveSubscribers}
                  className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200"
                >
                  <FaUsers />
                  Todos los activos
                </button>
                <button
                  type="button"
                  onClick={includeVisibleSubscribers}
                  className="inline-flex items-center gap-1 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-200"
                >
                  <FaUserCheck />
                  Incluir visibles
                </button>
                <button
                  type="button"
                  onClick={excludeVisibleSubscribers}
                  className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-200"
                >
                  <FaUserSlash />
                  Excluir visibles
                </button>
                <button
                  type="button"
                  onClick={clearRecipientRules}
                  className="inline-flex items-center gap-1 rounded-md border border-white/20 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-200"
                >
                  <FaFilter />
                  Limpiar reglas
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                Modo actual: <strong className="text-slate-200">{targetModeLabel(campaignForm.target_mode)}</strong> | Activos
                cargados: <strong className="text-slate-200">{subscriberOptions.length}</strong> | Visibles por filtro:{" "}
                <strong className="text-slate-200">{filteredSubscriberIds.length}</strong>
              </p>

              <input
                value={recipientSearch}
                onChange={(event) => setRecipientSearch(event.target.value)}
                placeholder="Buscar suscriptor..."
                className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
              />

              <div className="max-h-52 space-y-1 overflow-auto rounded-lg border border-white/10 bg-slate-950/40 p-2">
                {filteredSubscriberOptions.slice(0, 200).map((subscriber) => {
                  const isIncluded = campaignForm.include_subscriber_ids.includes(subscriber.id);
                  const isExcluded = campaignForm.exclude_subscriber_ids.includes(subscriber.id);
                  return (
                    <div key={subscriber.id} className="flex items-center justify-between gap-2 rounded-md px-2 py-1 hover:bg-white/5">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-100">{subscriber.email}</p>
                        <p className="truncate text-[11px] text-slate-400">{subscriber.full_name || subscriber.source}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-emerald-300">
                          <input
                            type="checkbox"
                            checked={isIncluded}
                            onChange={() => toggleIncludeSubscriber(subscriber.id)}
                            className="h-3.5 w-3.5 rounded border-white/20 bg-black/50"
                          />
                          Incluir
                        </label>
                        <label className="flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-rose-300">
                          <input
                            type="checkbox"
                            checked={isExcluded}
                            onChange={() => toggleExcludeSubscriber(subscriber.id)}
                            className="h-3.5 w-3.5 rounded border-white/20 bg-black/50"
                          />
                          Excluir
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-slate-300">
                Incluir: <strong>{campaignForm.include_subscriber_ids.length}</strong> | Excluir:{" "}
                <strong>{campaignForm.exclude_subscriber_ids.length}</strong>
              </p>
              {recipientPreview ? (
                <p className="text-xs text-cyan-300">
                  Destinatarios estimados: <strong>{recipientPreview.total}</strong>
                </p>
              ) : null}
            </div>

            <div className="rounded-xl border border-white/10 bg-black/25 p-3">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300">
                Vista previa del correo
              </p>
              <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Asunto</p>
                <p className="text-sm font-semibold text-white">{campaignForm.subject || "Sin asunto"}</p>
                <div className="mt-3">
                  {campaignForm.content_items.length === 0 ? (
                    <p className="text-xs text-slate-500">No has seleccionado contenido.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {campaignForm.content_items.map((item, previewIndex) => (
                        <article
                          key={`preview-${item.source_type}-${item.source_id}-${previewIndex}`}
                          className="overflow-hidden rounded-md border border-white/10 bg-black/30"
                        >
                          {item.image_url ? (
                            <div
                              className="h-20 w-full border-b border-white/10 bg-cover bg-center"
                              style={{ backgroundImage: `url(${item.image_url})` }}
                            />
                          ) : null}
                          <div className="space-y-2 p-2">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                {sourceTypeLabel(item.source_type)}
                              </p>
                              <button
                                type="button"
                                onClick={() => setDetailItem(item)}
                                className="text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-300"
                              >
                                Ver detalle
                              </button>
                            </div>
                            <p className="truncate text-xs font-semibold text-slate-100">{item.title}</p>
                            <p className="line-clamp-2 text-[11px] text-slate-400">
                              {excerptText(item.summary || item.details, 150) || "Sin resumen"}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => void saveCampaign()}
              disabled={busyKey.startsWith("campaign-save-") || busyKey === "campaign-create"}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FaSave />
              {campaignForm.id
                ? hasScheduledDate
                  ? "Guardar programación"
                  : "Guardar cambios"
                : hasScheduledDate
                  ? "Programar campaña"
                  : "Crear y enviar ahora"}
            </button>
          </div>

          <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-slate-900/45 p-5">
            {campaigns.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-black/30 p-8 text-center text-sm text-slate-400">
                No hay campanas todavia.
              </div>
            ) : (
              campaigns.map((campaign) => (
                <article
                  key={campaign.id}
                  className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-slate-200"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-black uppercase tracking-[0.08em] text-white">
                          {campaign.name}
                        </h4>
                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${badgeClass(campaign.status)}`}
                        >
                          {statusLabel(campaign.status)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">{campaign.subject}</p>
                      <div className="text-xs text-slate-400">
                        Segmentacion:{" "}
                        <span className="font-semibold text-slate-200">
                          {campaign.target_mode === "all"
                            ? "Todos"
                            : campaign.target_mode === "selected"
                              ? "Seleccion manual"
                              : campaign.target_tags.length > 0
                                ? campaign.target_tags.join(", ")
                                : "Sin tags"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                        <span>Contenido: {campaign.content_items.length}</span>
                        <span>Estimado: {campaign.estimated_recipients}</span>
                        <span>Total: {campaign.total_recipients}</span>
                        <span>OK: {campaign.total_sent}</span>
                        <span>Fallidos: {campaign.total_failed}</span>
                        <span>Programada: {fmtDate(campaign.scheduled_for)}</span>
                        <span>Actualizado: {fmtDate(campaign.updated_at)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => editCampaign(campaign)}
                        className="rounded-md border border-white/20 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-200"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCampaignId(campaign.id);
                          setTab("deliveries");
                        }}
                        className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200"
                      >
                        Ver envios
                      </button>
                      <button
                        onClick={() => void sendTestCampaign(campaign)}
                        disabled={busyKey === `campaign-test-${campaign.id}`}
                        className="inline-flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200"
                      >
                        <FaEnvelopeOpenText />
                        Test
                      </button>
                      <button
                        onClick={() => void sendCampaignNow(campaign)}
                        disabled={busyKey === `campaign-send-${campaign.id}`}
                        className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200"
                      >
                        <FaPaperPlane />
                        Enviar
                      </button>
                      <button
                        onClick={() => void deleteCampaign(campaign)}
                        disabled={busyKey === `campaign-delete-${campaign.id}`}
                        className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-200"
                      >
                        <FaTrash />
                        Borrar
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      ) : null}

      {tab === "deliveries" ? (
        <section className="space-y-4 rounded-[1.5rem] border border-white/10 bg-slate-900/45 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid w-full max-w-xl grid-cols-1 gap-3 md:grid-cols-[1fr,auto]">
              <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Campana
                <select
                  value={selectedCampaignId ?? ""}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    setSelectedCampaignId(Number.isNaN(value) ? null : value);
                  }}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-3 text-sm text-white outline-none focus:border-cyan-500/50"
                >
                  {campaigns.length === 0 ? <option value="">Sin campanas</option> : null}
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name} ({statusLabel(campaign.status)})
                    </option>
                  ))}
                </select>
              </label>
              <button
                onClick={() => {
                  if (selectedCampaignId) {
                    void fetchDeliveries(selectedCampaignId);
                  }
                }}
                disabled={!selectedCampaignId}
                className="inline-flex h-[46px] items-center justify-center gap-2 self-end rounded-xl border border-white/20 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaRedo />
                Recargar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-left">
              <thead className="bg-white/5">
                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Enviado</th>
                  <th className="px-4 py-3">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {deliveries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-sm text-slate-400">
                      No hay historial para esta campana.
                    </td>
                  </tr>
                ) : (
                  deliveries.map((delivery) => (
                    <tr key={delivery.id} className="text-sm text-slate-200">
                      <td className="px-4 py-4">{delivery.email}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${badgeClass(delivery.status)}`}
                        >
                          {statusLabel(delivery.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-400">{fmtDate(delivery.sent_at)}</td>
                      <td className="px-4 py-4 text-xs text-rose-300">
                        {delivery.error_message || <span className="text-slate-500">-</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {detailItem ? (
        <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:items-center">
          <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-950 shadow-[0_22px_80px_rgba(0,0,0,0.6)] sm:max-h-[92vh]">
            <div className="shrink-0 flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-300">
                  {sourceTypeLabel(detailItem.source_type)}
                </p>
                <p className="text-base font-black text-white">{detailItem.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="rounded-lg border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-200"
              >
                Cerrar
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {detailItem.image_url ? (
                <div
                  className="h-40 w-full rounded-xl border border-white/10 bg-cover bg-center md:h-52"
                  style={{ backgroundImage: `url(${detailItem.image_url})` }}
                />
              ) : null}

              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Resumen</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-200">
                  {excerptText(detailItem.summary || detailItem.details, 280) ||
                    "Sin resumen disponible para este contenido."}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Contenido completo
                </p>
                <div className="mt-2 max-h-[32vh] overflow-auto rounded-lg border border-white/10 bg-slate-950/40 p-3 md:max-h-[44vh]">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-slate-200">
                    {detailItem.details || detailItem.summary || "Sin contenido detallado para este elemento."}
                  </p>
                </div>
              </div>

              <div className="sticky bottom-0 z-[1] -mx-1 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-slate-950/95 px-2 py-2 backdrop-blur">
                {detailItem.url ? (
                  <button
                    type="button"
                    onClick={() => window.open(detailItem.url || "", "_blank")}
                    className="rounded-lg border border-cyan-400/35 bg-cyan-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-200"
                  >
                    Abrir contenido
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => toggleContentItem(detailItem)}
                  className={`rounded-lg border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] ${
                    isContentSelected(detailItem.source_type, detailItem.source_id)
                      ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                      : "border-white/20 bg-white/5 text-slate-100"
                  }`}
                >
                  {isContentSelected(detailItem.source_type, detailItem.source_id)
                    ? "Quitar de campaña"
                    : "Agregar a campaña"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "blue" | "emerald" | "amber" | "indigo" | "cyan" | "rose";
}) {
  const toneClass: Record<typeof tone, string> = {
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-200",
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    indigo: "border-indigo-500/30 bg-indigo-500/10 text-indigo-200",
    cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
    rose: "border-rose-500/30 bg-rose-500/10 text-rose-200",
  };

  return (
    <article className={`rounded-xl border p-3 ${toneClass[tone]}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </article>
  );
}


