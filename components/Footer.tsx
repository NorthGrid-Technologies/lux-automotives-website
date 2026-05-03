import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t border-[#1a1a1a] bg-[#0a0a0a] py-12 px-6 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <Image
            src="/images/logo.png"
            alt="Lux Automotive"
            width={140}
            height={36}
            className="object-contain h-auto max-w-[140px] mb-3"
          />
          <p className="text-gray-600 text-sm leading-relaxed">
            Los Santos&apos; premier luxury dealership. Premium vehicles, impeccable service.
          </p>
        </div>

        {/* Navigate */}
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-600 mb-4">Navigate</p>
          <ul className="space-y-2 text-sm text-gray-500">
            {[
              ['/inventory', 'Inventory'],
              ['/sell', 'Sell Your Vehicle'],
              ['/careers', 'Careers'],
              ['/partners', 'Partners'],
              ['/contact', 'Contact Us'],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="hover:text-[#c0392b] transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Location */}
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-600 mb-4">Location</p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Premium Deluxe Motorsport<br />
            Rockford Hills, Los Santos<br />
            San Andreas
          </p>
          <p className="text-xs text-gray-700 mt-4">GTA World RP — In Character Business</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-[#1a1a1a] flex flex-col sm:flex-row justify-between gap-2 text-xs text-gray-700">
        <p>&copy; 2025 Lux Automotive &middot; Los Santos, San Andreas</p>
        <p>GTA World RP &mdash; In-character purposes only</p>
      </div>
    </footer>
  );
}
