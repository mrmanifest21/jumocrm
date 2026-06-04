import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  CheckSquare,
  DollarSign,
  Plus,
  Mail,
  CheckSquareIcon,
  UserPlus,
  Sparkles,
  ArrowRight,
  Clock,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  index,
}: {
  label: string;
  value: string;
  change: number;
  icon: any;
  index: number;
}) {
  const isPositive = change >= 0;
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 hover:border-[#00E676]/30 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[11px] font-medium text-[#616161] uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-semibold text-white mt-1">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] flex items-center justify-center group-hover:bg-[#00E676]/10 transition-colors">
          <Icon size={18} className="text-[#00E676]" />
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {isPositive ? (
          <TrendingUp size={14} className="text-[#00E676]" />
        ) : (
          <TrendingDown size={14} className="text-[#EF5350]" />
        )}
        <span className={`text-xs font-medium ${isPositive ? "text-[#00E676]" : "text-[#EF5350]"}`}>
          {isPositive ? "+" : ""}
          {change}%
        </span>
        <span className="text-xs text-[#616161]">vs last month</span>
      </div>
    </motion.div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#141414]/95 backdrop-blur-xl border border-[#00E676]/30 rounded-xl p-3 shadow-xl">
      <p className="text-sm text-white font-medium">{label}</p>
      <p className="text-base text-[#00E676] font-semibold">
        R{payload[0].value.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
      </p>
      <p className="text-xs text-[#616161]">Revenue</p>
    </div>
  );
}

export default function Dashboard() {
  const { data: kpis } = trpc.dashboard.getKPIs.useQuery();
  const { data: revenueData } = trpc.dashboard.getRevenueOverview.useQuery();
  const { data: topDeals } = trpc.dashboard.getTopDeals.useQuery();
  const { data: recentActivity } = trpc.dashboard.getRecentActivity.useQuery();
  trpc.contact.getStats.useQuery();
  trpc.deal.getStats.useQuery();

  const stats = [
    { label: "Total Revenue", value: `R${(kpis?.revenue ?? 0).toLocaleString("en-ZA")}`, change: kpis?.revenueChange ?? 0, icon: DollarSign },
    { label: "Active Deals", value: `${kpis?.activeDeals ?? 0}`, change: kpis?.dealsChange ?? 0, icon: Briefcase },
    { label: "Contacts", value: `${kpis?.contacts ?? 0}`, change: kpis?.contactsChange ?? 0, icon: Users },
    { label: "Tasks Due", value: `${kpis?.tasksDue ?? 0}`, change: kpis?.tasksChange ?? 0, icon: CheckSquare },
  ];

  const chartData = revenueData?.labels.map((label: string, i: number) => ({
    name: label,
    value: revenueData.values[i],
  })) ?? [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "email": return Mail;
      case "call": return Users;
      case "meeting": return Users;
      case "task": return CheckSquare;
      default: return Activity;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-[#9E9E9E] mt-0.5">Welcome back to OmegaElz CRM</p>
        </div>
        <Link
          to="/ai-assistant"
          className="hidden sm:flex items-center gap-2 px-4 h-10 bg-[#00E676] text-black rounded-xl text-sm font-semibold hover:bg-[#69F0AE] transition-colors"
        >
          <Sparkles size={16} />
          Ask OmegaAI
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} {...stat} index={i} />
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.5 }}
          className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-medium text-white">Revenue Overview</h2>
            <span className="text-xs text-[#616161]">2026</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#616161", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              />
              <YAxis
                tick={{ fill: "#616161", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `R${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                fill="#141414"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-4 gap-3 mt-4">
            {chartData.map((item, i) => (
              <div key={i} className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${i === 1 ? "bg-[#00E676]" : "bg-[#616161]"}`} />
                  <span className="text-xs text-[#9E9E9E]">{item.name}</span>
                </div>
                <p className="text-sm text-white font-medium mt-0.5">
                  R{item.value.toLocaleString("en-ZA")}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Deal Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-medium text-white">Deal Pipeline</h2>
            <Link to="/deals" className="text-xs text-[#00E676] hover:underline flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {topDeals?.map((deal) => (
              <div
                key={deal.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#0C0C0C] hover:bg-[#1A1A1A] transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-[#9E9E9E]">
                    {(deal.company || "?").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{deal.company}</p>
                  <p className="text-xs text-[#616161] truncate">{deal.title}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-[#00E676]">
                    R{Number(deal.value).toLocaleString("en-ZA")}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-16 h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00E676] rounded-full transition-all"
                        style={{ width: `${deal.probability}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[#616161]">{deal.probability}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48, duration: 0.5 }}
          className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5"
        >
          <h2 className="text-base font-medium text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Add Contact", icon: UserPlus, path: "/contacts" },
              { label: "New Deal", icon: Plus, path: "/deals" },
              { label: "Create Task", icon: CheckSquareIcon, path: "/tasks" },
              { label: "Send Email", icon: Mail, path: "/contacts" },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.path}
                className="flex flex-col items-center justify-center gap-2 h-[72px] bg-[#1A1A1A] rounded-xl hover:border-[#00E676]/30 border border-transparent transition-all group"
              >
                <action.icon size={22} className="text-[#00E676]" />
                <span className="text-xs text-[#9E9E9E] group-hover:text-white transition-colors">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.56, duration: 0.5 }}
          className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 xl:col-span-2"
        >
          <h2 className="text-base font-medium text-white mb-4">Recent Activity</h2>
          <div className="space-y-0">
            {recentActivity?.map((activity, i) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start gap-3 py-3 relative">
                  {i < (recentActivity?.length ?? 0) - 1 && (
                    <div className="absolute left-[14px] top-8 bottom-0 w-px bg-white/[0.06]" />
                  )}
                  <div className="w-7 h-7 rounded-full bg-[#00E676]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={12} className="text-[#00E676]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#9E9E9E]">{activity.title}</p>
                    {activity.description && (
                      <p className="text-xs text-[#616161] mt-0.5">{activity.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-[#616161] shrink-0">
                    <Clock size={12} className="inline mr-1" />
                    {activity.createdAt
                      ? new Date(activity.createdAt).toLocaleDateString("en-ZA")
                      : "Recently"}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
