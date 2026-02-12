import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // Validación clave: API KEY
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Falta RESEND_API_KEY en el .env.local" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { nombre, email, telefono, servicio, descripcion } = body;

    const emailReceiver = process.env.EMAIL_RECEIVER;
    const emailFrom = process.env.EMAIL_FROM || "onboarding@resend.dev";
    // 🔥 Usamos remitente configurable o el default de Resend

    if (!emailReceiver) {
      return NextResponse.json(
        { error: "EMAIL_RECEIVER no está configurado en .env.local" },
        { status: 500 }
      );
    }

    // Validación básica de campos
    if (!nombre || !email || !telefono || !servicio) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    // 🔥 Envío de correo real
    const response = await resend.emails.send({
      from: emailFrom,
      to: emailReceiver,
      subject: `Nueva cotización solicitada (${servicio})`,
      html: `
        <h2 style="font-size:20px; font-weight:bold;">Nueva solicitud de cotización</h2>

        <p><strong>Cliente:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${telefono}</p>
        <p><strong>Servicio solicitado:</strong> ${servicio}</p>
        <p><strong>Descripción:</strong><br/>${descripcion}</p>

        <hr />
        <p style="font-size:12px; color:#777;">Enviado automáticamente desde tu portafolio.</p>
      `,
    });

    console.log("📨 CORREO ENVIADO:", response);

    return NextResponse.json({ ok: true, message: "Correo enviado" });

  } catch (error: any) {
    console.error("❌ ERROR AL ENVIAR:", error);

    return NextResponse.json(
      { error: error.message || "Error al enviar correo" },
      { status: 500 }
    );
  }
}
