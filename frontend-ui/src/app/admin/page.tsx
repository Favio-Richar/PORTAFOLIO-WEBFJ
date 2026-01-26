"use client";

import { useState, useEffect } from "react";
import { FaImage, FaBriefcase, FaCertificate, FaPhone, FaProjectDiagram, FaTools, FaBlog, FaUsers, FaClock, FaGraduationCap } from "react-icons/fa";

// Componentes modulares
import ProfileAdmin from "@/components/admin/ProfileAdmin";
import ExperienceAdmin from "@/components/admin/ExperienceAdmin";
import CertificationsAdmin from "@/components/admin/CertificationsAdmin";
import ContactAdmin from "@/components/admin/ContactAdmin";
import TimelineAdmin from "@/components/admin/TimelineAdmin";
import EducationAdmin from "@/components/admin/EducationAdmin";
import ProjectsAdmin, { Project } from "@/components/admin/ProjectsAdmin";

// Data imports
import { defaultProfile, ProfileData } from "@/lib/data/profile";
import { initialExperiences, Experience } from "@/lib/data/experience";
import { initialCertifications, Certification } from "@/lib/data/certifications";
import { defaultContact, ContactData } from "@/lib/data/contact";
import { initialTimeline, TimelineItem } from "@/lib/data/timeline";
import { initialEducation, Education } from "@/lib/data/education";

export default function AdminPanel() {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
  const [certifications, setCertifications] = useState<Certification[]>(initialCertifications);
  const [contact, setContact] = useState<ContactData>(defaultContact);
  const [timeline, setTimeline] = useState<TimelineItem[]>(initialTimeline);
  const [education, setEducation] = useState<Education[]>(initialEducation);
  const [projects, setProjects] = useState<Project[]>([]);

  const [activeSection, setActiveSection] = useState("profile");

  useEffect(() => {
    // Cargar datos desde la API
    const loadData = async () => {
      try {
        // Cargar perfil
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

        // Cargar experiencias
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

        // Cargar certificaciones
        const certRes = await fetch("http://localhost:8000/api/certifications");
        if (certRes.ok) {
          const certData = await certRes.json();
          setCertifications(certData.map((c: any) => ({
            ...c,
            id: c.id.toString(),
            credentialUrl: c.credential_url,
          })));
        }

        // Cargar contacto
        const contactRes = await fetch("http://localhost:8000/api/contact");
        if (contactRes.ok) setContact(await contactRes.json());

        // Cargar timeline
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

        // Cargar educación
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

        // Cargar Proyectos
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

  const saveProfile = (data: ProfileData) => setProfile(data);
  const saveExperiences = (data: Experience[]) => setExperiences(data);
  const saveCertifications = (data: Certification[]) => setCertifications(data);
  const saveContact = (data: ContactData) => setContact(data);
  const saveTimeline = (data: TimelineItem[]) => setTimeline(data);
  const saveEducation = (data: Education[]) => setEducation(data);
  const saveProjects = (data: Project[]) => setProjects(data);

  const sections = [
    { id: "profile", name: "Perfil/Hero", icon: <FaImage />, component: <ProfileAdmin profile={profile} onSave={saveProfile} /> },
    { id: "experience", name: "Experiencia", icon: <FaBriefcase />, component: <ExperienceAdmin experiences={experiences} onSave={saveExperiences} /> },
    { id: "timeline", name: "Timeline", icon: <FaClock />, component: <TimelineAdmin timeline={timeline} onSave={saveTimeline} /> },
    { id: "education", name: "Formación", icon: <FaGraduationCap />, component: <EducationAdmin education={education} onSave={saveEducation} /> },
    { id: "certifications", name: "Certificaciones", icon: <FaCertificate />, component: <CertificationsAdmin certifications={certifications} onSave={saveCertifications} /> },
    { id: "projects", name: "Proyectos", icon: <FaProjectDiagram />, component: <ProjectsAdmin projects={projects} onSave={saveProjects} /> },
    { id: "contact", name: "Contacto", icon: <FaPhone />, component: <ContactAdmin contact={contact} onSave={saveContact} /> },
    { id: "services", name: "Servicios", icon: <FaTools />, component: <PlaceholderSection name="Servicios" /> },
    { id: "blog", name: "Blog", icon: <FaBlog />, component: <PlaceholderSection name="Blog" /> },
    { id: "clients", name: "Clientes", icon: <FaUsers />, component: <PlaceholderSection name="Clientes" /> },
  ];

  const activeComponent = sections.find(s => s.id === activeSection)?.component;

  return (
    <div className="relative overflow-hidden pt-20 px-6 font-bold bg-transparent pb-40 min-h-screen">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 blur-[200px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[200px] rounded-full pointer-events-none" />

      {/* HEADER */}
      <section className="text-center py-24 relative z-10">
        <h2 className="text-7xl md:text-8xl font-black uppercase bg-gradient-to-r from-white via-cyan-400 to-white bg-clip-text text-transparent mb-4 tracking-tighter">
          ADMIN PANEL
        </h2>
        <p className="text-gray-400 text-xl font-medium">Gestión Completa del Portfolio</p>
      </section>

      {/* NAVEGACIÓN */}
      <div className="max-w-7xl mx-auto mb-16 relative z-10">
        <div className="flex flex-wrap gap-4 justify-center">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`px-8 py-4 rounded-full flex items-center gap-3 text-sm font-black uppercase tracking-wider transition-all shadow-xl ${activeSection === s.id
                ? 'btn-primary btn-alive btn-shimmer btn-border-glow'
                : 'glass-light border border-white/10 text-white/50 hover:text-white hover:border-cyan-500/30'
                }`}
            >
              <span className="text-lg">{s.icon}</span>
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENIDO DINÁMICO */}
      <div className="max-w-7xl mx-auto relative z-10">
        {activeComponent}
      </div>
    </div>
  );
}

function PlaceholderSection({ name }: { name: string }) {
  return (
    <div className="text-center py-20">
      <div className="glass-card-pro p-16 border border-white/10 rounded-[4rem] inline-block">
        <h3 className="text-4xl font-black text-white uppercase mb-4">{name}</h3>
        <p className="text-gray-400 text-lg">
          Sección en desarrollo. Componente modular listo para implementar.
        </p>
      </div>
    </div>
  );
}
