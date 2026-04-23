const { Router } = require("express");
const {
  registerUser,
  loginUser,
  checkUser,
  getAllUsers,
  registerDoctor,
} = require("../controllers/user.controller");
const router = Router();
router.route("/register").post(registerUser);
router.route("/doctorRegistration").post(registerDoctor);
// router.route('/login').post(loginUser);
// router.route('/check').get(checkUser);
// router.route('/getallusers').get(getAllUsers);

module.exports = router;
