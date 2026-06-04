import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Plus,
  X,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const statusConfig = {
  todo: { label: "To Do", color: "text-[#9E9E9E]", bg: "bg-[#1A1A1A]" },
  in_progress: { label: "In Progress", color: "text-[#42A5F5]", bg: "bg-blue-500/10" },
  review: { label: "Review", color: "text-[#FFB300]", bg: "bg-yellow-500/10" },
  done: { label: "Done", color: "text-[#00E676]", bg: "bg-[#00E676]/10" },
};

const priorityConfig = {
  low: { label: "Low", color: "text-[#9E9E9E]" },
  medium: { label: "Medium", color: "text-[#FFB300]" },
  high: { label: "High", color: "text-[#FF9800]" },
  urgent: { label: "Urgent", color: "text-[#EF5350]" },
};

export default function Tasks() {
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const { data, refetch } = trpc.task.list.useQuery(
    statusFilter ? { status: statusFilter } : {}
  );

  const createTask = trpc.task.create.useMutation({
    onSuccess: () => {
      setShowAddModal(false);
      refetch();
    },
  });

  const updateTask = trpc.task.update.useMutation({
    onSuccess: () => refetch(),
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    dueDate: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTask.mutate({
      title: formData.title,
      description: formData.description || undefined,
      priority: formData.priority,
      dueDate: formData.dueDate || undefined,
    });
  };

  const toggleStatus = (task: any) => {
    const nextStatus = task.status === "done" ? "todo" : "done";
    updateTask.mutate({ id: task.id, status: nextStatus });
  };

  const isOverdue = (dueDate: Date | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Tasks</h1>
          <p className="text-sm text-[#9E9E9E] mt-0.5">
            {data?.tasks.filter((t) => t.status !== "done").length ?? 0} pending · {data?.tasks.filter((t) => t.status === "done").length ?? 0} completed
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 h-10 bg-[#00E676] text-black rounded-xl text-sm font-semibold hover:bg-[#69F0AE] transition-colors self-start"
        >
          <Plus size={16} />
          Add Task
        </button>
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

      {/* Tasks List */}
      <div className="space-y-2">
        {data?.tasks.map((task) => {
          const overdue = isOverdue(task.dueDate);
          return (
            <motion.div
              key={task.id}
              layout
              className={`bg-[#141414] border rounded-xl p-4 flex items-start gap-4 hover:border-white/[0.12] transition-all ${
                overdue ? "border-red-500/20" : "border-white/[0.06]"
              }`}
            >
              <button
                onClick={() => toggleStatus(task)}
                className="mt-0.5 shrink-0"
              >
                {task.status === "done" ? (
                  <CheckCircle2 size={20} className="text-[#00E676]" />
                ) : (
                  <Circle size={20} className="text-[#616161] hover:text-[#00E676] transition-colors" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`text-sm font-medium ${task.status === "done" ? "text-[#616161] line-through" : "text-white"}`}>
                    {task.title}
                  </h3>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${priorityConfig[task.priority as keyof typeof priorityConfig]?.color ?? "text-[#9E9E9E]"} bg-white/[0.04]`}>
                    {task.priority}
                  </span>
                  {overdue && (
                    <span className="flex items-center gap-1 text-[10px] text-[#EF5350]">
                      <AlertTriangle size={10} /> Overdue
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className="text-xs text-[#616161] mt-1">{task.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-[10px] ${statusConfig[task.status as keyof typeof statusConfig]?.color ?? "text-[#9E9E9E]"}`}>
                    {statusConfig[task.status as keyof typeof statusConfig]?.label ?? task.status}
                  </span>
                  {task.dueDate && (
                    <span className={`flex items-center gap-1 text-[10px] ${overdue ? "text-[#EF5350]" : "text-[#616161]"}`}>
                      <Clock size={10} />
                      {new Date(task.dueDate).toLocaleDateString("en-ZA")}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Task Modal */}
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
              className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-white">New Task</h2>
                <button onClick={() => setShowAddModal(false)} className="text-[#616161] hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  placeholder="Task title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
                  required
                />
                <textarea
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full h-20 px-4 py-2 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40 resize-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-[#9E9E9E] focus:outline-none focus:border-[#00E676]/40"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <input
                    placeholder="Due date"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
                  />
                </div>
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
                    disabled={createTask.isPending}
                    className="flex-1 h-11 bg-[#00E676] text-black rounded-xl text-sm font-semibold hover:bg-[#69F0AE] transition-colors disabled:opacity-50"
                  >
                    {createTask.isPending ? "Creating..." : "Create Task"}
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
