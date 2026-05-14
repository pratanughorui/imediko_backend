const { Router } = require("express");
const {
  createPractice,
  getPracticesByDoctorId,
  deletePractice,
  updatePractice,
  getPracticeById,
} = require("../controllers/practice.controller");
const router = Router();

// all routers
router.route("/addPractice").post(createPractice);
router.route("/getPracticesByDrId/:doctor_id").get(getPracticesByDoctorId);
router.route("/deletePracticesById/:practice_id").delete(deletePractice);
router.route("/updatepractice/:practice_id").put(updatePractice);
router.route("/getPracticeById/:practice_id").get(getPracticeById);

module.exports = router;
