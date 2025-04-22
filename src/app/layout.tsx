import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Approval Chain",
  description: "dApp for university funds approval chain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
