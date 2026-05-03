'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { getVehicleById, recordSale } from '@/lib/storage';
import { Vehicle } from '@/lib/types';
import ClassBadge from '@/components/ClassBadge';
import StatusBadge from '@/components/StatusBadge';
import PageTransition from '@/components/PageTransition';
import {
  Zap, Shield, Droplets, Settings2, Wrench, Gauge,
  Star, BadgeDollarSign, Music2, Package, Hash,
  ChevronLeft, CheckCircle
} from 'lucide-react';

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US');
}

type SpecItem = {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
};

function SpecGrid({ specs }: { specs: SpecItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {specs.map((s) => (
        <div key={s.label} className="spec-cell">
          <div className="flex items-center gap-1.5 spec-cell-label">
            <span className="text-[#c0392b]">{s.icon}</span>
            {s.label}
          </div>
          <p className={`spec-cell-value ${s.highlight ? 'text-[#c0392b]' : ''}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

function modColor(mod: string) {
  if (mod === 'Complete') return 'text-green-400';
  if (mod === 'Partial') return 'text-yellow-400';
  return 'text-gray-600';
}

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [buyerName, setBuyerName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const found = getVehicleById(id);
    if (!found) router.push('/inventory');
    else setVehicle(found);
  }, [id, router]);

  function handleBuy() {
    if (!buyerName.trim()) { setError('Please enter your character name.'); return; }
    if (!vehicle) return;
    try {
      recordSale(vehicle.id, buyerName.trim());
      setPurchased(true);
      setShowModal(false);
      setVehicle(getVehicleById(vehicle.id) ?? vehicle);
    } catch {
      setError('Purchase failed. Please try again.');
    }
  }

  if (!vehicle) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#c0392b] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const canBuy = vehicle.status === 'available';

  const specs: SpecItem[] = [
    { label: 'Plate', value: vehicle.plate, icon: <Hash size={12} /> },
    { label: 'Mileage', value: `${vehicle.mileage.toLocaleString()} mi`, icon: <Gauge size={12} /> },
    { label: 'Fuel Type', value: vehicle.fuelType, icon: <Droplets size={12} /> },
    { label: 'Drivetrain', value: vehicle.drivetrain, icon: <Settings2 size={12} /> },
    { label: 'Condition', value: vehicle.condition, icon: <Star size={12} />, highlight: true },
    { label: 'Insurance /day', value: fmt(vehicle.insurancePerDay), icon: <BadgeDollarSign size={12} /> },
    { label: 'Performance', value: vehicle.performanceMods, icon: <Zap size={12} /> },
    { label: 'Security', value: vehicle.securityMods, icon: <Shield size={12} /> },
    { label: 'Handling', value: vehicle.handlingMods, icon: <Wrench size={12} /> },
    { label: 'Subwoofer', value: vehicle.subwoofer ? 'Yes' : 'No', icon: <Music2 size={12} /> },
    { label: 'Cargo Space', value: `${vehicle.cargoSpace} slots`, icon: <Package size={12} /> },
    { label: 'Units Sold', value: `${vehicle.soldCount}`, icon: <CheckCircle size={12} /> },
  ];

  return (
    <PageTransition>
      {/* Breadcrumb */}
      <div className="border-b border-[#1a1a1a] bg-[#0d0d0d] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-[#c0392b] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/inventory" className="hover:text-[#c0392b] transition-colors">Inventory</Link>
          <span>/</span>
          <span className="text-gray-300">{vehicle.brand} {vehicle.model}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <Link href="/inventory" className="btn-ghost text-xs mb-8 inline-flex">
          <ChevronLeft size={14} /> Back to Inventory
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="relative rounded-xl overflow-hidden crown-border bg-[#111]">
              <Image
                src={vehicle.imageUrl}
                alt={`${vehicle.brand} ${vehicle.model}`}
                width={800}
                height={450}
                className="w-full h-72 lg:h-96 object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <ClassBadge cls={vehicle.class} />
              </div>
              <div className="absolute top-4 right-4">
                <StatusBadge status={vehicle.status} />
              </div>
              {vehicle.featured && (
                <div className="absolute bottom-4 left-4">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#c0392b]/80 text-white">
                    Featured
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            <div>
              <p className="text-[#c0392b] text-xs uppercase tracking-[0.3em] mb-1">{vehicle.brand}</p>
              <h1 className="font-black text-4xl lg:text-5xl uppercase leading-tight">{vehicle.model}</h1>
            </div>

            {/* Price card */}
            <div className="py-5 px-6 rounded-xl bg-[#111] crown-border">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Asking Price</p>
              <p className="font-black text-4xl text-[#c0392b]">{fmt(vehicle.price)}</p>
              <p className="text-gray-600 text-xs mt-1">{fmt(vehicle.insurancePerDay)}/day insurance &bull; {vehicle.soldCount} units sold</p>
            </div>

            {/* Buy / Success */}
            {purchased ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-xl bg-green-500/10 border border-green-500/30 text-center"
              >
                <CheckCircle className="text-green-400 mx-auto mb-2" size={32} />
                <p className="text-green-400 font-bold text-lg mb-1">Purchase Confirmed!</p>
                <p className="text-gray-400 text-sm">Thank you, {buyerName}. Your vehicle is ready for pickup.</p>
                <Link href="/inventory" className="mt-4 inline-block text-[#c0392b] text-sm underline">
                  Browse More Vehicles
                </Link>
              </motion.div>
            ) : (
              <button
                onClick={() => { setShowModal(true); setError(''); }}
                disabled={!canBuy}
                className={`btn-crown w-full py-4 ${!canBuy ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {canBuy ? `Purchase for ${fmt(vehicle.price)}` : vehicle.status === 'reserved' ? 'Currently Reserved' : 'Already Sold'}
              </button>
            )}
          </motion.div>
        </div>

        {/* Spec grid — vex style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-12 card p-6"
        >
          <h2 className="font-bold text-sm uppercase tracking-widest text-[#c0392b] mb-6">Vehicle Specifications</h2>
          <SpecGrid specs={specs} />

          {/* Mod level visual rows */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Performance Mods', value: vehicle.performanceMods, icon: <Zap size={14} /> },
              { label: 'Security Mods', value: vehicle.securityMods, icon: <Shield size={14} /> },
              { label: 'Handling Mods', value: vehicle.handlingMods, icon: <Wrench size={14} /> },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a] border border-[#222]">
                <span className="text-[#c0392b]">{icon}</span>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wider">{label}</p>
                  <p className={`text-sm font-bold ${modColor(value)}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Buy Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#111] rounded-2xl p-8 max-w-md w-full crown-border shadow-2xl"
            >
              <h2 className="font-black text-2xl uppercase mb-1">Confirm Purchase</h2>
              <p className="text-gray-500 text-sm mb-6">
                {vehicle.brand} {vehicle.model} &mdash; <span className="text-[#c0392b] font-bold">{fmt(vehicle.price)}</span>
              </p>
              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">
                Your Character Name (IC)
              </label>
              <input
                type="text"
                placeholder="e.g. Marcus Holloway"
                value={buyerName}
                onChange={(e) => { setBuyerName(e.target.value); setError(''); }}
                className="lux-input mb-4"
              />
              {error && <p className="text-red-400 text-xs mb-4">{error}</p>}
              <div className="flex gap-3">
                <button onClick={handleBuy} className="btn-crown flex-1 py-3">Confirm</button>
                <button onClick={() => setShowModal(false)} className="btn-outline-crown flex-1 py-3">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
