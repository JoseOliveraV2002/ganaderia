import type { Metadata } from "next";
import "./globals.css";
import { CarritoProvider } from "@/components/CarritoContext";

export const metadata: Metadata = {
  title: "Asociación Ganadera — Tienda y Stock",
  description:
    "Venta en línea de productos lácteos y cárnicos de la Asociación de Productores. Liquidaciones automáticas por vencimiento.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-hueso text-carbon"
        style={{
          fontFamily: "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <CarritoProvider>{children}</CarritoProvider>
      </body>
    </html>
  );
}
