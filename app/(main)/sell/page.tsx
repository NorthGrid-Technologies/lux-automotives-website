'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveSellRequest } from '@/lib/storage';
import PageTransition from '@/components/PageTransition';
import { CheckCircle } from 'lucide-react';

const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'];

interface FormData {
  name: string;
  phone: string;
  brand: string;
  model: string;
  year: string;
  color: string;
  plate: string;
  askingPrice: string;
  condition: string;
  notes: string;
}

const EMPTY: FormData = {
  name: '', phone: '', brand: '', model: '', year: '',
  color: '', plate: '', askingPrice: '', condition: '', notes: '',
};

// ── Defined at module level so the reference is stable across renders ─────────
function Field({
  label,
  placeholder,
  type = 'text',
  value,
  error,
  onChange,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="block text-gray-500 text-xs uppercase tracking-wider mb-1.5">
        {label} <span className="text-[#c0392b]">*</span>
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="lux-input"
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function SellPage() {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitted, setSubmitted] = useState(false);

  function setField(key: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };
  }

  function validate(): boolean {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.brand.trim()) e.brand = 'Required';
    if (!form.model.trim()) e.model = 'Required';
    if (!form.year || isNaN(Number(form.year)) || Number(form.year) < 1990) e.year = 'Enter a valid year (1990+)';
    if (!form.color.trim()) e.color = 'Required';
    if (!form.plate.trim()) e.plate = 'Required';
    if (!form.askingPrice || isNaN(Number(form.askingPrice)) || Number(form.askingPrice) <= 0) e.askingPrice = 'Enter a valid price';
    if (!form.condition) e.condition = 'Select a condition';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    saveSellRequest({
      name: form.name.trim(),
      phone: form.phone.trim(),
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      color: form.color.trim(),
      plate: form.plate.trim(),
      askingPrice: Number(form.askingPrice),
      condition: form.condition,
      notes: form.notes.trim(),
    });
    setSubmitted(true);
  }

  return (
    <PageTransition>
      <div className="relative py-20 px-6 border-b border-[#1a1a1a] bg-[#0d0d0d] overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(192,57,43,0.07) 0%, transparent 60%)' }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="text-[#c0392b] text-xs uppercase tracking-[0.3em] mb-3">We Pay Top Dollar</p>
          <h1 className="font-black text-5xl uppercase mb-4">Sell Your Vehicle</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Submit your vehicle details and our team will reach out with a competitive offer within 24 hours.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 px-8 rounded-2xl bg-[#111] crown-border"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-[#c0392b]/10 border border-[#c0392b]/30 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="text-[#c0392b]" size={32} />
              </motion.div>
              <h2 className="font-black text-3xl uppercase mb-3">Request Submitted!</h2>
              <p className="text-gray-400 mb-2">
                Thank you, <span className="text-[#c0392b] font-semibold">{form.name}</span>.
              </p>
              <p className="text-gray-500 text-sm mb-8">
                We&apos;ll review your {form.brand} {form.model} and contact you at {form.phone} within 24 hours.
              </p>
              <button
                onClick={() => { setForm(EMPTY); setSubmitted(false); }}
                className="btn-outline-crown text-sm"
              >
                Submit Another Vehicle
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              {/* Contact Info */}
              <fieldset className="p-6 rounded-xl bg-[#111] crown-border space-y-4">
                <legend className="font-bold text-[#c0392b]/80 text-xs uppercase tracking-widest px-2">
                  Your Details
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Character Name"
                    placeholder="Marcus Holloway"
                    value={form.name}
                    error={errors.name}
                    onChange={setField('name')}
                  />
                  <Field
                    label="Phone / Contact"
                    placeholder="555-0100"
                    value={form.phone}
                    error={errors.phone}
                    onChange={setField('phone')}
                  />
                </div>
              </fieldset>

              {/* Vehicle Info */}
              <fieldset className="p-6 rounded-xl bg-[#111] crown-border space-y-4">
                <legend className="font-bold text-[#c0392b]/80 text-xs uppercase tracking-widest px-2">
                  Vehicle Details
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Brand"
                    placeholder="e.g. Pegassi"
                    value={form.brand}
                    error={errors.brand}
                    onChange={setField('brand')}
                  />
                  <Field
                    label="Model"
                    placeholder="e.g. Zentorno"
                    value={form.model}
                    error={errors.model}
                    onChange={setField('model')}
                  />
                  <Field
                    label="Year"
                    placeholder="2024"
                    type="number"
                    value={form.year}
                    error={errors.year}
                    onChange={setField('year')}
                  />
                  <Field
                    label="Color"
                    placeholder="Matte Black"
                    value={form.color}
                    error={errors.color}
                    onChange={setField('color')}
                  />
                  <Field
                    label="Plate Number"
                    placeholder="e.g. ZEN-001"
                    value={form.plate}
                    error={errors.plate}
                    onChange={setField('plate')}
                  />
                  <Field
                    label="Asking Price ($)"
                    placeholder="725000"
                    type="number"
                    value={form.askingPrice}
                    error={errors.askingPrice}
                    onChange={setField('askingPrice')}
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs uppercase tracking-wider mb-1.5">
                    Condition <span className="text-[#c0392b]">*</span>
                  </label>
                  <select value={form.condition} onChange={setField('condition')} className="lux-input">
                    <option value="">Select condition...</option>
                    {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.condition && <p className="text-red-400 text-xs mt-1">{errors.condition}</p>}
                </div>
              </fieldset>

              {/* Notes */}
              <fieldset className="p-6 rounded-xl bg-[#111] crown-border">
                <legend className="font-bold text-[#c0392b]/80 text-xs uppercase tracking-widest px-2 mb-4">
                  Additional Notes
                </legend>
                <textarea
                  rows={4}
                  placeholder="Any mods, damage, or special details about your vehicle..."
                  value={form.notes}
                  onChange={setField('notes')}
                  className="lux-input resize-none"
                />
              </fieldset>

              <button type="submit" className="btn-crown w-full py-4">
                Submit Sell Request
              </button>
              <p className="text-gray-600 text-xs text-center">
                By submitting, you agree this is an in-character request for GTA World RP purposes only.
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
