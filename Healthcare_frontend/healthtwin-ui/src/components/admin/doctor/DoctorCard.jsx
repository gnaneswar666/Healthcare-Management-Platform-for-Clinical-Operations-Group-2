import React from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Pencil,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Building2,
  BadgeCheck,
  Stethoscope
} from "lucide-react";

import { deleteDoctor } from "../../../services/doctorService";

export default function DoctorCard({
  doctor,
  onView,
  onEdit,
  onAssign,
  refresh,
}) {
  const initials = (doctor?.doctorName || "DR")
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isActive = String(doctor?.status || "").toUpperCase() === "ACTIVE";

  const dept = doctor?.department || "General Medicine";
  const spec = doctor?.specialization;

  // Deduplicate department & specialization if they are identical (e.g., Cardiology & Cardiology)
  const isSpecSameAsDept = spec && spec.trim().toLowerCase() === dept.trim().toLowerCase();

  const handleDelete = async () => {
    const confirmDelete = window.confirm(`Are you sure you want to delete Dr. ${doctor?.doctorName}?`);
    if (!confirmDelete) return;

    try {
      await deleteDoctor(doctor.doctorId);
      if (refresh) refresh();
    } catch (err) {
      console.error(err);
      alert("Unable to delete doctor.");
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{
        padding: "24px",
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 18px rgba(15, 23, 42, 0.04)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        position: "relative"
      }}
      className="group hover:border-indigo-200 hover:shadow-xl transition-all duration-300"
    >
      <div>
        {/* Top Meta Bar: Doctor ID & Status Badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "18px" }}>
          <span style={{
            fontSize: "11px",
            fontWeight: "700",
            fontFamily: "monospace",
            color: "#475569",
            backgroundColor: "#f1f5f9",
            padding: "4px 10px",
            borderRadius: "8px"
          }}>
            ID: {doctor?.doctorId || "D101"}
          </span>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: "800",
              letterSpacing: "0.03em",
              backgroundColor: isActive ? "#ecfdf5" : "#f1f5f9",
              color: isActive ? "#047857" : "#64748b"
            }}
          >
            <span style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: isActive ? "#10b981" : "#94a3b8"
            }} className={isActive ? "animate-pulse" : ""} />
            {doctor?.status || "INACTIVE"}
          </span>
        </div>

        {/* Doctor Info Row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "18px" }}>
          <div style={{
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontWeight: "800",
            fontSize: "17px",
            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)",
            flexShrink: 0
          }}>
            {initials || <Stethoscope size={22} />}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{
              fontSize: "17px",
              fontWeight: "800",
              color: "#0f172a",
              lineHeight: "1.3",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}>
              Dr. {doctor?.doctorName?.replace(/^Dr\.\s*/i, "")}
            </h3>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px", marginTop: "6px" }}>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                borderRadius: "8px",
                backgroundColor: "#eff6ff",
                padding: "3px 9px",
                fontSize: "11px",
                fontWeight: "700",
                color: "#1d4ed8"
              }}>
                <Building2 size={12} /> {dept}
              </span>

              {spec && !isSpecSameAsDept && (
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  borderRadius: "8px",
                  backgroundColor: "#f5f3ff",
                  padding: "3px 9px",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#6d28d9"
                }}>
                  <BadgeCheck size={12} /> {spec}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Professional Metrics Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
          <div style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "2px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#64748b", fontWeight: "700" }}>
              <Briefcase size={13} style={{ color: "#2563eb" }} /> Experience
            </div>
            <p style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
              {doctor?.experience != null ? `${doctor.experience} Yrs` : "—"}
            </p>
          </div>

          <div style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "2px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#64748b", fontWeight: "700" }}>
              <GraduationCap size={13} style={{ color: "#4f46e5" }} /> Qualification
            </div>
            <p style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={doctor?.qualification}>
              {doctor?.qualification || "MBBS"}
            </p>
          </div>
        </div>

        {/* Contact Snippets */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "#475569", marginBottom: "20px" }}>
          {doctor?.email && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <Mail size={13} style={{ color: "#94a3b8", flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: "600" }}>{doctor.email}</span>
            </div>
          )}
          {doctor?.phone && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Phone size={13} style={{ color: "#94a3b8", flexShrink: 0 }} />
              <span style={{ fontWeight: "600" }}>{doctor.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div style={{ paddingTop: "14px", borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Primary View Action */}
        <button
          type="button"
          onClick={() => onView && onView(doctor)}
          style={{
            width: "100%",
            padding: "10px 18px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
            color: "#ffffff",
            border: "none",
            fontSize: "12px",
            fontWeight: "800",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.15s ease"
          }}
        >
          <Eye size={15} style={{ color: "#ffffff" }} />
          <span>View Full Profile</span>
        </button>

        {/* Quick Actions Bar */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
          <button
            type="button"
            onClick={() => onEdit && onEdit(doctor)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              borderRadius: "10px",
              backgroundColor: "#f1f5f9",
              color: "#334155",
              border: "1px solid #cbd5e1",
              padding: "7px 10px",
              fontSize: "11px",
              fontWeight: "700",
              cursor: "pointer"
            }}
            title="Edit Doctor Profile"
          >
            <Pencil size={12} style={{ color: "#64748b" }} />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => onAssign && onAssign(doctor)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              borderRadius: "10px",
              backgroundColor: "#eff6ff",
              color: "#1d4ed8",
              border: "1px solid #bfdbfe",
              padding: "7px 10px",
              fontSize: "11px",
              fontWeight: "700",
              cursor: "pointer"
            }}
            title="Assign Patients"
          >
            <UserPlus size={12} style={{ color: "#2563eb" }} />
            <span>Assign</span>
          </button>

          <button
            type="button"
            onClick={handleDelete}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              borderRadius: "10px",
              backgroundColor: "#fff1f2",
              color: "#be123c",
              border: "1px solid #fecdd3",
              padding: "7px 10px",
              fontSize: "11px",
              fontWeight: "700",
              cursor: "pointer"
            }}
            title="Delete Doctor"
          >
            <Trash2 size={12} style={{ color: "#e11d48" }} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}