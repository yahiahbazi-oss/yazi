import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import MetaPixel from "@/components/MetaPixel";
import GoogleTagManager from "@/components/GoogleTagManager";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "YAZI — Luxury Clothing",
  description:
    "Discover YAZI premium clothing. Timeless elegance, modern luxury. Shop the latest collection.",
  openGraph: {
    title: "YAZI — Luxury Clothing",
    description:
      "Discover YAZI premium clothing. Timeless elegance, modern luxury.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-neutral-900">
        <CartProvider>
          <MetaPixel />
          <GoogleTagManager />
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#fff",
                color: "#111",
                border: "1px solid #e5e5e5",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              },
            }}
          />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
