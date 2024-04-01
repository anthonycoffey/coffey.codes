"use client";
import "@/styles/main.sass";
import Toolbar from "../components/Toolbar";
import localFont from "next/font/local";
import { GoogleAnalytics } from "nextjs-google-analytics";

const helvetica = localFont({
  src: [
    {
      path: "./helvetica.ttf",
      style: "normal",
    },
    {
      path: "./helvetica-bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={helvetica.className}>
      <body>
        <GoogleAnalytics trackPageViews />
        <Toolbar />
        <main className="overflow-hidden">{children}</main>
        <footer className="py-2">
          <div className="text-center">
            coffey.codes © {new Date().getFullYear()}
          </div>
        </footer>
      </body>
    </html>
  );
}
