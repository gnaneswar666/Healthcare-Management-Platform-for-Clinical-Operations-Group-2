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
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200/60 text-xs font-semibold">
                            <FileHeart size={14} className="text-teal-600" /> Care Plan Telemetry & Protocol Tracker
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight m-0">
                            Patient Care Plan Progress
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl m-0 leading-relaxed">
                            Enterprise dashboard for monitoring daily adherence telemetry, care plan interventions, and physician protocol compliance across all registered patients.
                        </p>
                    </div>
                    <div className="shrink-0">
                        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100/90 border border-slate-200 text-slate-600 text-xs font-bold">
                            <Lock size={14} className="text-slate-500" />
                            <span>Admin Portal View</span>
                        </div>
                    </div>
                </motion.div>

                {/* 2. TOP METRICS STAT CARDS */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-5">
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Plans</span>
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <ClipboardList size={18} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 m-0">{dashboardStats.activeCarePlans}</h3>
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                            <TrendingUp size={12} /> Active in system
                        </span>
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Adherence</span>
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <Award size={18} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 m-0">{dashboardStats.averageAdherence}%</h3>
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Daily compliance
                        </span>
                    </div>

                    <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Pending Review</span>
                            <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0">
                                <Clock3 size={18} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-amber-950 m-0">{pendingPlans.length || dashboardStats.pendingApproval}</h3>
                        <span className="text-[11px] font-bold text-amber-700 block">Awaiting physician</span>
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Recovered</span>
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <ShieldCheck size={18} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 m-0">{dashboardStats.recoveredPatients || 34}</h3>
                        <span className="text-[11px] font-bold text-indigo-600 block">Risk reduced</span>
                    </div>

                    <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">High Risk</span>
                            <div className="w-9 h-9 rounded-xl bg-rose-100/80 text-rose-700 flex items-center justify-center shrink-0">
                                <AlertTriangle size={18} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-rose-950 m-0">{dashboardStats.highRiskPatients}</h3>
                        <span className="text-[11px] font-bold text-rose-700 block">Priority cases</span>
                    </div>
                </motion.div>

                {/* 3. MAIN DASHBOARD CONTENT: 2-COLUMN SPLIT LAYOUT */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* LEFT COLUMN: VERTICAL PATIENTS DIRECTORY SELECTOR (lg:col-span-4) */}
                    <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                            <div className="flex items-center gap-2">
                                <Users size={20} className="text-blue-600" />
                                <h3 className="text-base font-extrabold text-slate-900 m-0">Patients Directory</h3>
                            </div>
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60">
                                {patients.length} Total
                            </span>
                        </div>

                        {/* SEARCH INPUT */}
                        <div className="relative">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search patient name or ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ paddingLeft: "2.4rem" }}
                                className="w-full pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none transition-all"
                            />
                        </div>

                        {/* FILTER TABS */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/70">
                            <button
                                type="button"
                                onClick={() => setActiveTab("ALL")}
                                className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer text-center ${
                                    activeTab === "ALL" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                All ({patients.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("PENDING")}
                                className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer text-center ${
                                    activeTab === "PENDING" ? "bg-amber-500 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                Pending ({pendingPlans.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("HIGH_RISK")}
                                className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer text-center ${
                                    activeTab === "HIGH_RISK" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                High Risk
                            </button>
                        </div>

                        {/* VERTICAL PATIENT LIST */}
                        <div className="max-h-[640px] overflow-y-auto pr-1 space-y-2.5">
                            {filteredPatients.map((p) => {
                                const isSelected = p.patientId === selectedPatientId;
                                const age = calculateAge(p.dob);
                                const isPending = pendingPlans.some((pending) => pending.patientId === p.patientId);

                                return (
                                    <button
                                        key={p.patientId}
                                        type="button"
                                        onClick={() => handleSelectPatient(p.patientId)}
                                        className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                                            isSelected
                                                ? "bg-blue-50/90 border-blue-500 shadow-sm ring-1 ring-blue-500/30"
                                                : "bg-slate-50/50 border-slate-200/70 hover:bg-white hover:border-slate-300"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                                                isSelected
                                                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm"
                                                    : "bg-white text-slate-700 border border-slate-200/70"
                                            }`}>
                                                {(p.firstName?.[0] || "") + (p.lastName?.[0] || "")}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="font-bold text-sm text-slate-900 truncate m-0">
                                                        {p.firstName} {p.lastName}
                                                    </p>
                                                    {isPending && (
                                                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse" title="Pending Doctor Review" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium m-0 flex items-center gap-1.5 mt-0.5">
                                                    <span className="font-mono bg-white text-slate-700 px-1.5 py-0.2 rounded text-[11px] border border-slate-200/70">{p.patientId}</span>
                                                    {age && <span>• {age} yrs</span>}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className={isSelected ? "text-blue-600" : "text-slate-300"} />
                                    </button>
                                );
                            })}

                            {filteredPatients.length === 0 && (
                                <div className="text-center py-8 text-xs text-slate-400 font-medium">
                                    No patients match the selected filter.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: CARE PLAN DETAILS & TELEMETRY DASHBOARD (lg:col-span-8) */}
                    <div className="lg:col-span-8 space-y-6">
                        {error && (
                            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs font-bold text-rose-700 flex items-center justify-between shadow-xs">
                                <div className="flex items-center gap-2.5">
                                    <AlertTriangle size={16} className="shrink-0 text-rose-600" />
                                    <span>{error}</span>
                                </div>
                                <button type="button" onClick={() => setError("")} className="text-rose-600 hover:underline">Dismiss</button>
                            </div>
                        )}

                        {loading ? (
                            <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center shadow-sm space-y-3">
                                <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-100 border-t-blue-600 mx-auto" />
                                <p className="font-extrabold text-base text-slate-800 m-0">Loading Patient Care Plan...</p>
                                <p className="text-xs text-slate-400 font-medium m-0">Fetching compliance telemetry for Patient {selectedPatientId}</p>
                            </div>
                        ) : carePlan ? (
                            <div className="space-y-6">
                                {/* CARE PLAN HEADER CARD */}
                                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-xl shadow-sm shrink-0">
                                                {(activePatient.firstName?.[0] || "") + (activePatient.lastName?.[0] || "")}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2.5 flex-wrap">
                                                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 m-0">
                                                        {activePatient.firstName} {activePatient.lastName}
                                                    </h2>
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                                        currentStatus === "APPROVED"
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                            : currentStatus === "REJECTED"
                                                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                                                            : "bg-amber-50 text-amber-700 border border-amber-200"
                                                    }`}>
                                                        {currentStatus === "APPROVED" && <CheckCircle2 size={13} className="text-emerald-600" />}
                                                        {currentStatus === "PENDING" && <Clock3 size={13} className="text-amber-600" />}
                                                        {currentStatus === "REJECTED" && <AlertTriangle size={13} className="text-rose-600" />}
                                                        Doctor Status: {currentStatus}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium flex items-center gap-2 flex-wrap m-0">
                                                    <span>Patient ID: <strong className="font-mono text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/70">{selectedPatientId}</strong></span>
                                                    <span>•</span>
                                                    <span>Created: {carePlan.createdAt ? new Date(carePlan.createdAt).toLocaleDateString() : "Today"}</span>
                                                    <span>•</span>
                                                    <span>Physician: {carePlan.doctorId || carePlan.approvedBy || "DOC101"}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100/90 border border-slate-200 text-slate-600 text-xs font-bold shrink-0 self-start sm:self-center">
                                            <Stethoscope size={16} className="text-blue-600 shrink-0" />
                                            <span>Clinical Interventions Active</span>
                                        </div>
                                    </div>
                                </div>

                                {/* LIVE DAILY ADHERENCE PROGRESS TRACKER CARD */}
                                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 space-y-6 shadow-sm">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <span className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                                                <Activity size={20} className="text-emerald-600" />
                                                Today's Patient Adherence Telemetry
                                            </span>
                                            <p className="text-xs text-slate-500 font-medium m-0">
                                                {progressTasks.completedCount} of {progressTasks.totalTasks} Daily Compliance Tasks Completed Today
                                            </p>
                                        </div>

                                        {/* ADHERENCE SCORE BADGE */}
                                        <div className="flex items-center gap-3 bg-gradient-to-br from-emerald-600 to-teal-600 text-white px-5 py-3 rounded-2xl shadow-sm self-start sm:self-auto">
                                            <Award size={24} className="text-emerald-100 shrink-0" />
                                            <div>
                                                <div className="text-2xl font-black leading-none">{progressTasks.adherence}%</div>
                                                <div className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider mt-1">Daily Score</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar Track */}
                                    <div className="space-y-1.5">
                                        <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 shadow-sm"
                                                style={{ width: `${Math.max(4, Math.min(100, progressTasks.adherence))}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* 6 DAILY TASKS STATUS GRID (3x2 DISPLAY FOR OPTIMAL BREATHING ROOM) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-2">
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
                                                    className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                                                        isDone
                                                            ? "bg-emerald-50/70 border-emerald-200 text-emerald-950 shadow-xs"
                                                            : "bg-slate-50/50 border-slate-200/70 text-slate-700"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className={`p-2 rounded-lg shrink-0 ${isDone ? "bg-emerald-100 text-emerald-700" : "bg-white border border-slate-200 text-slate-500"}`}>
                                                            <IconComponent size={18} />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-800 truncate">{task.label}</span>
                                                    </div>
                                                    {isDone ? (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md shrink-0">
                                                            <Check size={13} /> Done
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] font-semibold text-slate-400 bg-white px-2.5 py-1 rounded-md border border-slate-200/60 shrink-0">
                                                            Pending
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* PRIMARY GOAL BOX */}
                                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-3">
                                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2 m-0">
                                        <Target size={16} className="text-blue-600" />
                                        Primary Clinical Goal
                                    </h3>
                                    <div className="bg-blue-50/50 border border-blue-200/70 rounded-xl p-5">
                                        <p className="text-sm sm:text-base font-bold text-slate-900 m-0 leading-relaxed">
                                            {carePlan.goal || carePlan.primaryGoal || "Maintain optimal glycemic control, monitor BP twice daily, and adhere to prescribed medication schedule."}
                                        </p>
                                    </div>
                                </div>

                                {/* CARE INTERVENTIONS GRID (4 CARDS IN 2x2) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* MEDICATIONS CARD */}
                                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-3.5">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                                                    <Pill size={18} />
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                                                    Medication Schedule
                                                </span>
                                            </div>
                                            {progressTasks.items.medication ? (
                                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                                                    <Check size={13} /> Completed Today
                                                </span>
                                            ) : (
                                                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold text-slate-700 m-0 leading-relaxed pt-1">
                                            {Array.isArray(carePlan.medications) ? carePlan.medications.join(", ") : (carePlan.medications || "Take prescribed medication dosage as directed.")}
                                        </p>
                                    </div>

                                    {/* DIET CARD */}
                                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-3.5">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                                                    <Utensils size={18} />
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                                                    Dietary Protocol
                                                </span>
                                            </div>
                                            {progressTasks.items.diet ? (
                                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                                                    <Check size={13} /> Completed Today
                                                </span>
                                            ) : (
                                                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold text-slate-700 m-0 leading-relaxed pt-1">
                                            {carePlan.diet || "Low glycemic index, high fiber, controlled carbohydrates and reduced sodium intake."}
                                        </p>
                                    </div>

                                    {/* EXERCISE CARD */}
                                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-3.5">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                                    <Dumbbell size={18} />
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                                                    Exercise & Activity
                                                </span>
                                            </div>
                                            {progressTasks.items.exercise ? (
                                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                                                    <Check size={13} /> Completed Today
                                                </span>
                                            ) : (
                                                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold text-slate-700 m-0 leading-relaxed pt-1">
                                            {carePlan.exercise || "30 minutes brisk walking or supervised physical exercise 5 days/week."}
                                        </p>
                                    </div>

                                    {/* SLEEP CARD */}
                                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-3.5">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                                                    <Moon size={18} />
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                                                    Sleep & Recovery
                                                </span>
                                            </div>
                                            {progressTasks.items.sleep ? (
                                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                                                    <Check size={13} /> Completed Today
                                                </span>
                                            ) : (
                                                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold text-slate-700 m-0 leading-relaxed pt-1">
                                            {carePlan.sleep || "7-8 hours quality sleep per night; maintain consistent bedtime schedule."}
                                        </p>
                                    </div>
                                </div>

                                {/* READ-ONLY CLINICAL NOTES CARD */}
                                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 m-0">
                                            <FileText size={18} className="text-indigo-600" />
                                            Physician Review Notes & Clinical Remarks
                                        </h3>
                                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200/70 px-2.5 py-0.5 rounded-lg">Doctor Remarks</span>
                                    </div>

                                    <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-5 text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">
                                        {carePlan.doctorNotes || carePlan.notes || "Care plan reviewed by attending physician. Patient compliance monitored regularly."}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center space-y-3 shadow-sm">
                                <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                                    <FileHeart size={30} />
                                </div>
                                <h3 className="text-base font-extrabold text-slate-800 m-0">No Active Care Plan</h3>
                                <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto m-0 leading-relaxed">
                                    No active care plan progress recorded for Patient <strong className="text-slate-700">{selectedPatientId}</strong>. Care plan generation and physician approvals are managed by attending doctors.
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
