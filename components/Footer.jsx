import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-neutral-900 font-serif text-2xl tracking-[0.3em] uppercase mb-4">YAZI</h3>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Vêtements minimalistes confectionnés avec précision. Élégance intemporelle pour l&apos;individu moderne.
            </p>
          </div>
          <div>
            <h4 className="text-neutral-900 text-xs tracking-widest uppercase font-medium mb-4">Navigation</h4>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-neutral-500 hover:text-neutral-900 text-sm transition-colors">Accueil</Link>
              <Link href="/products" className="text-neutral-500 hover:text-neutral-900 text-sm transition-colors">Collection</Link>
            </div>
          </div>
          <div>
            <h4 className="text-neutral-900 text-xs tracking-widest uppercase font-medium mb-4">Contact</h4>
            <p className="text-neutral-500 text-sm">+216 XX XXX XXX</p>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-neutral-200 text-center">
          <p className="text-neutral-400 text-xs tracking-widest">&copy; {new Date().getFullYear()} YAZI. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
