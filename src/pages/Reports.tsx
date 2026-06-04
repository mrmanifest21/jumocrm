import { trpc } from "@/providers/trpc";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
} from "lucide-react";

const stageColors: Record<string, string> = {
  new: "#FFFFFF",
  qualified: "#FFB300",
  proposal: "#42A5F5",
  negotiation: "#FF9800",
  won: "#00E676",
  lost: "#EF5350",
};

const statusColors: Record<string, string> = {
  lead: "#FFB300",
  prospect: "#42A5F5",
  customer: "#00E676",
  churned: "#EF5350",
};

export default function Reports() {
  const { data: salesPerformance } = trpc.report.getSalesPerformance.useQuery();
  const { data: conversionRates } = trpc.report.getConversionRates.useQuery();
  const { data: contactAnalysis } = trpc.report.getContactAnalysis.useQuery();
  const { data: revenueBreakdown } = trpc.report.getRevenueBreakdown.useQuery();

  const pieData = conversionRates
    ?.filter((c) => c.count > 0)
    .map((c) => ({
      name: c.stage.charAt(0).toUpperCase() + c.stage.slice(1),
      value: c.count,
      color: stageColors[c.stage] ?? "#616161",
    })) ?? [];

  const contactStatusData = contactAnalysis?.byStatus.map((c) => ({
    name: c.status.charAt(0).toUpperCase() + c.status.slice(1),
    value: c.count,
    color: statusColors[c.status] ?? "#616161",
  })) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Reports & Analytics</h1>
        <p className="text-sm text-[#9E9E9E] mt-0.5">Comprehensive insights into your CRM performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Revenue", value: `R${(revenueBreakdown?.totalRevenue ?? 0).toLocaleString("en-ZA")}`, icon: DollarSign },
          { label: "Total Deals", value: `${revenueBreakdown?.totalDeals ?? 0}`, icon: Target },
          { label: "Win Rate", value: `${revenueBreakdown?.totalDeals ? ((revenueBreakdown.wonDeals / revenueBreakdown.totalDeals) * 100).toFixed(1) : 0}%`, icon: TrendingUp },
          { label: "Contacts", value: `${contactAnalysis?.byStatus.reduce((s, c) => s + c.count, 0) ?? 0}`, icon: Users },
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

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Sales by Stage */}
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="text-base font-medium text-white mb-4">Deals by Stage</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesPerformance ?? []} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="stage"
                tick={{ fill: "#616161", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                tickFormatter={(v: string) => v.charAt(0).toUpperCase() + v.slice(1)}
              />
              <YAxis
                tick={{ fill: "#616161", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#141414",
                  border: "1px solid rgba(0,230,118,0.3)",
                  borderRadius: 12,
                  color: "#fff",
                }}
                formatter={(value: any, name: string) => [value, name === "count" ? "Deals" : "Value (R)"]}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {(salesPerformance ?? []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={stageColors[entry.stage] ?? "#616161"} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline Distribution */}
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="text-base font-medium text-white mb-4">Pipeline Distribution</h2>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#141414",
                    border: "1px solid rgba(0,230,118,0.3)",
                    borderRadius: 12,
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs text-[#9E9E9E]">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Contact Status */}
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="text-base font-medium text-white mb-4">Contact Status Distribution</h2>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={contactStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {contactStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#141414",
                    border: "1px solid rgba(0,230,118,0.3)",
                    borderRadius: 12,
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {contactStatusData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs text-[#9E9E9E]">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="text-base font-medium text-white mb-4">Revenue Summary</h2>
          <div className="space-y-4">
            {[
              { label: "Total Revenue Won", value: revenueBreakdown?.totalRevenue ?? 0, color: "text-[#00E676]" },
              { label: "Weighted Pipeline", value: Math.round(revenueBreakdown?.weightedPipeline ?? 0), color: "text-[#42A5F5]" },
              { label: "Average Deal Size", value: Math.round(revenueBreakdown?.avgDealSize ?? 0), color: "text-[#FFB300]" },
              { label: "Deals Won", value: revenueBreakdown?.wonDeals ?? 0, color: "text-[#00E676]", isCount: true },
              { label: "Deals Lost", value: revenueBreakdown?.lostDeals ?? 0, color: "text-[#EF5350]", isCount: true },
              { label: "Active Deals", value: revenueBreakdown?.activeDeals ?? 0, color: "text-[#FF9800]", isCount: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-[#9E9E9E]">{item.label}</span>
                <span className={`text-sm font-semibold ${item.color}`}>
                  {item.isCount ? item.value : `R${(item.value as number).toLocaleString("en-ZA")}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
