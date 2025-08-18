import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConditionalNavbar } from "@/components/ui/conditional-navbar";
import { ConditionalFooter } from "@/components/ui/conditional-footer";
import { CartProvider } from "@/lib/cart-context";
import { ToastProvider } from "@/components/ui/toast";
import { CartSidebar } from "@/components/ui/cart-sidebar";
import { CartButton } from "@/components/ui/cart-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LusoInsumos",
  description: "Tu tienda de confianza para insumos de calidad",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          <ToastProvider>
            <ConditionalNavbar />
            <main className="min-h-screen">{children}</main>
            <ConditionalFooter />
            <CartSidebar />
            <CartButton />
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}
