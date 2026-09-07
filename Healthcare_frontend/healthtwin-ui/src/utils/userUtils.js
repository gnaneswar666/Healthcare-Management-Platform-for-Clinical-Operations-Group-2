import keycloak from "../keycloak";
import { getDoctors } from "../services/doctorService";

const DOCTOR_PROFILE_KEY = "healthtwin_doctor_profile";

/**
 * Returns cached doctor profile synchronously if present
 */
export const getCachedDoctorProfile = () => {
    try {
        const stored = sessionStorage.getItem(DOCTOR_PROFILE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.warn("Could not read cached doctor profile:", e);
    }
    return null;
};

/**
 * Resolves doctor identity reliably and caches result
 */
export const getDoctorIdentity = async (keycloakInstance = keycloak) => {
    const token = keycloakInstance?.tokenParsed || {};
    const keycloakEmail = token.email || "";
    const username = token.preferred_username || "";
    const tokenDoctorId = token.doctorId || "";

    // 1. Check synchronous cache first if present
    const cached = getCachedDoctorProfile();
    if (cached) {
        // Refresh in background
        fetchAndCacheDoctorProfile(keycloakEmail, username, tokenDoctorId);
        return cached;
    }

    return await fetchAndCacheDoctorProfile(keycloakEmail, username, tokenDoctorId);
};

const fetchAndCacheDoctorProfile = async (keycloakEmail, username, tokenDoctorId) => {
    // Default fallback initial identity
    let cleanName =
        (keycloak.tokenParsed?.given_name) ||
        (keycloak.tokenParsed?.firstName) ||
        (keycloak.tokenParsed?.name ? keycloak.tokenParsed.name.split(" ")[0] : null) ||
        (username && username.toLowerCase() !== "doctor" ? username : null) ||
        "Sarah Jenkins";

    let email = keycloakEmail || "sarah.jenkins@healthtwin.io";
    let doctorId = tokenDoctorId || "DOC101";
    let doctorName = cleanName.startsWith("Dr.") ? cleanName : `Dr. ${cleanName}`;

    try {
        const res = await getDoctors().catch(() => null);
        if (res?.data?.length) {
            const matched = res.data.find(
                (d) =>
                    (keycloakEmail && d.email?.toLowerCase() === keycloakEmail.toLowerCase()) ||
                    (tokenDoctorId && d.doctorId === tokenDoctorId) ||
                    (username && d.doctorId?.toLowerCase() === username.toLowerCase()) ||
                    (username && d.doctorName?.toLowerCase().includes(username.toLowerCase()))
            );

            const activeDoc = matched || res.data.find((d) => d.doctorId === "DOC101") || res.data[0];

            if (activeDoc) {
                doctorId = activeDoc.doctorId || "DOC101";
                doctorName = activeDoc.doctorName || "Dr. Sarah Jenkins";
                cleanName = doctorName.replace(/^Dr\.\s*/i, "").trim();
                email = activeDoc.email || email;
            }
        }
    } catch (err) {
        console.warn("Could not fetch doctor details from MongoDB:", err);
    }

    const profile = {
        doctorId,
        doctorName,
        cleanName,
        email,
        username,
        keycloakEmail
    };

    try {
        sessionStorage.setItem(DOCTOR_PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
        console.warn("Could not save doctor profile to sessionStorage:", e);
    }

    return profile;
};
