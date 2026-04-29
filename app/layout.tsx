import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gaby | 40 & Fabulous",
  description: "Invitación y confirmación de asistencia para el cumpleaños de Gaby.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Gaby | 40 & Fabulous",
    description: "Invitación y confirmación de asistencia para el cumpleaños de Gaby.",
    siteName: "Gaby 40 & Fabulous",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}