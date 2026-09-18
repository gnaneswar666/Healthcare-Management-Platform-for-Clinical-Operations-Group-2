import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Search, Eye, HeartPulse, Activity, User, CalendarDays, AlertTriangle, BadgeCheck, AlertCircle, Sparkles, X } from "lucide-react";

import AiPredictionModal from "../../components/admin/AiPredictionModal";
import DoctorLayout from "../../components/doctor/DoctorLayout";
import { getAssignedPatients } from "../../services/assignmentService";
import { getDoctorIdentity } from "../../utils/userUtils";
import { getHealthTwin, updateHealthTwin } from "../../services/HealthTwinService";
import {
    simulateDiabetesData,
    simulateHealthVitals,
    generateSimulatedDiabetesValues,
    generateSimulatedHeartValues,
    ensureAndSimulateDiabetesData
} from "../../services/simulationService";
import {
    predictPatient,
    getExplanation,
    predictDiabetesPatient
} from "../../services/aiPredictionService";
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04 }
    }
};

const rowVariants = {
    hidden: { opacity: 0, y: 14, scale: 0.97 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.35, delay: i * 0.03, ease: "easeOut" }
    })
};

const riskBadgeClass = (risk) => {
    switch (risk?.toUpperCase()) {
        case "HIGH": return "badge--danger";
        case "MEDIUM": return "badge--warning";
        case "LOW": return "badge--success";
        default: return "badge--slate";
    }
};

const riskIcon = (risk) => {
    switch (risk?.toUpperCase()) {
        case "HIGH": return <AlertTriangle size={12} />;
        case "MEDIUM": return <AlertCircle size={12} />;
        case "LOW": return <BadgeCheck size={12} />;
        default: return <Activity size={12} />;
    }
};

const riskBg = (risk) => {
    switch (risk?.toUpperCase()) {
        case "HIGH": return "from-rose-50 to-red-50/50 border-l-rose-400";
        case "MEDIUM": return "from-amber-50 to-yellow-50/50 border-l-amber-400";
        case "LOW": return "from-emerald-50 to-green-50/50 border-l-emerald-400";
        default: return "from-slate-50 to-gray-50/50 border-l-slate-400";
    }
};

function AiPrediction({ keycloak }) {
    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState("");
    const [loadingPatient, setLoadingPatient] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [open, setOpen] = useState(false);
    const [predictionsCache, setPredictionsCache] = useState({});
    const [predictionModel, setPredictionModel] = useState("heart");
    const [simulatingId, setSimulatingId] = useState(null);

    async function handleSimulateAndPredict(patientId) {
        try {
            setSimulatingId(patientId);

            const isHeart = predictionModel === "heart";
            const simValues = isHeart ? generateSimulatedHeartValues() : generateSimulatedDiabetesValues();

            let existingTwin = {};
            try {
                const res = await getHealthTwin(patientId);
                existingTwin = res.data || {};
            } catch (twinErr) {
                console.warn("Health Twin load notice:", twinErr);
            }

            const updatedTwin = {
                ...existingTwin,
                patientId,
                ...simValues
            };

            await updateHealthTwin(patientId, updatedTwin);

            try {
                if (isHeart) {
                    await simulateHealthVitals(patientId);
                } else {
                    await simulateDiabetesData(patientId);
                }
            } catch (simErr) {
                console.warn("Backend SIMULATION-SERVICE trigger notice:", simErr);
            }

            await handlePrediction(patientId);
        } catch (err) {
            console.error("Simulation error:", err);
        } finally {
            setSimulatingId(null);
        }
    }


   useEffect(() => {

    let mounted = true;

    async function loadPatients() {

        try {

            const doctorProfile = await getDoctorIdentity(keycloak);
            const doctorId = doctorProfile?.doctorId || "DOC101";

            const res = await getAssignedPatients(doctorId);

            if (mounted) {

                setPatients(res.data);

            }

        } catch (err) {

            console.log(err);

        }

    }

    loadPatients();

    const interval = setInterval(loadPatients, 15000);

    return () => {

        mounted = false;

        clearInterval(interval);

    };

}, []);

        async function handlePrediction(patientId) {
            if (!patientId || (typeof patientId === 'string' && !patientId.trim())) {
                alert("Patient ID is required before generating predictions. Please select a valid patient.");
                return;
            }
            try {
                setLoadingPatient(patientId);

        let predData;

        if (predictionModel === "heart") {

            const predictionRes = await predictPatient(patientId);
            const explanationRes = await getExplanation(patientId);

            predData = {
                ...predictionRes.data,
                explanation: explanationRes.data.explanation,
                clinicalGuideline: explanationRes.data.clinicalGuideline,
                recommendations: explanationRes.data.recommendations || [],
                topFactors: explanationRes.data.topFactors || []
            };

        } else {
            // Auto-ensure simulated diabetes data exists in MongoDB before running prediction
            await ensureAndSimulateDiabetesData(patientId);

            const predictionRes = await predictDiabetesPatient(patientId);

            // Diabetes response already contains explanation,
            // topFactors, recommendations, etc.
            predData = predictionRes.data;
        }

        setPrediction(predData);

        const cacheKey = `${predictionModel}-${patientId}`;

        setPredictionsCache(prev => ({
            ...prev,
            [cacheKey]: predData
        }));

        setOpen(true);

    }catch (err) {
    console.error(err.response?.data);
    console.error(err.response?.status);
    console.error(err.response?.headers);
    console.error(err);
} finally {
        setLoadingPatient(null);
    }
}

    async function handleViewCached(patientId) {
        const cacheKey = `${predictionModel}-${patientId}`;

if (predictionsCache[cacheKey]) {
    setPrediction(predictionsCache[cacheKey]);
        setOpen(true);
        } else {
            await handlePrediction(patientId);
        }
    }

    const filteredPatients = patients.filter((patient) =>
        patient.patientId?.toLowerCase().includes(search.toLowerCase()) ||
        patient.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        patient.lastName?.toLowerCase().includes(search.toLowerCase())
    );
    const calculateAge = (dob) => {
    if (!dob) return "—";

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }

    return age;
};

    return (
       <DoctorLayout keycloak={keycloak}>
            <motion.div
                className="page-card"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={rowVariants} className="page-header">
                    <div className="page-header__info">
                        <div className="page-status-chip page-status-chip--teal">
                            <Brain size={14} /> Clinical Decision Support
                        </div>
                        <h1 className="page-title">
                            {predictionModel === "heart"
                                ? "Heart Disease Prediction"
                                : "Diabetes Prediction"}
                        </h1>
                        <p className="page-subtitle">
                            {predictionModel === "heart"
                                ? "Run heart disease prediction for registered patients."
                                : "Run diabetes prediction for registered patients."}
                        </p>                   
                         </div>
              <div className="flex items-center gap-4">
    <button
        onClick={() => setPredictionModel("heart")}
        className={`flex items-center gap-3 px-7 py-3 rounded-2xl transition-all duration-300 ${
            predictionModel === "heart"
                ? "bg-red-50 border-2 border-red-500 text-red-600 shadow-md"
                : "bg-white border border-slate-200 text-slate-600 hover:border-red-300"
        }`}
    >
        <HeartPulse size={20} />
        <span className="font-semibold">Heart Disease</span>
    </button>

    <button
        onClick={() => setPredictionModel("diabetes")}
        className={`flex items-center gap-3 px-7 py-3 rounded-2xl transition-all duration-300 ${
            predictionModel === "diabetes"
                ? "bg-blue-50 border-2 border-blue-500 text-blue-600 shadow-md"
                : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
        }`}
    >
        <Activity size={20} />
        <span className="font-semibold">Diabetes</span>
    </button>
</div>     </motion.div>

                <motion.div variants={rowVariants} className="soft-card mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="stat-card__icon" style={{ background: "rgba(59, 130, 246, 0.1)" }}>
                            <Search size={18} className="text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">Search Patients</h3>
                            <p className="text-xs text-slate-500">Find a patient by name or ID to run a prediction</p>
                        </div>
                    </div>
                    <div className="relative w-full">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 pointer-events-none">
                            <Search size={19} className="text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search patient by name or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: "3.1rem", paddingTop: "12px", paddingBottom: "12px" }}
                            className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50/70 pr-10 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-2xs"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg p-1 transition-all cursor-pointer"
                            >
                                <X size={15} />
                            </button>
                        )}
                    </div>
                    {search && (
                        <p className="mt-2 text-xs text-slate-400">
                            Found {filteredPatients.length} patient{filteredPatients.length !== 1 ? "s" : ""}
                        </p>
                    )}
                </motion.div>

                <motion.div variants={rowVariants}>
                    {/* Patient Count Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <User size={15} />
                            <span className="font-medium">{filteredPatients.length} Patient{filteredPatients.length !== 1 ? "s" : ""} Registered</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Sparkles size={13} />
                            <span>Click Run Prediction to analyze</span>
                        </div>
                    </div>

                    {/* Patient Cards */}
                    {filteredPatients.length === 0 ? (
                        <div className="data-table-wrap">
                            <div className="data-table__empty">
                                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100">
                                    <Brain size={36} className="text-slate-300" />
                                </div>
                                <div className="font-semibold text-slate-600 text-lg mb-1">No patients found</div>
                                <p className="text-sm text-slate-400">Try adjusting your search query</p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                            {filteredPatients.map((patient, index) => {
                            const cacheKey = `${predictionModel}-${patient.patientId}`;

                            const hasPrediction = !!predictionsCache[cacheKey];                                return (
                                    <motion.div
                                        key={patient.patientId}
                                        custom={index}
                                        variants={rowVariants}
                                        initial="hidden"
                                        animate="visible"
                                        whileHover={{
                                            y: -2,
                                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
                                            transition: { duration: 0.15 }
                                        }}
                                        style={{
                                            backgroundColor: "#ffffff",
                                            borderRadius: "18px",
                                            border: "1px solid #e2e8f0",
                                            borderLeft: hasPrediction
                                                ? (predictionsCache[cacheKey]?.risk === "HIGH" ? "5px solid #ef4444" : predictionsCache[cacheKey]?.risk === "MEDIUM" ? "5px solid #f59e0b" : "5px solid #10b981")
                                                : "5px solid #cbd5e1",
                                            padding: "16px 24px",
                                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                                            transition: "all 0.2s ease-in-out",
                                            width: "100%",
                                            boxSizing: "border-box"
                                        }}
                                    >
                                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px", width: "100%" }}>
                                            {/* Left: Patient Info */}
                                            <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: "1 1 300px", minWidth: 0 }}>
                                                <div style={{
                                                    width: "44px",
                                                    height: "44px",
                                                    borderRadius: "14px",
                                                    background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                                                    color: "#ffffff",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontWeight: "800",
                                                    fontSize: "15px",
                                                    flexShrink: 0,
                                                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)"
                                                }}>
                                                    {(patient.firstName?.[0] || "") + (patient.lastName?.[0] || "")}
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                                        <h4 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                            {patient.firstName} {patient.lastName}
                                                        </h4>
                                                        <span style={{
                                                            backgroundColor: "#f1f5f9",
                                                            color: "#475569",
                                                            border: "1px solid #cbd5e1",
                                                            fontSize: "11px",
                                                            fontWeight: "700",
                                                            padding: "2px 8px",
                                                            borderRadius: "6px"
                                                        }}>
                                                            {patient.gender || "N/A"}
                                                        </span>
                                                        {hasPrediction && (
                                                            <span className={`badge ${riskBadgeClass(predictionsCache[cacheKey]?.risk)} text-[0.7rem] px-2 py-0.5`}>
                                                                {riskIcon(predictionsCache[cacheKey]?.risk)}
                                                                {predictionsCache[cacheKey]?.risk || "?"}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
                                                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                                            <User size={13} style={{ color: "#64748b" }} />
                                                            ID: <span style={{ fontFamily: "monospace", color: "#0f172a", backgroundColor: "#f1f5f9", padding: "1px 6px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>{patient.patientId}</span>
                                                        </span>
                                                        <span>•</span>
                                                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                                            <CalendarDays size={13} style={{ color: "#64748b" }} />
                                                            Age: <strong style={{ color: "#0f172a" }}>{calculateAge(patient.dob)}</strong>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Actions (Zero Truncation / Unclipped) */}
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, marginLeft: "auto" }}>
                                                <motion.button
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={() => handleSimulateAndPredict(patient.patientId)}
                                                    disabled={simulatingId === patient.patientId || loadingPatient === patient.patientId}
                                                    style={{
                                                        padding: "8px 16px",
                                                        borderRadius: "10px",
                                                        backgroundColor: "#f3e8ff",
                                                        color: "#7c3aed",
                                                        border: "1px solid #e9d5ff",
                                                        fontSize: "12px",
                                                        fontWeight: "800",
                                                        cursor: "pointer",
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "6px",
                                                        flexShrink: 0,
                                                        whiteSpace: "nowrap"
                                                    }}
                                                >
                                                    <Sparkles size={14} className={simulatingId === patient.patientId ? "animate-spin text-purple-600" : "text-purple-600"} />
                                                    <span>{simulatingId === patient.patientId ? "Simulating..." : "Simulate Data"}</span>
                                                </motion.button>
                                                {hasPrediction && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.03 }}
                                                        whileTap={{ scale: 0.97 }}
                                                        onClick={() => handleViewCached(patient.patientId)}
                                                        style={{
                                                            padding: "8px 16px",
                                                            borderRadius: "10px",
                                                            backgroundColor: "#f1f5f9",
                                                            color: "#334155",
                                                            border: "1px solid #cbd5e1",
                                                            fontSize: "12px",
                                                            fontWeight: "700",
                                                            cursor: "pointer",
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            gap: "6px",
                                                            flexShrink: 0,
                                                            whiteSpace: "nowrap"
                                                        }}
                                                    >
                                                        <Eye size={14} />
                                                        View
                                                    </motion.button>
                                                )}
                                                <motion.button
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={() => handlePrediction(patient.patientId)}
                                                    disabled={loadingPatient === patient.patientId}
                                                    style={{
                                                        padding: "8px 20px",
                                                        borderRadius: "10px",
                                                        background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                                                        color: "#ffffff",
                                                        border: "none",
                                                        fontSize: "12px",
                                                        fontWeight: "800",
                                                        cursor: "pointer",
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "6px",
                                                        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
                                                        flexShrink: 0,
                                                        whiteSpace: "nowrap"
                                                    }}
                                                >
                                                    {loadingPatient === patient.patientId ? (
                                                        <>
                                                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                            <span>Running...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Brain size={14} />
                                                            <span>
                                                                {predictionModel === "heart"
                                                                    ? (hasPrediction ? "Re-run Heart" : "Run Heart")
                                                                    : (hasPrediction ? "Re-run Diabetes" : "Run Diabetes")}
                                                            </span>
                                                        </>
                                                    )}
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </motion.div>

            <AiPredictionModal
                isOpen={open}
                onClose={() => setOpen(false)}
                prediction={prediction}
            />
        </DoctorLayout>
    );
}

export default AiPrediction;

