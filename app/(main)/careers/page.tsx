'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getCareers } from '@/lib/storage';
import { Career } from '@/lib/types';
import PageTransition from '@/components/PageTransition';
import { Briefcase, ChevronDown, ChevronUp } from 'lucide-react';

function CareerCard({ career, index }: { career: Career; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="card overflow-hidden"
    >
      <button
        className="w-full text-left p-6 flex items-start justify-between gap-4 hover:bg-[#1a1a1a] transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#c0392b]/10 border border-[#c0392b]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Briefcase size={18} className="text-[#c0392b]" />
          </div>
          <div>
            <p className="font-bold text-base">{career.title}</p>
            <p className="text-[#c0392b] text-xs uppercase tracking-wider mt-0.5">{career.department}</p>
          </div>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-500 flex-shrink-0 mt-1" /> : <ChevronDown size={18} className="text-gray-500 flex-shrink-0 mt-1" />}
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-6 pb-6 border-t border-[#1e1e1e]"
        >
          <div className="pt-4 space-y-4">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">Description</p>
              <p className="text-gray-300 text-sm leading-relaxed">{career.description}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">Requirements</p>
              <p className="text-gray-400 text-sm leading-relaxed">{career.requirements}</p>
            </div>
            <a
              href="/contact"
              className="btn-crown py-2.5 px-6 text-xs inline-flex"
            >
              Apply via Contact Form
            </a>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function CareersPage() {
  const [careers, setCareers] = useState<Career[]>([]);

  useEffect(() => {
    setCareers(getCareers().filter((c) => c.active));
  }, []);

  return (
    <PageTransition>
      <div className="relative py-20 px-6 border-b border-[#1a1a1a] bg-[#0d0d0d] overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(192,57,43,0.07) 0%, transparent 60%)' }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-[#c0392b] text-xs uppercase tracking-[0.3em] mb-3">Join Our Team</p>
          <h1 className="font-black text-5xl uppercase mb-4">Careers</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Lux Automotive is always looking for driven, professional individuals to represent our brand in Los Santos.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {careers.length > 0 ? (
          <>
            <p className="text-gray-600 text-sm mb-8">
              <span className="text-[#c0392b] font-semibold">{careers.length}</span> open position{careers.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-4">
              {careers.map((c, i) => <CareerCard key={c.id} career={c} index={i} />)}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <Briefcase size={48} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No open positions at this time.</p>
            <p className="text-gray-600 text-sm mt-2">Check back soon or contact us to express your interest.</p>
          </div>
        )}

        {/* General application note */}
        <div className="mt-16 p-6 rounded-xl bg-[#111] crown-border text-center">
          <h3 className="font-bold text-lg mb-2">Don&apos;t see your role?</h3>
          <p className="text-gray-500 text-sm mb-4">
            We occasionally hire for unlisted positions. Reach out and introduce yourself.
          </p>
          <a href="/contact" className="btn-outline-crown py-2.5 px-6 text-xs inline-flex">
            Get In Touch
          </a>
        </div>
      </div>
    </PageTransition>
  );
}
