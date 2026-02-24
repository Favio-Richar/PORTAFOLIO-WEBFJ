export interface Certification {
    id: string;
    title: string;
    issuer: string;
    date: string;
    description?: string;
    icon?: string;
    level?: string;
    color?: string;
    badge?: string;
    credentialUrl?: string;
}

export const initialCertifications: Certification[] = [
    {
        id: "cert-new-template-ing",
        title: "Ingeniero Informatico",
        issuer: "Instituto Profesional",
        date: "2022",
        description: "Titulo profesional orientado a arquitectura de software, bases de datos y sistemas escalables.",
        icon: "FaUserGraduate",
        level: "Titulo Profesional",
        color: "gold",
        badge: "Grado Academico",
        credentialUrl: "",
    },
    {
        id: "cert-new-template-aws",
        title: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        date: "2023",
        icon: "FaCertificate",
        level: "Associate",
        color: "amber",
        badge: "Cloud",
        credentialUrl: "",
    },
    {
        id: "cert-new-template-scrum",
        title: "Professional Scrum Master",
        issuer: "Scrum.org",
        date: "2022",
        icon: "FaChartLine",
        level: "PSM I",
        color: "blue",
        badge: "Agile",
        credentialUrl: "",
    },
    {
        id: "cert-new-template-clean",
        title: "Clean Architecture in Practice",
        issuer: "Software Engineering Academy",
        date: "2024",
        icon: "FaLaptopCode",
        level: "Advanced",
        color: "emerald",
        badge: "Engineering",
        credentialUrl: "",
    },
];
