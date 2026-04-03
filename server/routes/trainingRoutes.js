const express = require("express");
const router = express.Router();
const trainingController = require("../controllers/trainingController");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = authMiddleware.requireRole;

router.get("/", authMiddleware.optionalAuth, trainingController.getAllTrainings);
router.get(
  "/:id/participants",
  authMiddleware,
  trainingController.getTrainingParticipants,
);
router.get("/:id/weather", authMiddleware, trainingController.getTrainingWeather);
// POST "/" mora biti prije POST "/:id/register" (inace Express 5 moze krivo uskladiti rutu).
router.post(
  "/",
  authMiddleware,
  requireRole(["COACH", "ADMIN"]),
  trainingController.createTraining,
);
router.post(
  "/:id/register",
  authMiddleware,
  trainingController.registerForTraining,
);
router.delete(
  "/:id/register",
  authMiddleware,
  trainingController.unregisterFromTraining,
);
router.patch(
  "/participations/:id/status",
  authMiddleware,
  requireRole(["COACH", "ADMIN"]),
  trainingController.updateParticipationStatus,
);

module.exports = router;
