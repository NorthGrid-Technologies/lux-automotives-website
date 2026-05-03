'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getPartners } from '@/lib/storage';
import { Partner } from '@/lib/types';
import PageTransition from '@/components/PageTransition';
import { Handshake } from 'lucide-react';

function PartnerCard({ partner, index }: { partner: Partner; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="card p-6 flex flex-col items-center text-center gap-4"
    >
      <div className="rounded-lg overflow-hidden bg-[#1a1a1a] p-3">
        <Image
          src={partner.logoUrl}
          alt={partner.name}
          width={120}
          height={60}
          className="h-12 w-auto object-contain"
          unoptimized
        />
      </div>
      <div>
        <h3 className="font-bold text-base mb-2">{partner.name}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{partner.description}</p>
      </div>
      {partner.website && partner.website !== '#' && (
        <a
          href={partner.website}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost py-2 px-4 text-xs"
        >
          Visit Website
        </a>
      )}
    </motion.div>
  );
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    setPartners(getPartners().filter((p) => p.active));
  }, []);

  return (
    <PageTransition>
      <div className="relative py-20 px-6 border-b border-[#1a1a1a] bg-[#0d0d0d] overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(192,57,43,0.07) 0%, transparent 60%)' }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-[#c0392b] text-xs uppercase tracking-[0.3em] mb-3">Trusted Allies</p>
          <h1 className="font-black text-5xl uppercase mb-4">Our Partners</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Lux Automotive works with the finest businesses in Los Santos to provide our clients with exclusive benefits.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {partners.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((p, i) => <PartnerCard key={p.id} partner={p} index={i} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <Handshake size={48} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No partners listed at this time.</p>
          </div>
        )}

        {/* Partnership CTA */}
        <div className="mt-16 p-8 rounded-xl bg-[#111] crown-border text-center">
          <h3 className="font-bold text-2xl uppercase mb-3">Interested in Partnering?</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            We work with businesses that share our commitment to quality and professionalism. Reach out to discuss a partnership.
          </p>
          <a href="/contact" className="btn-crown py-3 px-8 inline-flex">
            Contact Us
          </a>
        </div>
      </div>
    </PageTransition>
  );
}
