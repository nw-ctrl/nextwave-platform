import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "MediVault | Clinic Portal",
  description: "Secure clinical infrastructure and patient record management.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minWidth: 320, background: "#081421" }}>{children}</body>
    </html>
  );
}
