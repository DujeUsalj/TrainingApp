const express = require("express");
const cors = require("cors");
const sensorRoutes = require("./routes/sensorRoutes");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const pool = require("./config/db");
const trainingRoutes = require("./routes/trainingRoutes");
const app = express();

const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors({
    origin: corsOrigin
      ? corsOrigin.split(",").map((o) => o.trim())
      : true,
  }),
);
app.use(express.json());
app.use("/api/trainings", trainingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/sensors", sensorRoutes);
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});

app.get("/", (req, res) => {
  res.json({ message: "Training Monitor API radi!" });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

pool
  .connect()
  .then(() => {
    console.log("Spojen na PostgreSQL bazu");
  })
  .catch((err) => {
    console.error("Greška pri spajanju na bazu:", err.message);
  });

app.listen(PORT, HOST, () => {
  console.log(`Server radi na http://${HOST}:${PORT}`);
});
