import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

export const metadata = {
  title: "CodeScry-AI — Editorial Code Review",
  description:
    "An editorial approach to reviewing code with a red pen and a second set of eyes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--paper)] text-[var(--ink)] font-sans antialiased selection:bg-[var(--pen)] selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

