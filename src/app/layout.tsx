import type { Metadata } from "next";
import { Source_Serif_4, Sofia_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
});

const sofiaSans = Sofia_Sans({
  variable: "--font-sofia",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fabricio Varela — Web Developer Full Stack",
  description:
    "Portfolio de Fabricio Varela, web developer full stack de Tucumán, Argentina. Proyectos, stack y formación, con un asistente para preguntar lo que quieras.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${sourceSerif.variable} ${sofiaSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* corre durante el parseo del HTML, antes del primer pintado: si no,
            la página aparecería en oscuro y saltaría a claro al hidratar.
            El idioma se deja en el <html> por el mismo motivo: la página lo
            lee de ahí al montar, en vez de tocar localStorage en el render */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem("theme")==="light")document.documentElement.dataset.theme="light";if(localStorage.getItem("lang")==="en")document.documentElement.lang="en";}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
