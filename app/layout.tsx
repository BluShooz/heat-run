import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DIRTY MONEY: CUT OFF",
  description: "Third-Person Street Survival",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-stone-950 text-stone-200">
        {children}
      </body>
    </html>
  );
}
