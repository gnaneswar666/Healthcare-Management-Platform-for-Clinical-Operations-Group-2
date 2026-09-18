import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Phone,
  User,
  GraduationCap,
  Briefcase,
  Clock,
  Building2,
  Stethoscope,
  BadgeCheck,
  Sparkles,
  Pencil,
  UserPlus,
  Copy,
  Check,
  CheckCircle2,
  Award,
  Fingerprint,
  ShieldCheck
} from "lucide-react";

export default function DoctorDetailsModal({ doctor, onClose, onEdit, onAssign }) {
  const [copiedField, setCopiedField] = useState(null);

  if (!doctor) return null;

  const isActive = doctor.status === "ACTIVE";

  const initials = (doctor?.doctorName || "DR")
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-6xl rounded-3xl bg-slate-50 shadow-2xl border border-slate-300/80 my-auto max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Executive Header Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)",
              padding: "20px 28px",
              borderBottom: "1px solid #334155",
              boxShadow: "0 10px 30px -5px rgba(15, 23, 42, 0.3)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              color: "#ffffff"
            }}
            className="shrink-0 relative overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />

            <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0, flex: 1, zIndex: 10 }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <Stethoscope size={24} className="text-blue-400" />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{
                    backgroundColor: "rgba(59, 130, 246, 0.2)",
                    color: "#93c5fd",
                    border: "1px solid rgba(147, 197, 253, 0.3)",
                    fontSize: "11px",
                    fontWeight: "800",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    padding: "2px 10px",
                    borderRadius: "20px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <ShieldCheck size={13} style={{ color: "#60a5fa" }} /> Keycloak SSO & Clinical Integration
                  </span>
                  <span style={{
                    backgroundColor: "rgba(16, 185, 129, 0.2)",
                    color: "#6ee7b7",
                    border: "1px solid rgba(110, 231, 183, 0.3)",
                    fontSize: "11px",
                    fontWeight: "800",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    padding: "2px 10px",
                    borderRadius: "20px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <BadgeCheck size={13} style={{ color: "#34d399" }} /> {doctor.status || "ACTIVE"}
                  </span>
                </div>
                <h2 style={{ color: "#ffffff", fontSize: "22px", fontWeight: "800", margin: 0, lineHeight: 1.2 }}>
                  Dr. {doctor.doctorName?.replace(/^Dr\.\s*/i, "")}
                </h2>
                <p style={{ color: "#94a3b8", fontSize: "13px", fontWeight: "500", margin: "3px 0 0 0" }}>
                  {doctor.department || "General"} Medicine • {doctor.specialization || "Clinical Specialist"}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0, zIndex: 10 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#cbd5e1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer"
                }}
                className="hover:bg-white/20 hover:text-white transition-all"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Modal Body Container */}
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 min-h-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column Clinical Cards (Col Span 7) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Clinical Overview */}
                <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "26px", boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)" }} className="space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-xs">
                        <Award size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          Clinical & Professional Overview
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Verified credentials and department role assignments
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                      Medical Credentials
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailCard
                      icon={Building2}
                      label="Department Assignment"
                      value={doctor.department}
                      badge="Primary Department"
                    />

                    <DetailCard
                      icon={Stethoscope}
                      label="Medical Specialization"
                      value={doctor.specialization}
                      badge="Specialist"
                    />

                    <DetailCard
                      icon={GraduationCap}
                      label="Highest Qualification"
                      value={doctor.qualification}
                    />

                    <DetailCard
                      icon={Briefcase}
                      label="Years of Experience"
                      value={doctor.experience != null ? `${doctor.experience} Years Practice` : "—"}
                    />
                  </div>
                </div>

                {/* Contact & Availability */}
                <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "26px", boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)" }} className="space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
                        <Mail size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          Contact & Schedule Details
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Direct communication channels and duty roster schedule
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                      Direct Communication
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Email */}
                    <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                          <Mail size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Email Address</p>
                          <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{doctor.email || "—"}</p>
                        </div>
                      </div>
                      {doctor.email && (
                        <button
                          onClick={() => handleCopy(doctor.email, "email")}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer shrink-0"
                          title="Copy Email"
                        >
                          {copiedField === "email" ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                        </button>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
                          <Phone size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Phone Number</p>
                          <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{doctor.phone || "—"}</p>
                        </div>
                      </div>
                      {doctor.phone && (
                        <button
                          onClick={() => handleCopy(doctor.phone, "phone")}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer shrink-0"
                          title="Copy Phone"
                        >
                          {copiedField === "phone" ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                        </button>
                      )}
                    </div>

                    <DetailCard
                      icon={User}
                      label="Gender"
                      value={doctor.gender}
                    />

                    <DetailCard
                      icon={Clock}
                      label="Working Hours / Availability"
                      value={doctor.availability}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Live Doctor Profile Preview Card (Col Span 5 - Sticky) */}
              <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-6">
                <div style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "24px", color: "#ffffff", padding: "26px", boxShadow: "0 20px 40px -10px rgba(15, 23, 42, 0.35)" }} className="space-y-6">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", borderBottom: "1px solid #334155", paddingBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1, color: "#818cf8", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      <Stethoscope size={16} style={{ flexShrink: 0 }} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Live Doctor Profile Preview</span>
                    </div>
                    <span style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#34d399", border: "1px solid rgba(52, 211, 153, 0.3)", fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "20px", flexShrink: 0, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#34d399" }} className="animate-pulse" />
                      Interactive
                    </span>
                  </div>

                  {/* Doctor Profile Card Head */}
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 50%, #06b6d4 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "20px", fontWeight: "900", boxShadow: "0 6px 16px rgba(79, 70, 229, 0.35)", flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#ffffff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        Dr. {doctor.doctorName?.replace(/^Dr\.\s*/i, "")}
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                        <span style={{ fontSize: "11px", fontFamily: "monospace", fontWeight: "700", color: "#cbd5e1", backgroundColor: "#1e293b", border: "1px solid #475569", padding: "2px 8px", borderRadius: "6px" }}>
                          ID: {doctor.doctorId || "D101"}
                        </span>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#a5b4fc", backgroundColor: "rgba(99, 102, 241, 0.2)", border: "1px solid rgba(165, 180, 252, 0.3)", padding: "2px 8px", borderRadius: "6px" }}>
                          {doctor.department || "General"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Summary Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div style={{ backgroundColor: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "14px", padding: "12px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", display: "block" }}>Gender & Exp</span>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#ffffff", marginTop: "2px", display: "block" }}>
                        {doctor.gender || "Male"} ({doctor.experience || 0} yrs)
                      </span>
                    </div>

                    <div style={{ backgroundColor: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "14px", padding: "12px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", display: "block" }}>Specialization</span>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#34d399", marginTop: "2px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {doctor.specialization || "General Medicine"}
                      </span>
                    </div>

                    <div style={{ backgroundColor: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "14px", padding: "12px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", display: "block" }}>Qualification</span>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#ffffff", marginTop: "2px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {doctor.qualification || "MBBS"}
                      </span>
                    </div>

                    <div style={{ backgroundColor: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "14px", padding: "12px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", display: "block" }}>Schedule</span>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#ffffff", marginTop: "2px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {doctor.availability || "10:00 AM - 06:00 PM"}
                      </span>
                    </div>
                  </div>

                  {/* Automated Pipeline Actions */}
                  <div style={{ borderTop: "1px solid #334155", paddingTop: "16px" }} className="space-y-2.5">
                    <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", marginBottom: "8px" }}>
                      Automated Pipeline Actions
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", backgroundColor: "rgba(2, 6, 23, 0.6)", padding: "12px 14px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "#cbd5e1", fontSize: "12px", fontWeight: "500", minWidth: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <Fingerprint size={14} style={{ color: "#818cf8", flexShrink: 0 }} />
                        Keycloak Realm SSO Account
                      </span>
                      <span style={{ color: "#34d399", fontSize: "12px", fontWeight: "800", flexShrink: 0, whiteSpace: "nowrap" }}>Auto-Provision</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", backgroundColor: "rgba(2, 6, 23, 0.6)", padding: "12px 14px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "#cbd5e1", fontSize: "12px", fontWeight: "500", minWidth: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <Stethoscope size={14} style={{ color: "#60a5fa", flexShrink: 0 }} />
                        Clinical Credentials Vector
                      </span>
                      <span style={{ color: "#34d399", fontSize: "12px", fontWeight: "800", flexShrink: 0, whiteSpace: "nowrap" }}>Verified</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Footer Bar */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderTop: "1px solid #e2e8f0",
              padding: "16px 28px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "14px"
            }}
            className="shrink-0 shadow-xs"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span>Registered Practitioner</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0, marginLeft: "auto" }}>
              {onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(doctor);
                  }}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "12px",
                    backgroundColor: "#ffffff",
                    color: "#334155",
                    border: "1px solid #cbd5e1",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    flexShrink: 0
                  }}
                >
                  <Pencil size={14} className="text-slate-500" />
                  <span>Edit Profile</span>
                </button>
              )}

              {onAssign && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onAssign(doctor);
                  }}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                    color: "#ffffff",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: "800",
                    cursor: "pointer",
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <UserPlus size={15} />
                  <span>Assign Patients</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "10px 24px",
                  borderRadius: "12px",
                  backgroundColor: "#f1f5f9",
                  color: "#334155",
                  border: "1px solid #cbd5e1",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  flexShrink: 0,
                  whiteSpace: "nowrap"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function DetailCard({ icon: Icon, label, value, badge }) {
  return (
    <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/60 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 shrink-0 shadow-2xs">
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
            {value || "—"}
          </p>
        </div>
      </div>
      {badge && (
        <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 shrink-0">
          {badge}
        </span>
      )}
    </div>
  );
}