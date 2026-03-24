import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://nextlevelsoftwarepro.com';

    // Páginas estáticas principales
    const staticPages = [
        '',
        '/servicios',
        '/proyectos',
        '/sobre-mi',
        '/blog',
        '/contacto',
        '/asesoria',
        '/clientes',
        '/privacidad',
        '/terminos',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return [...staticPages];
}
