"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { FaCloudUploadAlt, FaImage, FaPlayCircle, FaSave, FaVideo } from "react-icons/fa";

type HeroMediaType = "image" | "video";

interface BlogHeroConfigData {
  badge_text: string;
  headline_prefix: string;
  headline_highlight: string;
  headline_suffix: string;
  description: string;
  cta_text: string;
  cta_url: string;
  read_time_text: string;
  media_type: HeroMediaType;
  background_image_url: string;
  background_video_url: string;
  card_kicker: string;
  card_title: string;
  card_description: string;
  card_tags: string;
}

interface UploadResponse {
  url?: string;
}

type HeroMediaDraft = Pick<
  BlogHeroConfigData,
  "media_type" | "background_image_url" | "background_video_url" | "card_kicker" | "card_title" | "card_description" | "card_tags"
>;

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const DEFAULT_HERO_CONFIG: BlogHeroConfigData = {
  badge_text: "Articulo destacado",
  headline_prefix: "El Futuro del",
  headline_highlight: "Software Engineering",
  headline_suffix: "en la era de la IA",
  description:
    "Analisis profundo sobre como los modelos fundacionales estan redefiniendo el ciclo de vida de desarrollo.",
  cta_text: "Leer Ahora",
  cta_url: "/blog",
  read_time_text: "15 min de lectura",
  media_type: "video",
  background_image_url: "",
  background_video_url: "",
  card_kicker: "Radar Tecnologico 2026",
  card_title: "3 tendencias que estan cambiando el desarrollo",
  card_description: "IA agentes, cloud eficiente y seguridad zero trust para productos reales.",
  card_tags: '["LLM Ops","Cloud Native","Zero Trust"]',
};

const FIXED_PREVIEW = {
  badge: "ARTICULO DESTACADO",
  headingPrefix: "El Futuro del",
  headingHighlight: "Software Engineering",
  headingSuffix: "en la era de la IA",
  description: "Analisis profundo sobre como los modelos fundacionales estan redefiniendo el ciclo de vida de desarrollo.",
  cta: "Leer Ahora",
  readTime: "15 min de lectura",
};

const normalizeConfig = (payload: Partial<BlogHeroConfigData> | null | undefined): BlogHeroConfigData => {
  const data = payload || {};
  return {
    ...DEFAULT_HERO_CONFIG,
    ...data,
    media_type: data.media_type === "image" ? "image" : "video",
    background_image_url: data.background_image_url || "",
    background_video_url: data.background_video_url || "",
  };
};

const draftFromConfig = (config: BlogHeroConfigData): HeroMediaDraft => ({
  media_type: config.media_type === "image" ? "image" : "video",
  background_image_url: config.background_image_url || "",
  background_video_url: config.background_video_url || "",
  card_kicker: config.card_kicker || DEFAULT_HERO_CONFIG.card_kicker,
  card_title: config.card_title || DEFAULT_HERO_CONFIG.card_title,
  card_description: config.card_description || DEFAULT_HERO_CONFIG.card_description,
  card_tags: config.card_tags || DEFAULT_HERO_CONFIG.card_tags,
});

const parseTags = (raw: string): string[] => {
  const value = raw.trim();
  if (!value) return [];
  if (value.startsWith("[")) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      return [];
    }
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export default function BlogAdmin() {
  const [config, setConfig] = useState<BlogHeroConfigData>(DEFAULT_HERO_CONFIG);
  const [draft, setDraft] = useState<HeroMediaDraft>(draftFromConfig(DEFAULT_HERO_CONFIG));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<"" | "background_image_url" | "background_video_url">("");

  const showVideoPreview = useMemo(
    () => draft.media_type === "video" && draft.background_video_url.trim().length > 0,
    [draft.media_type, draft.background_video_url]
  );

  const showImagePreview = useMemo(
    () =>
      (draft.media_type === "image" && draft.background_image_url.trim().length > 0) ||
      (!showVideoPreview && draft.background_image_url.trim().length > 0),
    [draft.media_type, draft.background_image_url, showVideoPreview]
  );
  const previewTags = useMemo(() => {
    const tags = parseTags(draft.card_tags);
    return tags.length > 0 ? tags : ["LLM OPS", "CLOUD NATIVE", "ZERO TRUST"];
  }, [draft.card_tags]);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/blog/hero`);
      if (!response.ok) throw new Error("No se pudo cargar configuracion");
      const data = await response.json();
      const normalized = normalizeConfig(data);
      setConfig(normalized);
      setDraft(draftFromConfig(normalized));
    } catch (error) {
      console.error(error);
      const normalized = normalizeConfig(DEFAULT_HERO_CONFIG);
      setConfig(normalized);
      setDraft(draftFromConfig(normalized));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadConfig();
  }, []);

  const updateDraft = <K extends keyof HeroMediaDraft>(field: K, value: HeroMediaDraft[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    targetField: "background_image_url" | "background_video_url"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(targetField);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${BACKEND_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("No se pudo subir el archivo");
      const data = (await response.json()) as UploadResponse;
      if (!data.url) throw new Error("No se recibio URL de archivo");

      setDraft((prev) => ({
        ...prev,
        [targetField]: data.url as string,
        media_type: targetField === "background_video_url" ? "video" : prev.media_type,
      }));
    } catch (error) {
      console.error(error);
      alert("Error al subir archivo");
    } finally {
      setUploadingField("");
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: BlogHeroConfigData = {
        ...config,
        ...draft,
      };

      const response = await fetch(`${BACKEND_URL}/api/blog/hero`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("No se pudo guardar");
      const data = await response.json();
      const normalized = normalizeConfig(data);
      setConfig(normalized);
      setDraft(draftFromConfig(normalized));
      alert("Configuracion del hero actualizada");
    } catch (error) {
      console.error(error);
      alert("Error guardando configuracion del hero");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="border border-white/10 bg-slate-900/60 p-8 rounded-3xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-300/80 font-bold mb-2">Blog Hero Admin</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">Fondo y tarjeta anuncio</h2>
            <p className="text-slate-400 mt-2">
              Aqui administras foto/video del bloque y el contenido de la tarjeta anuncio que aparece sobre la imagen.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              type="button"
              disabled={isSaving || isLoading}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <FaSave /> {isSaving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-8 text-slate-300">Cargando configuracion...</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-6 space-y-4">
                <h3 className="text-white text-lg font-semibold">Pasarela de fondo</h3>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateDraft("media_type", "image")}
                    className={`py-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                      draft.media_type === "image"
                        ? "bg-blue-500/20 border-blue-400 text-blue-100"
                        : "bg-white/[0.03] border-white/10 text-slate-300"
                    }`}
                  >
                    <FaImage /> Imagen
                  </button>
                  <button
                    type="button"
                    onClick={() => updateDraft("media_type", "video")}
                    className={`py-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                      draft.media_type === "video"
                        ? "bg-blue-500/20 border-blue-400 text-blue-100"
                        : "bg-white/[0.03] border-white/10 text-slate-300"
                    }`}
                  >
                    <FaVideo /> Video
                  </button>
                </div>

                <TextInput
                  label="URL imagen de fondo"
                  value={draft.background_image_url}
                  onChange={(value) => updateDraft("background_image_url", value)}
                />
                <UploadControl
                  label="Subir imagen"
                  accept="image/*"
                  isUploading={uploadingField === "background_image_url"}
                  onChange={(e) => handleUpload(e, "background_image_url")}
                />

                <TextInput
                  label="URL video de fondo"
                  value={draft.background_video_url}
                  onChange={(value) => updateDraft("background_video_url", value)}
                />
                <UploadControl
                  label="Subir video"
                  accept="video/*"
                  isUploading={uploadingField === "background_video_url"}
                  onChange={(e) => handleUpload(e, "background_video_url")}
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-6 space-y-4">
                <h3 className="text-white text-lg font-semibold">Tarjeta anuncio</h3>
                <TextInput
                  label="Etiqueta superior"
                  value={draft.card_kicker}
                  onChange={(value) => updateDraft("card_kicker", value)}
                />
                <TextInput
                  label="Titulo de la tarjeta"
                  value={draft.card_title}
                  onChange={(value) => updateDraft("card_title", value)}
                />
                <TextAreaInput
                  label="Descripcion"
                  value={draft.card_description}
                  onChange={(value) => updateDraft("card_description", value)}
                />
                <TextInput
                  label='Tags (usa coma o JSON: ["LLM OPS","CLOUD NATIVE"])'
                  value={draft.card_tags}
                  onChange={(value) => updateDraft("card_tags", value)}
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-6 space-y-4">
                <h3 className="text-white text-lg font-semibold">Media cargada</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <MediaSnapshot label="Imagen actual" type="image" url={draft.background_image_url} />
                  <MediaSnapshot label="Video actual" type="video" url={draft.background_video_url} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 lg:p-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-4">Vista previa</p>

              <div className="relative rounded-[2rem] overflow-hidden border border-white/10 min-h-[520px]">
                {showVideoPreview ? (
                  <video
                    src={draft.background_video_url}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : showImagePreview ? (
                  <Image src={draft.background_image_url} alt="Blog hero preview" fill unoptimized className="object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.25),transparent_40%),linear-gradient(130deg,#0b1220_0%,#0f172a_45%,#1e1b4b_100%)]" />
                )}

                <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-indigo-950/70" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(96,165,250,0.2),transparent_45%)]" />

                <div className="relative z-10 p-6 md:p-8 flex flex-col h-full">
                  <span className="inline-flex self-start px-4 py-1 rounded-full bg-blue-500/25 border border-blue-300/40 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                    {FIXED_PREVIEW.badge}
                  </span>

                  <h3 className="mt-6 text-3xl md:text-4xl font-black leading-tight text-white max-w-lg">
                    {FIXED_PREVIEW.headingPrefix}{" "}
                    <span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">
                      {FIXED_PREVIEW.headingHighlight}
                    </span>{" "}
                    {FIXED_PREVIEW.headingSuffix}
                  </h3>

                  <p className="mt-4 text-slate-200/90 max-w-xl">{FIXED_PREVIEW.description}</p>

                  <div className="mt-6 flex items-center gap-4">
                    <button className="px-6 py-3 bg-blue-600 rounded-xl text-white font-semibold">
                      {FIXED_PREVIEW.cta}
                    </button>
                    <span className="text-sm text-slate-300">{FIXED_PREVIEW.readTime}</span>
                  </div>

                  <div className="mt-auto ml-auto w-full max-w-sm rounded-2xl border border-white/20 bg-slate-900/55 backdrop-blur-md p-5 shadow-2xl">
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-200 font-bold">
                      {(draft.card_kicker || DEFAULT_HERO_CONFIG.card_kicker).toUpperCase()}
                    </p>
                    <h4 className="mt-2 text-white text-xl font-bold leading-tight">
                      {draft.card_title || DEFAULT_HERO_CONFIG.card_title}
                    </h4>
                    <p className="mt-2 text-slate-300 text-sm">
                      {draft.card_description || DEFAULT_HERO_CONFIG.card_description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {previewTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] px-3 py-1 rounded-full border border-cyan-300/40 bg-cyan-400/10 text-cyan-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 text-[10px] text-slate-400 bg-black/40 px-3 py-1 rounded-full border border-white/10">
                  Modo fondo: {draft.media_type}
                </div>

                {showVideoPreview && (
                  <div className="absolute top-3 right-3 text-[10px] text-cyan-100 bg-cyan-500/30 px-3 py-1 rounded-full border border-cyan-300/40 flex items-center gap-1">
                    <FaPlayCircle /> Video activo
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.15em] text-slate-400 font-semibold">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-400 transition-all"
      />
    </label>
  );
}

function TextAreaInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.15em] text-slate-400 font-semibold">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-400 transition-all resize-none"
      />
    </label>
  );
}

function UploadControl({
  label,
  accept,
  isUploading,
  onChange,
}: {
  label: string;
  accept: string;
  isUploading: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block">
      <input type="file" accept={accept} onChange={onChange} className="hidden" />
      <span className="w-full px-4 py-3 rounded-xl border border-dashed border-blue-300/40 bg-blue-500/5 text-blue-100 hover:bg-blue-500/10 transition-all inline-flex items-center justify-center gap-2 cursor-pointer">
        <FaCloudUploadAlt />
        {isUploading ? "Subiendo..." : label}
      </span>
    </label>
  );
}

function MediaSnapshot({
  label,
  type,
  url,
}: {
  label: string;
  type: "image" | "video";
  url: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-400 font-semibold mb-2">{label}</p>
      <div className="relative rounded-lg overflow-hidden bg-slate-950 border border-white/10 aspect-video">
        {!url ? (
          <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">Sin archivo</div>
        ) : type === "video" ? (
          <video src={url} className="w-full h-full object-cover" controls muted />
        ) : (
          <Image src={url} alt={label} fill unoptimized className="object-cover" />
        )}
      </div>
    </div>
  );
}
