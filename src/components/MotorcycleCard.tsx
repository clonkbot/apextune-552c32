import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { useState } from "react";

interface MotorcycleCardProps {
  motorcycle: Doc<"motorcycles">;
  isSelected: boolean;
  onSelect: () => void;
}

type MaintenanceTask = Doc<"maintenanceTasks">;

export function MotorcycleCard({ motorcycle, isSelected, onSelect }: MotorcycleCardProps) {
  const tasks = useQuery(api.tasks.listByMotorcycle, { motorcycleId: motorcycle._id }) as MaintenanceTask[] | undefined;
  const generatePlan = useMutation(api.tasks.generateMaintenancePlan);
  const removeBike = useMutation(api.motorcycles.remove);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const pendingTasks = tasks?.filter((t: MaintenanceTask) => !t.completed) || [];
  const criticalTasks = pendingTasks.filter((t: MaintenanceTask) => t.priority === "critical" || t.priority === "high");

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      await generatePlan({ motorcycleId: motorcycle._id });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async () => {
    await removeBike({ id: motorcycle._id });
    setShowConfirmDelete(false);
  };

  // Generate brand-specific color accent
  const brandColors: Record<string, string> = {
    honda: "from-red-600 to-red-700",
    yamaha: "from-blue-600 to-blue-700",
    kawasaki: "from-green-600 to-green-700",
    suzuki: "from-blue-500 to-blue-600",
    ducati: "from-red-500 to-red-600",
    bmw: "from-blue-600 to-white",
    ktm: "from-orange-500 to-orange-600",
    triumph: "from-zinc-700 to-zinc-800",
    harley: "from-orange-600 to-black",
    indian: "from-red-700 to-black",
  };

  const brandColor = brandColors[motorcycle.make.toLowerCase()] || "from-amber-500 to-amber-600";

  return (
    <>
      <div
        className={`relative bg-zinc-900 border rounded-xl overflow-hidden transition-all cursor-pointer group ${
          isSelected ? "border-amber-500 ring-2 ring-amber-500/20" : "border-zinc-800 hover:border-zinc-700"
        }`}
        onClick={onSelect}
      >
        {/* Brand accent bar */}
        <div className={`h-1.5 bg-gradient-to-r ${brandColor}`} />

        <div className="p-4 md:p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="min-w-0 flex-1">
              {motorcycle.nickname && (
                <p className="text-xs text-amber-400 font-semibold uppercase tracking-wide mb-1">{motorcycle.nickname}</p>
              )}
              <h3 className="text-lg font-bold text-white truncate">{motorcycle.year} {motorcycle.make}</h3>
              <p className="text-zinc-400 truncate">{motorcycle.model}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setShowConfirmDelete(true); }}
              className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="text-sm font-medium text-white">{motorcycle.currentMileage.toLocaleString()} mi</span>
            </div>
          </div>

          {/* Task Summary */}
          <div className="flex items-center gap-3 mb-4">
            {criticalTasks.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-400 text-xs font-semibold rounded-lg">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></span>
                {criticalTasks.length} Critical
              </span>
            )}
            {pendingTasks.length > 0 && (
              <span className="text-xs text-zinc-500">{pendingTasks.length} pending tasks</span>
            )}
            {pendingTasks.length === 0 && tasks !== undefined && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                All caught up
              </span>
            )}
          </div>

          {/* Generate Plan Button */}
          {(!tasks || tasks.length === 0) && (
            <button
              onClick={(e) => { e.stopPropagation(); handleGeneratePlan(); }}
              disabled={isGenerating}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-sm font-bold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate AI Plan
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowConfirmDelete(false)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">Delete Motorcycle?</h3>
            <p className="text-zinc-400 text-sm text-center mb-6">
              This will permanently delete {motorcycle.year} {motorcycle.make} {motorcycle.model} and all associated maintenance tasks.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 py-2.5 border border-zinc-700 text-zinc-300 font-medium rounded-lg hover:bg-zinc-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-400 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
