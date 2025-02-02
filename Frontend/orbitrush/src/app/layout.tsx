import type { Metadata } from "next";
import { Roboto, Electrolize } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/authcontext";
import { UsersProvider } from "@/context/userscontext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from 'react-hot-toast';
import { WebSocketProvider } from "@/context/websocketcontext"
import { WSMessageProvider } from "@/context/wsmessagecontext"
import { FriendRequestsProvider } from "@/context/requestcontext"

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

export const metadata: Metadata = {
  title: "Orbit Rush!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <html lang="en">
      <body className={`${roboto.variable} ${electrolize.variable} antialiased overflow-hidden`}>

        <WebSocketProvider>
          <AuthProvider>
            <UsersProvider>
              <WSMessageProvider>
                <FriendRequestsProvider>
                  <ToastContainer />
                  {children}
                </FriendRequestsProvider>
              </WSMessageProvider>
            </UsersProvider>
          </AuthProvider>
        </WebSocketProvider>

        <Toaster
          position="bottom-right"
          reverseOrder={false}
          gutter={8} // Espaciado entre los toasts
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