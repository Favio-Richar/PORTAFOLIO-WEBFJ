export interface Education {
    id: string;
    degree: string;
    institution: string;
    fieldOfStudy?: string;
    location: string;
    startYear: string;
    endYear: string;
    description?: string;
    certificateUrl?: string;
}

export const initialEducation: Education[] = [
    {
        id: "edu1",
        degree: "Ingeniería Informática",
        institution: "INSTITUTO PROFESIONAL",
        location: "CHILE",
        startYear: "2018",
        endYear: "2022",
    },
];
