import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MediVault | Clinic Portal",
  description: "Secure clinical infrastructure and patient record management.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
