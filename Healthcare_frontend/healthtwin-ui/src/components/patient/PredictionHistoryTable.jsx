import { motion } from "framer-motion";
import { Eye, ShieldAlert, Activity, Clock, CalendarDays, BadgeCheck, AlertTriangle, AlertCircle } from "lucide-react";

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
        case "HIGH": return <AlertTriangle size={14} />;
        case "MEDIUM": return <AlertCircle size={14} />;
        case "LOW": return <BadgeCheck size={14} />;
        default: return <ShieldAlert size={14} />;
    }
};

const riskBg = (risk) => {
    switch (risk?.toUpperCase()) {
        case "HIGH": return "from-rose-50/70 to-red-50/30 border-slate-200/80";
        case "MEDIUM": return "from-amber-50/70 to-yellow-50/30 border-slate-200/80";
        case "LOW": return "from-emerald-50/70 to-teal-50/30 border-slate-200/80";
        default: return "from-slate-50 to-gray-50/50 border-slate-200/80";
    }
};

const confidenceColor = (val) => {
    const v = Number(val) || 0;
    if (v >= 80) return "bg-gradient-to-r from-emerald-400 to-emerald-500";
    if (v >= 50) return "bg-gradient-to-r from-amber-400 to-amber-500";
    return "bg-gradient-to-r from-rose-400 to-rose-500";
};

const rowVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.3, delay: i * 0.04, ease: "easeOut" }
    })
};

const PredictionHistoryTable = ({ history, onView }) => {
    if (!history || history.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            {history.map((item, index) => {
                const confidence = Math.round(Number(item.confidence) || 0);
                const riskLevel = (item.risk || "UNKNOWN").toUpperCase();

                const rawDate = item.predictionDate || item.createdAt || item.timestamp || item.date || item.created_at;
                let formattedDate = "Recent";
                let formattedTime = "";
                if (rawDate) {
                    const d = new Date(rawDate);
                    if (!isNaN(d.getTime())) {
                        formattedDate = d.toLocaleDateString();
                        formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }
                }

                return (
                    <motion.div
                        key={item.id || index}
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
                            borderLeft: riskLevel === "HIGH" || riskLevel === "CRITICAL" ? "5px solid #ef4444" : riskLevel === "MEDIUM" || riskLevel === "WARNING" ? "5px solid #f59e0b" : "5px solid #10b981",
                            padding: "18px 24px",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                            transition: "all 0.2s ease-in-out",
                            width: "100%",
                            boxSizing: "border-box"
                        }}
                    >
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px", width: "100%" }}>
                            {/* Left side - Main info */}
                            <div style={{ flex: "1 1 300px", minWidth: 0 }}>
                                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                                    <span className={`badge ${riskBadgeClass(riskLevel)}`}>
                                        {riskIcon(riskLevel)}
                                        {item.risk || "Unknown"} Risk
                                    </span>
                                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
                                        <CalendarDays size={13} style={{ color: "#64748b" }} />
                                        {formattedDate}
                                    </span>
                                    {formattedTime && (
                                        <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#94a3b8", fontWeight: "500" }}>
                                            <Clock size={13} style={{ color: "#94a3b8" }} />
                                            {formattedTime}
                                        </span>
                                    )}
                                </div>

                                <h4 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {item.prediction || "Heart Disease Assessment"}
                                </h4>

                                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", fontSize: "13px", color: "#475569" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <Activity size={14} style={{ color: "#64748b" }} />
                                        <span>
                                            Confidence: <strong style={{ color: "#0f172a" }}>{confidence}%</strong>
                                        </span>
                                    </div>
                                    <span>•</span>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <BadgeCheck size={14} style={{ color: "#64748b" }} />
                                        <span>
                                            Model: <strong style={{ color: "#334155" }}>{item.modelVersion || "v2.0"}</strong>
                                        </span>
                                    </div>
                                </div>

                                {/* Confidence progress bar */}
                                <div style={{ marginTop: "12px", maxWidth: "360px" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                                        <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Confidence</span>
                                        <span style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>{confidence}%</span>
                                    </div>
                                    <div style={{ height: "8px", width: "100%", backgroundColor: "#e2e8f0", borderRadius: "20px", overflow: "hidden" }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(confidence, 100)}%` }}
                                            transition={{ duration: 0.8, delay: 0.1 + index * 0.03, ease: "easeOut" }}
                                            className={`h-full rounded-full ${confidenceColor(confidence)}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right side - Action (Unclipped) */}
                            <div style={{ flexShrink: 0, marginLeft: "auto" }}>
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    type="button"
                                    onClick={() => onView(item.id)}
                                    style={{
                                        padding: "8px 18px",
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
                                    <Eye size={15} />
                                    <span>View Report</span>
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default PredictionHistoryTable;

