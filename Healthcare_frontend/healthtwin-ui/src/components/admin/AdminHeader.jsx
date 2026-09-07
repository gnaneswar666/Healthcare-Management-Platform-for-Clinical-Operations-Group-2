import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Search,
    Bell,
    UserCircle2,
    CalendarDays,
    Sparkles,
    LogOut
} from "lucide-react";
import keycloak from "../../keycloak";
import { getDoctors } from "../../services/doctorService";
import { getPatients } from "../../services/patientService";
import { getAllAlerts } from "../../services/alertService";

function AdminHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const today = new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const token = keycloak.tokenParsed || {};
    const keycloakEmail = token.email || "admin@healthcare.com";
    const username = token.preferred_username || "";

    const keycloakFirstName =
        token.given_name ||
        token.firstName ||
        token.givenName ||
        (token.name ? token.name.split(" ")[0] : null) ||
        (username && username.toLowerCase() !== "admin" ? username : null) ||
        "Administrator";

    const [displayName, setDisplayName] = useState(keycloakFirstName);
    const [displayEmail, setDisplayEmail] = useState(keycloakEmail);
    const [hasUnacknowledged, setHasUnacknowledged] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchMongoName = async () => {
            try {
                const [docRes, patRes] = await Promise.all([
                    getDoctors().catch(() => null),
                    getPatients().catch(() => null)
                ]);

                if (!isMounted) return;

                if (docRes?.data?.length) {
                    const matchedDoc = docRes.data.find(
                        (d) =>
                            (keycloakEmail && d.email?.toLowerCase() === keycloakEmail.toLowerCase()) ||
                            (username && d.doctorId?.toLowerCase() === username.toLowerCase())
                    );
                    if (matchedDoc) {
                        if (matchedDoc.doctorName) {
                            setDisplayName(matchedDoc.doctorName.replace(/^Dr\.\s*/i, "").trim());
                        }
                        if (matchedDoc.email) {
                            setDisplayEmail(matchedDoc.email);
                        }
                        return;
                    }
                }

                if (patRes?.data?.length) {
                    const matchedPat = patRes.data.find(
                        (p) =>
                            (keycloakEmail && p.email?.toLowerCase() === keycloakEmail.toLowerCase()) ||
                            (username && p.patientId?.toLowerCase() === username.toLowerCase())
                    );
                    if (matchedPat) {
                        if (matchedPat.firstName) {
                            setDisplayName(matchedPat.firstName);
                        }
                        if (matchedPat.email) {
                            setDisplayEmail(matchedPat.email);
                        }
                        return;
                    }
                }
            } catch (err) {
                console.warn("Could not fetch admin details from MongoDB:", err);
            }
        };

        fetchMongoName();
        return () => {
            isMounted = false;
        };
    }, [keycloakEmail, username]);

    // Check Unacknowledged Alerts Status for Notification Red Dot
    const checkAlertStatus = async () => {
        try {
            const res = await getAllAlerts().catch(() => null);
            const alertList = res?.data || [];
            const unacknowledged = alertList.filter((a) => {
                const status = String(a.status || "").toUpperCase();
                const isAck = a.acknowledged || status === "ACKNOWLEDGED" || status === "RESOLVED";
                return !isAck;
            });
            setHasUnacknowledged(unacknowledged.length > 0);
        } catch (e) {
            console.warn("Failed to check admin alerts:", e);
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
    }, [location.pathname]);

    const handleBellClick = () => {
        navigate("/admin/alerts");
    };

    return (
        <header className="px-4 pt-4 sm:px-6 lg:px-8">
            <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-[24px] px-4 py-4 sm:px-6 lg:px-8">
                <div>
                    <div className="page-status-chip mb-2">
                        <Sparkles size={14} />
                        Operations Center
                    </div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                        Welcome back, {displayName}
                    </h1>
                    <p className="text-sm text-slate-600 mt-1 flex items-center gap-2">
                        <CalendarDays size={15} />
                        {today}
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative hidden md:block">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 pointer-events-none z-10">
                            <Search size={16} className="text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search patients, doctors..."
                            style={{ paddingLeft: "2.75rem" }}
                            className="input input-search !py-2.5 w-72"
                        />
                    </div>

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
                            <p className="text-sm text-slate-500">{displayEmail}</p>
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

export default AdminHeader;
