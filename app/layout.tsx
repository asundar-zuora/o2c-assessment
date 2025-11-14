import "./globals.css";

export const metadata = {
  title: "Modern O2C Finance Leader Self-Assessment",
  description: "Benchmark your O2C maturity in minutes."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
