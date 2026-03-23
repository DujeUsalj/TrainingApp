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
    res.status(500).json({ message: "Server error" });
  }
};
exports.getAllTrainings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM trainings ORDER BY start_time ASC`,
    );

    res.status(200).json({
      trainings: result.rows,
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

exports.getTrainingWeather = async (req, res) => {
  try {
    const trainingId = req.params.id;

    const trainingResult = await pool.query(
      `SELECT id, title, location, start_time
       FROM trainings
       WHERE id = $1`,
      [trainingId],
    );

    if (trainingResult.rows.length === 0) {
      return res.status(404).json({ message: "Training not found" });
    }

    const training = trainingResult.rows[0];

    if (!training.location) {
      return res.status(400).json({ message: "Training location is missing" });
    }

    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(training.location)}&count=1&language=en&format=json`;
    const geocodeResponse = await fetch(geocodeUrl);

    if (!geocodeResponse.ok) {
      return res.status(502).json({ message: "Weather geocoding service unavailable" });
    }

    const geocodeData = await geocodeResponse.json();
    const bestMatch = geocodeData?.results?.[0];

    if (!bestMatch) {
      return res.status(404).json({ message: "Could not geocode training location" });
    }

    const latitude = bestMatch.latitude;
    const longitude = bestMatch.longitude;
    const startDateTime = new Date(training.start_time);
    const date = startDateTime.toISOString().slice(0, 10);

    const forecastUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&hourly=temperature_2m,precipitation_probability,windspeed_10m&start_date=${date}&end_date=${date}&timezone=auto`;
    const forecastResponse = await fetch(forecastUrl);

    if (!forecastResponse.ok) {
      return res.status(502).json({ message: "Weather forecast service unavailable" });
    }

    const forecastData = await forecastResponse.json();
    const times = forecastData?.hourly?.time || [];
    const temperatures = forecastData?.hourly?.temperature_2m || [];
    const precipitationProbabilities = forecastData?.hourly?.precipitation_probability || [];
    const windSpeeds = forecastData?.hourly?.windspeed_10m || [];

    if (times.length === 0) {
      return res.status(404).json({ message: "No weather forecast available for this date" });
    }

    const targetTimeMs = startDateTime.getTime();
    let closestIndex = 0;
    let closestDiff = Number.POSITIVE_INFINITY;

    for (let i = 0; i < times.length; i += 1) {
      const diff = Math.abs(new Date(times[i]).getTime() - targetTimeMs);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestIndex = i;
      }
    }

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
      },
    });
  } catch (error) {
    console.error("Get training weather error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
