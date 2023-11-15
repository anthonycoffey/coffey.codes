import "./main.sass";
import Toolbar from "../components/Toolbar";
import localFont from "next/font/local";
import Script from "next/script";
import Head from "next/head";
const {NODE_ENV} = process.env;

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
    <Head>
      {(NODE_ENV === "production") && (
        <>
          <Script async src="https://www.googletagmanager.com/gtag/js?id=G-MV8YG7QQW0"></Script>
          <Script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-MV8YG7QQW0');
          </Script>
        </>
      )}
    </Head>
      <body>
        <Toolbar />
        <main className="overflow-hidden">{children}</main>
        <footer className="py-2">
          <div className="flex flex-row justify-center py-10">
            <div className="flex flex-col">
              <div className="text-center">
                <img src="/underconstruction.gif" alt="under construction" />
              </div>
            </div>
          </div>
          <div className="text-center">
            coffey.codes © {new Date().getFullYear()}
          </div>
        </footer>
      </body>

    </html>
  );
}
