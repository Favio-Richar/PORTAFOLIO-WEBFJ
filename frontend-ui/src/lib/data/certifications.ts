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
        id: "cert1",
        title: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        date: "2023",
        credentialUrl: "",
    },
    {
        id: "cert2",
        title: "Professional Scrum Master",
        issuer: "Scrum.org",
        date: "2022",
        credentialUrl: "",
    },
];
