const express = require("express");
const router = express.Router();
const sensorController = require("../controllers/sensorController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/my-sessions", authMiddleware, sensorController.getMySessions);
router.post("/start", authMiddleware, sensorController.startSession);
router.post("/:id/data", authMiddleware, sensorController.addSensorData);
router.post("/:id/finish", authMiddleware, sensorController.finishSession);
router.get("/:id/result", authMiddleware, sensorController.getSessionResult);

module.exports = router;
