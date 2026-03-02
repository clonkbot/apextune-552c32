import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { MotorcycleCard } from "./MotorcycleCard";
import { AddMotorcycleModal } from "./AddMotorcycleModal";
import { TaskList } from "./TaskList";
import { PartsShop } from "./PartsShop";
import { Id, Doc } from "../../convex/_generated/dataModel";

type Tab = "dashboard" | "tasks" | "parts";
type MaintenanceTask = Doc<"maintenanceTasks">;
type Motorcycle = Doc<"motorcycles">;

export function Dashboard() {
  const { signOut } = useAuthActions();
  const motorcycles = useQuery(api.motorcycles.list) as Motorcycle[] | undefined;
  const upcomingTasks = useQuery(api.tasks.listUpcoming) as MaintenanceTask[] | undefined;
  const [showAddBike, setShowAddBike] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [selectedBikeId, setSelectedBikeId] = useState<Id<"motorcycles"> | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const criticalTasks = upcomingTasks?.filter((t: MaintenanceTask) => t.priority === "critical" || t.priority === "high") || [];
  const totalTasks = upcomingTasks?.length || 0;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center transform -rotate-3">
              <svg className="w-6 h-6 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black text-white tracking-tight">APEX<span className="text-amber-400">TUNE</span></h1>
              <p className="text-[10px] text-zinc-500 font-mono tracking-[0.15em] -mt-0.5">PRECISION MAINTENANCE</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900 p-1 rounded-lg">
            {[
              { id: "dashboard" as Tab, label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
              { id: "tasks" as Tab, label: "Tasks", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
              { id: "parts" as Tab, label: "Parts", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-amber-500 text-zinc-950"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => signOut()}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-sm">
            <nav className="p-2 space-y-1">
              {[
                { id: "dashboard" as Tab, label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
                { id: "tasks" as Tab, label: "Tasks", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
                { id: "parts" as Tab, label: "Parts", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeTab === tab.id
                      ? "bg-amber-500 text-zinc-950"
                      : "text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              ))}
              <button
                onClick={() => { signOut(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-400 hover:bg-zinc-800 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-xl p-4 md:p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wide">Bikes</span>
                  <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-black text-white">{motorcycles?.length || 0}</p>
              </div>

              <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-xl p-4 md:p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wide">Pending</span>
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-black text-white">{totalTasks}</p>
              </div>

              <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-xl p-4 md:p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wide">Critical</span>
                  <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-black text-white">{criticalTasks.length}</p>
              </div>

              <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-xl p-4 md:p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wide">Health</span>
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-black text-emerald-500">{criticalTasks.length === 0 ? "100%" : `${Math.max(0, 100 - criticalTasks.length * 15)}%`}</p>
              </div>
            </div>

            {/* Motorcycles Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-1 h-5 bg-amber-500 rounded-full"></span>
                  Your Motorcycles
                </h2>
                <button
                  onClick={() => setShowAddBike(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-amber-500 text-zinc-950 text-sm font-bold rounded-lg hover:bg-amber-400 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Add Bike</span>
                </button>
              </div>

              {motorcycles === undefined ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse">
                      <div className="h-6 bg-zinc-800 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : motorcycles.length === 0 ? (
                <div className="bg-zinc-900/50 border border-zinc-800 border-dashed rounded-xl p-8 md:p-12 text-center">
                  <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No motorcycles yet</h3>
                  <p className="text-zinc-500 text-sm mb-4">Add your first motorcycle to get personalized maintenance plans</p>
                  <button
                    onClick={() => setShowAddBike(true)}
                    className="px-5 py-2.5 bg-amber-500 text-zinc-950 font-bold rounded-lg hover:bg-amber-400 transition-all"
                  >
                    Add Your First Bike
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {motorcycles.map((moto: Motorcycle) => (
                    <MotorcycleCard
                      key={moto._id}
                      motorcycle={moto}
                      isSelected={selectedBikeId === moto._id}
                      onSelect={() => setSelectedBikeId(selectedBikeId === moto._id ? null : moto._id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Upcoming Tasks Preview */}
            {upcomingTasks && upcomingTasks.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                    Upcoming Maintenance
                  </h2>
                  <button
                    onClick={() => setActiveTab("tasks")}
                    className="text-sm text-zinc-400 hover:text-amber-400 transition-colors flex items-center gap-1"
                  >
                    View All
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-2">
                  {upcomingTasks.slice(0, 3).map((task: MaintenanceTask) => (
                    <div
                      key={task._id}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 hover:border-zinc-700 transition-all"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        task.priority === "critical" ? "bg-red-500/10 text-red-400" :
                        task.priority === "high" ? "bg-orange-500/10 text-orange-400" :
                        task.priority === "medium" ? "bg-amber-500/10 text-amber-400" :
                        "bg-zinc-800 text-zinc-400"
                      }`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{task.title}</p>
                        <p className="text-sm text-zinc-500 truncate">{task.description}</p>
                      </div>
                      {task.dueDate && (
                        <div className="text-right shrink-0 hidden sm:block">
                          <p className="text-xs text-zinc-500">Due</p>
                          <p className="text-sm font-medium text-white">
                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === "tasks" && (
          <TaskList motorcycleId={selectedBikeId} />
        )}

        {activeTab === "parts" && (
          <PartsShop />
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-zinc-900">
        <p className="text-zinc-600 text-xs">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>

      {/* Add Motorcycle Modal */}
      {showAddBike && (
        <AddMotorcycleModal onClose={() => setShowAddBike(false)} />
      )}
    </div>
  );
}
