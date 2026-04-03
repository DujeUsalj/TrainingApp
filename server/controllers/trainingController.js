const pool = require("../config/db");

exports.createTraining = async (req, res) => {
  try {
    const { title, description, location, startTime, endTime } = req.body;

    const coachId = req.user.id;

    const result = await pool.query(
      `INSERT INTO trainings (title, description, location, start_time, end_time, coach_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description, location, startTime, endTime, coachId],
    );

    res.status(201).json({
      message: "Training created",
      training: result.rows[0],
    });
  } catch (error) {
    console.error("Create training error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.registerForTraining = async (req, res) => {
  try {
    const userId = req.user.id;
    const trainingId = req.params.id;

    const existing = await pool.query(
      `SELECT * FROM participations WHERE user_id = $1 AND training_id = $2`,
      [userId, trainingId],
    );

    if (existing.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Already registered for this training" });
    }

    const result = await pool.query(
      `INSERT INTO participations (user_id, training_id)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, trainingId],
    );

    res.status(201).json({
      message: "Successfully registered for training",
      participation: result.rows[0],
    });
  } catch (error) {
    console.error("Register for training error:", error.message);
    if (error.code === "23505") {
      return res.status(400).json({ message: "Already registered for this training" });
    }
    if (error.code === "23514") {
      return res.status(400).json({
        message:
          "Prijava na trening nije dozvoljena za ovu ulogu (ograničenje u bazi). Trener i sportaš trebaju odvojene račune ili ukloni CHECK na participations.",
      });
    }
    if (error.code === "23503") {
      return res.status(400).json({ message: "Trening ne postoji." });
    }
    res.status(500).json({ message: "Server error" });
  }
};

exports.unregisterFromTraining = async (req, res) => {
  try {
    const userId = req.user.id;
    const trainingId = req.params.id;

    const result = await pool.query(
      `DELETE FROM participations
       WHERE user_id = $1 AND training_id = $2
       RETURNING *`,
      [userId, trainingId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Nisi prijavljen na ovaj trening" });
    }

    res.status(200).json({
      message: "Uspješno odjavljen s treninga",
      participation: result.rows[0],
    });
  } catch (error) {
    console.error("Unregister from training error:", error.message);
    if (error.code === "23503") {
      return res.status(400).json({
        message: "Ne možeš se odjaviti dok postoje povezani zapisi (npr. sesija senzora).",
      });
    }
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllTrainings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         t.*,
         coach.first_name AS coach_first_name,
         coach.last_name AS coach_last_name,
         coach.email AS coach_email
       FROM trainings t
       LEFT JOIN users coach ON coach.id = t.coach_id
       ORDER BY t.start_time ASC`,
    );

    const rows = result.rows;
    const userId = req.user?.id;

    if (userId != null && userId !== undefined) {
      const mine = await pool.query(
        `SELECT id, training_id, status FROM participations WHERE user_id = $1`,
        [userId],
      );
      const byTraining = new Map(mine.rows.map((r) => [Number(r.training_id), r]));

      for (const t of rows) {
        const p = byTraining.get(Number(t.id));
        t.my_participation_id = p ? p.id : null;
        t.my_participation_status = p ? p.status : null;
      }
    } else {
      for (const t of rows) {
        t.my_participation_id = null;
        t.my_participation_status = null;
      }
    }

    res.status(200).json({
      trainings: rows,
    });
  } catch (error) {
    console.error("Get trainings error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTrainingParticipants = async (req, res) => {
  try {
    const trainingId = req.params.id;

    const result = await pool.query(
      `SELECT 
         participations.id,
         participations.status,
         participations.created_at,
         users.id AS user_id,
         users.first_name,
         users.last_name,
         users.email,
         users.role
       FROM participations
       JOIN users ON participations.user_id = users.id
       WHERE participations.training_id = $1
       ORDER BY participations.created_at ASC`,
      [trainingId],
    );

    res.status(200).json({
      participants: result.rows,
    });
  } catch (error) {
    console.error("Get participants error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
exports.updateParticipationStatus = async (req, res) => {
  try {
    const participationId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = ["REGISTERED", "ATTENDED", "ABSENT"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const result = await pool.query(
      `UPDATE participations
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, participationId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Participation not found" });
    }

    res.status(200).json({
      message: "Participation status updated",
      participation: result.rows[0],
    });
  } catch (error) {
    console.error("Update participation error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const HOURLY_VARS =
  "hourly=temperature_2m,precipitation_probability,windspeed_10m&timezone=auto";

function pickClosestHourlyIndex(times, targetTimeMs) {
  let closestIndex = 0;
  let closestDiff = Number.POSITIVE_INFINITY;
  for (let i = 0; i < times.length; i += 1) {
    const diff = Math.abs(new Date(times[i]).getTime() - targetTimeMs);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestIndex = i;
    }
  }
  return closestIndex;
}

exports.getTrainingWeather = async (req, res) => {
  try {
    const trainingIdRaw = req.params.id;
    const trainingId = Number.parseInt(String(trainingIdRaw), 10);
    if (!Number.isFinite(trainingId)) {
      return res.status(400).json({ message: "Neispravan ID treninga" });
    }

    const trainingResult = await pool.query(
      `SELECT id, title, location, start_time
       FROM trainings
       WHERE id = $1`,
      [trainingId],
    );

    if (trainingResult.rows.length === 0) {
      return res.status(404).json({ message: "Trening nije pronađen" });
    }

    const training = trainingResult.rows[0];

    if (!training.location || !String(training.location).trim()) {
      return res.status(400).json({ message: "Trening nema lokaciju (potrebna za vremensku prognozu)" });
    }

    if (!training.start_time) {
      return res.status(400).json({ message: "Trening nema definiran početak" });
    }

    const startDateTime = new Date(training.start_time);
    if (Number.isNaN(startDateTime.getTime())) {
      return res.status(400).json({ message: "Neispravan datum početka treninga" });
    }

    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(training.location)}&count=1&language=en&format=json`;
    const geocodeResponse = await fetch(geocodeUrl);

    if (!geocodeResponse.ok) {
      return res.status(502).json({ message: "Geokodiranje lokacije trenutno nije dostupno" });
    }

    const geocodeData = await geocodeResponse.json();
    const bestMatch = geocodeData?.results?.[0];

    if (!bestMatch) {
      return res.status(404).json({ message: "Lokaciju treninga nije moguće pronaći na karti" });
    }

    const latitude = bestMatch.latitude;
    const longitude = bestMatch.longitude;
    const dateStr = startDateTime.toISOString().slice(0, 10);
    const targetTimeMs = startDateTime.getTime();

    const fetchJson = async (url) => {
      const r = await fetch(url);
      if (!r.ok) {
        return null;
      }
      return r.json();
    };

    const dayForecastUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&${HOURLY_VARS}` +
      `&start_date=${dateStr}&end_date=${dateStr}`;
    const archiveUrl =
      `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&${HOURLY_VARS}` +
      `&start_date=${dateStr}&end_date=${dateStr}`;
    const nearTermUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&${HOURLY_VARS}&forecast_days=7`;

    let bundle = await fetchJson(dayForecastUrl);
    if (!bundle || !(bundle.hourly?.time || []).length) {
      bundle = await fetchJson(archiveUrl);
    }
    if (!bundle || !(bundle.hourly?.time || []).length) {
      bundle = await fetchJson(nearTermUrl);
    }

    if (!bundle) {
      return res.status(502).json({ message: "Vremenska služba trenutno nije dostupna" });
    }

    const times = bundle?.hourly?.time || [];
    const temperatures = bundle?.hourly?.temperature_2m || [];
    const precipitationProbabilities = bundle?.hourly?.precipitation_probability || [];
    const windSpeeds = bundle?.hourly?.windspeed_10m || [];

    if (times.length === 0) {
      return res.status(404).json({ message: "Nema podataka o vremenu za ovu lokaciju" });
    }

    const closestIndex = pickClosestHourlyIndex(times, targetTimeMs);

    res.status(200).json({
      training: {
        id: training.id,
        title: training.title,
        location: training.location,
        startTime: training.start_time,
      },
      weather: {
        forecastTime: times[closestIndex] || null,
        temperatureC: temperatures[closestIndex] ?? null,
        precipitationProbability: precipitationProbabilities[closestIndex] ?? null,
        windSpeedKmh: windSpeeds[closestIndex] ?? null,
        latitude,
        longitude,
        resolvedLocationName: bestMatch.name,
        resolvedCountry: bestMatch.country || null,
        venueTimezone: bundle.timezone || null,
        venueTimezoneAbbreviation: bundle.timezone_abbreviation || null,
      },
    });
  } catch (error) {
    console.error("Get training weather error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
