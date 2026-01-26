export interface TimelineItem {
    id: string;
    year: string;
    title: string;
    desc: string;
    category?: string;
    icon?: string;
}

export const initialTimeline: TimelineItem[] = [
    {
        id: "tl1",
        year: "2021",
        title: "Consolidación en TI",
        desc: "Soporte técnico avanzado, redes corporativas y primeras automatizaciones reales.",
    },
    {
        id: "tl2",
        year: "2022",
        title: "Desarrollo Freelance Corporativo",
        desc: "Lanzamiento de aplicaciones móviles, APIs robustas y plataformas web para empresas.",
    },
    {
        id: "tl3",
        year: "2023",
        title: "Especialización Full Stack Senior",
        desc: "Dominio de FastAPI, Next.js, PostgreSQL y despliegues con Docker.",
    },
    {
        id: "tl4",
        year: "2024 – Presente",
        title: "Consultor Desarrollador Full Stack",
        desc: "Creación de sistemas empresariales, ERP personalizados y microservicios de alto impacto.",
    },
];
