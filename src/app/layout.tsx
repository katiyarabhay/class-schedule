import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SchedulerProvider } from "@/lib/store";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AUTOPLANNER",
  description: "Optimized timetable generation for higher education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SchedulerProvider>
            {children}
          </SchedulerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
