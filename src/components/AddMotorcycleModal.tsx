import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

interface AddMotorcycleModalProps {
  onClose: () => void;
}

const popularBrands = [
  "Honda", "Yamaha", "Kawasaki", "Suzuki", "Ducati", "BMW", "KTM", "Triumph", "Harley-Davidson", "Indian", "Aprilia", "MV Agusta"
];

export function AddMotorcycleModal({ onClose }: AddMotorcycleModalProps) {
  const createMotorcycle = useMutation(api.motorcycles.create);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    currentMileage: 0,
    nickname: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.make || !form.model) return;

    setIsSubmitting(true);
    try {
      await createMotorcycle({
        make: form.make,
        model: form.model,
        year: form.year,
        currentMileage: form.currentMileage,
        nickname: form.nickname || undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar for mobile */}
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Add Motorcycle</h2>
            <p className="text-sm text-zinc-500">Enter your bike's details</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Brand Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
              Make / Brand
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {popularBrands.slice(0, 6).map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => setForm({ ...form, make: brand })}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    form.make === brand
                      ? "bg-amber-500 text-zinc-950"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={form.make}
              onChange={(e) => setForm({ ...form, make: e.target.value })}
              placeholder="Or type brand name..."
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
              Model
            </label>
            <input
              type="text"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              placeholder="e.g. CBR600RR, MT-07, Ninja 400"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>

          {/* Year & Mileage Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                Year
              </label>
              <select
                value={form.year}
                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all appearance-none cursor-pointer"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                Current Mileage
              </label>
              <input
                type="number"
                value={form.currentMileage}
                onChange={(e) => setForm({ ...form, currentMileage: parseInt(e.target.value) || 0 })}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Nickname (optional) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
              Nickname <span className="text-zinc-600">(optional)</span>
            </label>
            <input
              type="text"
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              placeholder="e.g. The Beast, Daily Rider"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-zinc-700 text-zinc-300 font-medium rounded-lg hover:bg-zinc-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !form.make || !form.model}
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Adding..." : "Add Motorcycle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
