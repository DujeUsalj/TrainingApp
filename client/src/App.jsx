import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5001";

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#020617",
    backgroundImage: "linear-gradient(135deg, #020617 0%, #0f172a 45%, #1d4ed8 100%)",
    padding: "24px",
    boxSizing: "border-box",
    border: "8px solid #22c55e"
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
    background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.18)"
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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px"
  },
  statCard: {
    backgroundColor: "#eff6ff",
    borderRadius: "18px",
    padding: "18px 20px",
    border: "2px solid #93c5fd",
    boxShadow: "0 18px 38px rgba(2, 6, 23, 0.28)"
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
    backgroundColor: "#f8fbff",
    borderRadius: "18px",
    padding: "20px",
    border: "2px solid #93c5fd",
    boxShadow: "0 18px 38px rgba(2, 6, 23, 0.28)"
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
  sensorGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px"
  },
  emptyText: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px"
  }
};

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [trainings, setTrainings] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [lastActivity, setLastActivity] = useState("");
  const [lastSessionResult, setLastSessionResult] = useState(null);
  const [mySessions, setMySessions] = useState([]);
  const [showFinishedOnly, setShowFinishedOnly] = useState(true);
  const [historySort, setHistorySort] = useState("desc");
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "");
  const [isLiveCapture, setIsLiveCapture] = useState(false);
  const [liveSampleCount, setLiveSampleCount] = useState(0);
  const [weatherByTrainingId, setWeatherByTrainingId] = useState({});
  const [weatherLoadingId, setWeatherLoadingId] = useState(null);
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

  useEffect(() => {
    if (isLoggedIn) {
      fetchTrainings();
      fetchMySessions();
    }
  }, [isLoggedIn]);

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

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Login uspješan");
        localStorage.setItem("token", data.token);
        if (data.user?.role) {
          localStorage.setItem("userRole", data.user.role);
          setUserRole(data.user.role);
        }
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setMessage(data.message);
      }
    } catch (error) {
      setIsLoggedIn(false);
      setMessage("Greška u konekciji");
    }
  };

  const fetchTrainings = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE_URL}/api/trainings`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
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
    setIsLoggedIn(false);
    setTrainings([]);
    setCurrentSessionId(null);
    setLastActivity("");
    setLastSessionResult(null);
    setMySessions([]);
    setUserRole("");
    setWeatherByTrainingId({});
    setWeatherLoadingId(null);
    setMessage("Odjavljen si");
  };

  const fetchTrainingWeather = async (trainingId) => {
    const token = localStorage.getItem("token");
    setWeatherLoadingId(trainingId);

    try {
      const res = await fetch(`${API_BASE_URL}/api/trainings/${trainingId}/weather`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (res.ok) {
        setWeatherByTrainingId((prev) => ({
          ...prev,
          [trainingId]: data.weather
        }));
      } else {
        setMessage(data.message || "Greška pri dohvaćanju vremena");
      }
    } catch (error) {
      setMessage("Greška u konekciji");
    } finally {
      setWeatherLoadingId(null);
    }
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
      setMessage("Nema sessiona za export");
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
      setMessage("Nema odabranog sessiona za export");
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
    setMessage("Export odabranog sessiona uspješan");
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

      setMessage(data.message || "Greška pri dohvaćanju rezultata sessiona");
      return null;
    } catch (error) {
      setMessage("Greška u konekciji");
      return null;
    }
  };

  const sendSensorData = async (sensorPayload, label, silent = false) => {
    const token = localStorage.getItem("token");

    if (!currentSessionId) {
      setMessage("Nema aktivne session");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/sensors/${currentSessionId}/data`, {
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
        setMessage(`Session started (ID: ${data.session.id})`);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Greška u konekciji");
    }
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

  const startLiveSensorCapture = async () => {
    if (!currentSessionId) {
      setMessage("Prvo pokreni session pa onda live capture");
      return;
    }

    if (isLiveCapture) {
      setMessage("Live sensor capture je već aktivan");
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
        await sendSensorData(liveSensorRef.current, "Live", true);
        setLiveSampleCount((prev) => prev + 1);
      }, 300);
      setIsLiveCapture(true);
      setMessage("Live sensor capture pokrenut");
    } catch (error) {
      setMessage("Greška pri pokretanju live senzora");
    }
  };

  const finishSession = async () => {
    const token = localStorage.getItem("token");

    if (!currentSessionId) {
      setMessage("Nema aktivne session");
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
        setMessage(`Session finished: ${data.activity}`);
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
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Greška u konekciji");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <div style={styles.brandBlock}>
            <span style={styles.overline}>Training Monitor Platform</span>
            <h1 style={styles.title}>Dashboard</h1>
            <p style={styles.subtitle}>
              Pregled korisnika, treninga i session kontrole na jednom mjestu.
            </p>
          </div>

          <div style={styles.topActions}>
            <button
              style={getButtonStyle(!isLoggedIn, "secondary")}
              onClick={fetchTrainings}
              disabled={!isLoggedIn}
            >
              Osvježi treninge
            </button>
            {isLoggedIn && (
              <button style={getButtonStyle(false, "danger")} onClick={logout}>
                Logout
              </button>
            )}
          </div>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Status korisnika</div>
            <div style={styles.statValue}>{isLoggedIn ? "Online" : "Offline"}</div>
            <div style={styles.statNote}>
              {isLoggedIn ? "Korisnik je uspješno prijavljen." : "Potrebna je prijava za rad."}
            </div>
            <div style={{ ...styles.statNote, marginTop: "6px" }}>
              Uloga: {userRole || "N/A"}
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>Aktivna session</div>
            <div style={styles.statValue}>{currentSessionId || "Nema"}</div>
            <div style={styles.statNote}>Session ID za trenutno praćenje aktivnosti.</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>Dostupni treninzi</div>
            <div style={styles.statValue}>{trainings.length}</div>
            <div style={styles.statNote}>Ukupan broj treninga dohvaćenih iz backend-a.</div>
          </div>

          <div style={styles.statCard}>
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
        </div>

        <div
          style={{
            ...styles.mainGrid,
            gridTemplateColumns: window.innerWidth < 1100 ? "1fr" : "1.6fr 1fr"
          }}
        >
          <div style={styles.leftColumn}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.cardTitle}>Aktivni treninzi</h2>
                  <p style={styles.cardText}>Pregled treninga i akcije za registraciju i pokretanje sessiona.</p>
                </div>
              </div>

              {trainings.length === 0 ? (
                <p style={styles.emptyText}>Treninzi još nisu učitani.</p>
              ) : (
                <ul style={styles.trainingList}>
                  {trainings.map((t) => (
                    <li key={t.id} style={styles.trainingItem}>
                      <div style={styles.trainingTop}>
                        <div>
                          <h3 style={styles.trainingTitle}>{t.title}</h3>
                          <p style={styles.trainingMeta}>{t.location}</p>
                        </div>
                        <span style={{ ...styles.badge, backgroundColor: "#dbeafe", color: "#1d4ed8" }}>
                          ID {t.id}
                        </span>
                      </div>

                      <div style={styles.row}>
                        <button
                          style={getButtonStyle(!isLoggedIn, "primary")}
                          onClick={() => registerForTraining(t.id)}
                          disabled={!isLoggedIn}
                        >
                          Prijavi korisnika
                        </button>
                        <button
                          style={getButtonStyle(!isLoggedIn || !!currentSessionId, "soft")}
                          onClick={() => startSession(t.id)}
                          disabled={!isLoggedIn || !!currentSessionId}
                        >
                          Pokreni session
                        </button>
                        <button
                          style={getButtonStyle(!isLoggedIn || weatherLoadingId === t.id, "secondary")}
                          onClick={() => fetchTrainingWeather(t.id)}
                          disabled={!isLoggedIn || weatherLoadingId === t.id}
                        >
                          {weatherLoadingId === t.id ? "Dohvaćam..." : "Vrijeme"}
                        </button>
                      </div>

                      {weatherByTrainingId[t.id] && (
                        <div style={{ ...styles.cardText, marginTop: "10px" }}>
                          {`Prognoza (${weatherByTrainingId[t.id].forecastTime ? new Date(weatherByTrainingId[t.id].forecastTime).toLocaleString() : "N/A"}): `}
                          {`${weatherByTrainingId[t.id].temperatureC !== null && weatherByTrainingId[t.id].temperatureC !== undefined
                            ? Number(weatherByTrainingId[t.id].temperatureC).toFixed(1)
                            : "N/A"} C, `}
                          {`oborine ${weatherByTrainingId[t.id].precipitationProbability ?? "N/A"}%, `}
                          {`vjetar ${weatherByTrainingId[t.id].windSpeedKmh ?? "N/A"} km/h`}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.cardTitle}>Povijest sessiona</h2>
                  <p style={styles.cardText}>Zadnjih 10 sessiona prijavljenog korisnika.</p>
                </div>
                <div style={styles.row}>
                  <button
                    style={getButtonStyle(!isLoggedIn, "secondary")}
                    onClick={() => setShowFinishedOnly((prev) => !prev)}
                    disabled={!isLoggedIn}
                  >
                    {showFinishedOnly ? "Prikaži sve" : "Samo završene"}
                  </button>
                  <button
                    style={getButtonStyle(!isLoggedIn, "secondary")}
                    onClick={() => setHistorySort((prev) => (prev === "desc" ? "asc" : "desc"))}
                    disabled={!isLoggedIn}
                  >
                    {historySort === "desc" ? "Najnovije" : "Najstarije"}
                  </button>
                  <button
                    style={getButtonStyle(!isLoggedIn, "secondary")}
                    onClick={fetchMySessions}
                    disabled={!isLoggedIn}
                  >
                    Osvježi
                  </button>
                  <button
                    style={getButtonStyle(!isLoggedIn || displayedSessions.length === 0, "secondary")}
                    onClick={exportSessionsToCsv}
                    disabled={!isLoggedIn || displayedSessions.length === 0}
                  >
                    Export CSV
                  </button>
                </div>
              </div>

              {displayedSessions.length === 0 ? (
                <p style={styles.emptyText}>
                  {showFinishedOnly
                    ? "Nema završenih sessiona za prikaz."
                    : "Nema sessiona za prikaz."}
                </p>
              ) : (
                <ul style={styles.historyList}>
                  {displayedSessions.map((s) => (
                    <li
                      key={s.id}
                      style={{
                        ...styles.historyItem,
                        ...(lastSessionResult?.session?.id === s.id
                          ? { border: "2px solid #2563eb", boxShadow: "0 0 0 2px rgba(37, 99, 235, 0.2)" }
                          : {})
                      }}
                      onClick={() => fetchSessionResult(s.id)}
                      title={`Učitaj detalje sessiona #${s.id}`}
                    >
                      <div style={styles.historyTop}>
                        <p style={styles.historyTitle}>{s.training_title || `Training #${s.training_id}`}</p>
                        <span style={{ ...styles.badge, ...getActivityBadgeStyle(s.detected_activity) }}>
                          {s.detected_activity || "IN_PROGRESS"}
                        </span>
                      </div>
                      <p style={styles.historyMeta}>
                        Session #{s.id} • Avg: {s.avg_acceleration ? Number(s.avg_acceleration).toFixed(2) : "N/A"} • Max:{" "}
                        {s.max_acceleration ? Number(s.max_acceleration).toFixed(2) : "N/A"}
                      </p>
                      <p style={{ ...styles.historyMeta, marginTop: "4px" }}>
                        Start: {s.started_at ? new Date(s.started_at).toLocaleString() : "N/A"} • End:{" "}
                        {s.ended_at ? new Date(s.ended_at).toLocaleString() : "N/A"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div style={styles.rightColumn}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.cardTitle}>Prijava korisnika</h2>
                  <p style={styles.cardText}>Autentifikacija za pristup treninzima i senzorskim funkcijama.</p>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <input
                  style={styles.input}
                  placeholder="Unesi email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <input
                  style={styles.input}
                  placeholder="Unesi password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div style={styles.row}>
                <button style={getButtonStyle(false, "primary")} onClick={handleLogin}>
                  Login
                </button>
              </div>

              {message && <div style={messageStyle}>{message}</div>}
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.cardTitle}>Metodologija testa</h2>
                  <p style={styles.cardText}>Sažetak načina prikupljanja i klasifikacije aktivnosti.</p>
                </div>
              </div>

              <div style={styles.panelList}>
                <div style={styles.panelItem}>
                  <div style={styles.panelItemLabel}>Ulazni podaci</div>
                  <div style={styles.panelItemValue}>Akcelerometar (X, Y, Z) i žiroskop (X, Y, Z)</div>
                </div>
                <div style={styles.panelItem}>
                  <div style={styles.panelItemLabel}>Trenutni testni uzorci</div>
                  <div style={styles.panelItemValue}>Manualno slanje RUNNING / WALKING / IDLE payloada</div>
                </div>
                <div style={styles.panelItem}>
                  <div style={styles.panelItemLabel}>Klasifikacija aktivnosti</div>
                  <div style={styles.panelItemValue}>Ako je prosječna magnituda akceleracije &gt; 11 → RUNNING, inače WALKING</div>
                </div>
                <div style={styles.panelItem}>
                  <div style={styles.panelItemLabel}>Rezultati analize</div>
                  <div style={styles.panelItemValue}>Po sessionu se spremaju avg/max akceleracija i detektirana aktivnost</div>
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.cardTitle}>Praćenje aktivnosti</h2>
                  <p style={styles.cardText}>Slanje testnih podataka i završetak sessiona za klasifikaciju.</p>
                </div>
              </div>

              <div style={styles.panelList}>
                <div style={styles.panelItem}>
                  <div style={styles.panelItemLabel}>Aktivna session</div>
                  <div style={styles.panelItemValue}>{currentSessionId || "Nema aktivne session"}</div>
                </div>
                <div style={styles.panelItem}>
                  <div style={styles.panelItemLabel}>Zadnja prepoznata aktivnost</div>
                  <div style={styles.panelItemValue}>{lastActivity || "Nema rezultata"}</div>
                </div>
                <div style={styles.panelItem}>
                  <div style={styles.panelItemLabel}>Zadnji rezultat sessiona</div>
                  <div style={styles.panelItemValue}>
                    {lastSessionResult?.session?.id
                      ? `Session #${lastSessionResult.session.id} • ${lastSessionResult.session.detected_activity || "N/A"}`
                      : "Nema dohvaćenog rezultata"}
                  </div>
                  {lastSessionResult?.result && (
                    <div style={{ ...styles.cardText, marginTop: "8px" }}>
                      Avg: {Number(lastSessionResult.result.avg_acceleration).toFixed(2)} • Max:{" "}
                      {Number(lastSessionResult.result.max_acceleration).toFixed(2)}
                    </div>
                  )}
                  {(lastSessionResult?.session?.started_at || lastSessionResult?.session?.ended_at) && (
                    <div style={{ ...styles.cardText, marginTop: "6px" }}>
                      Start: {lastSessionResult.session.started_at ? new Date(lastSessionResult.session.started_at).toLocaleString() : "N/A"}
                      {" • "}
                      End: {lastSessionResult.session.ended_at ? new Date(lastSessionResult.session.ended_at).toLocaleString() : "N/A"}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ height: "14px" }} />

              <div style={styles.sensorGrid}>
                <button
                  style={getButtonStyle(!currentSessionId, "soft")}
                  onClick={sendRunningData}
                  disabled={!currentSessionId}
                >
                  Running data
                </button>
                <button
                  style={getButtonStyle(!currentSessionId, "soft")}
                  onClick={sendWalkingData}
                  disabled={!currentSessionId}
                >
                  Walking data
                </button>
                <button
                  style={getButtonStyle(!currentSessionId, "soft")}
                  onClick={sendIdleData}
                  disabled={!currentSessionId}
                >
                  Idle data
                </button>
                <button
                  style={getButtonStyle(!currentSessionId || isLiveCapture, "soft")}
                  onClick={startLiveSensorCapture}
                  disabled={!currentSessionId || isLiveCapture}
                >
                  Start live sensor
                </button>
                <button
                  style={getButtonStyle(!isLiveCapture, "danger")}
                  onClick={stopLiveSensorCapture}
                  disabled={!isLiveCapture}
                >
                  Stop live sensor
                </button>
                <button
                  style={getButtonStyle(!currentSessionId, "danger")}
                  onClick={finishSession}
                  disabled={!currentSessionId}
                >
                  Finish session
                </button>
              </div>

              <div style={{ ...styles.cardText, marginTop: "10px" }}>
                Live samples poslano: {liveSampleCount}
              </div>

              {lastSessionResult?.session?.id && (
                <div style={{ marginTop: "12px" }}>
                  <div style={styles.row}>
                    <button
                      style={getButtonStyle(false, "secondary")}
                      onClick={() => fetchSessionResult(lastSessionResult.session.id)}
                    >
                      Osvježi rezultat
                    </button>
                    <button
                      style={getButtonStyle(false, "secondary")}
                      onClick={exportSelectedSessionToCsv}
                    >
                      Export odabrani
                    </button>
                  </div>
                </div>
              )}
            </div> 
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;