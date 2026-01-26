export interface ProfileData {
    fullName: string;
    profileImage: string;
    profileVideo: string;
    title: string; // Ej: "Ingeniero de Software Full Stack"
}

export const defaultProfile: ProfileData = {
    fullName: "Favio Jiménez",
    profileImage: "/img/favio_perfil.jpg",
    profileVideo: "",
    title: "Ingeniero de Software Full Stack",
};
