export interface ContactData {
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    location: string;
}

export const defaultContact: ContactData = {
    email: "favio@example.com",
    phone: "+56 9 1234 5678",
    linkedin: "https://linkedin.com/in/favio-jimenez",
    github: "https://github.com/favio",
    location: "Chile",
};
