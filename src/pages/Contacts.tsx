import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Search,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Building2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const statusColors: Record<string, string> = {
  lead: "bg-yellow-500/20 text-yellow-400",
  prospect: "bg-blue-500/20 text-blue-400",
  customer: "bg-[#00E676]/20 text-[#00E676]",
  churned: "bg-red-500/20 text-red-400",
};

const sourceLabels: Record<string, string> = {
  website: "Website",
  referral: "Referral",
  social: "Social Media",
  cold_call: "Cold Call",
  event: "Event",
  other: "Other",
};

export default function Contacts() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetail, setShowDetail] = useState<number | null>(null);

  const { data, refetch } = trpc.contact.list.useQuery({
    search: search || undefined,
    status: statusFilter || undefined,
    source: sourceFilter || undefined,
    page,
    limit: 10,
  });

  const { data: stats } = trpc.contact.getStats.useQuery();

  const createContact = trpc.contact.create.useMutation({
    onSuccess: () => {
      setShowAddModal(false);
      refetch();
    },
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    status: "lead" as const,
    source: "website" as const,
    city: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createContact.mutate(formData);
  };

  const selectedContact = data?.contacts.find((c) => c.id === showDetail);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Contacts</h1>
          <p className="text-sm text-[#9E9E9E] mt-0.5">
            {stats?.total ?? 0} total contacts · {stats?.customers ?? 0} customers · {stats?.leads ?? 0} leads
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 h-10 bg-[#00E676] text-black rounded-xl text-sm font-semibold hover:bg-[#69F0AE] transition-colors self-start"
        >
          <Plus size={16} />
          Add Contact
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-10 pl-9 pr-4 bg-[#141414] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-10 px-3 bg-[#141414] border border-white/[0.06] rounded-xl text-sm text-[#9E9E9E] focus:outline-none focus:border-[#00E676]/40"
          >
            <option value="">All Status</option>
            <option value="lead">Lead</option>
            <option value="prospect">Prospect</option>
            <option value="customer">Customer</option>
            <option value="churned">Churned</option>
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
            className="h-10 px-3 bg-[#141414] border border-white/[0.06] rounded-xl text-sm text-[#9E9E9E] focus:outline-none focus:border-[#00E676]/40"
          >
            <option value="">All Sources</option>
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="social">Social</option>
            <option value="cold_call">Cold Call</option>
            <option value="event">Event</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-xs font-medium text-[#616161] uppercase tracking-wider px-4 py-3">Name</th>
                <th className="text-left text-xs font-medium text-[#616161] uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Email</th>
                <th className="text-left text-xs font-medium text-[#616161] uppercase tracking-wider px-4 py-3 hidden md:table-cell">Phone</th>
                <th className="text-left text-xs font-medium text-[#616161] uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-[#616161] uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Source</th>
                <th className="text-left text-xs font-medium text-[#616161] uppercase tracking-wider px-4 py-3 hidden xl:table-cell">Score</th>
                <th className="text-right text-xs font-medium text-[#616161] uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.contacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="border-b border-white/[0.04] hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                  onClick={() => setShowDetail(contact.id)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#00E676]/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-[#00E676]">
                          {contact.firstName[0]}{contact.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{contact.firstName} {contact.lastName}</p>
                        <p className="text-xs text-[#616161]">{contact.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-[#9E9E9E]">{contact.email}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-[#9E9E9E]">{contact.phone}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[contact.status] ?? "bg-[#1A1A1A] text-[#9E9E9E]"}`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-sm text-[#9E9E9E]">{sourceLabels[contact.source] ?? contact.source}</span>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#00E676] rounded-full"
                          style={{ width: `${contact.score}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#9E9E9E]">{contact.score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="p-1.5 text-[#616161] hover:text-white transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
          <p className="text-xs text-[#616161]">
            Showing {data?.contacts.length ?? 0} of {data?.total ?? 0} contacts
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 text-[#616161] hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-[#9E9E9E]">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={(data?.contacts.length ?? 0) < 10}
              className="p-2 text-[#616161] hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Contact Modal */}
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
                <h2 className="text-lg font-semibold text-white">Add Contact</h2>
                <button onClick={() => setShowAddModal(false)} className="text-[#616161] hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
                    required
                  />
                  <input
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
                    required
                  />
                </div>
                <input
                  placeholder="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
                  />
                  <input
                    placeholder="Company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-[#9E9E9E] focus:outline-none focus:border-[#00E676]/40"
                  >
                    <option value="lead">Lead</option>
                    <option value="prospect">Prospect</option>
                    <option value="customer">Customer</option>
                  </select>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                    className="h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-[#9E9E9E] focus:outline-none focus:border-[#00E676]/40"
                  >
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="social">Social</option>
                    <option value="cold_call">Cold Call</option>
                    <option value="event">Event</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <input
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full h-11 px-4 bg-[#0C0C0C] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-[#616161] focus:outline-none focus:border-[#00E676]/40"
                />
                <textarea
                  placeholder="Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                    disabled={createContact.isPending}
                    className="flex-1 h-11 bg-[#00E676] text-black rounded-xl text-sm font-semibold hover:bg-[#69F0AE] transition-colors disabled:opacity-50"
                  >
                    {createContact.isPending ? "Adding..." : "Add Contact"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Detail Sidebar */}
      <AnimatePresence>
        {showDetail && selectedContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setShowDetail(null)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#141414] border-l border-white/[0.06] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setShowDetail(null)} className="text-[#616161] hover:text-white">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#00E676]/10 flex items-center justify-center">
                    <span className="text-xl font-bold text-[#00E676]">
                      {selectedContact.firstName[0]}{selectedContact.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {selectedContact.firstName} {selectedContact.lastName}
                    </h2>
                    <p className="text-sm text-[#9E9E9E]">{selectedContact.company}</p>
                    <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedContact.status]}`}>
                      {selectedContact.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-[#0C0C0C] rounded-xl">
                    <Mail size={16} className="text-[#616161]" />
                    <span className="text-sm text-[#9E9E9E]">{selectedContact.email}</span>
                  </div>
                  {selectedContact.phone && (
                    <div className="flex items-center gap-3 p-3 bg-[#0C0C0C] rounded-xl">
                      <Phone size={16} className="text-[#616161]" />
                      <span className="text-sm text-[#9E9E9E]">{selectedContact.phone}</span>
                    </div>
                  )}
                  {selectedContact.city && (
                    <div className="flex items-center gap-3 p-3 bg-[#0C0C0C] rounded-xl">
                      <MapPin size={16} className="text-[#616161]" />
                      <span className="text-sm text-[#9E9E9E]">{selectedContact.city}, {selectedContact.country}</span>
                    </div>
                  )}
                  {selectedContact.jobTitle && (
                    <div className="flex items-center gap-3 p-3 bg-[#0C0C0C] rounded-xl">
                      <Building2 size={16} className="text-[#616161]" />
                      <span className="text-sm text-[#9E9E9E]">{selectedContact.jobTitle}</span>
                    </div>
                  )}
                </div>

                {selectedContact.notes && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-white mb-2">Notes</h3>
                    <p className="text-sm text-[#9E9E9E] bg-[#0C0C0C] p-3 rounded-xl">{selectedContact.notes}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button className="flex-1 h-10 bg-[#00E676] text-black rounded-xl text-sm font-semibold hover:bg-[#69F0AE] transition-colors">
                    Send Email
                  </button>
                  <button className="flex-1 h-10 border border-white/[0.12] text-[#9E9E9E] rounded-xl text-sm font-medium hover:bg-[#1A1A1A] transition-colors">
                    Edit Contact
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
