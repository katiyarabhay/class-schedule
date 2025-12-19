import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SchedulerProvider } from "@/lib/store";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Intelligent Class Scheduler",
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
        <SchedulerProvider>
          {children}
        </SchedulerProvider>
      </body>
    </html>
  );
}
