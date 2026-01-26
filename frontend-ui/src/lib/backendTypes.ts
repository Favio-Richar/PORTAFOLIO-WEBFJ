export interface Blog {
  id?: number;
  title: string;
  content: string;
}

export interface Proyecto {
  id?: number;
  name: string;
  description: string;
}

export interface CotizacionRequest {
  nombre: string;
  email: string;
  telefono?: string | null;
  mensaje: string;
}
