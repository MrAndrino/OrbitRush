import { Roboto, Electrolize } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from 'react-hot-toast';
import { ToastContainer } from "react-toastify";
import { WebSocketProvider } from "../context/websocketcontext";
import { AuthProvider } from "../context/authcontext";
import { UsersProvider } from "../context/userscontext";
import React from "react";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-secondary",
  weight: ["100", "300", "400", "500", "700", "900"],
});

const electrolize = Electrolize({
  subsets: ["latin"],
  variable: "--font-primary",
  weight: ["400"],
});

export const metadata = {
  title: "Orbit Rush",
  description: "Juego multijugador en tiempo real",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>

        {/* 👇 Este head es para la PWA */}
        <link rel="manifest" href="/manifest.json" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js')
                  .then(() => console.log("✅ Service Worker registrado correctamente."))
                  .catch((error) => console.error("❌ Error registrando el Service Worker:", error));
              }
            `,
          }}
        />
      </head>
      <body className={`${roboto.variable} ${electrolize.variable} antialiased overflow-hidden`}>
        <WebSocketProvider>
          <AuthProvider>
            <UsersProvider>
              <ToastContainer />
              {children}
            </UsersProvider>
          </AuthProvider>
        </WebSocketProvider>

        <Toaster
          position="bottom-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            success: {
              duration: 3000,
              style: {
                backgroundColor: 'var(--backgroundtoast)',
                color: 'var(--foreground)',
                fontSize: '16px',
                borderRadius: '8px',
                padding: '10px 20px',
                border: '2px solid rgb(0, 153, 255)',
                boxShadow: '0 0 10px rgba(0, 153, 255, 1), 0 0 15px rgba(0, 153, 255, 0.6)',
              },
            },
            error: {
              duration: 3000,
              style: {
                backgroundColor: 'var(--backgroundtoast)',
                color: 'var(--foreground)',
                fontSize: '16px',
                borderRadius: '8px',
                padding: '10px 20px',
                border: '2px solid rgb(255, 0, 0)',
                boxShadow: '0 0 10px rgba(255, 0, 0, 1), 0 0 15px rgba(255, 0, 0, 0.6)',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
