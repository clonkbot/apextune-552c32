import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id, Doc } from "../../convex/_generated/dataModel";
import { useState } from "react";

interface TaskListProps {
  motorcycleId: Id<"motorcycles"> | null;
}

type MaintenanceTask = Doc<"maintenanceTasks">;

const categoryIcons: Record<string, string> = {
  oil: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
  chain: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
  brakes: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  tires: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  air_filter: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z",
  spark_plugs: "M13 10V3L4 14h7v7l9-11h-7z",
  coolant: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  general: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
};

const priorityColors: Record<string, { bg: string; text: string; dot: string }> = {
  critical: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
  high: { bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-400" },
  medium: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  low: { bg: "bg-zinc-500/10", text: "text-zinc-400", dot: "bg-zinc-400" },
};

export function TaskList({ motorcycleId }: TaskListProps) {
  const allTasks = useQuery(api.tasks.listAll) as MaintenanceTask[] | undefined;
  const motorcycleTasks = useQuery(
    api.tasks.listByMotorcycle,
    motorcycleId ? { motorcycleId } : "skip"
  ) as MaintenanceTask[] | undefined;
  const completeTask = useMutation(api.tasks.complete);
  const snoozeTask = useMutation(api.tasks.snooze);
  const generateParts = useMutation(api.parts.generatePartsForTask);

  const [filter, setFilter] = useState<"all" | "pending" | "completed">("pending");
  const [expandedTask, setExpandedTask] = useState<Id<"maintenanceTasks"> | null>(null);

  const tasks = motorcycleId ? motorcycleTasks : allTasks;

  const filteredTasks = tasks?.filter((task: MaintenanceTask) => {
    if (filter === "pending") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  }).sort((a: MaintenanceTask, b: MaintenanceTask) => {
    // Sort by priority first (critical > high > medium > low)
    const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    const aPriority = priorityOrder[a.priority] ?? 4;
    const bPriority = priorityOrder[b.priority] ?? 4;
    if (aPriority !== bPriority) return aPriority - bPriority;
    // Then by due date
    const aDate = a.dueDate || Infinity;
    const bDate = b.dueDate || Infinity;
    return aDate - bDate;
  });

  const handleComplete = async (taskId: Id<"maintenanceTasks">) => {
    await completeTask({ id: taskId });
    setExpandedTask(null);
  };

  const handleSnooze = async (taskId: Id<"maintenanceTasks">, days: number) => {
    await snoozeTask({
      id: taskId,
      snoozedUntil: Date.now() + (days * 24 * 60 * 60 * 1000)
    });
    setExpandedTask(null);
  };

  const handleGenerateParts = async (taskId: Id<"maintenanceTasks">) => {
    await generateParts({ taskId });
  };

  if (tasks === undefined) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse">
            <div className="h-5 bg-zinc-800 rounded w-2/3 mb-3"></div>
            <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
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
          <h2 className="text-xl font-bold text-white">Maintenance Tasks</h2>
          <p className="text-sm text-zinc-500">
            {filteredTasks?.length || 0} {filter === "all" ? "total" : filter} tasks
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg">
          {(["pending", "completed", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all capitalize ${
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

      {/* Task List */}
      {filteredTasks?.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 border-dashed rounded-xl p-8 md:p-12 text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No {filter} tasks</h3>
          <p className="text-zinc-500 text-sm">
            {filter === "pending"
              ? "You're all caught up! No maintenance tasks pending."
              : filter === "completed"
              ? "No completed tasks yet."
              : "Add a motorcycle and generate a maintenance plan to get started."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks?.map((task: MaintenanceTask) => {
            const isExpanded = expandedTask === task._id;
            const colors = priorityColors[task.priority] || priorityColors.low;
            const icon = categoryIcons[task.category] || categoryIcons.general;

            return (
              <div
                key={task._id}
                className={`bg-zinc-900 border rounded-xl overflow-hidden transition-all ${
                  isExpanded ? "border-amber-500/50" : "border-zinc-800 hover:border-zinc-700"
                } ${task.completed ? "opacity-60" : ""}`}
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedTask(isExpanded ? null : task._id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colors.bg}`}>
                      <svg className={`w-5 h-5 ${colors.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className={`font-semibold ${task.completed ? "text-zinc-500 line-through" : "text-white"}`}>
                          {task.title}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold uppercase ${colors.bg} ${colors.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} ${task.priority === "critical" ? "animate-pulse" : ""}`}></span>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-500 line-clamp-1">{task.description}</p>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-zinc-500">
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                        {task.dueMileage && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            {task.dueMileage.toLocaleString()} mi
                          </span>
                        )}
                        {task.estimatedCost !== undefined && task.estimatedCost > 0 && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            ${task.estimatedCost}
                          </span>
                        )}
                        {task.estimatedTime && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {task.estimatedTime}
                          </span>
                        )}
                      </div>
                    </div>

                    <svg
                      className={`w-5 h-5 text-zinc-500 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Actions */}
                {isExpanded && !task.completed && (
                  <div className="px-4 pb-4 pt-2 border-t border-zinc-800">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleComplete(task._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-zinc-950 text-sm font-semibold rounded-lg hover:bg-emerald-400 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Mark Complete
                      </button>

                      <button
                        onClick={() => handleGenerateParts(task._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white text-sm font-semibold rounded-lg hover:bg-zinc-700 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Get Parts
                      </button>

                      <div className="relative group">
                        <button className="flex items-center gap-2 px-4 py-2 border border-zinc-700 text-zinc-300 text-sm font-semibold rounded-lg hover:bg-zinc-800 transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Snooze
                        </button>
                        <div className="absolute top-full left-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[120px]">
                          {[1, 3, 7, 14].map((days) => (
                            <button
                              key={days}
                              onClick={() => handleSnooze(task._id, days)}
                              className="w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
                            >
                              {days} day{days > 1 ? "s" : ""}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
