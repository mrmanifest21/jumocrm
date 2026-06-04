import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Search,
  Globe,
  Palette,
  FileText,
  Cpu,
  Video,
  Headphones,
  MessageSquare,
  Sparkles,
  Database,
  BarChart3,
  Megaphone,
  Package,
} from "lucide-react";

const categoryConfig: Record<string, { label: string; icon: any; color: string }> = {
  web_dev: { label: "Web Development", icon: Globe, color: "text-[#42A5F5]" },
  graphic_design: { label: "Graphic Design", icon: Palette, color: "text-[#E040FB]" },
  business_doc: { label: "Business Documentation", icon: FileText, color: "text-[#FFB300]" },
  tech_services: { label: "Technology Services", icon: Cpu, color: "text-[#00E676]" },
  creative: { label: "Creative Services", icon: Video, color: "text-[#EF5350]" },
  admin: { label: "Administrative", icon: Headphones, color: "text-[#9E9E9E]" },
  consultation: { label: "Consultation", icon: MessageSquare, color: "text-[#26C6DA]" },
  ai_automation: { label: "AI & Automation", icon: Sparkles, color: "text-[#00E676]" },
  crm: { label: "CRM Systems", icon: Database, color: "text-[#7E57C2]" },
  data_analytics: { label: "Data Analytics", icon: BarChart3, color: "text-[#42A5F5]" },
  marketing: { label: "Marketing", icon: Megaphone, color: "text-[#FF9800]" },
};

const unitLabels: Record<string, string> = {
  per_hour: "/hour",
  per_project: "/project",
  per_month: "/month",
  fixed: " fixed",
};

export default function Services() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const { data } = trpc.service.list.useQuery(
    { search: search || undefined, category: categoryFilter || undefined }
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Service Catalog</h1>
        <p className="text-sm text-[#9E9E9E] mt-0.5">
          OmegaElz complete service offerings and pricing
        </p>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-[#141414] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 px-3 bg-[#141414] border border-white/[0.06] rounded-xl text-sm text-[#9E9E9E] focus:outline-none focus:border-[#00E676]/40"
        >
          <option value="">All Categories</option>
          {Object.entries(categoryConfig).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data?.map((service) => {
          const cat = categoryConfig[service.category] ?? { label: service.category, icon: Package, color: "text-[#9E9E9E]" };
          const Icon = cat.icon;

          return (
            <div
              key={service.id}
              className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center ${cat.color}`}>
                  <Icon size={20} />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-[#616161]">
                  {cat.label}
                </span>
              </div>

              <h3 className="text-base font-medium text-white mb-1">{service.name}</h3>
              {service.description && (
                <p className="text-xs text-[#616161] mb-3 line-clamp-2">{service.description}</p>
              )}

              <div className="flex items-center justify-between">
                <div>
                  {service.priceMin && service.priceMax && (
                    <p className="text-sm font-semibold text-[#00E676]">
                      R{Number(service.priceMin).toLocaleString("en-ZA")} - R{Number(service.priceMax).toLocaleString("en-ZA")}
                      <span className="text-xs text-[#616161] font-normal">{unitLabels[service.pricingUnit] ?? ""}</span>
                    </p>
                  )}
                  {service.priceMin && !service.priceMax && (
                    <p className="text-sm font-semibold text-[#00E676]">
                      From R{Number(service.priceMin).toLocaleString("en-ZA")}
                      <span className="text-xs text-[#616161] font-normal">{unitLabels[service.pricingUnit] ?? ""}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
