"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import "@/styles/admin-dashboard.scss";
import { adminFetch } from "@/lib/adminFetch";
import QuoteOperationalTrackingPanel from "@/components/admin/QuoteOperationalTrackingPanel";

type ProposalLite = {
  id: number;
  quote_number: string;
  status: string;
  public_token?: string | null;
};

export default function AdminQuoteSeguimientoPage() {
  const params = useParams();
  const rawId = params?.id;
  const id = typeof rawId === "string" ? parseInt(rawId, 10) : NaN;
  const [proposal, setProposal] = useState<ProposalLite | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await adminFetch(`/api/proposals/${id}`);
        if (!res.ok) {
          setError("No se pudo cargar la cotización.");
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        const p = data.proposal ?? data;
        if (!p?.id) {
          setError("Respuesta del servidor sin datos de cotización.");
          return;
        }
        setProposal({
          id: p.id,
          quote_number: p.quote_number ?? `#${p.id}`,
          status: p.status ?? "Pending",
          public_token: p.public_token,
        });
      } catch {
        if (!cancelled) setError("Error de red al cargar la cotización.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!Number.isFinite(id)) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-10">
        <p className="text-slate-600">Ruta inválida.</p>
        <Link href="/admin?section=quotes" className="text-blue-600 text-sm font-bold mt-4 inline-block">
          Volver a cotizaciones
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/admin?section=quotes"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-bold"
          >
            <FaArrowLeft /> Volver a cotizaciones
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Seguimiento operativo</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestiona aquí el historial y las fases del proyecto. El cliente tiene su propia vista pública con el
            enlace de seguimiento (token).
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {proposal && !error && (
          <QuoteOperationalTrackingPanel
            key={proposal.id}
            proposalId={proposal.id}
            quoteNumber={proposal.quote_number}
            publicToken={proposal.public_token}
            status={proposal.status}
          />
        )}
      </div>
    </div>
  );
}
