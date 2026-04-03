import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5001";

const ACTIVITY_LABELS = {
  RUNNING: "TRCANJE",
  WALKING: "HODANJE",
  IDLE: "MIROVANJE"
};

const PARTICIPATION_STATUS_LABELS = {
  REGISTERED: "Prijavljen",
  ATTENDED: "Prisutan",
  ABSENT: "Odsutan"
};

const COACH_ATTENDANCE_STATUSES = ["ATTENDED", "ABSENT"];

function formatHrDateTime(iso) {
  if (iso == null || iso === "") {
    return "—";
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "—";
  }
  return d.toLocaleString("hr-HR", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

function toGoogleCalendarDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function buildGoogleCalendarUrl(training) {
  const title = training?.title || "Trening";
  const location = training?.location || "";
  const details = `Trener: ${
    training?.coach_first_name || training?.coach_last_name
      ? `${training?.coach_first_name || ""} ${training?.coach_last_name || ""}`.trim()
      : "N/A"
  }`;
  const start = toGoogleCalendarDateTime(training?.start_time);
  const end = toGoogleCalendarDateTime(training?.end_time);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    location,
    details
  });
  if (start && end) {
    params.set("dates", `${start}/${end}`);
  }
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#020617",
    backgroundImage:
      "radial-gradient(circle at 15% 10%, rgba(59,130,246,0.24), transparent 36%), radial-gradient(circle at 85% 20%, rgba(34,197,94,0.20), transparent 30%), linear-gradient(135deg, #020617 0%, #0f172a 45%, #1d4ed8 100%)",
    padding: "24px",
    boxSizing: "border-box"
  },
  container: {
    width: "100%",
    maxWidth: "none",
    margin: 0,
    fontFamily: "Arial, sans-serif",
    color: "#172033",
    boxSizing: "border-box",
    display: "grid",
    gap: "20px"
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "24px",
    padding: "22px 24px",
    borderRadius: "22px",
    background: "linear-gradient(135deg, rgba(15,23,42,0.88) 0%, rgba(29,78,216,0.82) 100%)",
    boxShadow: "0 20px 42px rgba(2, 6, 23, 0.36)",
    border: "1px solid rgba(191,219,254,0.25)"
  },
  brandBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  overline: {
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#bfdbfe"
  },
  title: {
    margin: 0,
    fontSize: "34px",
    fontWeight: "700",
    color: "#ffffff"
  },
  subtitle: {
    margin: 0,
    color: "#dbeafe",
    fontSize: "15px"
  },
  topActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },
  userChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(191,219,254,0.35)",
    backgroundColor: "rgba(15, 23, 42, 0.35)"
  },
  userAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "999px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "700",
    color: "#0f172a",
    backgroundColor: "#bfdbfe"
  },
  userChipName: {
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "700",
    lineHeight: 1.2
  },
  userChipRole: {
    color: "#dbeafe",
    fontSize: "12px"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px"
  },
  statCard: {
    backgroundColor: "rgba(239, 246, 255, 0.95)",
    borderRadius: "18px",
    padding: "18px 20px",
    border: "2px solid #93c5fd",
    boxShadow: "0 20px 36px rgba(2, 6, 23, 0.30)"
  },
  statLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#64748b",
    marginBottom: "10px",
    fontWeight: "700"
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "6px"
  },
  statNote: {
    fontSize: "14px",
    color: "#64748b"
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.6fr 1fr",
    gap: "20px",
    alignItems: "start"
  },
  leftColumn: {
    display: "grid",
    gap: "20px"
  },
  rightColumn: {
    display: "grid",
    gap: "20px"
  },
  card: {
    backgroundColor: "rgba(248, 251, 255, 0.95)",
    borderRadius: "18px",
    padding: "20px",
    border: "2px solid #93c5fd",
    boxShadow: "0 20px 36px rgba(2, 6, 23, 0.30)"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "16px"
  },
  cardTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827"
  },
  cardText: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px"
  },
  authFooter: {
    marginTop: "18px",
    textAlign: "center",
    fontSize: "14px",
    color: "#64748b",
    lineHeight: 1.5
  },
  authLink: {
    background: "none",
    border: "none",
    padding: 0,
    margin: 0,
    cursor: "pointer",
    color: "#1d4ed8",
    fontWeight: "700",
    fontSize: "14px",
    textDecoration: "underline",
    fontFamily: "inherit"
  },
  inputGroup: {
    marginBottom: "14px"
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155"
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    backgroundColor: "#ffffff"
  },
  button: {
    padding: "11px 16px",
    border: "none",
    borderRadius: "12px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer"
  },
  secondaryButton: {
    padding: "11px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontWeight: "700",
    cursor: "pointer"
  },
  softButton: {
    padding: "10px 14px",
    border: "1px solid #dbe3f1",
    borderRadius: "12px",
    backgroundColor: "#f8fbff",
    color: "#1d4ed8",
    fontWeight: "700",
    cursor: "pointer"
  },
  dangerButton: {
    padding: "11px 16px",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    backgroundColor: "#fff5f5",
    color: "#dc2626",
    fontWeight: "700",
    cursor: "pointer"
  },
  disabledButton: {
    opacity: 0.55,
    cursor: "not-allowed"
  },
  row: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },
  trainingList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "grid",
    gap: "14px"
  },
  trainingItem: {
    border: "2px solid #bfdbfe",
    borderRadius: "16px",
    padding: "18px",
    backgroundColor: "#dbeafe"
  },
  trainingTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "8px"
  },
  trainingTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827"
  },
  trainingMeta: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px"
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "7px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.03em"
  },
  message: {
    marginTop: "14px",
    padding: "13px 14px",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "14px"
  },
  panelList: {
    display: "grid",
    gap: "12px"
  },
  panelItem: {
    padding: "14px",
    borderRadius: "14px",
    border: "2px solid #bfdbfe",
    backgroundColor: "#dbeafe"
  },
  panelItemLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#64748b",
    marginBottom: "6px",
    fontWeight: "700"
  },
  panelItemValue: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827"
  },
  historyList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "grid",
    gap: "10px"
  },
  historyItem: {
    padding: "12px",
    borderRadius: "12px",
    border: "2px solid #bfdbfe",
    backgroundColor: "#dbeafe",
    cursor: "pointer"
  },
  historyTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "6px"
  },
  historyTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "700",
    color: "#111827"
  },
  historyMeta: {
    margin: 0,
    fontSize: "13px",
    color: "#475569"
  },
  miniChart: {
    width: "100%",
    height: "190px",
    backgroundColor: "#eff6ff",
    border: "2px solid #bfdbfe",
    borderRadius: "14px",
    padding: "8px",
    boxSizing: "border-box"
  },
  signalGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginTop: "8px"
  },
  signalTile: {
    border: "1px solid #bfdbfe",
    borderRadius: "10px",
    padding: "8px",
    backgroundColor: "#eff6ff"
  },
  sensorGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px"
  },
  emptyText: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px"
  },
  participantBox: {
    marginTop: "12px",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #93c5fd",
    backgroundColor: "#eff6ff"
  },
  participantRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "8px",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #bfdbfe"
  }
};

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordConfirm, setRegPasswordConfirm] = useState("");
  const [regRole, setRegRole] = useState("ATHLETE");
  const [message, setMessage] = useState("");
  const [trainings, setTrainings] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [lastActivity, setLastActivity] = useState("");
  const [lastSessionResult, setLastSessionResult] = useState(null);
  const [mySessions, setMySessions] = useState([]);
  const [showFinishedOnly, setShowFinishedOnly] = useState(true);
  const [historySort, setHistorySort] = useState("desc");
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "");
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail") || "");
  const [userFirstName, setUserFirstName] = useState(localStorage.getItem("userFirstName") || "");
  const [userLastName, setUserLastName] = useState(localStorage.getItem("userLastName") || "");
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [userId, setUserId] = useState(() => {
    const raw = localStorage.getItem("userId");
    if (raw == null || raw === "") {
      return null;
    }
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  });
  const [isLiveCapture, setIsLiveCapture] = useState(false);
  const [liveSampleCount, setLiveSampleCount] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const liveSensorRef = useRef({
    accelX: 0,
    accelY: 0,
    accelZ: 9.8,
    gyroX: 0,
    gyroY: 0,
    gyroZ: 0
  });
  const liveIntervalRef = useRef(null);

  const normalizedRole = String(userRole).trim().toUpperCase();
  const isCoach = normalizedRole === "COACH" || normalizedRole === "ADMIN";
  const userDisplayName =
    `${String(userFirstName || "").trim()} ${String(userLastName || "").trim()}`.trim() ||
    (userEmail ? userEmail.split("@")[0] : "Korisnik");
  const userInitials = userDisplayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U";
  const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(userDisplayName)}`;

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [userDisplayName]);

  const fetchMe = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok && data.user?.role) {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        localStorage.setItem("userRole", data.user.role);
        setUserRole(data.user.role);
        if (data.user.email) {
          localStorage.setItem("userEmail", data.user.email);
          setUserEmail(data.user.email);
        }
        localStorage.setItem("userFirstName", data.user.firstName || "");
        localStorage.setItem("userLastName", data.user.lastName || "");
        setUserFirstName(data.user.firstName || "");
        setUserLastName(data.user.lastName || "");
        if (data.user.id != null) {
          localStorage.setItem("userId", String(data.user.id));
          setUserId(Number(data.user.id));
        }
      }
    } catch (error) {
      // tiho ignoriraj — korisnik i dalje moze raditi s postojecim tokenom
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchMe();
      fetchTrainings();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && !isCoach) {
      fetchMySessions();
    }
  }, [isLoggedIn, isCoach]);

  useLayoutEffect(() => {
    document.documentElement.style.background = "#020617";
    document.body.style.background = "#020617";
    document.body.style.margin = "0";

    const root = document.getElementById("root");
    if (root) {
      root.style.background = "#020617";
      root.style.minHeight = "100vh";
      root.style.width = "100%";
      root.style.maxWidth = "none";
      root.style.margin = "0";
      root.style.padding = "0";
    }
  }, []);

  const getButtonStyle = (disabled, variant = "primary") => {
    const base =
      variant === "secondary"
        ? styles.secondaryButton
        : variant === "soft"
          ? styles.softButton
          : variant === "danger"
            ? styles.dangerButton
            : styles.button;

    return {
      ...base,
      minHeight: isMobile ? "44px" : base.minHeight,
      width: isMobile ? "100%" : base.width,
      ...(disabled ? styles.disabledButton : {})
    };
  };

  const getActivityBadgeStyle = (activity) => {
    if (activity === "RUNNING") {
      return { backgroundColor: "#dcfce7", color: "#166534" };
    }
    if (activity === "WALKING") {
      return { backgroundColor: "#fef3c7", color: "#92400e" };
    }
    if (activity === "IDLE") {
      return { backgroundColor: "#e5e7eb", color: "#374151" };
    }
    return { backgroundColor: "#dbeafe", color: "#1d4ed8" };
  };

  const getActivityLabel = (activity) => {
    if (!activity) {
      return "NEMA PODATAKA";
    }
    return ACTIVITY_LABELS[activity] || activity;
  };

  const statusBadgeStyle = useMemo(() => {
    return getActivityBadgeStyle(lastActivity);
  }, [lastActivity]);

  const messageStyle = useMemo(() => {
    const lower = message.toLowerCase();

    if (
      lower.includes("greška") ||
      lower.includes("greska") ||
      lower.includes("error")
    ) {
      return {
        ...styles.message,
        backgroundColor: "#fef2f2",
        color: "#b91c1c",
        border: "1px solid #fecaca"
      };
    }

    if (
      lower.includes("uspješno") ||
      lower.includes("uspješan") ||
      lower.includes("started") ||
      lower.includes("finished")
    ) {
      return {
        ...styles.message,
        backgroundColor: "#ecfdf5",
        color: "#047857",
        border: "1px solid #a7f3d0"
      };
    }

    return {
      ...styles.message,
      backgroundColor: "#eff6ff",
      color: "#1d4ed8",
      border: "1px solid #bfdbfe"
    };
  }, [message]);

  const displayedSessions = useMemo(() => {
    let sessions = [...mySessions];

    if (showFinishedOnly) {
      sessions = sessions.filter((s) => !!s.ended_at);
    }

    sessions.sort((a, b) => {
      const aTime = new Date(a.started_at || 0).getTime();
      const bTime = new Date(b.started_at || 0).getTime();
      return historySort === "asc" ? aTime - bTime : bTime - aTime;
    });

    return sessions;
  }, [mySessions, showFinishedOnly, historySort]);

  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1100;

  const [newTraining, setNewTraining] = useState({
    title: "",
    description: "",
    location: "",
    startTime: "",
    endTime: ""
  });
  const [coachPanelTrainingId, setCoachPanelTrainingId] = useState(null);
  const [participantsByTrainingId, setParticipantsByTrainingId] = useState({});
  const [participantsLoadingId, setParticipantsLoadingId] = useState(null);
  const finishedSessions = displayedSessions.filter((s) => s.avg_acceleration && s.max_acceleration).slice(0, 6);
  const chartMax =
    finishedSessions.length > 0
      ? Math.max(
          ...finishedSessions.map((s) => Math.max(Number(s.avg_acceleration), Number(s.max_acceleration)))
        )
      : 1;

  const applyLoginSuccess = (data) => {
    setMessage("Prijava uspješna");
    localStorage.setItem("token", data.token);
    if (data.user?.role) {
      localStorage.setItem("userRole", data.user.role);
      setUserRole(data.user.role);
    }
    if (data.user?.email) {
      localStorage.setItem("userEmail", data.user.email);
      setUserEmail(data.user.email);
    }
    localStorage.setItem("userFirstName", data.user?.firstName || "");
    localStorage.setItem("userLastName", data.user?.lastName || "");
    setUserFirstName(data.user?.firstName || "");
    setUserLastName(data.user?.lastName || "");
    if (data.user?.id != null) {
      localStorage.setItem("userId", String(data.user.id));
      setUserId(Number(data.user.id));
    }
    setIsLoggedIn(true);
    fetchTrainings();
  };

  const loginWithCredentials = async (loginEmail, loginPassword) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok) {
        applyLoginSuccess(data);
        return true;
      }
      setIsLoggedIn(false);
      setMessage(data.message || "Prijava nije uspjela");
      return false;
    } catch (error) {
      setIsLoggedIn(false);
      const detail = error?.message ? String(error.message) : "";
      setMessage(
        detail
          ? `Greška u konekciji (${detail}). Provjeri da server radi i da VITE_API_BASE_URL u client/.env* pokazuje na pravi host:port.`
          : "Greška u konekciji"
      );
      return false;
    }
  };

  const handleLogin = async () => {
    await loginWithCredentials(email.trim(), password);
  };

  const handleRegister = async () => {
    if (!regFirstName.trim() || !regLastName.trim() || !regEmail.trim() || !regPassword) {
      setMessage("Popuni sva polja registracije");
      return;
    }
    if (regPassword.length < 6) {
      setMessage("Lozinka mora imati najmanje 6 znakova");
      return;
    }
    if (regPassword !== regPasswordConfirm) {
      setMessage("Lozinke se ne podudaraju");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: regFirstName.trim(),
          lastName: regLastName.trim(),
          email: regEmail.trim(),
          password: regPassword,
          role: regRole
        })
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Registracija nije uspjela");
        return;
      }

      setEmail(regEmail.trim());
      setPassword(regPassword);
      setAuthMode("login");
      setRegPassword("");
      setRegPasswordConfirm("");
      const ok = await loginWithCredentials(regEmail.trim(), regPassword);
      if (ok) {
        setMessage("Registracija i prijava uspješne");
      }
    } catch (error) {
      setMessage("Greška u konekciji");
    }
  };

  const fetchTrainings = async () => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const res = await fetch(`${API_BASE_URL}/api/trainings`, {
        headers
      });

      const data = await res.json();

      if (res.ok) {
        setTrainings(data.trainings);
      } else {
        setMessage(data.message || "Greška pri dohvaćanju treninga");
      }
    } catch (error) {
      setMessage("Greška u konekciji");
    }
  };

  const logout = () => {
    if (isLiveCapture) {
      stopLiveSensorCapture();
    }

    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userFirstName");
    localStorage.removeItem("userLastName");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    setTrainings([]);
    setCurrentSessionId(null);
    setLastActivity("");
    setLastSessionResult(null);
    setMySessions([]);
    setUserRole("");
    setUserEmail("");
    setUserFirstName("");
    setUserLastName("");
    setUserId(null);
    setCoachPanelTrainingId(null);
    setParticipantsByTrainingId({});
    setNewTraining({
      title: "",
      description: "",
      location: "",
      startTime: "",
      endTime: ""
    });
    setMessage("Odjavljen si");
    fetchTrainings();
  };

  const fetchMySessions = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE_URL}/api/sensors/my-sessions?limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setMySessions(data.sessions || []);
      } else {
        setMessage(data.message || "Greška pri dohvaćanju povijesti sessiona");
      }
    } catch (error) {
      setMessage("Greška u konekciji");
    }
  };

  const exportSessionsToCsv = () => {
    if (displayedSessions.length === 0) {
      setMessage("Nema sesija za izvoz");
      return;
    }

    const headers = [
      "session_id",
      "training_id",
      "training_title",
      "training_location",
      "detected_activity",
      "avg_acceleration",
      "max_acceleration",
      "started_at",
      "ended_at",
      "summary"
    ];

    const escapeCsv = (value) => {
      const stringValue = value === null || value === undefined ? "" : String(value);
      return `"${stringValue.replace(/"/g, '""')}"`;
    };

    const rows = displayedSessions.map((s) => [
      s.id,
      s.training_id,
      s.training_title,
      s.training_location,
      s.detected_activity,
      s.avg_acceleration,
      s.max_acceleration,
      s.started_at,
      s.ended_at,
      s.summary
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const datePart = new Date().toISOString().slice(0, 10);
    const link = document.createElement("a");
    link.href = url;
    link.download = `session-history-${datePart}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setMessage("CSV export uspješan");
  };

  const exportSelectedSessionToCsv = () => {
    if (!lastSessionResult?.session) {
      setMessage("Nema odabrane sesije za izvoz");
      return;
    }

    const { session, result } = lastSessionResult;
    const headers = [
      "session_id",
      "training_id",
      "user_id",
      "detected_activity",
      "avg_acceleration",
      "max_acceleration",
      "started_at",
      "ended_at",
      "summary"
    ];

    const escapeCsv = (value) => {
      const stringValue = value === null || value === undefined ? "" : String(value);
      return `"${stringValue.replace(/"/g, '""')}"`;
    };

    const row = [
      session.id,
      session.training_id,
      session.user_id,
      session.detected_activity,
      result?.avg_acceleration,
      result?.max_acceleration,
      session.started_at,
      session.ended_at,
      session.summary
    ];

    const csvContent = [headers, row].map((line) => line.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const datePart = new Date().toISOString().slice(0, 10);
    const link = document.createElement("a");
    link.href = url;
    link.download = `session-${session.id}-detail-${datePart}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setMessage("Izvoz odabrane sesije uspješan");
  };

  const fetchSessionResult = async (sessionId) => {
    const token = localStorage.getItem("token");

    if (!sessionId) {
      setMessage("Nedostaje session ID");
      return null;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/sensors/${sessionId}/result`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setLastSessionResult(data);
        return data;
      }

      setMessage(data.message || "Greška pri dohvaćanju rezultata sesije");
      return null;
    } catch (error) {
      setMessage("Greška u konekciji");
      return null;
    }
  };

  const sendSensorData = async (sensorPayload, label, silent = false, sessionIdOverride = null) => {
    const token = localStorage.getItem("token");
    const activeSessionId = sessionIdOverride ?? currentSessionId;

    if (!activeSessionId) {
      setMessage("Nema aktivne sesije");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/sensors/${activeSessionId}/data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(sensorPayload)
      });

      const data = await res.json();

      if (res.ok) {
        if (!silent) {
          setMessage(`${label} sensor data poslan`);
        }
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Greška u konekciji");
    }
  };

  const startSession = async (trainingId) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE_URL}/api/sensors/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ trainingId })
      });

      const data = await res.json();

      if (res.ok) {
        setCurrentSessionId(data.session.id);
        setMessage(`Snimanje senzorima započelo (sesija ID: ${data.session.id})`);
        return data.session.id;
      } else {
        setMessage(data.message);
        return null;
      }
    } catch (error) {
      setMessage("Greška u konekciji");
      return null;
    }
  };

  const startSensorsForTraining = async (trainingId) => {
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = await startSession(trainingId);
      if (!sessionId) {
        return;
      }
    }
    await startLiveSensorCapture(sessionId);
  };

  const stopSensorsForTraining = async () => {
    if (!currentSessionId) {
      setMessage("Nema aktivne sesije za zaustaviti.");
      return;
    }
    await finishSession();
  };

  const sendRunningData = async () => {
    await sendSensorData(
      {
        accelX: 4.0,
        accelY: 3.5,
        accelZ: 13.0,
        gyroX: 1.5,
        gyroY: 1.3,
        gyroZ: 1.4
      },
      "Running"
    );
  };

  const sendWalkingData = async () => {
    await sendSensorData(
      {
        accelX: 1.2,
        accelY: 1.0,
        accelZ: 10.2,
        gyroX: 0.3,
        gyroY: 0.2,
        gyroZ: 0.4
      },
      "Walking"
    );
  };

  const sendIdleData = async () => {
    await sendSensorData(
      {
        accelX: 0.1,
        accelY: 0.1,
        accelZ: 9.8,
        gyroX: 0.0,
        gyroY: 0.0,
        gyroZ: 0.0
      },
      "Idle"
    );
  };

  const stopLiveSensorCapture = () => {
    if (liveIntervalRef.current) {
      clearInterval(liveIntervalRef.current);
      liveIntervalRef.current = null;
    }
    window.removeEventListener("devicemotion", handleDeviceMotion);
    setIsLiveCapture(false);
  };

  const handleDeviceMotion = (event) => {
    const a = event.accelerationIncludingGravity;
    const r = event.rotationRate;

    liveSensorRef.current = {
      accelX: a?.x ?? 0,
      accelY: a?.y ?? 0,
      accelZ: a?.z ?? 9.8,
      gyroX: r?.alpha ?? 0,
      gyroY: r?.beta ?? 0,
      gyroZ: r?.gamma ?? 0
    };
  };

  const startLiveSensorCapture = async (sessionIdOverride = null) => {
    const activeSessionId = sessionIdOverride ?? currentSessionId;

    if (!activeSessionId) {
      setMessage("Prvo pokreni sesiju pa zatim uključi pracenje uzivo");
      return;
    }

    if (isLiveCapture) {
      setMessage("Pracenje senzora uzivo je vec aktivno");
      return;
    }

    if (typeof window === "undefined" || typeof window.DeviceMotionEvent === "undefined") {
      setMessage("DeviceMotion nije podržan na ovom uređaju/browseru");
      return;
    }

    try {
      // iOS Safari requires explicit permission call.
      if (
        typeof window.DeviceMotionEvent.requestPermission === "function"
      ) {
        const permission = await window.DeviceMotionEvent.requestPermission();
        if (permission !== "granted") {
          setMessage("Dozvola za senzore nije odobrena");
          return;
        }
      }

      setLiveSampleCount(0);
      window.addEventListener("devicemotion", handleDeviceMotion);
      liveIntervalRef.current = setInterval(async () => {
        await sendSensorData(liveSensorRef.current, "Live", true, activeSessionId);
        setLiveSampleCount((prev) => prev + 1);
      }, 300);
      setIsLiveCapture(true);
      setMessage("Pracenje senzora uzivo pokrenuto");
    } catch (error) {
      setMessage("Greška pri pokretanju live senzora");
    }
  };

  const finishSession = async () => {
    const token = localStorage.getItem("token");

    if (!currentSessionId) {
      setMessage("Nema aktivne sesije");
      return;
    }

    const sessionId = currentSessionId;

    try {
      if (isLiveCapture) {
        stopLiveSensorCapture();
      }

      const res = await fetch(`${API_BASE_URL}/api/sensors/${sessionId}/finish`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`Sesija zavrsena: ${getActivityLabel(data.activity)}`);
        setLastActivity(data.activity);
        await fetchSessionResult(sessionId);
        await fetchMySessions();
        setCurrentSessionId(null);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Greška u konekciji");
    }
  };

  useEffect(() => {
    return () => {
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current);
      }
      window.removeEventListener("devicemotion", handleDeviceMotion);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const registerForTraining = async (trainingId) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE_URL}/api/trainings/${trainingId}/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Uspješno si prijavljen na trening");
        fetchTrainings();
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Greška u konekciji");
    }
  };

  const unregisterFromTraining = async (trainingId) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE_URL}/api/trainings/${trainingId}/register`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Uspješno si odjavljen s treninga");
        fetchTrainings();
      } else {
        setMessage(data.message || "Greška pri odjavi s treninga");
      }
    } catch (error) {
      setMessage("Greška u konekciji");
    }
  };

  const fetchTrainingParticipants = async (trainingId) => {
    const token = localStorage.getItem("token");
    const idNum = Number(trainingId);
    setParticipantsLoadingId(idNum);

    try {
      const res = await fetch(`${API_BASE_URL}/api/trainings/${idNum}/participants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        setParticipantsByTrainingId((prev) => ({
          ...prev,
          [idNum]: data.participants || []
        }));
      } else {
        setMessage(data.message || "Greška pri dohvaćanju sudionika");
      }
    } catch (error) {
      setMessage("Greška u konekciji");
    } finally {
      setParticipantsLoadingId(null);
    }
  };

  const toggleCoachParticipantsPanel = (trainingId) => {
    const idNum = Number(trainingId);
    if (coachPanelTrainingId === idNum) {
      setCoachPanelTrainingId(null);
      return;
    }
    setCoachPanelTrainingId(idNum);
    fetchTrainingParticipants(idNum);
  };

  const createTraining = async () => {
    if (!newTraining.title.trim() || !newTraining.location.trim() || !newTraining.startTime || !newTraining.endTime) {
      setMessage("Popuni naslov, lokaciju, početak i kraj treninga.");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE_URL}/api/trainings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: newTraining.title.trim(),
          description: newTraining.description.trim() || "",
          location: newTraining.location.trim(),
          startTime: new Date(newTraining.startTime).toISOString(),
          endTime: new Date(newTraining.endTime).toISOString()
        })
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("Trening je kreiran.");
        setNewTraining({
          title: "",
          description: "",
          location: "",
          startTime: "",
          endTime: ""
        });
        fetchTrainings();
      } else {
        setMessage(data.message || "Neuspjelo kreiranje treninga");
      }
    } catch (error) {
      setMessage("Greška u konekciji");
    }
  };

  const updateParticipationStatus = async (participationId, status, trainingId) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE_URL}/api/trainings/participations/${participationId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("Status sudjelovanja ažuriran.");
        fetchTrainingParticipants(trainingId);
      } else {
        setMessage(data.message || "Greška pri ažuriranju statusa");
      }
    } catch (error) {
      setMessage("Greška u konekciji");
    }
  };

  return (
    <div style={{ ...styles.page, padding: isMobile ? "12px" : "24px", border: isMobile ? "4px solid #22c55e" : styles.page.border }}>
      <div style={{ ...styles.container, gap: isMobile ? "12px" : "20px" }}>
        <div style={{ ...styles.topBar, padding: isMobile ? "14px" : "22px 24px", borderRadius: isMobile ? "14px" : "22px", marginBottom: isMobile ? "12px" : "24px" }}>
          <div style={styles.brandBlock}>
            <span style={styles.overline}>Platforma Za Pracenje Treninga</span>
            <h1 style={{ ...styles.title, fontSize: isMobile ? "24px" : "34px" }}>
              {isLoggedIn ? userDisplayName : "Dobrodošao"}
            </h1>
            <p style={{ ...styles.subtitle, fontSize: isMobile ? "13px" : "15px" }}>
              {isLoggedIn
                ? "Pregled treninga, sudjelovanja i senzora na jednom mjestu."
                : "Prijavi se za pregled treninga i upravljanje aktivnostima."}
            </p>
          </div>

          {isLoggedIn && (
            <div style={{ ...styles.topActions, width: isMobile ? "100%" : "auto" }}>
              <div style={styles.userChip}>
                {!avatarLoadFailed ? (
                  <img
                    src={avatarUrl}
                    alt={userDisplayName}
                    style={styles.userAvatar}
                    onError={() => setAvatarLoadFailed(true)}
                  />
                ) : (
                  <span style={styles.userAvatar}>{userInitials}</span>
                )}
                <div>
                  <div style={styles.userChipName}>{userDisplayName}</div>
                  <div style={styles.userChipRole}>{normalizedRole || "Korisnik"}</div>
                </div>
              </div>
              <button
                style={getButtonStyle(false, "secondary")}
                onClick={fetchTrainings}
              >
                Osvježi treninge
              </button>
              <button style={getButtonStyle(false, "danger")} onClick={logout}>
                Odjava
              </button>
            </div>
          )}
        </div>
        {isLoggedIn && (
        <div
          style={{
            ...styles.statsGrid,
            gridTemplateColumns: isMobile
              ? "1fr"
              : isTablet
                ? "repeat(2, minmax(0, 1fr))"
                : styles.statsGrid.gridTemplateColumns
          }}
        >
          <div style={{ ...styles.statCard, padding: isMobile ? "14px" : "18px 20px", borderRadius: isMobile ? "14px" : "18px" }}>
            <div style={styles.statLabel}>Status korisnika</div>
            <div style={{ ...styles.statValue, fontSize: isMobile ? "22px" : "28px" }}>{isLoggedIn ? "Prijavljen" : "Odjavljen"}</div>
            <div style={styles.statNote}>
              {isLoggedIn ? "Korisnik je uspješno prijavljen." : "Potrebna je prijava za rad."}
            </div>
            <div style={{ ...styles.statNote, marginTop: "6px" }}>
              Email: {userEmail || "N/A"}
            </div>
            <div style={{ ...styles.statNote, marginTop: "4px" }}>
              Uloga: {userRole || "N/A"}
            </div>
          </div>

          {!isCoach && (
          <div style={{ ...styles.statCard, padding: isMobile ? "14px" : "18px 20px", borderRadius: isMobile ? "14px" : "18px" }}>
            <div style={styles.statLabel}>Aktivna sesija</div>
            <div style={{ ...styles.statValue, fontSize: isMobile ? "22px" : "28px" }}>{currentSessionId || "Nema"}</div>
            <div style={styles.statNote}>ID sesije za trenutno praćenje aktivnosti.</div>
          </div>
          )}

          <div style={{ ...styles.statCard, padding: isMobile ? "14px" : "18px 20px", borderRadius: isMobile ? "14px" : "18px" }}>
            <div style={styles.statLabel}>Dostupni treninzi</div>
            <div style={{ ...styles.statValue, fontSize: isMobile ? "22px" : "28px" }}>{trainings.length}</div>
            <div style={styles.statNote}>Ukupan broj treninga dohvaćenih iz backend-a.</div>
          </div>

          {!isCoach && (
          <div style={{ ...styles.statCard, padding: isMobile ? "14px" : "18px 20px", borderRadius: isMobile ? "14px" : "18px" }}>
            <div style={styles.statLabel}>Zadnja aktivnost</div>
            <div style={styles.row}>
              <span style={{ ...styles.badge, ...statusBadgeStyle }}>
                {lastActivity || "NEMA PODATAKA"}
              </span>
            </div>
            <div style={{ ...styles.statNote, marginTop: "8px" }}>
              Rezultat zadnje završene klasifikacije aktivnosti.
            </div>
          </div>
          )}
        </div>
        )}

        <div
          style={{
            ...styles.mainGrid,
            gridTemplateColumns: isLoggedIn
              ? (isMobile || isTablet ? "1fr" : "1.6fr 1fr")
              : "1fr",
            gap: isMobile ? "12px" : "20px"
          }}
        >
          {isLoggedIn && (
          <div style={styles.leftColumn}>
            {isLoggedIn && isCoach && (
              <div style={{ ...styles.card, padding: isMobile ? "14px" : "20px", borderRadius: isMobile ? "14px" : "18px", border: "2px solid #22c55e" }}>
                <div style={styles.cardHeader}>
                  <div>
                    <h2 style={styles.cardTitle}>Trener: novi trening</h2>
                    <p style={styles.cardText}>Kreiranje treninga vidljivo svim prijavljenim korisnicima.</p>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Naslov</label>
                  <input
                    style={{ ...styles.input, minHeight: isMobile ? "44px" : styles.input.minHeight }}
                    placeholder="Npr. intervali na stadionu"
                    value={newTraining.title}
                    onChange={(e) => setNewTraining((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Opis (opcionalno)</label>
                  <input
                    style={{ ...styles.input, minHeight: isMobile ? "44px" : styles.input.minHeight }}
                    placeholder="Kratki opis"
                    value={newTraining.description}
                    onChange={(e) => setNewTraining((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Lokacija</label>
                  <input
                    style={{ ...styles.input, minHeight: isMobile ? "44px" : styles.input.minHeight }}
                    placeholder="Npr. Zagreb"
                    value={newTraining.location}
                    onChange={(e) => setNewTraining((prev) => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div style={{ ...styles.row, flexDirection: isMobile ? "column" : "row" }}>
                  <div style={{ ...styles.inputGroup, flex: 1, marginBottom: 0, width: isMobile ? "100%" : "auto" }}>
                    <label style={styles.label}>Početak</label>
                    <input
                      type="datetime-local"
                      style={{ ...styles.input, minHeight: isMobile ? "44px" : styles.input.minHeight }}
                      value={newTraining.startTime}
                      onChange={(e) => setNewTraining((prev) => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                  <div style={{ ...styles.inputGroup, flex: 1, marginBottom: 0, width: isMobile ? "100%" : "auto" }}>
                    <label style={styles.label}>Kraj</label>
                    <input
                      type="datetime-local"
                      style={{ ...styles.input, minHeight: isMobile ? "44px" : styles.input.minHeight }}
                      value={newTraining.endTime}
                      onChange={(e) => setNewTraining((prev) => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>

                <button type="button" style={getButtonStyle(false, "primary")} onClick={createTraining}>
                  Spremi trening
                </button>
              </div>
            )}

            <div style={{ ...styles.card, padding: isMobile ? "14px" : "20px", borderRadius: isMobile ? "14px" : "18px" }}>
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.cardTitle}>Aktivni treninzi</h2>
                </div>
              </div>

              {trainings.length === 0 ? (
                <p style={styles.emptyText}>
                  {isLoggedIn
                    ? "Trenutno nema treninga u bazi. Trener može dodati novi gore."
                    : "Trenutno nema treninga u bazi. Prijavi se za prijavu na trening i osobni status."}
                </p>
              ) : (
                <ul style={styles.trainingList}>
                  {trainings.map((t) => (
                    <li key={t.id} style={{ ...styles.trainingItem, padding: isMobile ? "14px" : "18px", borderRadius: isMobile ? "12px" : "16px" }}>
                      <div style={styles.trainingTop}>
                        <div>
                          <h3 style={styles.trainingTitle}>{t.title}</h3>
                          <p style={styles.trainingMeta}>{t.location}</p>
                          <p style={{ ...styles.trainingMeta, marginTop: "6px", color: "#334155", fontWeight: "600" }}>
                            Trener:{" "}
                            {t.coach_first_name || t.coach_last_name
                              ? `${t.coach_first_name || ""} ${t.coach_last_name || ""}`.trim()
                              : t.coach_id != null
                                ? `ID ${t.coach_id}`
                                : "Nije upisan"}
                          </p>
                          <p style={{ ...styles.trainingMeta, marginTop: "8px", color: "#1e3a5f", fontWeight: "600", lineHeight: 1.5 }}>
                            Termin: {formatHrDateTime(t.start_time)} → {formatHrDateTime(t.end_time)}
                          </p>
                        </div>
                        <span style={{ ...styles.badge, backgroundColor: "#dbeafe", color: "#1d4ed8" }}>
                          ID {t.id}
                        </span>
                      </div>

                      <div style={{ ...styles.row, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center" }}>
                        {!isCoach && (
                          t.my_participation_id != null && t.my_participation_id !== "" ? (
                        <button
                          type="button"
                          style={getButtonStyle(!isLoggedIn, "danger")}
                          onClick={() => unregisterFromTraining(t.id)}
                          disabled={!isLoggedIn}
                        >
                          Odjavi se
                        </button>
                          ) : (
                        <button
                          type="button"
                          style={getButtonStyle(!isLoggedIn, "primary")}
                          onClick={() => registerForTraining(t.id)}
                          disabled={!isLoggedIn}
                        >
                          Prijavi se
                        </button>
                          )
                        )}
                        {!isCoach &&
                          t.my_participation_id != null &&
                          t.my_participation_id !== "" && (
                          <span
                            style={{
                              ...styles.badge,
                              backgroundColor: "#e0e7ff",
                              color: "#3730a3",
                              alignSelf: isMobile ? "flex-start" : "center"
                            }}
                          >
                            Tvoj status:{" "}
                            {PARTICIPATION_STATUS_LABELS[t.my_participation_status] ||
                              PARTICIPATION_STATUS_LABELS.REGISTERED}
                          </span>
                        )}
                        {!isCoach &&
                          t.my_participation_id != null &&
                          t.my_participation_id !== "" && (
                          <button
                            type="button"
                            style={getButtonStyle(!isLoggedIn || isLiveCapture, "soft")}
                            onClick={() => startSensorsForTraining(t.id)}
                            disabled={!isLoggedIn || isLiveCapture}
                          >
                            Pokreni senzore
                          </button>
                        )}
                        {!isCoach && (
                          <button
                            type="button"
                            style={getButtonStyle(!currentSessionId, "danger")}
                            onClick={stopSensorsForTraining}
                            disabled={!currentSessionId}
                          >
                            Zaustavi senzore
                          </button>
                        )}
                        <a
                          href={buildGoogleCalendarUrl(t)}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            ...getButtonStyle(false, "secondary"),
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          Dodaj u Google Kalendar
                        </a>
                      </div>

                      {isCoach && (
                        <div style={{ marginTop: "12px" }}>
                          <button
                            type="button"
                            style={getButtonStyle(false, "secondary")}
                            onClick={() => toggleCoachParticipantsPanel(t.id)}
                          >
                            {coachPanelTrainingId === Number(t.id) ? "Sakrij sudionike" : "Sudionici"}
                          </button>
                          {coachPanelTrainingId === Number(t.id) && (
                            <div style={styles.participantBox}>
                              <p style={{ ...styles.cardText, marginBottom: "10px", fontSize: "13px" }}>
                                &quot;Prijavljen&quot; = prijavio se u aplikaciji. Nakon treninga označi samo{" "}
                                <strong>Prisutan</strong> ili <strong>Odsutan</strong>.
                              </p>
                              {participantsLoadingId === Number(t.id) ? (
                                <p style={styles.emptyText}>Učitavanje…</p>
                              ) : (participantsByTrainingId[Number(t.id)] || []).length === 0 ? (
                                <p style={styles.emptyText}>Još nema prijava na ovaj trening.</p>
                              ) : (
                                (participantsByTrainingId[Number(t.id)] || []).map((p, idx, arr) => {
                                  const currentStatus = p.status || "REGISTERED";
                                  const isLast = idx === arr.length - 1;

                                  return (
                                    <div
                                      key={p.id}
                                      style={{
                                        ...styles.participantRow,
                                        borderBottom: isLast ? "none" : styles.participantRow.borderBottom
                                      }}
                                    >
                                      <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                                        <div style={{ fontWeight: "700", color: "#111827" }}>
                                          {p.first_name} {p.last_name}
                                        </div>
                                        <div style={{ fontSize: "13px", color: "#64748b" }}>{p.email}</div>
                                        <span
                                          style={{
                                            ...styles.badge,
                                            backgroundColor: "#e0e7ff",
                                            color: "#3730a3",
                                            marginTop: "6px"
                                          }}
                                        >
                                          {PARTICIPATION_STATUS_LABELS[currentStatus] || currentStatus}
                                        </span>
                                      </div>
                                      <div
                                        style={{
                                          ...styles.row,
                                          flexDirection: isMobile ? "column" : "row",
                                          flex: "1 1 220px"
                                        }}
                                      >
                                        {COACH_ATTENDANCE_STATUSES.map((st) => (
                                          <button
                                            key={st}
                                            type="button"
                                            style={getButtonStyle(false, currentStatus === st ? "primary" : "secondary")}
                                            onClick={() => updateParticipationStatus(p.id, st, t.id)}
                                          >
                                            {PARTICIPATION_STATUS_LABELS[st]}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
          )}

          <div style={styles.rightColumn}>
            <div style={{ ...styles.card, padding: isMobile ? "14px" : "20px", borderRadius: isMobile ? "14px" : "18px" }}>
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.cardTitle}>
                    {isLoggedIn ? "Račun" : authMode === "login" ? "Prijava" : "Registracija"}
                  </h2>
                  {!isLoggedIn && (
                    <p style={styles.cardText}>
                      {authMode === "login"
                        ? "Unesi email i lozinku za pristup."
                        : "Ispuni podatke i odaberi ulogu (sportaš ili trener)."}
                    </p>
                  )}
                  {isLoggedIn && (
                    <p style={styles.cardText}>Prijavljen si u aplikaciju.</p>
                  )}
                </div>
              </div>

              {isLoggedIn ? (
                <div style={styles.cardText}>
                  <strong>{userEmail || "N/A"}</strong>
                  <br />
                  Uloga: {userRole || "N/A"}
                </div>
              ) : (
                <>
                  {authMode === "login" ? (
                    <>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                          style={{ ...styles.input, minHeight: isMobile ? "44px" : styles.input.minHeight }}
                          placeholder="npr. ime@gmail.com"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Lozinka</label>
                        <input
                          style={{ ...styles.input, minHeight: isMobile ? "44px" : styles.input.minHeight }}
                          placeholder="Lozinka"
                          type="password"
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <button type="button" style={getButtonStyle(false, "primary")} onClick={handleLogin}>
                        Prijavi se
                      </button>
                      <div style={styles.authFooter}>
                        Nemaš račun?{" "}
                        <button
                          type="button"
                          style={styles.authLink}
                          onClick={() => {
                            setAuthMode("register");
                            setMessage("");
                          }}
                        >
                          Registriraj se
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ ...styles.row, flexDirection: isMobile ? "column" : "row", gap: "10px" }}>
                        <div style={{ ...styles.inputGroup, flex: 1, marginBottom: isMobile ? "14px" : 0 }}>
                          <label style={styles.label}>Ime</label>
                          <input
                            style={{ ...styles.input, minHeight: isMobile ? "44px" : styles.input.minHeight }}
                            placeholder="Ime"
                            value={regFirstName}
                            onChange={(e) => setRegFirstName(e.target.value)}
                          />
                        </div>
                        <div style={{ ...styles.inputGroup, flex: 1, marginBottom: 0 }}>
                          <label style={styles.label}>Prezime</label>
                          <input
                            style={{ ...styles.input, minHeight: isMobile ? "44px" : styles.input.minHeight }}
                            placeholder="Prezime"
                            value={regLastName}
                            onChange={(e) => setRegLastName(e.target.value)}
                          />
                        </div>
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                          style={{ ...styles.input, minHeight: isMobile ? "44px" : styles.input.minHeight }}
                          placeholder="npr. ime@gmail.com"
                          autoComplete="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                        />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Uloga</label>
                        <select
                          style={{ ...styles.input, minHeight: isMobile ? "44px" : styles.input.minHeight }}
                          value={regRole}
                          onChange={(e) => setRegRole(e.target.value)}
                        >
                          <option value="ATHLETE">Sportaš</option>
                          <option value="COACH">Trener</option>
                        </select>
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Lozinka</label>
                        <input
                          style={{ ...styles.input, minHeight: isMobile ? "44px" : styles.input.minHeight }}
                          placeholder="Min. 6 znakova"
                          type="password"
                          autoComplete="new-password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                        />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Ponovi lozinku</label>
                        <input
                          style={{ ...styles.input, minHeight: isMobile ? "44px" : styles.input.minHeight }}
                          placeholder="Ista lozinka"
                          type="password"
                          autoComplete="new-password"
                          value={regPasswordConfirm}
                          onChange={(e) => setRegPasswordConfirm(e.target.value)}
                        />
                      </div>
                      <button type="button" style={getButtonStyle(false, "primary")} onClick={handleRegister}>
                        Registriraj se
                      </button>
                      <div style={styles.authFooter}>
                        Već imaš račun?{" "}
                        <button
                          type="button"
                          style={styles.authLink}
                          onClick={() => {
                            setAuthMode("login");
                            setMessage("");
                          }}
                        >
                          Prijavi se
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}

              {message && <div style={messageStyle}>{message}</div>}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;