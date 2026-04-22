const { Router } = require('express');
const {
  createSubscriptionPayment,
  getAllSubscriptionPayments,
  updateSubscriptionPaymentStatus,
} = require('../controllers/payment.controller');

const router = Router();

router.route('/subscription').post(createSubscriptionPayment);
router.route('/allSubscriptionData').get(getAllSubscriptionPayments);
router
  .route('/updateSubscriptionData/:id')
  .patch(updateSubscriptionPaymentStatus);

module.exports = router;
