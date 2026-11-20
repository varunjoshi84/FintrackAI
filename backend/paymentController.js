const crypto = require('crypto');
const User = require('./authentication/User');
const paymentRepository = require('./repositories/paymentRepository');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Official pricing table definition to guarantee backend authority on price and plan
const PLAN_PRICING = {
  Pro: {
    monthly: 199,
    yearly: 2148,
  },
  Enterprise: {
    monthly: 999,
    yearly: 10788,
  },
};

/**
 * Calculates subscription dates from billing cycle.
 */
const calculateSubscriptionDates = (billing) => {
  const startDate = new Date();
  const endDate = new Date(startDate);
  const nextPaymentDate = new Date(startDate);

  if (billing === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
    nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
  }

  return { startDate, endDate, nextPaymentDate };
};

/**
 * Applies subscription activation to MongoDB user profile.
 */
const applySubscriptionToUser = async (userId, plan, startDate, endDate, nextPaymentDate) => {
  return User.findByIdAndUpdate(
    userId,
    {
      plan,
      planStartDate: startDate,
      planEndDate: endDate,
      nextPaymentDate,
      subscriptionStatus: 'active',
    },
    { new: true }
  );
};

/**
 * Creates or reuses a pending Razorpay order.
 * Resolves Gap 5 (Double payment): detects and returns an existing active order within 10 minutes.
 */
const createOrder = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const userId = (req.user.id || req.user._id).toString();
    const { plan = 'Pro', billing = 'monthly' } = req.body;

    // Validate plan & billing server-side
    if (!PLAN_PRICING[plan] || !PLAN_PRICING[plan][billing]) {
      return res.status(400).json({
        success: false,
        message: `Invalid plan or billing selection: plan=${plan}, billing=${billing}`,
      });
    }

    const authoritativeAmount = PLAN_PRICING[plan][billing];

    // Check for existing active/pending order created within the last 10 minutes to prevent duplicate orders
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const existingPayment = await paymentRepository.findByUser(userId, 1);
    if (
      existingPayment &&
      existingPayment.length > 0 &&
      existingPayment[0].status === 'created' &&
      existingPayment[0].plan === plan &&
      existingPayment[0].billing === billing &&
      new Date(existingPayment[0].createdAt) > tenMinutesAgo
    ) {
      const activeOrder = existingPayment[0];
      console.log(`Reusing existing pending Razorpay order: ${activeOrder.razorpayOrderId} for user: ${userId}`);
      return res.json({
        success: true,
        orderId: activeOrder.razorpayOrderId,
        amount: Math.round(activeOrder.amount * 100),
        currency: activeOrder.currency || 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
        reused: true,
      });
    }

    const options = {
      amount: authoritativeAmount * 100, // Amount in paise
      currency: 'INR',
      receipt: `rcpt_${userId.slice(-6)}_${Date.now()}`,
      notes: {
        userId,
        plan,
        billing,
      },
    };

    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created:', order.id);

    const { startDate, endDate, nextPaymentDate } = calculateSubscriptionDates(billing);

    // Save initial order row in PostgreSQL as 'created' (Pending checkout)
    await paymentRepository.create({
      userId,
      razorpayPaymentId: null,
      razorpayOrderId: order.id,
      amount: authoritativeAmount,
      currency: 'INR',
      plan,
      billing,
      status: 'created',
      startDate,
      endDate,
      nextPaymentDate,
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
    });
  }
};

/**
 * Processes completed payment with cryptographic HMAC-SHA256 signature verification.
 * Resolves:
 * - Gap 1: Cryptographic signature verification with authoritative plan & amount.
 * - Gap 3: Idempotent handling (detects existing payment, returns success without duplicate revenue).
 * - Gap 6: Cross-DB reconciliation with compensation rollback on Mongo failure.
 */
const processPayment = async (req, res) => {
  let paymentRecord = null;
  try {
    if (!req.user || !req.user.id || !req.user.email) {
      return res.status(401).json({
        success: false,
        message: 'AUTHENTICATION REQUIRED: You must be logged in to process payments',
      });
    }

    const userId = (req.user.id || req.user._id).toString();
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required signature verification credentials: razorpay_payment_id, razorpay_order_id, razorpay_signature',
      });
    }

    // 1. Cryptographic HMAC-SHA256 signature verification (GAP 1)
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('CRITICAL: Payment signature verification failed!', {
        userId,
        razorpay_order_id,
        razorpay_payment_id,
      });

      // Record fraudulent or failed attempt in database
      const existingOrder = await paymentRepository.findByOrderId(razorpay_order_id);
      if (existingOrder) {
        await paymentRepository.update(existingOrder.id, {
          status: 'failed',
          failureReason: 'Cryptographic HMAC signature mismatch',
          razorpayPaymentId: razorpay_payment_id,
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid cryptographic signature',
      });
    }

    // 2. Idempotency Check (GAP 3)
    const existingByPayment = await paymentRepository.findByPaymentId(razorpay_payment_id);
    if (existingByPayment && existingByPayment.status === 'completed') {
      console.log(`Idempotent request: payment ${razorpay_payment_id} is already processed.`);
      return res.json({
        success: true,
        message: 'Payment has already been processed successfully',
        data: {
          paymentId: existingByPayment.razorpayPaymentId,
          plan: existingByPayment.plan,
          billing: existingByPayment.billing,
          validUntil: existingByPayment.endDate,
          nextPayment: existingByPayment.nextPaymentDate,
        },
      });
    }

    // 3. Find the created order row in Postgres to get authoritative plan and amount
    const existingOrder = await paymentRepository.findByOrderId(razorpay_order_id);
    const plan = existingOrder?.plan || req.body.plan || 'Pro';
    const billing = existingOrder?.billing || req.body.billing || 'monthly';
    const amount = existingOrder?.amount || (PLAN_PRICING[plan]?.[billing] ?? 199);

    const { startDate, endDate, nextPaymentDate } = calculateSubscriptionDates(billing);

    // 4. Update or insert payment row in PostgreSQL as 'completed'
    if (existingOrder) {
      paymentRecord = await paymentRepository.update(existingOrder.id, {
        razorpayPaymentId: razorpay_payment_id,
        status: 'completed',
        startDate,
        endDate,
        nextPaymentDate,
      });
    } else {
      paymentRecord = await paymentRepository.create({
        userId,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        amount,
        currency: 'INR',
        plan,
        billing,
        status: 'completed',
        startDate,
        endDate,
        nextPaymentDate,
      });
    }

    // 5. Cross-DB Consistency (GAP 6): Update Mongo User
    try {
      await applySubscriptionToUser(userId, plan, startDate, endDate, nextPaymentDate);
    } catch (mongoError) {
      console.error('Mongo user update failed after Postgres write. Initiating rollback compensation...', mongoError);
      // Revert Postgres payment record to 'failed' to prevent orphan completed record
      if (paymentRecord?.id) {
        await paymentRepository.update(paymentRecord.id, {
          status: 'failed',
          failureReason: `MongoDB synchronization failure: ${mongoError.message}`,
        });
      }
      throw new Error(`Database synchronization failed. Please contact support with payment ID: ${razorpay_payment_id}`);
    }

    res.json({
      success: true,
      message: 'Payment processed and verified successfully',
      data: {
        paymentId: razorpay_payment_id,
        plan,
        billing,
        validUntil: endDate,
        nextPayment: nextPaymentDate,
      },
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process payment',
    });
  }
};

/**
 * Records failed payment events.
 * Resolves Gap 4: Failed payments logged to Postgres with reason instead of dropped.
 */
const recordFailedPayment = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id).toString() : null;
    const { razorpay_order_id, razorpay_payment_id, error_description, error_code, plan = 'Pro', billing = 'monthly' } = req.body;

    if (!razorpay_order_id && !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID or Payment ID is required to log failure',
      });
    }

    console.warn(`Logging failed payment for user ${userId || 'unknown'}: order=${razorpay_order_id}, reason=${error_description}`);

    const existingOrder = razorpay_order_id ? await paymentRepository.findByOrderId(razorpay_order_id) : null;
    const { startDate, endDate, nextPaymentDate } = calculateSubscriptionDates(billing);

    if (existingOrder) {
      await paymentRepository.update(existingOrder.id, {
        razorpayPaymentId: razorpay_payment_id || null,
        status: 'failed',
        failureReason: `${error_code || 'FAILED'}: ${error_description || 'Unknown error'}`,
      });
    } else if (userId) {
      await paymentRepository.create({
        userId,
        razorpayPaymentId: razorpay_payment_id || null,
        razorpayOrderId: razorpay_order_id || `failed_order_${Date.now()}`,
        amount: PLAN_PRICING[plan]?.[billing] || 0,
        currency: 'INR',
        plan,
        billing,
        status: 'failed',
        failureReason: `${error_code || 'FAILED'}: ${error_description || 'Unknown error'}`,
        startDate,
        endDate,
        nextPaymentDate,
      });
    }

    res.json({
      success: true,
      message: 'Payment failure recorded',
    });
  } catch (err) {
    console.error('Failed to log payment failure:', err);
    res.status(500).json({
      success: false,
      message: 'Internal error while recording failure',
    });
  }
};

/**
 * Razorpay Webhook Handler.
 * Resolves Gap 2: Recovers payments even if the user drops network, closes tab, or encounters crash before /process.
 * Handles events:
 * - 'payment.captured' / 'order.paid' -> upgrades user & completes payment
 * - 'payment.failed' -> records failed payment in Postgres
 */
const handleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!webhookSignature) {
      console.warn('Webhook rejected: Missing x-razorpay-signature header');
      return res.status(400).send('Missing signature');
    }

    // req.rawBody is captured from raw request streamer in server.js
    const payload = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    if (expectedSignature !== webhookSignature) {
      console.error('Webhook signature mismatch!');
      return res.status(400).send('Invalid webhook signature');
    }

    const event = req.body.event;
    console.log(`Razorpay webhook event received: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body.payload.payment ? req.body.payload.payment.entity : null;
      const orderEntity = req.body.payload.order ? req.body.payload.order.entity : null;

      const orderId = paymentEntity?.order_id || orderEntity?.id;
      const paymentId = paymentEntity?.id;
      const notes = paymentEntity?.notes || orderEntity?.notes || {};
      const userId = notes.userId;
      const plan = notes.plan || 'Pro';
      const billing = notes.billing || 'monthly';
      const amount = (paymentEntity?.amount || orderEntity?.amount || 0) / 100;

      if (!orderId || !paymentId) {
        console.warn('Webhook payload missing payment/order ID:', req.body.payload);
        return res.status(200).json({ status: 'ok' });
      }

      // Check idempotency
      const existingByPayment = await paymentRepository.findByPaymentId(paymentId);
      if (existingByPayment && existingByPayment.status === 'completed') {
        console.log(`Webhook: Payment ${paymentId} already marked as completed.`);
        return res.status(200).json({ status: 'ok' });
      }

      const { startDate, endDate, nextPaymentDate } = calculateSubscriptionDates(billing);
      const existingOrder = await paymentRepository.findByOrderId(orderId);

      if (existingOrder) {
        await paymentRepository.update(existingOrder.id, {
          razorpayPaymentId: paymentId,
          status: 'completed',
          startDate,
          endDate,
          nextPaymentDate,
        });
      } else if (userId) {
        await paymentRepository.create({
          userId,
          razorpayPaymentId: paymentId,
          razorpayOrderId: orderId,
          amount,
          currency: 'INR',
          plan,
          billing,
          status: 'completed',
          startDate,
          endDate,
          nextPaymentDate,
        });
      }

      // Cross-DB sync: Update user plan in MongoDB
      if (userId) {
        await applySubscriptionToUser(userId, plan, startDate, endDate, nextPaymentDate);
        console.log(`Webhook successfully fulfilled and upgraded user ${userId} to ${plan}!`);
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = req.body.payload.payment?.entity;
      if (paymentEntity) {
        const orderId = paymentEntity.order_id;
        const paymentId = paymentEntity.id;
        const failureReason = `${paymentEntity.error_code || 'FAILED'}: ${paymentEntity.error_description || 'Payment Failed'}`;

        const existingOrder = orderId ? await paymentRepository.findByOrderId(orderId) : null;
        if (existingOrder) {
          await paymentRepository.update(existingOrder.id, {
            razorpayPaymentId: paymentId,
            status: 'failed',
            failureReason,
          });
        }
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Error handling Razorpay webhook:', error);
    res.status(500).json({ error: 'Webhook processing error' });
  }
};

/**
 * Retrieves payment history for the logged-in user.
 */
const getPaymentHistory = async (req, res) => {
  try {
    const userId = (req.user.id || req.user._id).toString();
    const payments = await paymentRepository.findByUser(userId, 10);

    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history',
    });
  }
};

/**
 * Retrieves current subscription status.
 */
const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = (req.user.id || req.user._id).toString();
    const user = await User.findById(userId).select('plan planEndDate nextPaymentDate subscriptionStatus');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const now = new Date();
    const isExpired = user.planEndDate && new Date(user.planEndDate) < now;

    if (isExpired && user.plan !== 'Basic') {
      user.plan = 'Basic';
      user.subscriptionStatus = 'inactive';
      await user.save();
      console.log(`Auto-downgraded user ${userId} to Basic plan`);
    }

    res.json({
      success: true,
      data: {
        currentPlan: user.plan || 'Basic',
        planEndDate: user.planEndDate,
        nextPaymentDate: user.nextPaymentDate,
        subscriptionStatus: isExpired ? 'expired' : user.subscriptionStatus || 'inactive',
        daysRemaining: user.planEndDate ? Math.ceil((new Date(user.planEndDate) - now) / (1000 * 60 * 60 * 24)) : 0,
        wasDowngraded: isExpired && user.plan === 'Basic',
      },
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription status',
    });
  }
};

module.exports = {
  createOrder,
  processPayment,
  recordFailedPayment,
  handleRazorpayWebhook,
  getPaymentHistory,
  getSubscriptionStatus,
  PLAN_PRICING,
};
