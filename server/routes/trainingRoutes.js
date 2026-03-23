const express = require("express");
const router = express.Router();
const trainingController = require("../controllers/trainingController");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = authMiddleware.requireRole;

router.get("/", authMiddleware, trainingController.getAllTrainings);
router.get(
  "/:id/participants",
  authMiddleware,
  trainingController.getTrainingParticipants,
);
router.get("/:id/weather", authMiddleware, trainingController.getTrainingWeather);
router.post(
  "/:id/register",
  authMiddleware,
  trainingController.registerForTraining,
);
router.post(
  "/",
  authMiddleware,
  requireRole(["COACH", "ADMIN"]),
  trainingController.createTraining,
);
router.patch(
  "/participations/:id/status",
  authMiddleware,
  requireRole(["COACH", "ADMIN"]),
  trainingController.updateParticipationStatus,
);

module.exports = router;
