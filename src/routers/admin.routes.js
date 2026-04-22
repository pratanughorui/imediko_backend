const { Router } = require('express');
const {
  loginAdmin,
  addUserByAdmin,
  adminVerification,
} = require('../controllers/admin.controller');
const { verifyAdminToken } = require('../middleware/adminAuth.middleware');
const router = Router();
router.route('/login').post(loginAdmin);
router.post('/addUsers', verifyAdminToken, addUserByAdmin);
router.get('/verifyAdmin', verifyAdminToken, adminVerification);

module.exports = router;
