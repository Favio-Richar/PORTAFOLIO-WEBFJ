import type { Blog, Proyecto, CotizacionRequest } from './backendTypes';

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export async function fetchBlogs(): Promise<Blog[]> {
  return request<Blog[]>('/api/blog/');
}

export async function fetchBlog(id: number): Promise<Blog> {
  return request<Blog>(`/api/blog/${id}`);
}

export async function createBlog(payload: Blog): Promise<Blog> {
  return request<Blog>('/api/blog/', { method: 'POST', body: JSON.stringify(payload) });
}

export async function fetchProyectos(): Promise<Proyecto[]> {
  return request<Proyecto[]>('/api/proyectos/');
}

export async function enviarCotizacion(payload: CotizacionRequest): Promise<{ status: string }>{
  return request<{ status: string }>('/api/cotizacion/', { method: 'POST', body: JSON.stringify(payload) });
}

export default { fetchBlogs, fetchBlog, createBlog, fetchProyectos, enviarCotizacion };
