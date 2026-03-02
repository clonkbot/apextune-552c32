import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Id, Doc } from "../../convex/_generated/dataModel";

type Part = Doc<"parts">;
type MaintenanceTask = Doc<"maintenanceTasks">;

export function PartsShop() {
  const parts = useQuery(api.parts.listAll) as Part[] | undefined;
  const tasks = useQuery(api.tasks.listAll) as MaintenanceTask[] | undefined;
  const markOrdered = useMutation(api.parts.markOrdered);
  const markDelivered = useMutation(api.parts.markDelivered);
  const removePart = useMutation(api.parts.remove);

  const [filter, setFilter] = useState<"all" | "pending" | "ordered" | "delivered">("pending");

  const filteredParts = parts?.filter((part: Part) => {
    if (filter === "pending") return !part.ordered;
    if (filter === "ordered") return part.ordered && !part.delivered;
    if (filter === "delivered") return part.delivered;
    return true;
  });

  // Group parts by task
  const taskMap = new Map<Id<"maintenanceTasks">, MaintenanceTask>(
    tasks?.map((t: MaintenanceTask) => [t._id, t]) || []
  );

  const groupedParts = filteredParts?.reduce((acc: Map<Id<"maintenanceTasks">, Part[]>, part: Part) => {
    const taskId = part.taskId;
    if (!acc.has(taskId)) {
      acc.set(taskId, []);
    }
    acc.get(taskId)!.push(part);
    return acc;
  }, new Map<Id<"maintenanceTasks">, Part[]>()) || new Map<Id<"maintenanceTasks">, Part[]>();

  const totalCost = filteredParts?.reduce((sum: number, part: Part) => sum + (part.estimatedPrice || 0) * part.quantity, 0) || 0;

  if (parts === undefined) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse">
            <div className="h-5 bg-zinc-800 rounded w-1/3 mb-3"></div>
            <div className="h-4 bg-zinc-800 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Parts Shop</h2>
          <p className="text-sm text-zinc-500">
            {filteredParts?.length || 0} items · ${totalCost.toFixed(2)} estimated
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg overflow-x-auto">
          {(["pending", "ordered", "delivered", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-all capitalize whitespace-nowrap ${
                filter === f
                  ? "bg-amber-500 text-zinc-950"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredParts?.length === 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 border-dashed rounded-xl p-8 md:p-12 text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No {filter === "all" ? "" : filter} parts</h3>
          <p className="text-zinc-500 text-sm">
            {filter === "pending"
              ? "No parts to order. Click 'Get Parts' on a task to generate a parts list."
              : filter === "ordered"
              ? "No parts currently on order."
              : filter === "delivered"
              ? "No delivered parts yet."
              : "Add parts through your maintenance tasks."}
          </p>
        </div>
      )}

      {/* Parts grouped by task */}
      {Array.from(groupedParts.entries()).map(([taskId, taskParts]: [Id<"maintenanceTasks">, Part[]]) => {
        const task = taskMap.get(taskId);
        if (!taskParts || taskParts.length === 0) return null;

        return (
          <div key={taskId} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {/* Task Header */}
            <div className="px-4 py-3 bg-zinc-800/50 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
                <span className="font-semibold text-white text-sm">
                  {task?.title || "Unknown Task"}
                </span>
              </div>
            </div>

            {/* Parts List */}
            <div className="divide-y divide-zinc-800">
              {taskParts.map((part: Part) => (
                <div key={part._id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-white">{part.name}</h4>
                      {part.partNumber && (
                        <span className="text-xs text-zinc-500 font-mono bg-zinc-800 px-2 py-0.5 rounded">
                          #{part.partNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-zinc-500">
                      <span>Qty: {part.quantity}</span>
                      {part.estimatedPrice && (
                        <span className="text-emerald-400 font-medium">
                          ${(part.estimatedPrice * part.quantity).toFixed(2)}
                        </span>
                      )}
                      {part.supplier && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {part.supplier}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {part.delivered ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-lg">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Delivered
                      </span>
                    ) : part.ordered ? (
                      <>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-lg">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                          Ordered
                        </span>
                        <button
                          onClick={() => markDelivered({ id: part._id })}
                          className="px-3 py-1.5 bg-emerald-500 text-zinc-950 text-xs font-semibold rounded-lg hover:bg-emerald-400 transition-all"
                        >
                          Mark Delivered
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => markOrdered({ id: part._id })}
                          className="px-3 py-1.5 bg-amber-500 text-zinc-950 text-xs font-semibold rounded-lg hover:bg-amber-400 transition-all"
                        >
                          Mark Ordered
                        </button>
                        <button
                          onClick={() => removePart({ id: part._id })}
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Summary Card */}
      {filteredParts && filteredParts.length > 0 && (
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-white mb-1">Order Summary</h3>
              <p className="text-sm text-zinc-400">
                {filteredParts.filter((p: Part) => !p.ordered).length} items pending order
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Estimated Total</p>
              <p className="text-2xl font-bold text-amber-400">${totalCost.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
