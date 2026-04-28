import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const phone = "21693733766";
  const message = encodeURIComponent("Bonjour, je suis int\u00e9ress\u00e9(e) par vos produits YAZI.");
  const href = `https://wa.me/${phone}?text=${message}`;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <span
        className="absolute inline-flex h-14 w-14 rounded-full animate-ping opacity-30"
        style={{ backgroundColor: "#25D366" }}
      />
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactez-nous sur WhatsApp"
        className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95"
        style={{ backgroundColor: "#25D366" }}
      >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="w-7 h-7 fill-white"
      >
        <path d="M16.003 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.34.63 4.63 1.827 6.64L2.667 29.333l6.907-1.8A13.267 13.267 0 0016.003 29.333c7.36 0 13.33-5.973 13.33-13.333S23.363 2.667 16.003 2.667zm0 24a10.6 10.6 0 01-5.413-1.48l-.387-.233-4.093 1.067 1.093-3.973-.253-.413A10.6 10.6 0 015.337 16c0-5.88 4.787-10.667 10.666-10.667S26.67 10.12 26.67 16 21.882 26.667 16.003 26.667zm5.84-7.987c-.32-.16-1.893-.933-2.187-1.04-.293-.107-.507-.16-.72.16-.213.32-.827 1.04-.947 1.253-.12.213-.24.24-.56.08-.32-.16-1.347-.493-2.56-1.573-.947-.84-1.587-1.88-1.773-2.2-.187-.32-.02-.493.14-.653.147-.147.32-.387.48-.573.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.733-.987-2.373-.253-.613-.52-.533-.72-.547-.187-.013-.4-.013-.613-.013-.213 0-.56.08-.853.373-.293.293-1.12 1.093-1.12 2.667 0 1.573 1.147 3.093 1.307 3.307.16.213 2.24 3.413 5.44 4.787.76.333 1.347.533 1.813.68.76.24 1.453.207 2 .127.613-.093 1.893-.773 2.16-1.52.267-.747.267-1.387.187-1.52-.08-.133-.293-.213-.613-.373z" />
      </svg>
      </Link>
    </div>
  );
}
