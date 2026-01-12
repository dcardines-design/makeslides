import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TikTok Slides Maker",
  description: "Create beautiful TikTok carousel slides",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Montserrat:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Open+Sans:wght@400;500;600;700&family=Lato:wght@400;700&family=Playfair+Display:wght@400;500;600;700&family=Bebas+Neue&family=Oswald:wght@400;500;600;700&family=Raleway:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Nunito:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&family=Archivo+Black&family=DM+Sans:wght@400;500;700&family=Work+Sans:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Sora:wght@400;500;600;700&family=TikTok+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
