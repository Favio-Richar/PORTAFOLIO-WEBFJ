export interface ContactData {
    email: string;
    phone: string;
    whatsapp: string;
    linkedin: string;
    github: string;
    facebook: string;
    instagram: string;
    twitter: string;
    tiktok: string;
    location: string;
    hero_image?: string;
    hero_video?: string;
}

export const defaultContact: ContactData = {
    email: "contacto@levelsoftwarepro.com",
    phone: "+56 9 1234 5678",
    whatsapp: "+56 9 1234 5678",
    linkedin: "https://linkedin.com/in/favio-jimenez",
    github: "https://github.com/favio",
    facebook: "",
    instagram: "",
    twitter: "",
    tiktok: "",
    location: "Santiago, Chile",
    hero_image: "",
    hero_video: "",
};
