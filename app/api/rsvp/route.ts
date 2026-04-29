import { NextResponse } from "next/server";
import { google } from "googleapis";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { nombre, asistencia, personas, telefono, mensaje } = body;

    if (!nombre || !asistencia) {
      return NextResponse.json(
        { error: "El nombre y la asistencia son obligatorios." },
        { status: 400 }
      );
    }

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({
      version: "v4",
      auth,
    });

    const fecha = new Date().toLocaleString("es-GT", {
      timeZone: "America/Guatemala",
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Hoja 1!A:F",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            fecha,
            nombre,
            asistencia,
            personas || "1",
            telefono || "",
            mensaje || "",
          ],
        ],
      },
    });

    if (process.env.RESEND_API_KEY && process.env.RSVP_TO_EMAIL) {
      await resend.emails.send({
        from: "Confirmación Cumpleaños <onboarding@resend.dev>",
        to: process.env.RSVP_TO_EMAIL,
        subject: `Confirmación de asistencia - ${nombre}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #2b1b17;">
            <h2>Nueva confirmación de asistencia</h2>
            <p><strong>Nombre:</strong> ${nombre}</p>
            <p><strong>Asistencia:</strong> ${asistencia}</p>
            <p><strong>Número de personas:</strong> ${personas || "1"}</p>
            <p><strong>Teléfono:</strong> ${telefono || "No indicado"}</p>
            <p><strong>Mensaje:</strong> ${mensaje || "Sin mensaje"}</p>
            <br />
            <p>También quedó registrada en Google Sheets.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      message: "Confirmación registrada correctamente.",
    });
  } catch (error) {
    console.error("Error RSVP:", error);

    return NextResponse.json(
      { error: "No se pudo registrar la confirmación." },
      { status: 500 }
    );
  }
}