import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Plus,
  X,
  MoreHorizontal,
  TrendingUp,
  DollarSign,
  Target,
  Percent,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const stageConfig = [
  { key: "new", label: "New", color: "#FFFFFF", borderColor: "border-t-white" },
  { key: "qualified", label: "Qualified", color: "#FFB300", borderColor: "border-t-[#FFB300]" },
  { key: "proposal", label: "Proposal", color: "#42A5F5", borderColor: "border-t-[#42A5F5]" },
  { key: "negotiation", label: "Negotiation", color: "#FF9800", borderColor: "border-t-[#FF9800]" },
  { key: "won", label: "Won", color: "#00E676", borderColor: "border-t-[#00E676]" },
  { key: "lost", label: "Lost", color: "#EF5350", borderColor: "border-t-[#EF5350]" },
];

export default function Deals() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { data: dealsData, refetch } = trpc.deal.list.useQuery({});
  const { data: stats } = trpc.deal.getStats.useQuery();

  const updateStage = trpc.deal.updateStage.useMutation({
    onSuccess: () => refetch(),
  });

  const createDeal = trpc.deal.create.useMutation({
    onSuccess: () => {
      setShowAddModal(false);
      refetch();
    },
  });

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    value: "",
    stage: "new" as const,
    probability: "",
    expectedCloseDate: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDeal.mutate({
      title: formData.title,
      company: formData.company,
      value: Number(formData.value),
      stage: formData.stage,
      probability: Number(formData.probability) || undefined,
      expectedCloseDate: formData.expectedCloseDate || undefined,
      description: formData.description || undefined,
    });
  };

  const handleStageChange = (dealId: number, newStage: string) => {
    updateStage.mutate({ id: dealId, stage: newStage as any });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Deals</h1>
          <p className="text-sm text-[#9E9E9E] mt-0.5">
            Pipeline value: R{stats?.totalValue?.toLocaleString("en-ZA") ?? 0} · {stats?.totalDeals ?? 0} total deals
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 h-10 bg-[#00E676] text-black rounded-xl text-sm font-semibold hover:bg-[#69F0AE] transition-colors self-start"
        >
          <Plus size={16} />
          Add Deal
        </button>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Value", value: `R${stats?.totalValue?.toLocaleString("en-ZA") ?? 0}`, icon: DollarSign },
          { label: "Avg Deal Size", value: `R${Math.round(stats?.avgDealSize ?? 0).toLocaleString("en-ZA")}`, icon: Target },
          { label: "Win Rate", value: `${(stats?.winRate ?? 0).toFixed(1)}%`, icon: Percent },
          { label: "Revenue Won", value: `R${stats?.revenueWon?.toLocaleString("en-ZA") ?? 0}`, icon: TrendingUp },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#141414] border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon size={14} className="text-[#00E676]" />
              <span className="text-xs text-[#616161]">{stat.label}</span>
            </div>
            <p className="text-lg font-semibold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
        {stageConfig.map((stage) => {
          const stageDeals = dealsData?.deals.filter((d) => d.stage === stage.key) ?? [];
          const stageValue = stageDeals.reduce((s, d) => s + Number(d.value), 0);

          return (
            <div
              key={stage.key}
              className={`flex-shrink-0 w-[280px] snap-start bg-[#0C0C0C] rounded-2xl border border-white/[0.06] ${stage.borderColor} border-t-[3px] flex flex-col max-h-[calc(100vh-280px)]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between p-4 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: stage.color }}>
                    {stage.label}
                  </span>
                  <span className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-xs text-[#9E9E9E]">
                    {stageDeals.length}
                  </span>
                </div>
                <span className="text-xs text-[#616161]">
                  R{stageValue.toLocaleString("en-ZA")}
                </span>
              </div>

              {/* Deals */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {stageDeals.map((deal) => (
                  <motion.div
                    key={deal.id}
                    layout
                    className="bg-[#141414] border border-white/[0.06] rounded-xl p-3 hover:border-white/[0.12] transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-medium text-white line-clamp-2 flex-1">{deal.title}</h3>
                      <div className="relative">
                        <select
                          value={deal.stage}
                          onChange={(e) => handleStageChange(deal.id, e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        >
                          {stageConfig.map((s) => (
                            <option key={s.key} value={s.key}>{s.label}</option>
                          ))}
                        </select>
                        <MoreHorizontal size={14} className="text-[#616161] group-hover:text-white" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded bg-[#1A1A1A] flex items-center justify-center">
                        <span className="text-[10px] text-[#9E9E9E]">
                          {(deal.company || "?")[0].toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-[#9E9E9E] truncate">{deal.company}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#00E676]">
                        R{Number(deal.value).toLocaleString("en-ZA")}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-10 h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${deal.probability}%`,
                              backgroundColor: stage.color,
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-[#616161]">{deal.probability}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Deal Modal */}
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
              className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-white">New Deal</h2>
                <button onClick={() => setShowAddModal(false)} className="text-[#616161] hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  placeholder="Deal Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
                  />
                  <input
                    placeholder="Value (ZAR)"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value as any })}
                    className="h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-[#9E9E9E] focus:outline-none focus:border-[#00E676]/40"
                  >
                    {stageConfig.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                  <input
                    placeholder="Probability %"
                    type="number"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                    className="h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
                  />
                </div>
                <input
                  placeholder="Expected Close Date"
                  type="date"
                  value={formData.expectedCloseDate}
                  onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                  className="w-full h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
                />
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full h-20 px-4 py-2 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40 resize-none"
                />
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
                    disabled={createDeal.isPending}
                    className="flex-1 h-11 bg-[#00E676] text-black rounded-xl text-sm font-semibold hover:bg-[#69F0AE] transition-colors disabled:opacity-50"
                  >
                    {createDeal.isPending ? "Creating..." : "Create Deal"}
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
