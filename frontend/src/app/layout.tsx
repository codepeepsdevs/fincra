import type { Metadata } from "next";
import "./globals.css";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { Toaster } from "react-hot-toast";
import UserProvider from "@/providers/UserProvider";

export const metadata: Metadata = {
  title: "Fincra",
  description: "Fincra is a platform for managing your finances",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <ReactQueryProvider>
          <UserProvider>
            <Toaster
              position="top-right"
              reverseOrder={false}
              toastOptions={{
                style: {
                  border: "1px solid #E4E7EC",
                  borderRadius: 15,
                  padding: "16px",
                  color: "#000",
                  fontSize: 15,
                  fontWeight: 400,
                },
                duration: 1000,
              }}
            />

            {children}
          </UserProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
