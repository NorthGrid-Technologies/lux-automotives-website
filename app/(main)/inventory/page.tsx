'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getInventory } from '@/lib/storage';
import { Vehicle, VehicleClass, VehicleStatus } from '@/lib/types';
import VehicleCard from '@/components/VehicleCard';
import PageTransition from '@/components/PageTransition';
import { Search } from 'lucide-react';

const ALL_CLASSES: VehicleClass[] = ['Super', 'Sports', 'Muscle', 'SUV'];
const ALL_STATUSES: VehicleStatus[] = ['available', 'reserved', 'sold'];

type SortKey = 'price-asc' | 'price-desc' | 'mileage-asc' | 'name-asc';
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'mileage-asc', label: 'Lowest Mileage' },
  { value: 'name-asc', label: 'Name A–Z' },
];

function sortVehicles(cars: Vehicle[], sort: SortKey): Vehicle[] {
  return [...cars].sort((a, b) => {
    switch (sort) {
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'mileage-asc': return a.mileage - b.mileage;
      case 'name-asc': return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`);
    }
  });
}

function InventoryContent() {
  const searchParams = useSearchParams();
  const initialClass = searchParams.get('class') as VehicleClass | null;

  const [inventory, setInventory] = useState<Vehicle[]>([]);
  const [activeClass, setActiveClass] = useState<VehicleClass | 'All'>((initialClass as VehicleClass) || 'All');
  const [activeStatus, setActiveStatus] = useState<VehicleStatus | 'All'>('All');
  const [sort, setSort] = useState<SortKey>('price-desc');
  const [search, setSearch] = useState('');

  useEffect(() => { setInventory(getInventory()); }, []);

  const filtered = useMemo(() => {
    let cars = inventory;
    if (activeClass !== 'All') cars = cars.filter((c) => c.class === activeClass);
    if (activeStatus !== 'All') cars = cars.filter((c) => c.status === activeStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      cars = cars.filter((c) => c.brand.toLowerCase().includes(q) || c.model.toLowerCase().includes(q) || c.plate.toLowerCase().includes(q));
    }
    return sortVehicles(cars, sort);
  }, [inventory, activeClass, activeStatus, sort, search]);

  return (
    <PageTransition>
      {/* Header */}
      <div className="relative py-20 px-6 border-b border-[#1a1a1a] bg-[#0d0d0d] overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(192,57,43,0.07) 0%, transparent 60%)' }}
        />
        <div className="relative max-w-7xl mx-auto">
          <p className="text-[#c0392b] text-xs uppercase tracking-[0.4em] mb-3">Browse</p>
          <h1 className="font-black text-5xl uppercase mb-3">Our Inventory</h1>
          <p className="text-gray-400">{inventory.length} vehicles in Los Santos</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={15} />
            <input
              type="text"
              placeholder="Search brand, model, or plate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="lux-input pl-9"
            />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="lux-input lg:w-52">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Class tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(['All', ...ALL_CLASSES] as const).map((cls) => (
            <button
              key={cls}
              onClick={() => setActiveClass(cls)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border transition-all ${
                activeClass === cls
                  ? 'bg-[#c0392b] text-white border-[#c0392b]'
                  : 'bg-transparent border-[#2a2a2a] text-gray-500 hover:border-[#c0392b]/40 hover:text-[#c0392b]/80'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>

        {/* Status tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(['All', ...ALL_STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={`px-3 py-1 rounded text-xs font-medium border transition-all ${
                activeStatus === s
                  ? 'bg-white/10 border-white/30 text-white'
                  : 'bg-transparent border-[#2a2a2a] text-gray-600 hover:border-white/20 hover:text-gray-400'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <p className="text-gray-600 text-sm mb-6">
          Showing <span className="text-[#c0392b] font-semibold">{filtered.length}</span>{' '}
          {filtered.length === 1 ? 'vehicle' : 'vehicles'}
        </p>

        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((v, i) => <VehicleCard key={v.id} vehicle={v} index={i} />)}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-5xl mb-4">🚗</p>
              <p className="text-gray-500 text-lg">No vehicles match your filters.</p>
              <button
                onClick={() => { setActiveClass('All'); setActiveStatus('All'); setSearch(''); }}
                className="mt-4 text-[#c0392b] text-sm underline"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <InventoryContent />
    </Suspense>
  );
}
