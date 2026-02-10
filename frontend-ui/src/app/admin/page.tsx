"use client";

import { useState, useEffect } from "react";
import "@/styles/admin-dashboard.scss"; // Midnight Elite Theme

// Layout Components
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import AdminHeader from "@/components/admin/layout/AdminHeader";
import DashboardHome from "@/components/admin/dashboard/DashboardHome";

// Content Components
import ProfileAdmin from "@/components/admin/ProfileAdmin";
import ExperienceAdmin from "@/components/admin/ExperienceAdmin";
import CertificationsAdmin from "@/components/admin/CertificationsAdmin";
import ContactAdmin from "@/components/admin/ContactAdmin";
import TimelineAdmin from "@/components/admin/TimelineAdmin";
import EducationAdmin from "@/components/admin/EducationAdmin";
import ProjectsAdmin, { Project } from "@/components/admin/ProjectsAdmin";
import AdsAdmin from "@/components/admin/AdsAdmin";

// Data types (keep imports for type safety)
import { defaultProfile, ProfileData } from "@/lib/data/profile";
import { initialExperiences, Experience } from "@/lib/data/experience";
import { initialCertifications, Certification } from "@/lib/data/certifications";
import { defaultContact, ContactData } from "@/lib/data/contact";
import { initialTimeline, TimelineItem } from "@/lib/data/timeline";
import { initialEducation, Education } from "@/lib/data/education";

export default function AdminPanel() {
  // --- STATE ---
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");

  // Data State
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
  const [certifications, setCertifications] = useState<Certification[]>(initialCertifications);
  const [contact, setContact] = useState<ContactData>(defaultContact);
  const [timeline, setTimeline] = useState<TimelineItem[]>(initialTimeline);
  const [education, setEducation] = useState<Education[]>(initialEducation);
  const [projects, setProjects] = useState<Project[]>([]);

  // --- DATA FETCHING ---
  useEffect(() => {
    const loadData = async () => {
      try {
        // Profile
        const profileRes = await fetch("http://localhost:8000/api/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile({
            fullName: profileData.full_name,
            title: profileData.title,
            profileImage: profileData.profile_image || "",
            profileVideo: profileData.profile_video || ""
          });
        }

        // Experiences
        const expRes = await fetch("http://localhost:8000/api/experiences");
        if (expRes.ok) {
          const expData = await expRes.json();
          setExperiences(expData.map((e: any) => ({
            ...e,
            id: e.id.toString(),
            employmentType: e.employment_type,
            technologies: typeof e.technologies === 'string' ? JSON.parse(e.technologies) : e.technologies
          })));
        }

        // Certifications
        const certRes = await fetch("http://localhost:8000/api/certifications");
        if (certRes.ok) {
          const certData = await certRes.json();
          setCertifications(certData.map((c: any) => ({
            ...c,
            id: c.id.toString(),
            credentialUrl: c.credential_url,
          })));
        }

        // Contact
        const contactRes = await fetch("http://localhost:8000/api/contact");
        if (contactRes.ok) setContact(await contactRes.json());

        // Timeline
        const timelineRes = await fetch("http://localhost:8000/api/timeline");
        if (timelineRes.ok) {
          const timeData = await timelineRes.json();
          setTimeline(timeData.map((t: any) => ({
            ...t,
            id: t.id.toString(),
            desc: t.description,
            category: t.category || "Hito",
            icon: t.icon || "rocket"
          })));
        }

        // Education
        const eduRes = await fetch("http://localhost:8000/api/education");
        if (eduRes.ok) {
          const eduData = await eduRes.json();
          setEducation(eduData.map((edu: any) => ({
            id: edu.id.toString(),
            degree: edu.degree,
            fieldOfStudy: edu.field_of_study,
            institution: edu.institution,
            location: edu.location,
            startYear: edu.start_year,
            endYear: edu.end_year,
            description: edu.description,
            certificateUrl: edu.certificate_url
          })));
        }

        // Projects
        const projRes = await fetch("http://localhost:8000/api/proyectos");
        if (projRes.ok) {
          const projData = await projRes.json();
          setProjects(projData.map((p: any) => ({
            ...p,
            id: p.id.toString(),
            media: typeof p.media === 'string' ? JSON.parse(p.media) : (p.media || []),
            stack: typeof p.stack === 'string' ? JSON.parse(p.stack) : p.stack
          })));
        }

      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    loadData();
  }, []);

  // --- SAVE HANDLERS ---
  const saveProfile = (data: ProfileData) => setProfile(data);
  const saveExperiences = (data: Experience[]) => setExperiences(data);
  const saveCertifications = (data: Certification[]) => setCertifications(data);
  const saveContact = (data: ContactData) => setContact(data);
  const saveTimeline = (data: TimelineItem[]) => setTimeline(data);
  const saveEducation = (data: Education[]) => setEducation(data);
  const saveProjects = (data: Project[]) => setProjects(data);

  // --- RENDER CONTENT ---
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <DashboardHome />;
      case 'profile': return (
        <ProfileAdmin
          profile={profile}
          experiences={experiences}
          education={education}
          certifications={certifications}
          timeline={timeline}
          onSaveProfile={saveProfile}
          onSaveExperience={saveExperiences}
          onSaveEducation={saveEducation}
          onSaveCertifications={saveCertifications}
          onSaveTimeline={saveTimeline}
        />
      );
      case 'projects': return <ProjectsAdmin projects={projects} onSave={saveProjects} />;
      case 'contact': return <ContactAdmin contact={contact} onSave={saveContact} />;
      case 'ads': return <AdsAdmin />;
      // case 'timeline': now inside profile
      default: return <PlaceholderSection name={activeSection} />;
    }
  };

  return (
    <div className="admin-dashboard-wrapper">
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} isCollapsed={isSidebarCollapsed} />

      <div className={`admin-main transition-all duration-300`} style={{ marginLeft: isSidebarCollapsed ? '0' : '280px' }}>
        <AdminHeader toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} activeSection={activeSection} />

        <div className="admin-content">
          {renderContent()}
        </div>
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
          Módulo en construcción. Próximamente disponible.
        </p>
      </div>
    </div>
  );
}
