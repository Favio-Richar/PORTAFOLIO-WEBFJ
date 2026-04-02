import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, email, telefono, servicio, descripcion } = body;

    // Obtener URL del backend desde variables de entorno
    const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000").replace(/\/$/, "");

    // 🔥 Delegar al Backend de FastAPI (Persistence + Email + Notifications)
    const backendResponse = await fetch(`${backendUrl}/api/enviar-cotizacion/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        email,
        telefono,
        servicio: servicio || "Consulta General",
        mensaje: descripcion || ""
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      throw new Error(errorData.detail || "Error en la comunicación con el servidor central");
    }

    const data = await backendResponse.json();
    console.log("📨 LEAD PROCESADO POR BACKEND:", data);

    return NextResponse.json({ ok: true, message: "Solicitud procesada correctamente", id: data.id });

  } catch (error: any) {
    console.error("❌ ERROR AL PROCESAR LEAD:", error);

    return NextResponse.json(
      { error: error.message || "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
