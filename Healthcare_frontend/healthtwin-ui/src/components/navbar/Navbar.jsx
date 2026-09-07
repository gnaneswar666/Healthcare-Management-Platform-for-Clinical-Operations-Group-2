import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, LogOut, UserCircle2, Sparkles, CalendarDays } from "lucide-react";
import keycloak from "../../keycloak";
import { getDoctors } from "../../services/doctorService";
import { getPatients } from "../../services/patientService";
import { getAllAlerts, getDoctorAlerts, getPatientAlerts } from "../../services/alertService";
import { getDoctorIdentity, getCachedDoctorProfile } from "../../utils/userUtils";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const roles = keycloak.tokenParsed?.realm_access?.roles || [];
    const token = keycloak.tokenParsed || {};

    const keycloakEmail = token.email || "";
    const username = token.preferred_username || "";
    const doctorId = token.doctorId || "";
    const patientId = token.patientId || "";

    const isAdmin = roles.some((r) => String(r).toUpperCase() === "ADMIN");
    const isDoctor = roles.some((r) => String(r).toUpperCase() === "DOCTOR");
    const isPatient = roles.some((r) => String(r).toUpperCase() === "PATIENT");

    // Check synchronous cache first to avoid header flashing
    const cachedDoctor = isDoctor ? getCachedDoctorProfile() : null;

    // Keycloak initial fallback name
    const keycloakFirstName =
        cachedDoctor?.cleanName ||
        token.given_name ||
        token.firstName ||
        token.givenName ||
        (token.name ? token.name.split(" ")[0] : null) ||
        (username && username.toLowerCase() !== "doctor" && username.toLowerCase() !== "patient" ? username : null) ||
        "User";

    const [displayName, setDisplayName] = useState(keycloakFirstName);
    const [displayEmail, setDisplayEmail] = useState(cachedDoctor?.email || keycloakEmail);
    const [hasUnacknowledged, setHasUnacknowledged] = useState(false);

    // Load User Details
    useEffect(() => {
        let isMounted = true;

        const fetchMongoUser = async () => {
            try {
                if (isDoctor) {
                    const docProfile = await getDoctorIdentity(keycloak);
                    if (isMounted && docProfile) {
                        setDisplayName(docProfile.cleanName);
                        setDisplayEmail(docProfile.email);
                    }
                } else if (isPatient) {
                    const res = await getPatients().catch(() => null);
                    if (!isMounted || !res?.data?.length) return;

                    const matchedPatient = res.data.find(
                        (p) =>
                            (keycloakEmail && p.email?.toLowerCase() === keycloakEmail.toLowerCase()) ||
                            (patientId && p.patientId === patientId) ||
                            (username && p.patientId?.toLowerCase() === username.toLowerCase()) ||
                            (username &&
                                (p.firstName?.toLowerCase() === username.toLowerCase() ||
                                    p.lastName?.toLowerCase() === username.toLowerCase()))
                    );

                    if (matchedPatient) {
                        if (matchedPatient.firstName) {
                            setDisplayName(matchedPatient.firstName);
                        }
                        if (matchedPatient.email) {
                            setDisplayEmail(matchedPatient.email);
                        }
                    }
                }
            } catch (err) {
                console.warn("Could not fetch user info from MongoDB:", err);
            }
        };

        fetchMongoUser();
        return () => {
            isMounted = false;
        };
    }, [isDoctor, isPatient, keycloakEmail, username, doctorId, patientId]);

    // Check Unacknowledged Alerts Status for Notification Red Dot
    const checkAlertStatus = async () => {
        try {
            let res = null;
            if (isDoctor && doctorId) {
                res = await getDoctorAlerts(doctorId).catch(() => null);
            } else if (isPatient && patientId) {
                res = await getPatientAlerts(patientId).catch(() => null);
            }
            if (!res?.data) {
                res = await getAllAlerts().catch(() => null);
            }

            const alertList = res?.data || [];
            const unacknowledged = alertList.filter((a) => {
                const status = String(a.status || "").toUpperCase();
                const isAck = a.acknowledged || status === "ACKNOWLEDGED" || status === "RESOLVED";
                return !isAck;
            });

            setHasUnacknowledged(unacknowledged.length > 0);
        } catch (e) {
            console.warn("Failed to check alert status:", e);
        }
    };

    useEffect(() => {
        checkAlertStatus();
        const interval = setInterval(checkAlertStatus, 2000);
        window.addEventListener("alertStatusChanged", checkAlertStatus);
        window.addEventListener("focus", checkAlertStatus);
        return () => {
            clearInterval(interval);
            window.removeEventListener("alertStatusChanged", checkAlertStatus);
            window.removeEventListener("focus", checkAlertStatus);
        };
    }, [location.pathname, isDoctor, isPatient, doctorId, patientId]);

    // Navigation on Bell Icon Click
    const handleBellClick = () => {
        if (isAdmin) {
            navigate("/admin/alerts");
        } else if (isDoctor) {
            navigate("/doctor/alerts");
        } else if (isPatient) {
            navigate("/patient/alerts");
        } else {
            navigate("/admin/alerts");
        }
    };

    const chipLabel = isDoctor ? "Clinical workspace" : isPatient ? "My health hub" : "Workspace";
    const subtitle = isDoctor
        ? "Oversee patient care and clinical insights in real time."
        : isPatient
        ? "Monitor your Digital Twin and wellness journey in real time."
        : "Welcome to your workspace.";

    const today = new Date().toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
    });

    return (
        <header className="px-4 pt-4 sm:px-6 lg:px-8">
            <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-[24px] px-4 py-4 sm:px-6 lg:px-8">
                <div>
                    <div className="page-status-chip mb-2">
                        <Sparkles size={14} />
                        {chipLabel}
                    </div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                        Welcome back, {displayName}
                    </h1>
                    <p className="text-sm text-slate-600 mt-1 flex items-center gap-2">
                        <CalendarDays size={15} />
                        {today} • {subtitle}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBellClick}
                        className="btn btn--ghost btn--icon relative cursor-pointer"
                        aria-label="Notifications"
                        title="View Alerts"
                    >
                        <Bell size={18} />
                        {hasUnacknowledged && (
                            <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                        )}
                    </button>

                    <div className="flex items-center gap-3 rounded-[18px] border border-slate-200 bg-white/85 px-3 py-2">
                        <UserCircle2 size={38} className="text-blue-600" />
                        <div className="hidden sm:block">
                            <h3 className="font-semibold text-slate-800 text-[0.92rem]">{displayName}</h3>
                            <p className="text-sm text-slate-500">
                                {isDoctor ? "Care Team" : isPatient ? "Patient" : "Member"}
                                {displayEmail ? ` • ${displayEmail}` : ""}
                            </p>
                        </div>
                    </div>

                    <button onClick={() => keycloak.logout()} className="btn btn--dark">
                        <LogOut size={17} />
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Navbar;
