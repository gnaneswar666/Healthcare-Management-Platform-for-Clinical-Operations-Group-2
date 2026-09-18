import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  AlertCircle,
  Stethoscope,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Briefcase,
  Clock,
  User,
  Sparkles,
  Loader2,
  ShieldCheck,
  Zap,
  Hash,
  Users,
  UserPlus,
  Fingerprint
} from "lucide-react";
import { addDoctor, getDoctors } from "../../../services/doctorService";
import { validateEmail, validatePhone } from "../../../utils/validation";
import { getNextDoctorId } from "../../../utils/doctorUtils";

export default function AddDoctorModal({ show, handleClose, refresh, existingDoctors = [] }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [autoDoctorId, setAutoDoctorId] = useState("D101");

  const [doctor, setDoctor] = useState({
    doctorId: "",
    doctorName: "",
    email: "",
    phone: "",
    gender: "Male",
    specialization: "",
    qualification: "",
    experience: "",
    department: "",
    availability: "10:00 AM - 06:00 PM"
  });

  useEffect(() => {
    async function initDoctorId() {
      if (!show) return;
      let doctorList = existingDoctors;
      if (!doctorList || doctorList.length === 0) {
        try {
          const res = await getDoctors();
          doctorList = res.data || [];
        } catch (err) {
          console.error("Failed to fetch doctors for auto ID generation:", err);
        }
      }
      const nextId = getNextDoctorId(doctorList);
      setAutoDoctorId(nextId);
      setDoctor((prev) => ({
        ...prev,
        doctorId: nextId,
        doctorName: "",
        email: "",
        phone: "",
        gender: "Male",
        specialization: "",
        qualification: "",
        experience: "",
        department: "",
        availability: "10:00 AM - 06:00 PM"
      }));
      setError("");
    }
    initDoctorId();
  }, [show, existingDoctors]);

  const handleChange = (e) => {
    setDoctor({
      ...doctor,
      [e.target.name]: e.target.value
    });
  };

  const handleFillSampleData = () => {
    const samples = [
      {
        name: "Dr. Sarah Jenkins",
        dept: "Cardiology",
        spec: "Pediatric Cardiology",
        qual: "MD, DM Cardiology",
        exp: "12",
        email: `sarah.jenkins${Math.floor(10 + Math.random() * 90)}@hospital.com`,
        phone: "9808707606"
      },
      {
        name: "Dr. Robert Chen",
        dept: "Neurology",
        spec: "Neuro-Oncology",
        qual: "MD, Neuro Surgery",
        exp: "15",
        email: `robert.chen${Math.floor(10 + Math.random() * 90)}@hospital.com`,
        phone: "9876543210"
      },
      {
        name: "Dr. Elena Rostova",
        dept: "Endocrinology",
        spec: "Diabetes & Metabolism",
        qual: "MD, FACP",
        exp: "10",
        email: `elena.rostova${Math.floor(10 + Math.random() * 90)}@hospital.com`,
        phone: "9123456789"
      }
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    setDoctor((prev) => ({
      ...prev,
      doctorId: autoDoctorId || "D104",
      doctorName: picked.name,
      email: picked.email,
      phone: picked.phone,
      gender: "Male",
      department: picked.dept,
      specialization: picked.spec,
      qualification: picked.qual,
      experience: picked.exp,
      availability: "10:00 AM - 06:00 PM"
    }));
    setError("");
  };

  const saveDoctor = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (!doctor.doctorName.trim()) {
      setError("Doctor Name is required.");
      return;
    }

    const emailCheck = validateEmail(doctor.email);
    if (!emailCheck.isValid) {
      setError(emailCheck.message);
      return;
    }

    const phoneCheck = validatePhone(doctor.phone);
    if (!phoneCheck.isValid) {
      setError(phoneCheck.message);
      return;
    }

    setSubmitting(true);
    try {
      const finalDoctorId = doctor.doctorId.trim() || autoDoctorId || "D101";
      const payload = {
        ...doctor,
        doctorId: finalDoctorId,
        doctorName: doctor.doctorName.trim(),
        email: doctor.email.trim(),
        experience: doctor.experience ? Number(doctor.experience) : 0,
        status: "ACTIVE"
      };

      await addDoctor(payload);
      setSubmitting(false);
      setError("");
      if (refresh) refresh();
      handleClose();
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      setError(err.response?.data?.message || "Failed to Add Doctor.");
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
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
                    <Zap size={13} style={{ color: "#34d399" }} /> Doctor Profile Synced
                  </span>
                </div>
                <h2 style={{ color: "#ffffff", fontSize: "22px", fontWeight: "800", margin: 0, lineHeight: 1.2 }}>
                  Register New Doctor Profile
                </h2>
                <p style={{ color: "#94a3b8", fontSize: "13px", fontWeight: "500", margin: "3px 0 0 0" }}>
                  Configure doctor credentials, clinical specialization, and department assignments
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0, zIndex: 10 }}>
              <button
                type="button"
                onClick={handleFillSampleData}
                style={{
                  padding: "9px 18px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  color: "#ffffff",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: "800",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 14px rgba(79, 70, 229, 0.4)"
                }}
              >
                <Sparkles size={16} />
                <span>Auto-Fill Sample Data</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
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

          {/* Form Body Scrollable Area */}
          <form onSubmit={saveDoctor} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 min-h-0">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column Form Cards (Col Span 7) */}
                <div className="lg:col-span-7 space-y-6">
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold px-5 py-4 rounded-2xl flex items-center gap-3 shadow-xs"
                      >
                        <AlertCircle size={18} className="text-rose-600 shrink-0" />
                        <span className="flex-1">{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Section 1: Doctor Identification */}
                  <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "26px", boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)" }} className="space-y-5">
                    <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-xs">
                        <User size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug flex items-center gap-2">
                          Doctor Identification
                          <span className="text-[10px] uppercase font-extrabold tracking-wider text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                            Required
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          System unique code and legal primary name
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Doctor ID */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Doctor ID <span className="text-slate-400 font-normal lowercase">(optional)</span>
                        </label>
                        <div className="flex items-center h-12 bg-slate-50/70 border border-slate-300 rounded-xl focus-within:bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all overflow-hidden">
                          <div className="w-11 h-full flex items-center justify-center bg-slate-100 border-r border-slate-200 text-slate-500 shrink-0">
                            <Hash size={18} />
                          </div>
                          <input
                            type="text"
                            name="doctorId"
                            value={doctor.doctorId}
                            onChange={handleChange}
                            placeholder={`e.g. ${autoDoctorId}`}
                            className="w-full px-3 text-sm font-semibold text-slate-900 bg-transparent outline-none placeholder:text-slate-400"
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1.5 font-medium">Auto-generated if blank</p>
                      </div>

                      {/* Doctor Name */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Doctor Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex items-center h-12 bg-slate-50/70 border border-slate-300 rounded-xl focus-within:bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all overflow-hidden">
                          <div className="w-11 h-full flex items-center justify-center bg-slate-100 border-r border-slate-200 text-slate-500 shrink-0">
                            <User size={18} />
                          </div>
                          <input
                            type="text"
                            name="doctorName"
                            value={doctor.doctorName}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Dr. Sarah Jenkins"
                            className="w-full px-3 text-sm font-semibold text-slate-900 bg-transparent outline-none placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Gender
                        </label>
                        <div className="flex items-center h-12 bg-slate-50/70 border border-slate-300 rounded-xl focus-within:bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all overflow-hidden">
                          <div className="w-11 h-full flex items-center justify-center bg-slate-100 border-r border-slate-200 text-slate-500 shrink-0">
                            <Users size={18} />
                          </div>
                          <select
                            name="gender"
                            value={doctor.gender}
                            onChange={handleChange}
                            className="w-full px-3 text-sm font-semibold text-slate-900 bg-transparent outline-none cursor-pointer"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Contact & Authentication */}
                  <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "26px", boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)" }} className="space-y-5">
                    <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
                        <Mail size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          Contact & Authentication
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Email serves as Keycloak login ID and portal notification destination
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Email Address */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Email Address <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex items-center h-12 bg-slate-50/70 border border-slate-300 rounded-xl focus-within:bg-white focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all overflow-hidden">
                          <div className="w-11 h-full flex items-center justify-center bg-slate-100 border-r border-slate-200 text-slate-500 shrink-0">
                            <Mail size={18} />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={doctor.email}
                            onChange={handleChange}
                            required
                            placeholder="sarah.jenkins@hospital.com"
                            className="w-full px-3 text-sm font-semibold text-slate-900 bg-transparent outline-none placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Phone Number
                        </label>
                        <div className="flex items-center h-12 bg-slate-50/70 border border-slate-300 rounded-xl focus-within:bg-white focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all overflow-hidden">
                          <div className="w-11 h-full flex items-center justify-center bg-slate-100 border-r border-slate-200 text-slate-500 shrink-0">
                            <Phone size={18} />
                          </div>
                          <input
                            type="tel"
                            name="phone"
                            value={doctor.phone}
                            onChange={handleChange}
                            placeholder="9808707606"
                            className="w-full px-3 text-sm font-semibold text-slate-900 bg-transparent outline-none placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Clinical Profile & Specialization */}
                  <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "26px", boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)" }} className="space-y-5">
                    <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0 shadow-xs">
                        <Stethoscope size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          Clinical Specialization & Qualifications
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Department assignment, medical credentials, and duty schedule
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Department */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Department
                        </label>
                        <div className="flex items-center h-12 bg-slate-50/70 border border-slate-300 rounded-xl focus-within:bg-white focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all overflow-hidden">
                          <div className="w-11 h-full flex items-center justify-center bg-slate-100 border-r border-slate-200 text-slate-500 shrink-0">
                            <Building2 size={18} />
                          </div>
                          <input
                            type="text"
                            name="department"
                            value={doctor.department}
                            onChange={handleChange}
                            placeholder="e.g. Cardiology"
                            className="w-full px-3 text-sm font-semibold text-slate-900 bg-transparent outline-none placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      {/* Specialization */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Specialization
                        </label>
                        <div className="flex items-center h-12 bg-slate-50/70 border border-slate-300 rounded-xl focus-within:bg-white focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all overflow-hidden">
                          <div className="w-11 h-full flex items-center justify-center bg-slate-100 border-r border-slate-200 text-slate-500 shrink-0">
                            <Stethoscope size={18} />
                          </div>
                          <input
                            type="text"
                            name="specialization"
                            value={doctor.specialization}
                            onChange={handleChange}
                            placeholder="e.g. Pediatric Cardiology"
                            className="w-full px-3 text-sm font-semibold text-slate-900 bg-transparent outline-none placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      {/* Qualification */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Qualification
                        </label>
                        <div className="flex items-center h-12 bg-slate-50/70 border border-slate-300 rounded-xl focus-within:bg-white focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all overflow-hidden">
                          <div className="w-11 h-full flex items-center justify-center bg-slate-100 border-r border-slate-200 text-slate-500 shrink-0">
                            <GraduationCap size={18} />
                          </div>
                          <input
                            type="text"
                            name="qualification"
                            value={doctor.qualification}
                            onChange={handleChange}
                            placeholder="e.g. MD, DM Cardiology"
                            className="w-full px-3 text-sm font-semibold text-slate-900 bg-transparent outline-none placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      {/* Experience */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Experience <span className="text-slate-400 font-normal lowercase">(Years)</span>
                        </label>
                        <div className="flex items-center h-12 bg-slate-50/70 border border-slate-300 rounded-xl focus-within:bg-white focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all overflow-hidden">
                          <div className="w-11 h-full flex items-center justify-center bg-slate-100 border-r border-slate-200 text-slate-500 shrink-0">
                            <Briefcase size={18} />
                          </div>
                          <input
                            type="number"
                            name="experience"
                            value={doctor.experience}
                            onChange={handleChange}
                            placeholder="e.g. 12"
                            min="0"
                            className="w-full px-3 text-sm font-semibold text-slate-900 bg-transparent outline-none placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      {/* Availability */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Availability / Schedule
                        </label>
                        <div className="flex items-center h-12 bg-slate-50/70 border border-slate-300 rounded-xl focus-within:bg-white focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all overflow-hidden">
                          <div className="w-11 h-full flex items-center justify-center bg-slate-100 border-r border-slate-200 text-slate-500 shrink-0">
                            <Clock size={18} />
                          </div>
                          <input
                            type="text"
                            name="availability"
                            value={doctor.availability}
                            onChange={handleChange}
                            placeholder="10:00 AM - 06:00 PM"
                            className="w-full px-3 text-sm font-semibold text-slate-900 bg-transparent outline-none placeholder:text-slate-400"
                          />
                        </div>
                      </div>
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
                        {doctor.doctorName ? doctor.doctorName.replace(/^Dr\.\s*/i, "").charAt(0).toUpperCase() : "D"}
                        {doctor.doctorName && doctor.doctorName.replace(/^Dr\.\s*/i, "").split(" ")[1] ? doctor.doctorName.replace(/^Dr\.\s*/i, "").split(" ")[1].charAt(0).toUpperCase() : "R"}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#ffffff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {doctor.doctorName || "Dr. Sarah Jenkins"}
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                          <span style={{ fontSize: "11px", fontFamily: "monospace", fontWeight: "700", color: "#cbd5e1", backgroundColor: "#1e293b", border: "1px solid #475569", padding: "2px 8px", borderRadius: "6px" }}>
                            ID: {doctor.doctorId || autoDoctorId || "D101"}
                          </span>
                          <span style={{ fontSize: "11px", fontWeight: "700", color: "#a5b4fc", backgroundColor: "rgba(99, 102, 241, 0.2)", border: "1px solid rgba(165, 180, 252, 0.3)", padding: "2px 8px", borderRadius: "6px" }}>
                            {doctor.department || "Cardiology"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Clinical Summary Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div style={{ backgroundColor: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "14px", padding: "12px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", display: "block" }}>Gender & Exp</span>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#ffffff", marginTop: "2px", display: "block" }}>
                          {doctor.gender} ({doctor.experience || 0} yrs)
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
                          {doctor.qualification || "MD, DM Cardiology"}
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

            {/* Actions Footer Bar */}
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
              <button
                type="button"
                onClick={handleFillSampleData}
                style={{
                  padding: "10px 20px",
                  borderRadius: "12px",
                  backgroundColor: "#eef2ff",
                  color: "#4338ca",
                  border: "1px solid #c7d2fe",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  flexShrink: 0
                }}
              >
                <Sparkles size={16} />
                <span>Auto-Fill Sample Data</span>
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0, marginLeft: "auto" }}>
                <button
                  type="button"
                  onClick={handleClose}
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
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "10px 28px",
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
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Registering Doctor...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      <span>Register Doctor Profile</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

