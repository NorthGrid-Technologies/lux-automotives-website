'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveMessage } from '@/lib/storage';
import PageTransition from '@/components/PageTransition';
import { CheckCircle, MapPin, Phone, Clock } from 'lucide-react';

interface FormData {
  name: string;
  phone: string;
  subject: string;
  message: string;
}

const EMPTY: FormData = { name: '', phone: '', subject: '', message: '' };

export default function ContactPage() {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitted, setSubmitted] = useState(false);

  function validate(): boolean {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.subject.trim()) e.subject = 'Required';
    if (!form.message.trim()) e.message = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    saveMessage({
      name: form.name.trim(),
      phone: form.phone.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    });
    setSubmitted(true);
  }

  function set(key: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setErrors((err) => ({ ...err, [key]: undefined }));
    };
  }

  return (
    <PageTransition>
      <div className="relative py-20 px-6 border-b border-[#1a1a1a] bg-[#0d0d0d] overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(192,57,43,0.07) 0%, transparent 60%)' }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-[#c0392b] text-xs uppercase tracking-[0.3em] mb-3">Reach Out</p>
          <h1 className="font-black text-5xl uppercase mb-4">Contact Us</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Have a question, want to apply, or interested in a partnership? We&apos;d love to hear from you.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact info */}
        <div className="space-y-6">
          {[
            { icon: <MapPin size={18} />, label: 'Location', value: 'Rockford Hills, Los Santos, San Andreas' },
            { icon: <Phone size={18} />, label: 'In-Character', value: 'Contact via /phone in-game' },
            { icon: <Clock size={18} />, label: 'Hours', value: 'Open during peak server hours' },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#c0392b]/10 border border-[#c0392b]/30 flex items-center justify-center flex-shrink-0 text-[#c0392b]">
                {icon}
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-gray-300 text-sm">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 px-8 rounded-2xl bg-[#111] crown-border"
              >
                <CheckCircle className="text-[#c0392b] mx-auto mb-4" size={48} />
                <h2 className="font-black text-2xl uppercase mb-3">Message Sent!</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Thank you, <span className="text-[#c0392b] font-semibold">{form.name}</span>. We&apos;ll be in touch soon.
                </p>
                <button onClick={() => { setForm(EMPTY); setSubmitted(false); }} className="btn-outline-crown text-sm">
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="card p-6 space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-500 text-xs uppercase tracking-wider mb-1.5">
                      Name <span className="text-[#c0392b]">*</span>
                    </label>
                    <input type="text" placeholder="Marcus Holloway" value={form.name} onChange={set('name')} className="lux-input" />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs uppercase tracking-wider mb-1.5">
                      Phone / Contact <span className="text-[#c0392b]">*</span>
                    </label>
                    <input type="text" placeholder="555-0100" value={form.phone} onChange={set('phone')} className="lux-input" />
                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-500 text-xs uppercase tracking-wider mb-1.5">
                    Subject <span className="text-[#c0392b]">*</span>
                  </label>
                  <input type="text" placeholder="e.g. Career Application, Partnership Inquiry..." value={form.subject} onChange={set('subject')} className="lux-input" />
                  {errors.subject && <p className="text-red-400 text-xs mt-1">{errors.subject}</p>}
                </div>
                <div>
                  <label className="block text-gray-500 text-xs uppercase tracking-wider mb-1.5">
                    Message <span className="text-[#c0392b]">*</span>
                  </label>
                  <textarea rows={5} placeholder="Your message..." value={form.message} onChange={set('message')} className="lux-input resize-none" />
                  {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
                </div>
                <button type="submit" className="btn-crown w-full py-3.5">
                  Send Message
                </button>
                <p className="text-gray-600 text-xs text-center">
                  GTA World RP — In-character purposes only.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
