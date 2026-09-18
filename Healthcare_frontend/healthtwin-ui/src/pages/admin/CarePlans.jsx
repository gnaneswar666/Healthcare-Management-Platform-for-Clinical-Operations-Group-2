import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Search,
    ShieldCheck,
    AlertTriangle,
    Activity,
    Pill,
    Utensils,
    Dumbbell,
    Moon,
    CheckCircle2,
    Clock3,
    UserRound,
    FileText,
    TrendingUp,
    ClipboardList,
    Users,
    Award,
    HeartPulse,
    Check,
    ChevronRight,
    FileHeart,
    Stethoscope,
    Lock,
    Target,
    Sparkles,
    UserCheck,
    CalendarDays
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout";
import { getPatients } from "../../services/patientService";
import {
    getCarePlan,
    getPendingCarePlans,
    getDashboardStats,
    getTodayProgress
} from "../../services/carePlanService";

const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: "easeOut", staggerChildren: 0.05 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } }
};

function CarePlans() {
    const [patients, setPatients] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState("P101");
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("ALL"); // ALL | PENDING | HIGH_RISK

    const [carePlan, setCarePlan] = useState(null);
    const [todayProgress, setTodayProgress] = useState(null);
    const [pendingPlans, setPendingPlans] = useState([]);
    const [dashboardStats, setDashboardStats] = useState({
        activeCarePlans: 124,
        averageAdherence: 82,
        pendingApproval: 8,
        recoveredPatients: 34,
        highRiskPatients: 14
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Calculate age helper
    const calculateAge = (dob) => {
        if (!dob) return null;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age > 0 ? age : null;
    };

    // Load initial patient list and dashboard stats
    useEffect(() => {
        let isMounted = true;
        const init = async () => {
            try {
                const [patientsRes, statsRes, pendingRes] = await Promise.all([
                    getPatients().catch(() => ({ data: [] })),
                    getDashboardStats().catch(() => null),
                    getPendingCarePlans().catch(() => null)
                ]);

                if (!isMounted) return;

                if (patientsRes?.data?.length > 0) {
                    setPatients(patientsRes.data);
                    const initialId = patientsRes.data[0].patientId || "P101";
                    setSelectedPatientId(initialId);
                    loadCarePlanData(initialId);
                }

                if (statsRes?.data) setDashboardStats(statsRes.data);
                if (pendingRes?.data) setPendingPlans(pendingRes.data);
            } catch (err) {
                console.error("Failed to load initial care plan data:", err);
            }
        };
        init();
        return () => { isMounted = false; };
    }, []);

    const loadCarePlanData = async (targetPatientId) => {
        if (!targetPatientId) return;
        setLoading(true);
        setError("");
        try {
            const [planRes, progRes] = await Promise.all([
                getCarePlan(targetPatientId).catch(() => null),
                getTodayProgress(targetPatientId).catch(() => null)
            ]);

            setCarePlan(planRes?.data || null);

            if (progRes?.data) {
                setTodayProgress(progRes.data);
            } else {
                setTodayProgress(null);
            }
        } catch (err) {
            console.error("Error loading care plan data:", err);
            setError("Unable to load care plan progress for patient " + targetPatientId);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPatient = (pId) => {
        setSelectedPatientId(pId);
        loadCarePlanData(pId);
    };

    // Filter patients by search & tab
    const filteredPatients = useMemo(() => {
        return patients.filter((p) => {
            const q = search.toLowerCase();
            const matchesSearch =
                (p.firstName || "").toLowerCase().includes(q) ||
                (p.lastName || "").toLowerCase().includes(q) ||
                (p.patientId || "").toLowerCase().includes(q);

            if (!matchesSearch) return false;

            if (activeTab === "PENDING") {
                return pendingPlans.some((pending) => pending.patientId === p.patientId);
            }
            if (activeTab === "HIGH_RISK") {
                return String(p.riskLevel || "").toUpperCase() === "HIGH" || String(p.riskLevel || "").toUpperCase() === "CRITICAL";
            }
            return true;
        });
    }, [patients, search, activeTab, pendingPlans]);

    const activePatient = patients.find((p) => p.patientId === selectedPatientId) || {
        firstName: "Patient",
        lastName: selectedPatientId,
        patientId: selectedPatientId
    };

    // Compute progress details from todayProgress API
    const progressTasks = useMemo(() => {
        if (!todayProgress) {
            return {
                completedCount: 0,
                totalTasks: 6,
                adherence: carePlan?.adherenceRate ?? Math.round(Number(carePlan?.adherenceScore || 0)),
                items: {
                    medication: false,
                    diet: false,
                    exercise: false,
                    sleep: false,
                    bp: false,
                    sugar: false
                }
            };
        }

        const items = {
            medication: !!todayProgress.medicationCompleted,
            diet: !!todayProgress.dietCompleted,
            exercise: !!todayProgress.exerciseCompleted,
            sleep: !!todayProgress.sleepCompleted,
            bp: !!todayProgress.bpChecked,
            sugar: !!todayProgress.sugarChecked
        };

        const completedCount = Object.values(items).filter(Boolean).length;
        const computedAdherence = todayProgress.adherence != null
            ? Math.round(todayProgress.adherence)
            : Math.round((completedCount / 6) * 100);

        return {
            completedCount,
            totalTasks: 6,
            adherence: computedAdherence,
            items
        };
    }, [todayProgress, carePlan]);

    const currentStatus = carePlan?.status || "APPROVED";

    return (
        <AdminLayout>
            <motion.div
                className="space-y-6 max-w-[1700px] mx-auto pb-12"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* 1. HERO HEADER BANNER */}
                <motion.div variants={itemVariants} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px", paddingBottom: "16px", borderBottom: "1px solid #e2e8f0" }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            backgroundColor: "#f0fdf4",
                            color: "#15803d",
                            border: "1px solid #bbf7d0",
                            fontSize: "11px",
                            fontWeight: "800",
                            padding: "3px 10px",
                            borderRadius: "8px",
                            marginBottom: "6px"
                        }}>
                            <FileHeart size={14} style={{ color: "#16a34a" }} /> Care Plan Telemetry & Protocol Tracker
                        </div>
                        <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0, lineHeight: 1.2 }}>
                            Patient Care Plan Progress
                        </h1>
                        <p style={{ fontSize: "13px", color: "#64748b", fontWeight: "500", margin: "4px 0 0 0" }}>
                            Enterprise dashboard for monitoring daily adherence telemetry, care plan interventions, and physician protocol compliance across all registered patients.
                        </p>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                        <div style={{
                            backgroundColor: "#f8fafc",
                            border: "1px solid #cbd5e1",
                            padding: "8px 16px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "#334155",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px"
                        }}>
                            <Lock size={14} style={{ color: "#64748b" }} />
                            <span>Admin Portal View</span>
                        </div>
                    </div>
                </motion.div>

                {/* 2. TOP METRICS STAT CARDS */}
                <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                    {/* Active Plans */}
                    <div style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "16px", padding: "18px 20px", boxShadow: "0 4px 14px rgba(15, 23, 42, 0.03)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                            <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" }}>Active Plans</span>
                            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <ClipboardList size={18} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0 }}>{dashboardStats.activeCarePlans}</h3>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#16a34a", display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                            <TrendingUp size={12} /> Active in system
                        </span>
                    </div>

                    {/* Avg Adherence */}
                    <div style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "16px", padding: "18px 20px", boxShadow: "0 4px 14px rgba(15, 23, 42, 0.03)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                            <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" }}>Avg Adherence</span>
                            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Award size={18} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0 }}>{dashboardStats.averageAdherence}%</h3>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#16a34a", display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                            <CheckCircle2 size={12} /> Daily compliance
                        </span>
                    </div>

                    {/* Pending Review */}
                    <div style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "16px", padding: "18px 20px", boxShadow: "0 4px 14px rgba(15, 23, 42, 0.03)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                            <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#d97706" }}>Pending Review</span>
                            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#fffbeb", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Clock3 size={18} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#92400e", margin: 0 }}>{pendingPlans.length || dashboardStats.pendingApproval}</h3>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#b45309", display: "block", marginTop: "4px" }}>Awaiting physician</span>
                    </div>

                    {/* Recovered */}
                    <div style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "16px", padding: "18px 20px", boxShadow: "0 4px 14px rgba(15, 23, 42, 0.03)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                            <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" }}>Recovered</span>
                            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#e0e7ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <ShieldCheck size={18} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0 }}>{dashboardStats.recoveredPatients || 34}</h3>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#4338ca", display: "block", marginTop: "4px" }}>Risk reduced</span>
                    </div>

                    {/* High Risk */}
                    <div style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "16px", padding: "18px 20px", boxShadow: "0 4px 14px rgba(15, 23, 42, 0.03)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                            <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#e11d48" }}>High Risk</span>
                            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#fff1f2", color: "#e11d48", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <AlertTriangle size={18} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#9f1239", margin: 0 }}>{dashboardStats.highRiskPatients}</h3>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#be123c", display: "block", marginTop: "4px" }}>Priority cases</span>
                    </div>
                </motion.div>

                {/* 3. MAIN DASHBOARD CONTENT: 2-COLUMN SPLIT LAYOUT */}
                <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "24px", alignItems: "start" }}>
                    
                    {/* LEFT COLUMN: VERTICAL PATIENTS DIRECTORY SELECTOR */}
                    <div style={{ gridColumn: "span 4", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "20px", padding: "20px", boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)" }} className="space-y-4">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "14px", borderBottom: "1px solid #e2e8f0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <Users size={18} style={{ color: "#2563eb" }} />
                                <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Patients Directory</h3>
                            </div>
                            <span style={{ fontSize: "11px", fontWeight: "800", color: "#475569", backgroundColor: "#f1f5f9", padding: "2px 10px", borderRadius: "20px", border: "1px solid #cbd5e1" }}>
                                {patients.length} Total
                            </span>
                        </div>

                        {/* SEARCH INPUT */}
                        <div style={{ position: "relative" }}>
                            <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                            <input
                                type="text"
                                placeholder="Search patient name or ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "8px 12px 8px 40px",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    borderRadius: "12px",
                                    border: "1px solid #cbd5e1",
                                    backgroundColor: "#f8fafc",
                                    color: "#0f172a",
                                    outline: "none"
                                }}
                            />
                        </div>

                        {/* FILTER TABS */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                            <button
                                type="button"
                                onClick={() => setActiveTab("ALL")}
                                style={{
                                    flex: 1,
                                    padding: "6px 0",
                                    fontSize: "11px",
                                    fontWeight: "800",
                                    borderRadius: "8px",
                                    border: "none",
                                    backgroundColor: activeTab === "ALL" ? "#0f172a" : "transparent",
                                    color: activeTab === "ALL" ? "#ffffff" : "#475569",
                                    cursor: "pointer"
                                }}
                            >
                                All ({patients.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("PENDING")}
                                style={{
                                    flex: 1,
                                    padding: "6px 0",
                                    fontSize: "11px",
                                    fontWeight: "800",
                                    borderRadius: "8px",
                                    border: "none",
                                    backgroundColor: activeTab === "PENDING" ? "#d97706" : "transparent",
                                    color: activeTab === "PENDING" ? "#ffffff" : "#475569",
                                    cursor: "pointer"
                                }}
                            >
                                Pending ({pendingPlans.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("HIGH_RISK")}
                                style={{
                                    flex: 1,
                                    padding: "6px 0",
                                    fontSize: "11px",
                                    fontWeight: "800",
                                    borderRadius: "8px",
                                    border: "none",
                                    backgroundColor: activeTab === "HIGH_RISK" ? "#e11d48" : "transparent",
                                    color: activeTab === "HIGH_RISK" ? "#ffffff" : "#475569",
                                    cursor: "pointer"
                                }}
                            >
                                High Risk
                            </button>
                        </div>

                        {/* VERTICAL PATIENT LIST */}
                        <div style={{ maxHeight: "600px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", paddingRight: "4px" }}>
                            {filteredPatients.map((p) => {
                                const isSelected = p.patientId === selectedPatientId;
                                const age = calculateAge(p.dob);
                                const isPending = pendingPlans.some((pending) => pending.patientId === p.patientId);

                                return (
                                    <button
                                        key={p.patientId}
                                        type="button"
                                        onClick={() => handleSelectPatient(p.patientId)}
                                        style={{
                                            width: "100%",
                                            textAlign: "left",
                                            padding: "12px 14px",
                                            borderRadius: "14px",
                                            backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
                                            border: `1px solid ${isSelected ? "#3b82f6" : "#cbd5e1"}`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            cursor: "pointer",
                                            boxShadow: isSelected ? "0 2px 8px rgba(59, 130, 246, 0.15)" : "none"
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                                            <div style={{
                                                width: "38px",
                                                height: "38px",
                                                borderRadius: "10px",
                                                background: isSelected ? "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)" : "#f1f5f9",
                                                color: isSelected ? "#ffffff" : "#334155",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "12px",
                                                fontWeight: "800",
                                                flexShrink: 0
                                            }}>
                                                {(p.firstName?.[0] || "") + (p.lastName?.[0] || "")}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <p style={{ fontWeight: "800", fontSize: "13px", color: "#0f172a", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                        {p.firstName} {p.lastName}
                                                    </p>
                                                    {isPending && (
                                                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#f59e0b", flexShrink: 0 }} title="Pending Doctor Review" />
                                                    )}
                                                </div>
                                                <p style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", margin: "2px 0 0 0", display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <span style={{ fontFamily: "monospace", backgroundColor: "#f1f5f9", color: "#334155", padding: "1px 6px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>{p.patientId}</span>
                                                    {age && <span>• {age} yrs</span>}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} style={{ color: isSelected ? "#2563eb" : "#cbd5e1", flexShrink: 0 }} />
                                    </button>
                                );
                            })}

                            {filteredPatients.length === 0 && (
                                <div style={{ textAlign: "center", padding: "30px 0", fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>
                                    No patients match the selected filter.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: CARE PLAN DETAILS & TELEMETRY DASHBOARD */}
                    <div style={{ gridColumn: "span 8", display: "flex", flexDirection: "column", gap: "24px" }}>
                        {error && (
                            <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "14px", padding: "14px 18px", fontSize: "12px", fontWeight: "700", color: "#be123c", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <AlertTriangle size={16} style={{ color: "#e11d48", flexShrink: 0 }} />
                                    <span>{error}</span>
                                </div>
                                <button type="button" onClick={() => setError("")} style={{ color: "#e11d48", background: "none", border: "none", cursor: "pointer", fontWeight: "800" }}>Dismiss</button>
                            </div>
                        )}

                        {loading ? (
                            <div style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "20px", padding: "60px 24px", textAlign: "center", boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                                <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                                <p style={{ fontWeight: "800", fontSize: "15px", color: "#0f172a", margin: 0 }}>Loading Patient Care Plan...</p>
                                <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Fetching compliance telemetry for Patient {selectedPatientId}</p>
                            </div>
                        ) : carePlan ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                {/* CARE PLAN HEADER CARD */}
                                <div style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)" }}>
                                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
                                            <div style={{
                                                width: "56px",
                                                height: "56px",
                                                borderRadius: "16px",
                                                background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                                                color: "#ffffff",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: "800",
                                                fontSize: "20px",
                                                boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
                                                flexShrink: 0
                                            }}>
                                                {(activePatient.firstName?.[0] || "") + (activePatient.lastName?.[0] || "")}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                                                    <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                                                        {activePatient.firstName} {activePatient.lastName}
                                                    </h2>
                                                    <span style={{
                                                        backgroundColor: currentStatus === "APPROVED" ? "#ecfdf5" : currentStatus === "REJECTED" ? "#fff1f2" : "#fffbeb",
                                                        color: currentStatus === "APPROVED" ? "#047857" : currentStatus === "REJECTED" ? "#be123c" : "#b45309",
                                                        border: `1px solid ${currentStatus === "APPROVED" ? "#a7f3d0" : currentStatus === "REJECTED" ? "#fecdd3" : "#fde68a"}`,
                                                        fontSize: "11px",
                                                        fontWeight: "800",
                                                        padding: "3px 10px",
                                                        borderRadius: "20px",
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "6px"
                                                    }}>
                                                        {currentStatus === "APPROVED" && <CheckCircle2 size={13} style={{ color: "#10b981" }} />}
                                                        {currentStatus === "PENDING" && <Clock3 size={13} style={{ color: "#d97706" }} />}
                                                        {currentStatus === "REJECTED" && <AlertTriangle size={13} style={{ color: "#e11d48" }} />}
                                                        Doctor Status: {currentStatus}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", margin: 0, display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
                                                    <span>Patient ID: <strong style={{ fontFamily: "monospace", color: "#0f172a", backgroundColor: "#f1f5f9", padding: "1px 6px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>{selectedPatientId}</strong></span>
                                                    <span>•</span>
                                                    <span>Created: {carePlan.createdAt ? new Date(carePlan.createdAt).toLocaleDateString() : "Today"}</span>
                                                    <span>•</span>
                                                    <span>Physician: {carePlan.doctorId || carePlan.approvedBy || "DOC101"}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div style={{
                                            backgroundColor: "#f8fafc",
                                            border: "1px solid #cbd5e1",
                                            padding: "8px 16px",
                                            borderRadius: "12px",
                                            fontSize: "12px",
                                            fontWeight: "700",
                                            color: "#334155",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            flexShrink: 0,
                                            whiteSpace: "nowrap"
                                        }}>
                                            <Stethoscope size={16} style={{ color: "#2563eb" }} />
                                            <span>Clinical Interventions Active</span>
                                        </div>
                                    </div>
                                </div>

                                {/* LIVE DAILY ADHERENCE PROGRESS TRACKER CARD */}
                                <div style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)" }} className="space-y-5">
                                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "14px" }}>
                                        <div>
                                            <span style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                                                <Activity size={18} style={{ color: "#16a34a" }} />
                                                Today's Patient Adherence Telemetry
                                            </span>
                                            <p style={{ fontSize: "12px", color: "#64748b", fontWeight: "500", margin: "2px 0 0 0" }}>
                                                {progressTasks.completedCount} of {progressTasks.totalTasks} Daily Compliance Tasks Completed Today
                                            </p>
                                        </div>

                                        {/* ADHERENCE SCORE BADGE - UNCLIPPED */}
                                        <div style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
                                            color: "#ffffff",
                                            padding: "10px 18px",
                                            borderRadius: "14px",
                                            boxShadow: "0 4px 14px rgba(5, 150, 105, 0.3)",
                                            flexShrink: 0,
                                            whiteSpace: "nowrap"
                                        }}>
                                            <Award size={22} style={{ color: "#a7f3d0", flexShrink: 0 }} />
                                            <div>
                                                <div style={{ fontSize: "20px", fontWeight: "900", lineHeight: 1 }}>{progressTasks.adherence}%</div>
                                                <div style={{ fontSize: "9px", fontWeight: "800", color: "#d1fae5", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "2px" }}>Daily Score</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar Track */}
                                    <div style={{ width: "100%", height: "10px", backgroundColor: "#e2e8f0", borderRadius: "20px", overflow: "hidden" }}>
                                        <div
                                            style={{
                                                height: "100%",
                                                borderRadius: "20px",
                                                background: "linear-gradient(90deg, #10b981 0%, #14b8a6 100%)",
                                                transition: "width 0.5s ease-out",
                                                width: `${Math.max(4, Math.min(100, progressTasks.adherence))}%`
                                            }}
                                        />
                                    </div>

                                    {/* 6 DAILY TASKS STATUS GRID */}
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", paddingTop: "6px" }}>
                                        {[
                                            { key: "medication", label: "Medication Schedule", icon: Pill },
                                            { key: "diet", label: "Dietary Protocol", icon: Utensils },
                                            { key: "exercise", label: "Exercise & Workout", icon: Dumbbell },
                                            { key: "sleep", label: "Sleep & Rest Log", icon: Moon },
                                            { key: "bp", label: "Blood Pressure Log", icon: Activity },
                                            { key: "sugar", label: "Blood Sugar Log", icon: HeartPulse }
                                        ].map((task) => {
                                            const isDone = progressTasks.items[task.key];
                                            const IconComponent = task.icon;
                                            return (
                                                <div
                                                    key={task.key}
                                                    style={{
                                                        padding: "12px 14px",
                                                        borderRadius: "14px",
                                                        backgroundColor: isDone ? "#f0fdf4" : "#f8fafc",
                                                        border: `1px solid ${isDone ? "#bbf7d0" : "#cbd5e1"}`,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        gap: "8px"
                                                    }}
                                                >
                                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                                                        <div style={{
                                                            width: "32px",
                                                            height: "32px",
                                                            borderRadius: "8px",
                                                            backgroundColor: isDone ? "#dcfce7" : "#ffffff",
                                                            color: isDone ? "#15803d" : "#64748b",
                                                            border: `1px solid ${isDone ? "#86efac" : "#cbd5e1"}`,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            flexShrink: 0
                                                        }}>
                                                            <IconComponent size={16} />
                                                        </div>
                                                        <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{task.label}</span>
                                                    </div>
                                                    {isDone ? (
                                                        <span style={{ backgroundColor: "#dcfce7", color: "#15803d", fontSize: "11px", fontWeight: "800", padding: "2px 8px", borderRadius: "6px", flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                            <Check size={12} /> Done
                                                        </span>
                                                    ) : (
                                                        <span style={{ backgroundColor: "#ffffff", color: "#64748b", border: "1px solid #cbd5e1", fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "6px", flexShrink: 0 }}>
                                                            Pending
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* PRIMARY GOAL BOX */}
                                <div style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)" }}>
                                    <h3 style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", display: "flex", alignItems: "center", gap: "6px", margin: "0 0 12px 0" }}>
                                        <Target size={16} style={{ color: "#2563eb" }} />
                                        Primary Clinical Goal
                                    </h3>
                                    <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "14px", padding: "18px" }}>
                                        <p style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", margin: 0, lineHeight: 1.5 }}>
                                            {carePlan.goal || carePlan.primaryGoal || "Maintain optimal glycemic control, monitor BP twice daily, and adhere to prescribed medication schedule."}
                                        </p>
                                    </div>
                                </div>

                                {/* CARE INTERVENTIONS GRID (4 CARDS IN 2x2) */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                                    {/* MEDICATIONS CARD */}
                                    <div style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "18px", padding: "20px", boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "14px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#fff1f2", color: "#e11d48", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <Pill size={16} />
                                                </div>
                                                <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#0f172a" }}>
                                                    Medication Schedule
                                                </span>
                                            </div>
                                            {progressTasks.items.medication ? (
                                                <span style={{ backgroundColor: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "6px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                    <Check size={12} /> Completed Today
                                                </span>
                                            ) : (
                                                <span style={{ backgroundColor: "#f8fafc", color: "#64748b", border: "1px solid #cbd5e1", fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "6px" }}>
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: "13px", fontWeight: "600", color: "#334155", margin: 0, lineHeight: 1.5 }}>
                                            {Array.isArray(carePlan.medications) ? carePlan.medications.join(", ") : (carePlan.medications || "Take prescribed medication dosage as directed.")}
                                        </p>
                                    </div>

                                    {/* DIET CARD */}
                                    <div style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "18px", padding: "20px", boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "14px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#fffbeb", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <Utensils size={16} />
                                                </div>
                                                <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#0f172a" }}>
                                                    Dietary Protocol
                                                </span>
                                            </div>
                                            {progressTasks.items.diet ? (
                                                <span style={{ backgroundColor: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "6px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                    <Check size={12} /> Completed Today
                                                </span>
                                            ) : (
                                                <span style={{ backgroundColor: "#f8fafc", color: "#64748b", border: "1px solid #cbd5e1", fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "6px" }}>
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: "13px", fontWeight: "600", color: "#334155", margin: 0, lineHeight: 1.5 }}>
                                            {carePlan.diet || "Low glycemic index, high fiber, controlled carbohydrates and reduced sodium intake."}
                                        </p>
                                    </div>

                                    {/* EXERCISE CARD */}
                                    <div style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "18px", padding: "20px", boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "14px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <Dumbbell size={16} />
                                                </div>
                                                <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#0f172a" }}>
                                                    Exercise & Activity
                                                </span>
                                            </div>
                                            {progressTasks.items.exercise ? (
                                                <span style={{ backgroundColor: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "6px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                    <Check size={12} /> Completed Today
                                                </span>
                                            ) : (
                                                <span style={{ backgroundColor: "#f8fafc", color: "#64748b", border: "1px solid #cbd5e1", fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "6px" }}>
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: "13px", fontWeight: "600", color: "#334155", margin: 0, lineHeight: 1.5 }}>
                                            {carePlan.exercise || "30 minutes brisk walking or supervised physical exercise 5 days/week."}
                                        </p>
                                    </div>

                                    {/* SLEEP CARD */}
                                    <div style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "18px", padding: "20px", boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "14px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#e0e7ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <Moon size={16} />
                                                </div>
                                                <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#0f172a" }}>
                                                    Sleep & Recovery
                                                </span>
                                            </div>
                                            {progressTasks.items.sleep ? (
                                                <span style={{ backgroundColor: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "6px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                    <Check size={12} /> Completed Today
                                                </span>
                                            ) : (
                                                <span style={{ backgroundColor: "#f8fafc", color: "#64748b", border: "1px solid #cbd5e1", fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "6px" }}>
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: "13px", fontWeight: "600", color: "#334155", margin: 0, lineHeight: 1.5 }}>
                                            {carePlan.sleep || "7-8 hours quality sleep per night; maintain consistent bedtime schedule."}
                                        </p>
                                    </div>
                                </div>

                                {/* READ-ONLY CLINICAL NOTES CARD */}
                                <div style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "14px" }}>
                                        <h3 style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                                            <FileText size={18} style={{ color: "#4f46e5" }} />
                                            Physician Review Notes & Clinical Remarks
                                        </h3>
                                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#475569", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", padding: "2px 10px", borderRadius: "8px" }}>Doctor Remarks</span>
                                    </div>

                                    <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "18px", fontSize: "13px", fontWeight: "600", color: "#334155", lineHeight: 1.5 }}>
                                        {carePlan.doctorNotes || carePlan.notes || "Care plan reviewed by attending physician. Patient compliance monitored regularly."}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "20px", padding: "60px 24px", textAlign: "center", boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#f1f5f9", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <FileHeart size={28} />
                                </div>
                                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>No Active Care Plan</h3>
                                <p style={{ fontSize: "12px", color: "#64748b", fontWeight: "500", maxWidth: "380px", margin: 0, lineHeight: 1.5 }}>
                                    No active care plan progress recorded for Patient <strong style={{ color: "#0f172a" }}>{selectedPatientId}</strong>. Care plan generation and physician approvals are managed by attending doctors.
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AdminLayout>
    );
}

export default CarePlans;
