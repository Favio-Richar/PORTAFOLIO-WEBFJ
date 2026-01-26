export interface Service {
    id: string;
    icon: string;
    title: string;
    desc: string;
    features: string[];
}

export const initialServices: Service[] = [
    {
        id: "1",
        icon: "/img/webdev.jpg",
        title: "Desarrollo Web",
        desc: "Sitios y sistemas modernos con Next.js y React.",
        features: ["SEO técnico", "SSR / ISR", "Dashboards", "Performance"],
    },
    {
        id: "2",
        icon: "/img/mobile.jpg",
        title: "Apps Móviles",
        desc: "Apps nativas y cross-platform listas para producción.",
        features: ["iOS & Android", "UI/UX Fluida", "Notificaciones", "Offline Design"],
    },
    {
        id: "3",
        icon: "/img/backend.jpg",
        title: "Backend & APIs",
        desc: "Arquitecturas escalables y seguras.",
        features: ["FastAPI / NestJS", "PostgreSQL", "Microservicios", "Seguridad"],
    },
    {
        id: "4",
        icon: "/img/devops.jpg",
        title: "DevOps & Cloud",
        desc: "Infraestructura robusta en la nube.",
        features: ["Docker", "CI/CD", "AWS / VPS", "Monitoreo"],
    },
    {
        id: "5",
        icon: "/img/support.jpg",
        title: "Soporte TI",
        desc: "Mantenimiento y soporte técnico especializado.",
        features: ["Diagnóstico", "Optimización", "Redes", "Hardware"],
    },
    {
        id: "6",
        icon: "/img/the7.jpg",
        title: "Software Corp",
        desc: "Soluciones de software empresarial a medida.",
        features: ["Licenciamiento", "Consultoría", "Integraciones", "Soporte"],
    },
    {
        id: "7",
        icon: "/img/ticslaboral.jpg",
        title: "Redes",
        desc: "Infraestructura de redes segura y eficiente.",
        features: ["WiFi", "Cableado", "VPN", "Seguridad"],
    },
    {
        id: "8",
        icon: "/img/maintenance.jpg",
        title: "Mantenimiento",
        desc: "Prevención y corrección de fallas.",
        features: ["Preventivo", "Correctivo", "Limpieza", "Upgrades"],
    },
];
