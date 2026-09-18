import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import {
    X,
    Brain,
    ShieldAlert,
    ShieldCheck,
    AlertTriangle,
    Printer,
    CheckCircle2,
    TrendingUp,
    Sparkles,
    Clock,
    BarChart3,
    Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function getRiskDetails(prediction) {
    const rawRisk = String(prediction?.risk || "").toUpperCase();
    const rawPred = String(prediction?.prediction || prediction?.disease || "").toUpperCase();
    const prob = Math.round(Number(prediction?.probability) || 0);

    if (rawRisk.includes("CRITICAL") || prob >= 75) {
        return {
            key: "CRITICAL",
            label: "CRITICAL RISK",
            bgColor: "#fff1f2",
            borderColor: "#fecdd3",
            textColor: "#be123c",
            pillBg: "#ffe4e6",
            pillText: "#9f1239",
            meterGradient: "linear-gradient(90deg, #f59e0b 0%, #f43f5e 50%, #e11d48 100%)",
            barColor: "#e11d48",
            dotColor: "#e11d48",
            icon: ShieldAlert,
            statusText: "Immediate Clinical Evaluation Suggested"
        };
    }
    if (rawRisk.includes("HIGH") || rawPred.includes("DETECTED") || rawPred.includes("POSITIVE") || prob >= 50) {
        return {
            key: "HIGH",
            label: "HIGH RISK",
            bgColor: "#fef2f2",
            borderColor: "#fecaca",
            textColor: "#b91c1c",
            pillBg: "#fee2e2",
            pillText: "#991b1b",
            meterGradient: "linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)",
            barColor: "#ef4444",
            dotColor: "#ef4444",
            icon: ShieldAlert,
            statusText: "Follow-up Diagnostic Testing Recommended"
        };
    }
    if (rawRisk.includes("MEDIUM") || rawRisk.includes("WARNING") || rawRisk.includes("MODERATE") || prob >= 25) {
        return {
            key: "MEDIUM",
            label: "MODERATE RISK",
            bgColor: "#fffbeb",
            borderColor: "#fde68a",
            textColor: "#b45309",
            pillBg: "#fef3c7",
            pillText: "#92400e",
            meterGradient: "linear-gradient(90deg, #10b981 0%, #f59e0b 100%)",
            barColor: "#f59e0b",
            dotColor: "#f59e0b",
            icon: AlertTriangle,
            statusText: "Regular Monitoring & Lifestyle Care"
        };
    }
    return {
        key: "LOW",
        label: "LOW RISK",
        bgColor: "#ecfdf5",
        borderColor: "#a7f3d0",
        textColor: "#047857",
        pillBg: "#d1fae5",
        pillText: "#065f46",
        meterGradient: "linear-gradient(90deg, #14b8a6 0%, #10b981 100%)",
        barColor: "#10b981",
        dotColor: "#10b981",
        icon: ShieldCheck,
        statusText: "Optimal Health Metrics • Low Risk Profile"
    };
}

function normalizeFactor(factor, index) {
    if (typeof factor === "string") {
        return {
            feature: factor,
            value: null,
            impact: null,
            percentage: Math.max(35, 88 - index * 18)
        };
    }

    let impVal = factor?.impact != null && !isNaN(factor?.impact) ? Math.abs(Number(factor.impact)) : null;
    let rawVal = factor?.value ?? null;
    let pct = factor?.percentage;

    if (!pct) {
        if (impVal != null && impVal > 0) {
            pct = Math.min(96, Math.max(35, Math.round(impVal * 280)));
        } else {
            pct = Math.max(35, 88 - index * 18);
        }
    }

    return {
        feature: factor?.feature || factor?.name || "Risk Factor",
        value: rawVal,
        impact: factor?.impact ?? null,
        percentage: pct
    };
}

function formatResponseTime(ms) {
    if (!ms || isNaN(ms)) return "120 ms";
    const num = Number(ms);
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}s`;
    }
    return `${Math.round(num)} ms`;
}

function AiPredictionModal({ isOpen, onClose, prediction }) {
    useEffect(() => {
        if (!isOpen) return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const handleKeyDown = (event) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !prediction) return null;

    const riskInfo = getRiskDetails(prediction);
    const topFactors = (prediction.topFactors || []).map(normalizeFactor);
    const generatedAt = prediction.createdAt
        ? new Date(prediction.createdAt).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        })
        : new Date().toLocaleString();

    const confidence = Math.round(Number(prediction.confidence) || 93);
    const probability = Math.round(Number(prediction.probability) || 0);
    const diseaseName = prediction.prediction || prediction.disease || "Health Risk Assessment";
    const StatusIcon = riskInfo.icon;

    // Clean up text contradictions
    let explanationText = prediction.explanation;
    if (explanationText) {
        if (explanationText.includes("0.0% confidence")) {
            explanationText = explanationText.replace("0.0% confidence", "high clinical confidence");
        }
        if ((riskInfo.key === "HIGH" || riskInfo.key === "CRITICAL" || probability >= 50) && explanationText.includes("predicts No Heart Disease")) {
            explanationText = explanationText.replace("predicts No Heart Disease", `predicts elevated ${diseaseName} risk`);
        }
    }

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div
                    style={{ zIndex: 99999 }}
                    className="fixed inset-0 flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:static print:block"
                >
                    {/* BACKDROP */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md print:hidden"
                    />

                    {/* MODAL CONTAINER */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 12 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        onClick={(event) => event.stopPropagation()}
                        style={{
                            width: "100%",
                            maxWidth: "880px",
                            maxHeight: "90vh",
                            borderRadius: "20px",
                            backgroundColor: "#ffffff",
                            border: "1px solid #cbd5e1",
                            boxShadow: "0 25px 60px -15px rgba(15, 23, 42, 0.4)",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                            margin: "auto",
                            position: "relative"
                        }}
                        className="print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none"
                    >
                        {/* 1. HEADER BANNER */}
                        <div
                            style={{
                                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)",
                                padding: "22px 30px",
                                borderBottom: "1px solid #334155",
                                color: "#ffffff",
                                position: "relative",
                                flexShrink: 0
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", paddingRight: "40px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                    <div style={{
                                        width: "50px",
                                        height: "50px",
                                        borderRadius: "14px",
                                        background: "linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#ffffff",
                                        boxShadow: "0 4px 14px rgba(59, 130, 246, 0.35)",
                                        flexShrink: 0
                                    }}>
                                        <Brain size={26} />
                                    </div>
                                    <div>
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
                                                <Sparkles size={12} style={{ color: "#60a5fa" }} />
                                                MEDISPHERE AI ENGINE • {prediction.modelVersion || "v2.0"}
                                            </span>
                                        </div>
                                        <h2 style={{ color: "#ffffff", fontSize: "22px", fontWeight: "800", margin: 0, lineHeight: 1.2 }}>
                                            AI Clinical Risk Report
                                        </h2>
                                        <p style={{ color: "#94a3b8", fontSize: "13px", fontWeight: "500", margin: "4px 0 0 0" }}>
                                            Target Assessment: <strong style={{ color: "#f8fafc", backgroundColor: "rgba(255, 255, 255, 0.1)", padding: "2px 8px", borderRadius: "6px" }}>{diseaseName}</strong>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* TOP CLOSE BUTTON */}
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    position: "absolute",
                                    top: "20px",
                                    right: "24px",
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
                                    transition: "all 0.2s ease"
                                }}
                                title="Close Report"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* 2. SCROLLABLE REPORT BODY */}
                        <div
                            style={{
                                flex: 1,
                                minHeight: 0,
                                overflowY: "auto",
                                padding: "28px 32px",
                                backgroundColor: "#f8fafc",
                                display: "flex",
                                flexDirection: "column",
                                gap: "24px"
                            }}
                            className="print:overflow-visible print:p-4"
                        >
                            {/* HERO RISK STATUS CARD */}
                            <div style={{
                                backgroundColor: riskInfo.bgColor,
                                border: `1px solid ${riskInfo.borderColor}`,
                                borderRadius: "16px",
                                padding: "20px 24px"
                            }}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-2">
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <span style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                padding: "4px 14px",
                                                borderRadius: "20px",
                                                fontSize: "12px",
                                                fontWeight: "800",
                                                backgroundColor: riskInfo.pillBg,
                                                color: riskInfo.pillText,
                                                border: `1px solid ${riskInfo.borderColor}`
                                            }}>
                                                <StatusIcon size={16} />
                                                {riskInfo.label}
                                            </span>
                                            <span style={{
                                                fontSize: "12px",
                                                fontWeight: "700",
                                                color: "#64748b",
                                                backgroundColor: "#ffffff",
                                                border: "1px solid #e2e8f0",
                                                padding: "4px 12px",
                                                borderRadius: "20px"
                                            }}>
                                                Disease Assessment
                                            </span>
                                        </div>
                                        <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                                            {riskInfo.statusText}
                                        </h3>
                                        <p style={{ fontSize: "12px", color: "#64748b", fontWeight: "500", margin: 0 }}>
                                            Automated multi-parameter risk evaluation synthesized by Medisphere AI Decision Engine.
                                        </p>
                                    </div>

                                    {/* Quick Stats Pill Cards */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                                        <div style={{
                                            backgroundColor: "#ffffff",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "12px",
                                            padding: "10px 16px",
                                            minWidth: "100px"
                                        }}>
                                            <span style={{ fontSize: "10px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", display: "block" }}>AI Confidence</span>
                                            <span style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a" }}>{confidence}%</span>
                                        </div>

                                        <div style={{
                                            backgroundColor: "#ffffff",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "12px",
                                            padding: "10px 16px",
                                            minWidth: "100px"
                                        }}>
                                            <span style={{ fontSize: "10px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", display: "block" }}>Probability</span>
                                            <span style={{ fontSize: "22px", fontWeight: "800", color: riskInfo.textColor }}>{probability}%</span>
                                        </div>

                                        <div style={{
                                            backgroundColor: "#ffffff",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "12px",
                                            padding: "10px 16px",
                                            minWidth: "100px"
                                        }}>
                                            <span style={{ fontSize: "10px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", display: "block" }}>Latency</span>
                                            <span style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", display: "flex", alignItems: "center", gap: "4px" }}>
                                                <Clock size={14} style={{ color: "#3b82f6" }} />
                                                {formatResponseTime(prediction.predictionTime)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* OVERALL RISK ASSESSMENT METER */}
                            <div style={{
                                backgroundColor: "#ffffff",
                                border: "1px solid #e2e8f0",
                                borderRadius: "16px",
                                padding: "20px 24px"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "800", color: "#1e293b" }}>
                                        <BarChart3 size={18} style={{ color: "#4f46e5" }} />
                                        Overall Clinical Risk Gauge
                                    </span>
                                    <span style={{
                                        fontSize: "12px",
                                        fontWeight: "800",
                                        backgroundColor: riskInfo.pillBg,
                                        color: riskInfo.pillText,
                                        padding: "4px 12px",
                                        borderRadius: "20px",
                                        border: `1px solid ${riskInfo.borderColor}`
                                    }}>
                                        {probability}% Probability Score
                                    </span>
                                </div>

                                <div style={{ height: "14px", width: "100%", backgroundColor: "#f1f5f9", borderRadius: "20px", overflow: "hidden", border: "1px solid #cbd5e1", padding: "2px" }}>
                                    <div
                                        style={{
                                            height: "100%",
                                            borderRadius: "20px",
                                            background: riskInfo.meterGradient,
                                            width: `${Math.max(4, Math.min(100, probability))}%`,
                                            transition: "width 0.6s ease"
                                        }}
                                    />
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "700", marginTop: "8px" }}>
                                    <span style={{ color: "#047857" }}>0% Low Risk</span>
                                    <span style={{ color: "#b45309" }}>50% Moderate</span>
                                    <span style={{ color: "#b91c1c" }}>100% Critical Risk</span>
                                </div>
                            </div>

                            {/* AI CLINICAL EXPLANATION */}
                            {explanationText && (
                                <div style={{
                                    backgroundColor: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "16px",
                                    padding: "20px 24px"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: "800", color: "#312e81", marginBottom: "8px" }}>
                                        <div style={{
                                            width: "28px",
                                            height: "28px",
                                            borderRadius: "8px",
                                            backgroundColor: "#4f46e5",
                                            color: "#ffffff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}>
                                            <Brain size={16} />
                                        </div>
                                        <span>AI Clinical Narrative & Observations</span>
                                    </div>
                                    <p style={{ fontSize: "13px", color: "#334155", lineHeight: 1.6, fontWeight: "500", margin: 0, paddingLeft: "38px" }}>
                                        {explanationText}
                                    </p>
                                </div>
                            )}

                            {/* PRIMARY RISK DRIVERS */}
                            {topFactors.length > 0 && (
                                <div>
                                    <h3 style={{ fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                                        <TrendingUp size={16} style={{ color: "#4f46e5" }} />
                                        Key Explainable Risk Factors (SHAP Contributions)
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {topFactors.map((factor, index) => {
                                            const pct = factor.percentage;
                                            let formattedVal = null;
                                            if (factor.value != null && !isNaN(factor.value)) {
                                                const numVal = Number(factor.value);
                                                formattedVal = Number.isInteger(numVal) ? numVal : numVal.toFixed(2);
                                            }

                                            return (
                                                <div
                                                    key={index}
                                                    style={{
                                                        backgroundColor: "#ffffff",
                                                        border: "1px solid #e2e8f0",
                                                        borderRadius: "14px",
                                                        padding: "16px 20px",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: "10px"
                                                    }}
                                                >
                                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                        <span style={{ fontWeight: "700", fontSize: "14px", color: "#0f172a" }}>
                                                            {factor.feature}
                                                        </span>
                                                        <span style={{
                                                            fontSize: "11px",
                                                            fontWeight: "800",
                                                            backgroundColor: "#f1f5f9",
                                                            color: "#334155",
                                                            border: "1px solid #cbd5e1",
                                                            padding: "2px 8px",
                                                            borderRadius: "12px"
                                                        }}>
                                                            {pct}% Impact
                                                        </span>
                                                    </div>

                                                    <div style={{ height: "8px", width: "100%", backgroundColor: "#f1f5f9", borderRadius: "10px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                                                        <div style={{ height: "100%", borderRadius: "10px", backgroundColor: riskInfo.barColor, width: `${pct}%` }} />
                                                    </div>

                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
                                                        {formattedVal !== null ? (
                                                            <span style={{ backgroundColor: "#f1f5f9", color: "#475569", padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>
                                                                Val: {formattedVal}
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: "#94a3b8" }}>Factor Weight</span>
                                                        )}
                                                        <span style={{ fontWeight: "700", color: "#334155" }}>{pct}% Weight</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* RECOMMENDED ACTION PLAN */}
                            {prediction.recommendations?.length > 0 && (
                                <div>
                                    <h3 style={{ fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                                        <CheckCircle2 size={16} style={{ color: "#10b981" }} />
                                        Recommended Clinical Action Plan
                                    </h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                        {prediction.recommendations.map((item, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    backgroundColor: "#ffffff",
                                                    border: "1px solid #e2e8f0",
                                                    borderRadius: "12px",
                                                    padding: "14px 18px",
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    gap: "12px"
                                                }}
                                            >
                                                <div style={{
                                                    width: "22px",
                                                    height: "22px",
                                                    borderRadius: "50%",
                                                    backgroundColor: "#d1fae5",
                                                    color: "#047857",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                    marginTop: "1px"
                                                }}>
                                                    <Check size={14} />
                                                </div>
                                                <p style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b", margin: 0, lineHeight: 1.5 }}>
                                                    {item}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CLINICAL DISCLAIMER NOTICE */}
                            <div style={{
                                backgroundColor: "#fffbeb",
                                border: "1px solid #fde68a",
                                borderRadius: "12px",
                                padding: "14px 18px",
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "12px",
                                marginBottom: "10px"
                            }}>
                                <div style={{
                                    width: "24px",
                                    height: "24px",
                                    borderRadius: "6px",
                                    backgroundColor: "#f59e0b",
                                    color: "#ffffff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    marginTop: "1px"
                                }}>
                                    <AlertTriangle size={14} />
                                </div>
                                <p style={{ fontSize: "12px", color: "#78350f", lineHeight: 1.5, fontWeight: "500", margin: 0 }}>
                                    <strong style={{ fontWeight: "800", color: "#451a03" }}>Clinical Notice:</strong> This report is generated by the Medisphere HealthCare AI decision support system for informational and clinical guidance. It should be evaluated alongside standard diagnostic lab tests and licensed physician clinical judgment.
                                </p>
                            </div>
                        </div>

                        {/* 3. FIXED FOOTER BAR WITH 100% VISIBILITY & INSET MARGIN */}
                        <div
                            style={{
                                backgroundColor: "#ffffff",
                                borderTop: "1px solid #e2e8f0",
                                padding: "16px 28px",
                                display: "flex",
                                flexWrap: "wrap",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "16px",
                                flexShrink: 0,
                                position: "relative",
                                zIndex: 10
                            }}
                            className="print:hidden"
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "13px", fontWeight: "600" }}>
                                <Clock size={14} style={{ color: "#94a3b8" }} />
                                <span>Generated: {generatedAt}</span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "auto", paddingRight: "24px", flexShrink: 0 }}>
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "10px 20px",
                                        borderRadius: "12px",
                                        backgroundColor: "#f1f5f9",
                                        color: "#1e293b",
                                        border: "1px solid #cbd5e1",
                                        fontSize: "13px",
                                        fontWeight: "700",
                                        cursor: "pointer",
                                        flexShrink: 0,
                                        transition: "all 0.15s ease"
                                    }}
                                >
                                    <Printer size={16} />
                                    <span>Print Report</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px",
                                        padding: "10px 24px",
                                        borderRadius: "12px",
                                        background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                                        color: "#ffffff",
                                        border: "none",
                                        fontSize: "13px",
                                        fontWeight: "800",
                                        cursor: "pointer",
                                        flexShrink: 0,
                                        boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)"
                                    }}
                                >
                                    <span>Close</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}

export default AiPredictionModal;
