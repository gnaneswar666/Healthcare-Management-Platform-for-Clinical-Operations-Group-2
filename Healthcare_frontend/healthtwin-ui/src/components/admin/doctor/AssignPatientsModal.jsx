import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Loader2,
  Users,
  UserPlus,
  UserMinus,
  Stethoscope,
  BadgeCheck,
  Mars,
  Venus,
  CheckCircle2,
  UserCircle2,
  Sparkles,
  Droplets,
  CheckSquare,
  Square,
  Filter,
  ArrowRightLeft
} from "lucide-react";

import {
  assignPatient,
  getAssignedPatients,
  unAssignPatient,
} from "../../../services/assignmentService";

import { getPatients } from "../../../services/patientService";

export default function AssignPatientsModal({ doctor, onClose }) {
  const [patients, setPatients] = useState([]);
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState("available"); // for mobile screens

  // Batch selection states
  const [selectedAvailable, setSelectedAvailable] = useState([]);
  const [selectedAssigned, setSelectedAssigned] = useState([]);

  useEffect(() => {
    if (!doctor) return;
    let active = true;

    Promise.all([
      getPatients(),
      getAssignedPatients(doctor.doctorId),
    ])
      .then(([patientRes, assignedRes]) => {
        if (!active) return;
        setPatients(patientRes.data || []);
        setAssignedPatients(assignedRes.data || []);
      })
      .catch((err) => {
        console.error("Error fetching assignment data:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [doctor]);

  // Filtered Available Patients
  const filteredPatients = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return patients.filter((patient) => {
      const alreadyAssigned = assignedPatients.some(
        (a) => a.patientId === patient.patientId
      );

      if (alreadyAssigned) return false;

      if (genderFilter !== "ALL" && patient.gender?.toUpperCase() !== genderFilter) {
        return false;
      }

      const fullName = `${patient.firstName || ""} ${patient.lastName || ""}`.toLowerCase();

      return (
        fullName.includes(keyword) ||
        patient.patientId?.toLowerCase().includes(keyword) ||
        patient.email?.toLowerCase().includes(keyword)
      );
    });
  }, [patients, assignedPatients, search, genderFilter]);

  // Filtered Assigned Patients
  const filteredAssigned = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return assignedPatients.filter((patient) => {
      if (genderFilter !== "ALL" && patient.gender?.toUpperCase() !== genderFilter) {
        return false;
      }

      const fullName = `${patient.firstName || ""} ${patient.lastName || ""}`.toLowerCase();

      return (
        fullName.includes(keyword) ||
        patient.patientId?.toLowerCase().includes(keyword) ||
        patient.email?.toLowerCase().includes(keyword)
      );
    });
  }, [assignedPatients, search, genderFilter]);

  // Single Assign
  const handleAssign = async (patientId) => {
    try {
      setActionLoading(patientId);
      await assignPatient({
        doctorId: doctor.doctorId,
        patientId,
      });

      setSelectedAvailable((prev) => prev.filter((id) => id !== patientId));

      const [patientRes, assignedRes] = await Promise.all([
        getPatients(),
        getAssignedPatients(doctor.doctorId),
      ]);
      setPatients(patientRes.data || []);
      setAssignedPatients(assignedRes.data || []);
    } catch (err) {
      console.error("Failed to assign patient:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Single Remove
  const handleRemove = async (patientId) => {
    try {
      setActionLoading(patientId);
      await unAssignPatient(doctor.doctorId, patientId);

      setSelectedAssigned((prev) => prev.filter((id) => id !== patientId));

      const [patientRes, assignedRes] = await Promise.all([
        getPatients(),
        getAssignedPatients(doctor.doctorId),
      ]);
      setPatients(patientRes.data || []);
      setAssignedPatients(assignedRes.data || []);
    } catch (err) {
      console.error("Failed to unassign patient:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Batch Assign
  const handleBatchAssign = async () => {
    if (selectedAvailable.length === 0) return;
    try {
      setActionLoading("batch-assign");
      await Promise.all(
        selectedAvailable.map((patientId) =>
          assignPatient({ doctorId: doctor.doctorId, patientId })
        )
      );
      setSelectedAvailable([]);
      const [patientRes, assignedRes] = await Promise.all([
        getPatients(),
        getAssignedPatients(doctor.doctorId),
      ]);
      setPatients(patientRes.data || []);
      setAssignedPatients(assignedRes.data || []);
    } catch (err) {
      console.error("Failed batch assignment:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Batch Remove
  const handleBatchRemove = async () => {
    if (selectedAssigned.length === 0) return;
    try {
      setActionLoading("batch-remove");
      await Promise.all(
        selectedAssigned.map((patientId) =>
          unAssignPatient(doctor.doctorId, patientId)
        )
      );
      setSelectedAssigned([]);
      const [patientRes, assignedRes] = await Promise.all([
        getPatients(),
        getAssignedPatients(doctor.doctorId),
      ]);
      setPatients(patientRes.data || []);
      setAssignedPatients(assignedRes.data || []);
    } catch (err) {
      console.error("Failed batch remove:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Selection Toggles
  const toggleSelectAvailable = (patientId) => {
    setSelectedAvailable((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId]
    );
  };

  const toggleSelectAllAvailable = () => {
    if (selectedAvailable.length === filteredPatients.length) {
      setSelectedAvailable([]);
    } else {
      setSelectedAvailable(filteredPatients.map((p) => p.patientId));
    }
  };

  const toggleSelectAssigned = (patientId) => {
    setSelectedAssigned((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId]
    );
  };

  const toggleSelectAllAssigned = () => {
    if (selectedAssigned.length === filteredAssigned.length) {
      setSelectedAssigned([]);
    } else {
      setSelectedAssigned(filteredAssigned.map((p) => p.patientId));
    }
  };

  const counts = {
    total: patients.length,
    assigned: assignedPatients.length,
    available: Math.max(0, patients.length - assignedPatients.length),
  };

  const assignedPercentage = counts.total > 0
    ? Math.round((counts.assigned / counts.total) * 100)
    : 0;

  if (!doctor) return null;

  const doctorInitials = (doctor?.doctorName || "DR")
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const rawDept = (doctor?.department || "").trim();
  const rawSpec = (doctor?.specialization || "").trim();
  const isSame = rawDept && rawSpec && rawDept.toLowerCase() === rawSpec.toLowerCase();

  const displaySubtitle = (() => {
    if (!rawDept && !rawSpec) return "Clinical Operations";
    if (rawDept && rawSpec && !isSame) return `${rawDept} • ${rawSpec}`;
    return rawDept || rawSpec;
  })();

  return (
    <AnimatePresence>
      <div
        style={{ zIndex: 99999 }}
        className="fixed inset-0 flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-y-auto"
      >
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: "920px",
            maxHeight: "90vh",
            borderRadius: "24px",
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            boxShadow: "0 25px 60px -15px rgba(15, 23, 42, 0.4)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            margin: "auto",
            position: "relative",
            zIndex: 10
          }}
        >
          {/* Header Banner - Executive Midnight Slate Gradient */}
          <div
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)",
              padding: "22px 32px",
              borderBottom: "1px solid #334155",
              color: "#ffffff",
              flexShrink: 0,
              position: "relative"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              {/* Doctor Details */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0, flex: 1 }}>
                <div style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontWeight: "800",
                  fontSize: "18px",
                  boxShadow: "0 4px 14px rgba(59, 130, 246, 0.35)",
                  flexShrink: 0
                }}>
                  {doctorInitials || <Stethoscope size={24} />}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
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
                      <Sparkles size={12} style={{ color: "#60a5fa" }} /> PATIENT ASSIGNMENT HUB
                    </span>
                    <span style={{
                      fontFamily: "monospace",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#cbd5e1",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      padding: "2px 8px",
                      borderRadius: "6px"
                    }}>
                      ID: {doctor.doctorId}
                    </span>
                  </div>

                  <h2 style={{ color: "#ffffff", fontSize: "22px", fontWeight: "800", margin: 0, lineHeight: 1.2 }}>
                    Dr. {doctor.doctorName?.replace(/^Dr\.\s*/i, "")}
                  </h2>
                  <p style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "500", margin: "4px 0 0 0", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Stethoscope size={13} style={{ color: "#60a5fa" }} />
                    <span>{displaySubtitle}</span>
                  </p>
                </div>
              </div>

              {/* Right Side Header Controls: Capacity Meter & Close Button */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                {/* Patient Capacity Load Meter */}
                <div style={{
                  backgroundColor: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "14px",
                  padding: "8px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ color: "#94a3b8", fontSize: "10px", fontWeight: "800", textTransform: "uppercase", margin: 0 }}>
                      Assigned Load
                    </p>
                    <p style={{ color: "#ffffff", fontSize: "15px", fontWeight: "800", margin: "2px 0 0 0" }}>
                      {counts.assigned} <span style={{ fontSize: "11px", color: "#cbd5e1", fontWeight: "600" }}>/ {counts.total} Patients</span>
                    </p>
                  </div>
                  <div style={{ position: "relative", width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg className="w-9 h-9 transform -rotate-90">
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        stroke="rgba(255, 255, 255, 0.15)"
                        strokeWidth="3"
                        fill="transparent"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        stroke="#60a5fa"
                        strokeWidth="3"
                        fill="transparent"
                        strokeDasharray={88}
                        strokeDashoffset={88 - (88 * assignedPercentage) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span style={{ position: "absolute", color: "#ffffff", fontSize: "10px", fontWeight: "800" }}>
                      {assignedPercentage}%
                    </span>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0
                  }}
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "14px 28px", flexShrink: 0 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
              {/* Search Bar */}
              <div style={{ position: "relative", flex: 1, maxWidth: "420px" }}>
                <Search
                  size={16}
                  style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search patient by name, ID, or email..."
                  style={{
                    width: "100%",
                    height: "40px",
                    paddingLeft: "36px",
                    paddingRight: "36px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#0f172a",
                    outline: "none"
                  }}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Gender Filter Pills */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Filter size={12} /> Filter:
                </span>
                {["ALL", "MALE", "FEMALE"].map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => setGenderFilter(gender)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      backgroundColor: genderFilter === gender ? "#2563eb" : "#ffffff",
                      color: genderFilter === gender ? "#ffffff" : "#475569",
                      border: genderFilter === gender ? "none" : "1px solid #cbd5e1"
                    }}
                  >
                    {gender === "ALL" ? "All Patients" : gender === "MALE" ? "Male" : "Female"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Tab Switcher */}
          <div className="flex lg:hidden border-b border-slate-200 bg-slate-200/80 p-2 gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("available")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "available"
                  ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Users size={15} />
              <span>Available ({filteredPatients.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("assigned")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "assigned"
                  ? "bg-white text-emerald-700 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <BadgeCheck size={15} />
              <span>Assigned ({filteredAssigned.length})</span>
            </button>
          </div>

          {/* Main Dual-Column Transfer Content Area */}
          <div style={{ flex: 1, minHeight: 0, backgroundColor: "#f8fafc", padding: "20px 28px", overflow: "hidden" }}>
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-full">
                <SkeletonColumn title="Available Patients" />
                <SkeletonColumn title="Assigned Patients" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-full min-h-0">
                {/* Left Transfer Column: Available Patients */}
                <div
                  style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}
                  className={activeTab !== "available" ? "hidden lg:flex" : "flex"}
                >
                  {/* Column Header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", backgroundColor: "#eff6ff", padding: "12px 18px", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <button
                        type="button"
                        onClick={toggleSelectAllAvailable}
                        disabled={filteredPatients.length === 0}
                        style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
                        title="Select All Available"
                      >
                        {selectedAvailable.length > 0 &&
                        selectedAvailable.length === filteredPatients.length ? (
                          <CheckSquare size={17} style={{ color: "#2563eb" }} />
                        ) : (
                          <Square size={17} />
                        )}
                      </button>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Users size={15} style={{ color: "#2563eb" }} />
                        <h3 style={{ fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.04em", color: "#1e3a8a", margin: 0 }}>
                          Available Patients
                        </h3>
                        <span style={{ fontSize: "11px", fontWeight: "800", color: "#1d4ed8", backgroundColor: "#ffffff", border: "1px solid #bfdbfe", padding: "1px 8px", borderRadius: "12px" }}>
                          {filteredPatients.length}
                        </span>
                      </div>
                    </div>

                    {/* Batch Assign Button */}
                    {selectedAvailable.length > 0 && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        disabled={actionLoading === "batch-assign"}
                        onClick={handleBatchAssign}
                        style={{
                          padding: "5px 12px",
                          borderRadius: "8px",
                          backgroundColor: "#2563eb",
                          color: "#ffffff",
                          border: "none",
                          fontSize: "11px",
                          fontWeight: "800",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px"
                        }}
                      >
                        {actionLoading === "batch-assign" ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <UserPlus size={13} />
                        )}
                        <span>Assign Selected ({selectedAvailable.length})</span>
                      </motion.button>
                    )}
                  </div>

                  {/* Patient Scroll List */}
                  <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "10px", minHeight: 0 }}>
                    {filteredPatients.length === 0 ? (
                      <EmptyColumn
                        icon={UserCircle2}
                        title="No Available Patients"
                        subtitle={
                          search || genderFilter !== "ALL"
                            ? "No patient matches your active filter criteria."
                            : "All registered patients are currently assigned to this doctor."
                        }
                      />
                    ) : (
                      filteredPatients.map((patient) => (
                        <PatientTransferCard
                          key={patient.patientId}
                          patient={patient}
                          type="available"
                          isSelected={selectedAvailable.includes(patient.patientId)}
                          onToggleSelect={() => toggleSelectAvailable(patient.patientId)}
                          onAction={() => handleAssign(patient.patientId)}
                          loading={actionLoading === patient.patientId}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Right Transfer Column: Assigned Patients */}
                <div
                  style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}
                  className={activeTab !== "assigned" ? "hidden lg:flex" : "flex"}
                >
                  {/* Column Header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", backgroundColor: "#ecfdf5", padding: "12px 18px", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <button
                        type="button"
                        onClick={toggleSelectAllAssigned}
                        disabled={filteredAssigned.length === 0}
                        style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
                        title="Select All Assigned"
                      >
                        {selectedAssigned.length > 0 &&
                        selectedAssigned.length === filteredAssigned.length ? (
                          <CheckSquare size={17} style={{ color: "#d97706" }} />
                        ) : (
                          <Square size={17} />
                        )}
                      </button>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <BadgeCheck size={15} style={{ color: "#059669" }} />
                        <h3 style={{ fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.04em", color: "#065f46", margin: 0 }}>
                          Assigned Patients
                        </h3>
                        <span style={{ fontSize: "11px", fontWeight: "800", color: "#047857", backgroundColor: "#ffffff", border: "1px solid #a7f3d0", padding: "1px 8px", borderRadius: "12px" }}>
                          {filteredAssigned.length}
                        </span>
                      </div>
                    </div>

                    {/* Batch Remove Button */}
                    {selectedAssigned.length > 0 && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        disabled={actionLoading === "batch-remove"}
                        onClick={handleBatchRemove}
                        style={{
                          padding: "5px 12px",
                          borderRadius: "8px",
                          backgroundColor: "#f59e0b",
                          color: "#ffffff",
                          border: "none",
                          fontSize: "11px",
                          fontWeight: "800",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px"
                        }}
                      >
                        {actionLoading === "batch-remove" ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <UserMinus size={13} />
                        )}
                        <span>Remove Selected ({selectedAssigned.length})</span>
                      </motion.button>
                    )}
                  </div>

                  {/* Patient Scroll List */}
                  <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "10px", minHeight: 0 }}>
                    {filteredAssigned.length === 0 ? (
                      <EmptyColumn
                        icon={CheckCircle2}
                        title="No Assigned Patients"
                        subtitle={
                          search || genderFilter !== "ALL"
                            ? "No assigned patient matches your active filter criteria."
                            : "This doctor currently has no patients assigned."
                        }
                      />
                    ) : (
                      filteredAssigned.map((patient) => (
                        <PatientTransferCard
                          key={patient.patientId}
                          patient={patient}
                          type="assigned"
                          isSelected={selectedAssigned.includes(patient.patientId)}
                          onToggleSelect={() => toggleSelectAssigned(patient.patientId)}
                          onAction={() => handleRemove(patient.patientId)}
                          loading={actionLoading === patient.patientId}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fixed Footer Bar - Zero Button Truncation with Generous Inset */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderTop: "1px solid #e2e8f0",
              padding: "16px 32px 18px 32px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexShrink: 0,
              position: "relative",
              zIndex: 10
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "600", color: "#475569" }}>
              <ArrowRightLeft size={15} style={{ color: "#2563eb", flexShrink: 0 }} />
              <span>
                Total Registry: <strong style={{ color: "#0f172a" }}>{counts.total}</strong> | Assigned:{" "}
                <strong style={{ color: "#047857" }}>{counts.assigned}</strong> | Available:{" "}
                <strong style={{ color: "#1d4ed8" }}>{counts.available}</strong>
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "auto", paddingRight: "16px", flexShrink: 0 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "9px 22px",
                  borderRadius: "10px",
                  backgroundColor: "#f1f5f9",
                  color: "#334155",
                  border: "1px solid #cbd5e1",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease"
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "9px 28px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                  color: "#ffffff",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: "800",
                  cursor: "pointer",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
                  marginRight: "12px"
                }}
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function PatientTransferCard({
  patient,
  type,
  isSelected,
  onToggleSelect,
  onAction,
  loading,
}) {
  const isAssigned = type === "assigned";
  const initials =
    `${patient.firstName?.[0] || ""}${patient.lastName?.[0] || ""}`.toUpperCase() || "PT";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "12px 16px",
        borderRadius: "12px",
        backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
        border: isSelected ? "1px solid #3b82f6" : "1px solid #e2e8f0"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
        {/* Selection Checkbox */}
        <button
          type="button"
          onClick={onToggleSelect}
          style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 0, flexShrink: 0 }}
        >
          {isSelected ? (
            <CheckSquare size={17} style={{ color: "#2563eb" }} />
          ) : (
            <Square size={17} />
          )}
        </button>

        {/* Patient Avatar Badge */}
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          backgroundColor: "#f1f5f9",
          border: "1px solid #cbd5e1",
          color: "#0f172a",
          fontWeight: "800",
          fontSize: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }}>
          {initials}
        </div>

        {/* Patient Metadata */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <h4 style={{ fontWeight: "800", color: "#0f172a", fontSize: "13px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {patient.firstName} {patient.lastName}
            </h4>
            {isAssigned && <BadgeCheck size={14} style={{ color: "#10b981", flexShrink: 0 }} />}
          </div>

          <div style={{ marginTop: "2px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px", fontSize: "11px", color: "#64748b" }}>
            <span style={{ fontFamily: "monospace", fontWeight: "700", color: "#334155", backgroundColor: "#f1f5f9", padding: "1px 6px", borderRadius: "4px", fontSize: "10px" }}>
              {patient.patientId}
            </span>

            {patient.gender && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", color: "#475569" }}>
                {patient.gender === "Female" ? (
                  <Venus size={11} style={{ color: "#f43f5e" }} />
                ) : (
                  <Mars size={11} style={{ color: "#3b82f6" }} />
                )}
                {patient.gender}
              </span>
            )}

            {patient.bloodGroup && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", color: "#475569" }}>
                <Droplets size={10} style={{ color: "#f43f5e" }} />
                {patient.bloodGroup}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Button (Assign or Remove) */}
      <button
        type="button"
        disabled={loading}
        onClick={onAction}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: "7px 14px",
          borderRadius: "10px",
          fontSize: "11px",
          fontWeight: "800",
          cursor: "pointer",
          flexShrink: 0,
          backgroundColor: isAssigned ? "#fffbeb" : "#2563eb",
          color: isAssigned ? "#b45309" : "#ffffff",
          border: isAssigned ? "1px solid #fde68a" : "none",
          boxShadow: isAssigned ? "none" : "0 2px 8px rgba(37, 99, 235, 0.3)"
        }}
      >
        {loading ? (
          <Loader2 size={13} className="animate-spin" />
        ) : isAssigned ? (
          <>
            <UserMinus size={13} />
            <span>Remove</span>
          </>
        ) : (
          <>
            <UserPlus size={13} />
            <span>Assign</span>
          </>
        )
      }
      </button>
    </motion.div>
  );
}

function EmptyColumn({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: "14px", border: "1px dashed #cbd5e1", backgroundColor: "#ffffff", padding: "36px 16px", textAlign: "center", height: "100%", minHeight: "200px" }}>
      <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f1f5f9", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", marginBottom: "10px" }}>
        <Icon size={20} />
      </div>
      <h4 style={{ fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.04em", color: "#334155", margin: 0 }}>{title}</h4>
      <p style={{ marginTop: "4px", fontSize: "11px", color: "#64748b", fontWeight: "500", maxWidth: "260px", margin: 0 }}>{subtitle}</p>
    </div>
  );
}

function SkeletonColumn({ title }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", borderRadius: "14px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", padding: "16px", gap: "12px" }}>
      <div style={{ height: "18px", width: "120px", backgroundColor: "#f1f5f9", borderRadius: "6px" }} className="animate-pulse" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "12px", border: "1px solid #f1f5f9" }} className="animate-pulse">
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#f1f5f9", flexShrink: 0 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ height: "12px", width: "100px", backgroundColor: "#f1f5f9", borderRadius: "4px" }} />
            <div style={{ height: "10px", width: "140px", backgroundColor: "#f1f5f9", borderRadius: "4px" }} />
          </div>
          <div style={{ width: "60px", height: "26px", backgroundColor: "#f1f5f9", borderRadius: "8px", flexShrink: 0 }} />
        </div>
      ))}
    </div>
  );
}
