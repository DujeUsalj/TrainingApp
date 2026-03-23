const pool = require("../config/db");

exports.startSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { trainingId } = req.body;

    const result = await pool.query(
      `INSERT INTO sensor_sessions (user_id, training_id)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, trainingId],
    );

    res.status(201).json({
      message: "Session started",
      session: result.rows[0],
    });
  } catch (error) {
    console.error("Start session error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addSensorData = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { accelX, accelY, accelZ, gyroX, gyroY, gyroZ } = req.body;

    const result = await pool.query(
      `INSERT INTO sensor_data 
      (session_id, accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [sessionId, accelX, accelY, accelZ, gyroX, gyroY, gyroZ],
    );

    res.status(201).json({
      message: "Sensor data added",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Sensor data error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
exports.finishSession = async (req, res) => {
  try {
    const sessionId = req.params.id;

    // 1. uzmi sve podatke
    const dataResult = await pool.query(
      `SELECT accel_x, accel_y, accel_z FROM sensor_data WHERE session_id = $1`,
      [sessionId],
    );

    const data = dataResult.rows;

    if (data.length === 0) {
      return res.status(400).json({ message: "No sensor data for session" });
    }

    // 2. izračun magnitude
    let magnitudes = data.map((d) => {
      const x = parseFloat(d.accel_x);
      const y = parseFloat(d.accel_y);
      const z = parseFloat(d.accel_z);

      return Math.sqrt(x * x + y * y + z * z);
    });

    // 3. statistika
    const avg = magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length;
    const max = Math.max(...magnitudes);

    // 4. jednostavna klasifikacija
    let activity = "WALKING";

    if (avg > 11) {
      activity = "RUNNING";
    }

    // 5. spremi rezultat
    await pool.query(
      `INSERT INTO activity_results (session_id, avg_acceleration, max_acceleration)
       VALUES ($1, $2, $3)
       ON CONFLICT (session_id) DO NOTHING`,
      [sessionId, avg, max],
    );

    // 6. update session
    const result = await pool.query(
      `UPDATE sensor_sessions
       SET ended_at = CURRENT_TIMESTAMP,
           detected_activity = $1,
           summary = $2
       WHERE id = $3
       RETURNING *`,
      [activity, `avg=${avg.toFixed(2)}, max=${max.toFixed(2)}`, sessionId],
    );

    res.status(200).json({
      message: "Session finished and analyzed",
      activity,
      avgAcceleration: avg,
      maxAcceleration: max,
      session: result.rows[0],
    });
  } catch (error) {
    console.error("Finish session error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getSessionResult = async (req, res) => {
  try {
    const sessionId = req.params.id;

    const sessionResult = await pool.query(
      `SELECT * FROM sensor_sessions WHERE id = $1`,
      [sessionId],
    );

    const activityResult = await pool.query(
      `SELECT * FROM activity_results WHERE session_id = $1`,
      [sessionId],
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.status(200).json({
      session: sessionResult.rows[0],
      result: activityResult.rows[0] || null,
    });
  } catch (error) {
    console.error("Get session result error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMySessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const limitRaw = Number.parseInt(req.query.limit, 10);
    const limit = Number.isNaN(limitRaw)
      ? 10
      : Math.max(1, Math.min(limitRaw, 50));

    const result = await pool.query(
      `SELECT
         s.id,
         s.training_id,
         s.user_id,
         s.started_at,
         s.ended_at,
         s.detected_activity,
         s.summary,
         t.title AS training_title,
         t.location AS training_location,
         ar.avg_acceleration,
         ar.max_acceleration
       FROM sensor_sessions s
       LEFT JOIN trainings t ON t.id = s.training_id
       LEFT JOIN activity_results ar ON ar.session_id = s.id
       WHERE s.user_id = $1
       ORDER BY s.started_at DESC
       LIMIT $2`,
      [userId, limit],
    );

    res.status(200).json({
      sessions: result.rows,
    });
  } catch (error) {
    console.error("Get my sessions error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
