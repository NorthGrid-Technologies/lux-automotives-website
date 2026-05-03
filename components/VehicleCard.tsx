'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Vehicle } from '@/lib/types';
import ClassBadge from './ClassBadge';
import StatusBadge from './StatusBadge';
import { Gauge, Zap } from 'lucide-react';

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US');
}

export default function VehicleCard({ vehicle, index }: { vehicle: Vehicle; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="card overflow-hidden group"
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <Image
          src={vehicle.imageUrl}
          alt={`${vehicle.brand} ${vehicle.model}`}
          width={800}
          height={450}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <ClassBadge cls={vehicle.class} />
        </div>
        <div className="absolute top-3 right-3">
          <StatusBadge status={vehicle.status} />
        </div>
        {vehicle.featured && (
          <div className="absolute bottom-3 left-3">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#c0392b]/80 text-white border border-[#c0392b]/50">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-[#c0392b] text-xs uppercase tracking-widest mb-0.5">{vehicle.brand}</p>
        <h3 className="font-bold text-lg leading-tight mb-3">{vehicle.model}</h3>

        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Gauge size={12} />
            {vehicle.mileage.toLocaleString()} mi
          </span>
          <span className="flex items-center gap-1">
            <Zap size={12} />
            {vehicle.fuelType}
          </span>
          <span>{vehicle.plate}</span>
        </div>

        <div className="flex items-center justify-between">
          <p className="font-bold text-xl text-white">{fmt(vehicle.price)}</p>
          <Link
            href={`/inventory/${vehicle.id}`}
            className="btn-outline-crown py-1.5 px-4 text-xs"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
