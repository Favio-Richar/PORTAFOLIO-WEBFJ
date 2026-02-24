"use client";

import { useEffect, useState } from "react";
import "@/styles/admin-dashboard.scss";

import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import AdminHeader from "@/components/admin/layout/AdminHeader";
import DashboardHome from "@/components/admin/dashboard/DashboardHome";

import AboutAdmin from "@/components/admin/AboutAdmin";
import ContactAdmin from "@/components/admin/ContactAdmin";
import ProjectsAdmin from "@/components/admin/ProjectsAdmin";
import AdsAdmin from "@/components/admin/AdsAdmin";
import MediaAdmin from "@/components/admin/MediaAdmin";
import ClientsAdmin from "@/components/admin/ClientsAdmin";
import TestimonialsAdmin from "@/components/admin/TestimonialsAdmin";
import BlogAdmin from "@/components/admin/BlogAdmin";
import ServicesAdmin from "@/components/admin/ServicesAdmin";
import AdvisoriesAdmin from "@/components/admin/AdvisoriesAdmin";
import TeamAdmin from "@/components/admin/TeamAdmin";

import { initialCertifications, Certification } from "@/lib/data/certifications";
import { defaultContact, ContactData } from "@/lib/data/contact";

type RawCertification = {
  id: number | string;
  title: string;
  issuer: string;
  date: string;
  description?: string;
  icon?: string;
  level?: string;
  color?: string;
  badge?: string;
  credential_url?: string;
};

export default function AdminPanel() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");

  const [certifications, setCertifications] = useState<Certification[]>(initialCertifications);
  const [contact, setContact] = useState<ContactData>(defaultContact);

  useEffect(() => {
    const loadData = async () => {
      try {
        const certRes = await fetch("http://localhost:8000/api/certifications");
        if (certRes.ok) {
          const certData = (await certRes.json()) as RawCertification[];
          if (Array.isArray(certData) && certData.length > 0) {
            setCertifications(
              certData.map((c) => ({
                id: c.id.toString(),
                title: c.title,
                issuer: c.issuer,
                date: c.date,
                description: c.description,
                icon: c.icon,
                level: c.level,
                color: c.color,
                badge: c.badge,
                credentialUrl: c.credential_url,
              }))
            );
          }
        }

        const contactRes = await fetch("http://localhost:8000/api/contact");
        if (contactRes.ok) setContact(await contactRes.json());
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    loadData();
  }, []);

  const saveCertifications = (data: Certification[]) => setCertifications(data);
  const saveContact = (data: ContactData) => setContact(data);

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardHome />;
      case "about":
      case "profile":
        return (
          <AboutAdmin
            certifications={certifications}
            onSaveCertifications={saveCertifications}
          />
        );
      case "projects":
        return <ProjectsAdmin />;
      case "services":
        return <ServicesAdmin />;
      case "advisories":
        return <AdvisoriesAdmin />;
      case "blog":
        return <BlogAdmin />;
      case "clients":
        return <ClientsAdmin />;
      case "contact":
        return <ContactAdmin contact={contact} onSave={saveContact} />;
      case "media":
        return <MediaAdmin />;
      case "ads":
        return <AdsAdmin />;
      case "testimonials":
        return <TestimonialsAdmin />;
      default:
        return <PlaceholderSection name={activeSection} />;
    }
  };

  return (
    <div className="admin-dashboard-wrapper">
      <AdminSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isCollapsed={isSidebarCollapsed}
      />

      <div
        className="admin-main transition-all duration-300"
        style={{ marginLeft: isSidebarCollapsed ? "0" : "280px" }}
      >
        <AdminHeader
          toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          activeSection={activeSection}
        />

        <div className="admin-content">{renderContent()}</div>
      </div>
    </div>
  );
}

function PlaceholderSection({ name }: { name: string }) {
  return (
    <div className="text-center py-20 fade-in-up">
      <div className="bg-slate-800/50 p-16 border border-white/10 rounded-[2rem] inline-block">
        <h3 className="text-4xl font-black text-white uppercase mb-4">{name}</h3>
        <p className="text-gray-400 text-lg">
          Modulo en construccion. Proximamente disponible.
        </p>
      </div>
    </div>
  );
}
