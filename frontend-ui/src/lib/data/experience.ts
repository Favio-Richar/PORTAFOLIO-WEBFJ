export interface Experience {
    id: string;
    company: string;
    position: string;
    period: string;
    location?: string;
    employmentType?: string;
    description: string;
    technologies: string[];
}

export const initialExperiences: Experience[] = [
    {
        id: "exp1",
        company: "Tech Solutions Inc.",
        position: "Senior Full Stack Developer",
        period: "2023 - Presente",
        description: "Desarrollo de arquitecturas empresariales y liderazgo de equipos técnicos.",
        technologies: ["Next.js", "FastAPI", "PostgreSQL", "Docker"],
    },
    {
        id: "exp2",
        company: "Innovation Labs",
        position: "Full Stack Developer",
        period: "2021 - 2023",
        description: "Desarrollo de aplicaciones web y móviles para múltiples clientes corporativos.",
        technologies: ["React", "Node.js", "Flutter", "MongoDB"],
    },
];
