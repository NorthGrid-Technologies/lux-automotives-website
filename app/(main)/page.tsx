'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getInventory } from '@/lib/storage';
import { Vehicle, VehicleClass } from '@/lib/types';
import VehicleCard from '@/components/VehicleCard';
import PageTransition from '@/components/PageTransition';
import { ChevronRight } from 'lucide-react';

// Motorcycle removed per business decision
const CLASSES: { cls: VehicleClass; icon: string }[] = [
  { cls: 'Super', icon: '🏎️' },
  { cls: 'Sports', icon: '🚗' },
  { cls: 'Muscle', icon: '💪' },
  { cls: 'SUV', icon: '🚙' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<Vehicle[]>([]);

  useEffect(() => {
    const inv = getInventory();
    const feat = inv.filter((v) => v.featured).slice(0, 3);
    setFeatured(feat.length > 0 ? feat : inv.slice(0, 3));
  }, []);

  return (
    <PageTransition>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Banner image */}
        <div className="absolute inset-0">
          <Image
            src="https://i.ibb.co/4w7PJ8kf/lux-banner-fb.png"
            alt="Lux Automotive Banner"
            fill
            className="object-cover"
            priority
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>

        {/* Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 80% at 30% 50%, rgba(192,57,43,0.08) 0%, transparent 60%)' }}
        />

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-[#c0392b] text-xs uppercase tracking-[0.4em] mb-4 font-semibold">
              Los Santos &middot; Premier Dealership
            </p>
            <h1 className="font-black text-5xl md:text-7xl leading-[1.05] mb-6 uppercase tracking-tight">
              Drive the<br />
              <span className="text-[#c0392b]">Extraordinary</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mb-10 leading-relaxed">
              Lux Automotive is a high-end dealership located in Rockford Hills. We provide some of the most prestigious and exclusive vehicles in the market.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/inventory" className="btn-crown py-3 px-8">
                Browse Inventory <ChevronRight size={16} />
              </Link>
              <Link href="/sell" className="btn-outline-crown py-3 px-8">
                Sell Your Vehicle
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Vehicle classes ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-[#c0392b] text-xs uppercase tracking-[0.4em] mb-3">Categories</p>
          <h2 className="font-black text-4xl uppercase">Browse by Class</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CLASSES.map(({ cls, icon }) => (
            <Link
              key={cls}
              href={`/inventory?class=${cls}`}
              className="group card p-6 text-center hover:border-[#c0392b]/40 transition-all duration-200"
            >
              <div className="text-3xl mb-3">{icon}</div>
              <p className="font-bold text-sm uppercase tracking-wider group-hover:text-[#c0392b] transition-colors">
                {cls}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured vehicles ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[#c0392b] text-xs uppercase tracking-[0.4em] mb-2">Hand-picked</p>
            <h2 className="font-black text-4xl uppercase">Featured Vehicles</h2>
          </div>
          <Link href="/inventory" className="btn-ghost text-xs hidden sm:inline-flex">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((v, i) => (
            <VehicleCard key={v.id} vehicle={v} index={i} />
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(192,57,43,0.07) 0%, transparent 70%)' }}
        />
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="font-black text-4xl uppercase mb-4">Ready to Sell Your Ride?</h2>
          <p className="text-gray-500 text-lg mb-8">
            We pay competitive market rates. Submit your vehicle details and hear back within 24 hours.
          </p>
          <Link href="/sell" className="btn-crown py-3 px-10">
            Submit a Sell Request
          </Link>
        </div>
      </section>
    </PageTransition>
  );
}
