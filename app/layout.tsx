import "./global.sass";
import Toolbar from "../components/Toolbar";
import localFont from "next/font/local";

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
        <Toolbar />
        <main>{children}</main>
        <footer className="py-2">
          <div className="flex flex-row justify-center p-4">
            <div className="flex flex-col">
              <div className="text-center">Coffey.Codes © 2023</div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
