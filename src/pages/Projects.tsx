import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Plus,
  X,
  FolderKanban,
  CheckCircle2,
  Clock,
  PauseCircle,
  Ban,
  TrendingUp,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  planning: { label: "Planning", icon: Clock, color: "text-[#9E9E9E]" },
  in_progress: { label: "In Progress", icon: FolderKanban, color: "text-[#42A5F5]" },
  on_hold: { label: "On Hold", icon: PauseCircle, color: "text-[#FFB300]" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-[#00E676]" },
  cancelled: { label: "Cancelled", icon: Ban, color: "text-[#EF5350]" },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "text-[#9E9E9E]" },
  medium: { label: "Medium", color: "text-[#FFB300]" },
  high: { label: "High", color: "text-[#FF9800]" },
  urgent: { label: "Urgent", color: "text-[#EF5350]" },
};

export default function Projects() {
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const { data, refetch } = trpc.project.list.useQuery(
    statusFilter ? { status: statusFilter } : {}
  );
  const { data: stats } = trpc.project.getStats.useQuery();

  const createProject = trpc.project.create.useMutation({
    onSuccess: () => {
      setShowAddModal(false);
      refetch();
    },
  });

  const [formData, setFormData] = useState({
    projectCode: "",
    title: "",
    description: "",
    budget: "",
    startDate: "",
    endDate: "",
    priority: "medium" as const,
    services: "" as string,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProject.mutate({
      projectCode: formData.projectCode,
      title: formData.title,
      description: formData.description || undefined,
      budget: formData.budget ? Number(formData.budget) : undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      priority: formData.priority,
      services: formData.services ? formData.services.split(",").map((s) => s.trim()) : undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Projects</h1>
          <p className="text-sm text-[#9E9E9E] mt-0.5">
            {stats?.total ?? 0} projects · {stats?.inProgress ?? 0} active · R{stats?.totalRevenue?.toLocaleString("en-ZA") ?? 0} total revenue
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 h-10 bg-[#00E676] text-black rounded-xl text-sm font-semibold hover:bg-[#69F0AE] transition-colors self-start"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Revenue", value: `R${stats?.totalRevenue?.toLocaleString("en-ZA") ?? 0}`, icon: TrendingUp, color: "text-[#00E676]" },
          { label: "Received", value: `R${stats?.totalReceived?.toLocaleString("en-ZA") ?? 0}`, icon: Wallet, color: "text-[#42A5F5]" },
          { label: "Outstanding", value: `R${stats?.totalOutstanding?.toLocaleString("en-ZA") ?? 0}`, icon: AlertTriangle, color: "text-[#FFB300]" },
          { label: "Completed", value: `${stats?.completed ?? 0}`, icon: CheckCircle2, color: "text-[#00E676]" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#141414] border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon size={14} className={stat.color} />
              <span className="text-xs text-[#616161]">{stat.label}</span>
            </div>
            <p className="text-lg font-semibold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setStatusFilter("")}
          className={`px-3 h-8 rounded-lg text-xs font-medium transition-colors ${!statusFilter ? "bg-[#00E676] text-black" : "bg-[#141414] text-[#9E9E9E] hover:bg-[#1A1A1A]"}`}
        >
          All
        </button>
        {Object.entries(statusConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-3 h-8 rounded-lg text-xs font-medium transition-colors ${statusFilter === key ? "bg-[#00E676] text-black" : "bg-[#141414] text-[#9E9E9E] hover:bg-[#1A1A1A]"}`}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data?.projects.map((project) => {
          const status = statusConfig[project.status] ?? statusConfig.planning;
          const StatusIcon = status.icon;
          const progress = project.budget && project.actualCost
            ? Math.min(100, (Number(project.actualCost) / Number(project.budget)) * 100)
            : 0;

          return (
            <motion.div
              key={project.id}
              layout
              className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <StatusIcon size={16} className={status.color} />
                  <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                </div>
                <span className="text-xs text-[#616161]">{project.projectCode}</span>
              </div>

              <h3 className="text-base font-medium text-white mb-1">{project.title}</h3>
              {project.description && (
                <p className="text-xs text-[#616161] line-clamp-2 mb-3">{project.description}</p>
              )}

              {/* Services tags */}
              {project.services && Array.isArray(project.services) && project.services.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {(project.services as string[]).slice(0, 3).map((service, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[#00E676]/10 text-[#00E676]">
                      {service}
                    </span>
                  ))}
                  {Array.isArray(project.services) && project.services.length > 3 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A1A1A] text-[#616161]">
                      +{project.services.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Financial */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#00E676]">
                  R{Number(project.revenue ?? 0).toLocaleString("en-ZA")}
                </span>
                <span className={`text-[10px] ${priorityConfig[project.priority]?.color ?? "text-[#9E9E9E]"}`}>
                  {project.priority}
                </span>
              </div>

              {/* Progress bar */}
              {project.budget && (
                <div className="mb-2">
                  <div className="flex items-center justify-between text-[10px] text-[#616161] mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                    <div className="h-full bg-[#00E676] rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {/* Received/Outstanding */}
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#42A5F5]">R{Number(project.received ?? 0).toLocaleString("en-ZA")} received</span>
                {Number(project.outstanding ?? 0) > 0 && (
                  <span className="text-[#FFB300]">R{Number(project.outstanding).toLocaleString("en-ZA")} outstanding</span>
                )}
              </div>

              {project.startDate && (
                <p className="text-[10px] text-[#616161] mt-2">
                  {new Date(project.startDate).toLocaleDateString("en-ZA")}
                  {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString("en-ZA")}`}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Add Project Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-white">New Project</h2>
                <button onClick={() => setShowAddModal(false)} className="text-[#616161] hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Project Code (e.g. OE007)"
                    value={formData.projectCode}
                    onChange={(e) => setFormData({ ...formData, projectCode: e.target.value })}
                    className="h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
                    required
                  />
                  <input
                    placeholder="Project Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
                    required
                  />
                </div>
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full h-20 px-4 py-2 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40 resize-none"
                />
                <input
                  placeholder="Services (comma-separated)"
                  value={formData.services}
                  onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                  className="w-full h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    placeholder="Budget (ZAR)"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
                  />
                  <input
                    placeholder="Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
                  />
                  <input
                    placeholder="End Date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
                  />
                </div>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-[#9E9E9E] focus:outline-none focus:border-[#00E676]/40"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 h-11 border border-white/[0.12] text-[#9E9E9E] rounded-xl text-sm font-medium hover:bg-[#1A1A1A] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createProject.isPending}
                    className="flex-1 h-11 bg-[#00E676] text-black rounded-xl text-sm font-semibold hover:bg-[#69F0AE] transition-colors disabled:opacity-50"
                  >
                    {createProject.isPending ? "Creating..." : "Create Project"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
