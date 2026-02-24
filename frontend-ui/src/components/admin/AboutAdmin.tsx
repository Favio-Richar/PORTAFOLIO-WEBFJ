"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaCertificate, FaLayerGroup, FaUsers } from "react-icons/fa";

import AboutStackAdmin from "./AboutStackAdmin";
import CertificationsAdmin from "./CertificationsAdmin";
import TeamAdmin from "./TeamAdmin";
import type { Certification } from "@/lib/data/certifications";

interface AboutAdminProps {
  certifications: Certification[];
  onSaveCertifications: (data: Certification[]) => void;
}

type AboutTab = "stack" | "certifications" | "team";

export default function AboutAdmin({
  certifications,
  onSaveCertifications,
}: AboutAdminProps) {
  const [activeTab, setActiveTab] = useState<AboutTab>("certifications");

  const tabs: Array<{ id: AboutTab; label: string; icon: ReactNode }> = [
    { id: "stack", label: "Stack", icon: <FaLayerGroup /> },
    { id: "certifications", label: "Certificaciones", icon: <FaCertificate /> },
    { id: "team", label: "Equipo", icon: <FaUsers /> },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/50 border border-white/5 rounded-2xl w-full lg:w-fit backdrop-blur-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[500px] admin-panel-container">
        <AnimatePresence mode="wait">
          {activeTab === "stack" && (
            <motion.div
              key="about-stack"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AboutStackAdmin />
            </motion.div>
          )}

          {activeTab === "certifications" && (
            <motion.div
              key="about-certifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CertificationsAdmin
                certifications={certifications}
                onSave={onSaveCertifications}
              />
            </motion.div>
          )}
          {activeTab === "team" && (
            <motion.div
              key="about-team"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <TeamAdmin />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
