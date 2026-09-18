import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import keycloak from "../../keycloak";
import PatientLayout from "../../components/patient/PatientLayout";
import {
    getPatient,
    getHealthTwin,
    getConsent
} from "../../services/patient360Services";
import {
    UserCircle2,
    Activity,
    Pill,
    ShieldCheck,
    HeartPulse,
    Heart,
    Droplets,
    Thermometer,
    AlertCircle,
    BadgeCheck,
    AlertTriangle,
    Calendar,
    Mail,
    Phone,
    MapPin,
    Gauge,
    Sparkles
} from "lucide-react";

function Patient360() {
    const [patient, setPatient] = useState(null);
    const [healthTwin, setHealthTwin] = useState(null);
    const [consent, setConsent] = useState(null);
    const [loading, setLoading] = useState(true);

    async function loadData(isInitial = false) {
        try {
            if (isInitial) setLoading(true);
            const patientId = keycloak.tokenParsed?.patientId;
            if (!patientId) {
                console.error("Patient ID not found in token");
                return;
            }

            const patientData = await getPatient(patientId);
            setPatient(patientData);

            try {
                const twinData = await getHealthTwin(patientId);
                setHealthTwin(twinData);
            } catch {
                setHealthTwin(null);
            }

            try {
                const consentData = await getConsent(patientId);
                setConsent(consentData);
            } catch {
                setConsent(null);
            }
        } catch (err) {
            console.error("Patient360 data error", err);
        } finally {
            if (isInitial) setLoading(false);
        }
    }

    useEffect(() => {
        loadData(true);
        const interval = setInterval(() => {
            loadData(false);
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    const calculateAge = (dob) => {
        if (!dob) return "—";
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const calculateBMI = (height, weight) => {
        const hVal = Number(height) || Number(patient?.height) || 175;
        const wVal = Number(weight) || Number(patient?.weight) || 70;
        const h = hVal / 100;
        if (!h) return null;
        return (wVal / (h * h)).toFixed(1);
    };

    const bmiCategory = (bmi) => {
        const v = Number(bmi);
        if (v < 18.5) return "Underweight";
        if (v < 25) return "Normal";
        if (v < 30) return "Overweight";
        return "Obese";
    };

    const calculateRiskScore = (twin) => {
        if (!twin) return 0;
        let score = 0;
        if (twin.heartRate < 60 || twin.heartRate > 100) score += 15;
        if (twin.temperature >= 38) score += 20;
        if (twin.oxygenLevel < 95) score += 25;
        if (twin.bloodPressure) {
            const [sys, dia] = twin.bloodPressure.split("/").map(Number);
            if (sys >= 140 || dia >= 90) score += 20;
            if (sys < 90 || dia < 60) score += 15;
        }
        if (twin.height && twin.weight) {
            const bmi = twin.weight / Math.pow(twin.height / 100, 2);
            if (bmi >= 30 || bmi < 18.5) score += 20;
        }
        if (twin.chronicDiseases?.length) score += 20;
        return Math.min(score, 100);
    };

    if (loading || !patient) {
        return (
            <PatientLayout>
                <div className="page-card flex items-center justify-center py-24">
                    <div className="flex flex-col items-center gap-4 text-slate-500">
                        <div className="h-10 w-10 animate-spin rounded-full border-3 border-slate-200 border-t-blue-600" />
                        <span className="font-medium">Loading your 360° health overview...</span>
                    </div>
                </div>
            </PatientLayout>
        );
    }

    const initials = `${patient.firstName?.[0] || ""}${patient.lastName?.[0] || ""}`.toUpperCase();
    const fullName = `${patient.firstName || ""} ${patient.lastName || ""}`.trim();
    const bmi = calculateBMI(healthTwin?.height, healthTwin?.weight);
    const calculatedRisk = calculateRiskScore(healthTwin);
    const risk = calculatedRisk > 0 ? calculatedRisk : (healthTwin?.riskScore ?? 0);
    const riskLabel = risk < 30 ? "Healthy" : risk < 70 ? "Warning" : "Critical";
    const riskBarColor = risk < 30
        ? "bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-600"
        : risk < 70
        ? "bg-gradient-to-r from-amber-400 via-amber-500 to-orange-600"
        : "bg-gradient-to-r from-rose-500 via-red-600 to-rose-700";

    return (
        <PatientLayout>
            <div className="page-card">
                {/* Page Hero Header (Identical to Admin View) */}
                <div style={{ paddingBottom: "24px", marginBottom: "24px", borderBottom: "1px solid #e2e8f0", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "18px", minWidth: 0 }}>
                        <div style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "18px",
                            background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ffffff",
                            fontWeight: "800",
                            fontSize: "22px",
                            boxShadow: "0 6px 20px rgba(37, 99, 235, 0.3)",
                            flexShrink: 0
                        }}>
                            {initials || <UserCircle2 size={32} />}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                                <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0 }}>{fullName}</h1>
                                <span style={{
                                    backgroundColor: "#eff6ff",
                                    color: "#1d4ed8",
                                    border: "1px solid #bfdbfe",
                                    fontSize: "11px",
                                    fontWeight: "800",
                                    padding: "2px 10px",
                                    borderRadius: "8px",
                                    fontFamily: "monospace"
                                }}>
                                    {patient.patientId}
                                </span>
                                <span style={{
                                    backgroundColor: risk < 30 ? "#ecfdf5" : risk < 70 ? "#fffbeb" : "#fef2f2",
                                    color: risk < 30 ? "#047857" : risk < 70 ? "#b45309" : "#b91c1c",
                                    border: `1px solid ${risk < 30 ? "#a7f3d0" : risk < 70 ? "#fde68a" : "#fecaca"}`,
                                    fontSize: "11px",
                                    fontWeight: "800",
                                    padding: "2px 10px",
                                    borderRadius: "20px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px"
                                }}>
                                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: risk < 30 ? "#10b981" : risk < 70 ? "#f59e0b" : "#ef4444" }} />
                                    {riskLabel}
                                </span>
                            </div>
                            <p style={{ color: "#64748b", fontSize: "13px", fontWeight: "500", margin: 0 }}>
                                {patient.gender || "Gender N/A"} • {calculateAge(patient.dob)} yrs • Patient 360° Personal Health Hub
                            </p>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
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
                            <Sparkles size={15} style={{ color: "#4f46e5" }} />
                            Digital Twin ID: <span style={{ fontFamily: "monospace", color: "#0f172a" }}>{patient.patientId}</span>
                        </div>
                    </div>
                </div>

                {/* Main 360 Grid (Matching Admin View Exactly) */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
                    {/* Patient Profile Card */}
                    <div style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", flexShrink: 0 }}>
                                <UserCircle2 size={20} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Demographics & Contact</h3>
                                <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Personal & contact records</p>
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <InfoRow icon={<UserCircle2 size={16} />} label="Full Name" value={fullName} />
                            <InfoRow icon={<BadgeCheck size={16} />} label="Patient ID" value={patient.patientId} mono />
                            <InfoRow icon={<Calendar size={16} />} label="Gender & Age" value={`${patient.gender || "—"} (${calculateAge(patient.dob)} years old)`} />
                            <InfoRow icon={<Mail size={16} />} label="Email Address" value={patient.email || "—"} />
                            <InfoRow icon={<Phone size={16} />} label="Phone Number" value={patient.phone || "—"} />
                            <InfoRow icon={<MapPin size={16} />} label="Address" value={patient.address || "—"} />
                        </div>
                    </div>

                    {/* Vital Signs Grid Card */}
                    <div style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#fff1f2", border: "1px solid #fecdd3", display: "flex", alignItems: "center", justifyContent: "center", color: "#e11d48" }}>
                                    <HeartPulse size={20} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Latest Vital Signs</h3>
                                    <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Real-time physiological telemetry</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <VitalBox
                                label="Heart Rate"
                                value={healthTwin?.heartRate}
                                unit="bpm"
                                icon={<Heart size={16} />}
                                tone="rose"
                            />
                            <VitalBox
                                label="SpO₂ Oxygen"
                                value={healthTwin?.oxygenLevel}
                                unit="%"
                                icon={<Droplets size={16} />}
                                tone="emerald"
                            />
                            <VitalBox
                                label="Temperature"
                                value={healthTwin?.temperature}
                                unit="°C"
                                icon={<Thermometer size={16} />}
                                tone="amber"
                            />
                            <VitalBox
                                label="Blood Pressure"
                                value={healthTwin?.bloodPressure}
                                unit="mmHg"
                                icon={<Activity size={16} />}
                                tone="brand"
                            />
                        </div>
                    </div>

                    {/* Biometrics & Risk Card */}
                    <div style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706" }}>
                                <Gauge size={20} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Biometrics & Risk Indicator</h3>
                                <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>BMI & health risk stratification score</p>
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "14px", backgroundColor: "#f8fafc", padding: "16px", border: "1px solid #e2e8f0" }}>
                                <div>
                                    <p style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", margin: 0 }}>Body Mass Index</p>
                                    <p style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: "4px 0 0 0" }}>
                                        {bmi || "—"} <span style={{ fontSize: "13px", fontWeight: "600", color: "#94a3b8" }}>BMI</span>
                                    </p>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#334155", display: "block" }}>{bmi ? bmiCategory(bmi) : "N/A"}</span>
                                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                                        {healthTwin?.height || patient?.height ? `${healthTwin?.height || patient?.height}cm` : "175cm"} / {healthTwin?.weight || patient?.weight ? `${healthTwin?.weight || patient?.weight}kg` : "70kg"}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                                    <span style={{ fontSize: "13px", fontWeight: "800", color: "#1e293b" }}>Overall Health Risk</span>
                                    <span style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>{risk}%</span>
                                </div>
                                <div style={{ width: "100%", height: "10px", backgroundColor: "#e2e8f0", borderRadius: "20px", overflow: "hidden" }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${risk}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`h-full rounded-full ${riskBarColor}`}
                                    />
                                </div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px", fontSize: "12px", color: "#64748b" }}>
                                    <span>Blood Group: <strong style={{ color: "#0f172a" }}>{healthTwin?.bloodGroup || patient?.bloodGroup || "O+"}</strong></span>
                                    <span style={{
                                        backgroundColor: risk < 30 ? "#ecfdf5" : risk < 70 ? "#fffbeb" : "#fef2f2",
                                        color: risk < 30 ? "#047857" : risk < 70 ? "#b45309" : "#b91c1c",
                                        border: `1px solid ${risk < 30 ? "#a7f3d0" : risk < 70 ? "#fde68a" : "#fecaca"}`,
                                        fontSize: "11px",
                                        fontWeight: "800",
                                        padding: "2px 8px",
                                        borderRadius: "6px"
                                    }}>
                                        {riskLabel} Status
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Medical Details & Clinical History Card */}
                    <div style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#f3e8ff", border: "1px solid #e9d5ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed" }}>
                                <Pill size={20} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Medical Details & Clinical History</h3>
                                <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Known allergies, chronic conditions, and ongoing medications</p>
                            </div>
                        </div>

                        {healthTwin ? (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                                {/* Allergies Card */}
                                <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#e11d48", marginBottom: "10px" }}>
                                        <AlertTriangle size={14} style={{ color: "#e11d48" }} />
                                        <span>Allergies</span>
                                    </div>
                                    {healthTwin.allergies && healthTwin.allergies.length > 0 ? (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                            {healthTwin.allergies.map((item, idx) => (
                                                <span key={idx} style={{ backgroundColor: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3", fontSize: "12px", fontWeight: "700", padding: "4px 10px", borderRadius: "8px" }}>
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "12px", margin: 0 }}>No known allergies reported</p>
                                    )}
                                </div>

                                {/* Chronic Diseases Card */}
                                <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#d97706", marginBottom: "10px" }}>
                                        <Activity size={14} style={{ color: "#d97706" }} />
                                        <span>Chronic Diseases</span>
                                    </div>
                                    {healthTwin.chronicDiseases && healthTwin.chronicDiseases.length > 0 ? (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                            {healthTwin.chronicDiseases.map((item, idx) => (
                                                <span key={idx} style={{ backgroundColor: "#fffbeb", color: "#b45309", border: "1px solid #fde68a", fontSize: "12px", fontWeight: "700", padding: "4px 10px", borderRadius: "8px" }}>
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "12px", margin: 0 }}>No chronic conditions reported</p>
                                    )}
                                </div>

                                {/* Current Medications Card */}
                                <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#2563eb", marginBottom: "10px" }}>
                                        <Pill size={14} style={{ color: "#2563eb" }} />
                                        <span>Current Medications</span>
                                    </div>
                                    {healthTwin.currentMedications && healthTwin.currentMedications.length > 0 ? (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                            {healthTwin.currentMedications.map((item, idx) => (
                                                <span key={idx} style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", fontSize: "12px", fontWeight: "700", padding: "4px 10px", borderRadius: "8px" }}>
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "12px", margin: 0 }}>No current medications listed</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div style={{ borderRadius: "14px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", padding: "24px", textAlign: "center" }}>
                                <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>No medical details or health twin profile found for this patient.</p>
                            </div>
                        )}
                    </div>

                    {/* Clinical Prediction Model Inputs (Heart & Diabetes) Card */}
                    <div style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)", gridColumn: "1 / -1" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", paddingBottom: "14px", borderBottom: "1px solid #e2e8f0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#e0e7ff", border: "1px solid #c7d2fe", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f46e5" }}>
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Clinical Prediction Model Inputs</h3>
                                    <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Configured clinical inputs for Heart & Diabetes classification models</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px" }}>
                            {/* Heart Inputs Container */}
                            <div style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "16px", padding: "18px" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "12px", marginBottom: "14px", borderBottom: "1px solid #e2e8f0" }}>
                                    <span style={{ fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#e11d48", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                        <Heart size={15} style={{ color: "#e11d48" }} /> Heart Inputs
                                    </span>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                    <div style={{ backgroundColor: "#ffffff", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                                        <span style={{ color: "#64748b", display: "block", fontSize: "10px", fontWeight: "700", textTransform: "uppercase" }}>Chest Pain (cp)</span>
                                        <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "13px" }}>{healthTwin?.cp ?? healthTwin?.chestPainType ?? 0}</span>
                                    </div>
                                    <div style={{ backgroundColor: "#ffffff", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                                        <span style={{ color: "#64748b", display: "block", fontSize: "10px", fontWeight: "700", textTransform: "uppercase" }}>Cholesterol (chol)</span>
                                        <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "13px" }}>{healthTwin?.chol ?? healthTwin?.cholesterol ?? 200} mg/dL</span>
                                    </div>
                                    <div style={{ backgroundColor: "#ffffff", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                                        <span style={{ color: "#64748b", display: "block", fontSize: "10px", fontWeight: "700", textTransform: "uppercase" }}>Fasting BS &gt; 120</span>
                                        <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "13px" }}>{healthTwin?.fbs ?? healthTwin?.fastingBS ?? 0 ? "Yes" : "No"}</span>
                                    </div>
                                    <div style={{ backgroundColor: "#ffffff", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                                        <span style={{ color: "#64748b", display: "block", fontSize: "10px", fontWeight: "700", textTransform: "uppercase" }}>Resting ECG</span>
                                        <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "13px" }}>{healthTwin?.restecg ?? healthTwin?.restECG ?? 0}</span>
                                    </div>
                                    <div style={{ backgroundColor: "#ffffff", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                                        <span style={{ color: "#64748b", display: "block", fontSize: "10px", fontWeight: "700", textTransform: "uppercase" }}>Max Heart Rate</span>
                                        <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "13px" }}>{healthTwin?.thalach ?? healthTwin?.maxHeartRate ?? 150} bpm</span>
                                    </div>
                                    <div style={{ backgroundColor: "#ffffff", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                                        <span style={{ color: "#64748b", display: "block", fontSize: "10px", fontWeight: "700", textTransform: "uppercase" }}>Exercise Angina</span>
                                        <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "13px" }}>{healthTwin?.exang ?? healthTwin?.exerciseAngina ?? 0 ? "Yes" : "No"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Diabetes Inputs Container */}
                            <div style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "16px", padding: "18px" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "12px", marginBottom: "14px", borderBottom: "1px solid #e2e8f0" }}>
                                    <span style={{ fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#2563eb", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                        <Activity size={15} style={{ color: "#2563eb" }} /> Diabetes Inputs
                                    </span>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                    <div style={{ backgroundColor: "#ffffff", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                                        <span style={{ color: "#64748b", display: "block", fontSize: "10px", fontWeight: "700", textTransform: "uppercase" }}>Hypertension</span>
                                        <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "13px" }}>{healthTwin?.hypertension ? "Yes" : "No"}</span>
                                    </div>
                                    <div style={{ backgroundColor: "#ffffff", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                                        <span style={{ color: "#64748b", display: "block", fontSize: "10px", fontWeight: "700", textTransform: "uppercase" }}>Heart Disease</span>
                                        <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "13px" }}>{healthTwin?.heartDisease ?? healthTwin?.heart_disease ? "Yes" : "No"}</span>
                                    </div>
                                    <div style={{ backgroundColor: "#ffffff", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                                        <span style={{ color: "#64748b", display: "block", fontSize: "10px", fontWeight: "700", textTransform: "uppercase" }}>Smoking History</span>
                                        <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "13px" }}>
                                            {healthTwin?.smokingHistory === 1 ? "Current" : healthTwin?.smokingHistory === 2 ? "Former" : "Never"}
                                        </span>
                                    </div>
                                    <div style={{ backgroundColor: "#ffffff", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                                        <span style={{ color: "#64748b", display: "block", fontSize: "10px", fontWeight: "700", textTransform: "uppercase" }}>BMI (kg/m²)</span>
                                        <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "13px" }}>{healthTwin?.bmi ?? bmi ?? 22.9}</span>
                                    </div>
                                    <div style={{ backgroundColor: "#ffffff", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                                        <span style={{ color: "#64748b", display: "block", fontSize: "10px", fontWeight: "700", textTransform: "uppercase" }}>HbA1c Level</span>
                                        <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "13px" }}>{healthTwin?.hba1cLevel ?? healthTwin?.HbA1c_level ?? 5.7}%</span>
                                    </div>
                                    <div style={{ backgroundColor: "#ffffff", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                                        <span style={{ color: "#64748b", display: "block", fontSize: "10px", fontWeight: "700", textTransform: "uppercase" }}>Blood Glucose</span>
                                        <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "13px" }}>{healthTwin?.bloodGlucoseLevel ?? healthTwin?.blood_glucose_level ?? 100} mg/dL</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FHIR Privacy & Consent Record Card */}
                    <div style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)", gridColumn: "1 / -1" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>FHIR Privacy & Consent Record</h3>
                                <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Patient data sharing authorization status</p>
                            </div>
                        </div>

                        {consent ? (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
                                <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px" }}>
                                    <p style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", margin: 0 }}>Consent Type</p>
                                    <p style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", margin: "6px 0 0 0" }}>{consent.consentType || "N/A"}</p>
                                </div>
                                <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px" }}>
                                    <p style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", margin: 0 }}>Status</p>
                                    <span style={{
                                        marginTop: "6px",
                                        backgroundColor: consent.status === "ACTIVE" || consent.status === "GRANTED" ? "#ecfdf5" : "#fffbeb",
                                        color: consent.status === "ACTIVE" || consent.status === "GRANTED" ? "#047857" : "#b45309",
                                        border: `1px solid ${consent.status === "ACTIVE" || consent.status === "GRANTED" ? "#a7f3d0" : "#fde68a"}`,
                                        fontSize: "11px",
                                        fontWeight: "800",
                                        padding: "4px 10px",
                                        borderRadius: "8px",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "6px"
                                    }}>
                                        <BadgeCheck size={14} /> {consent.status || "UNKNOWN"}
                                    </span>
                                </div>
                                <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px" }}>
                                    <p style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", margin: 0 }}>Granted Date</p>
                                    <p style={{ fontSize: "13px", fontWeight: "700", color: "#334155", margin: "6px 0 0 0" }}>{consent.grantedDate || "N/A"}</p>
                                </div>
                                <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px" }}>
                                    <p style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", margin: 0 }}>Expiry Date</p>
                                    <p style={{ fontSize: "13px", fontWeight: "700", color: "#334155", margin: "6px 0 0 0" }}>{consent.expiryDate || "N/A"}</p>
                                </div>
                            </div>
                        ) : (
                            <div style={{ borderRadius: "14px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", padding: "24px", textAlign: "center" }}>
                                <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>No active FHIR data sharing consent on file for this patient.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PatientLayout>
    );
}

function InfoRow({ icon, label, value, mono }) {
    return (
        <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2.5 text-slate-500">
                {icon}
                <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
            </div>
            <span className={`text-sm font-bold text-slate-800 ${mono ? "font-mono" : ""}`}>{value}</span>
        </div>
    );
}

function VitalBox({ label, value, unit, icon, tone }) {
    const toneMap = {
        rose: { iconBg: "bg-rose-100 text-rose-600 border border-rose-200/60" },
        emerald: { iconBg: "bg-emerald-100 text-emerald-600 border border-emerald-200/60" },
        amber: { iconBg: "bg-amber-100 text-amber-600 border border-amber-200/60" },
        brand: { iconBg: "bg-blue-100 text-blue-600 border border-blue-200/60" }
    };
    const t = toneMap[tone] || toneMap.brand;

    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${t.iconBg}`}>
                    {icon}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
                    <p className="text-xl font-extrabold tracking-tight leading-none mt-1 text-slate-900">
                        {value ?? "—"}{" "}
                        {unit && <span className="text-xs font-semibold text-slate-400 ml-0.5">{unit}</span>}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Patient360;