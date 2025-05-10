const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Course = require('../models/courseModel');
const User = require('../models/userModel');
const Payment = require('../models/paymentModel');

// Create a Stripe checkout session
exports.createCheckoutSession = async (req, res) => {
  try {
    const { courseId, userId } = req.body;

    // Check if user has already purchased this course
    const existingPayment = await Payment.findOne({
      userId,
      courseId,
      status: { $ne: 'completed' }
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'You have already purchased this course'
      });
    }

    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get user details for the checkout session
    const user = await User.findById(userId);

    // Create a product in Stripe if it doesn't exist
    let stripeProductId = course.stripeProductId;
    let stripePriceId = course.stripePriceId;

    if (!stripeProductId) {
      const product = await stripe.products.create({
        name: course.title,
        description: course.description,
        images: course.thumbnail ? [course.thumbnail] : []
      });
      stripeProductId = product.id;

      // Create a price for the product
      const price = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: Math.round(course.price * 100), // Convert to cents
        currency: 'usd',
      });
      stripePriceId = price.id;

      // Update course with Stripe IDs
      await Course.findByIdAndUpdate(courseId, {
        stripeProductId,
        stripePriceId
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/courses`,
      metadata: {
        courseId: courseId.toString(),
        userId: userId.toString()
      }
    });

    // Create a pending payment record
    await Payment.create({
      userId,
      courseId,
      amount: course.price,
      stripeSessionId: session.id,
      status: 'completed'
    });

    // Return the session ID
    res.status(200).json({
      success: true,
      sessionId: session.id
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error.message
    });
  }
};

// Verify payment status and update database
exports.verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.payment_status === 'paid') {
      // Update payment record
      const { courseId, userId } = session.metadata;

      await Payment.findOneAndUpdate(
        { stripeSessionId: sessionId },
        {
          status: 'completed',
          stripePaymentIntentId: session.payment_intent
        }
      );

      // Add course to user's purchased courses
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { courses: courseId } }
      );

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        courseId
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};

// Handle Stripe webhook events
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;

      // Update payment status
      if (session.payment_status === 'paid') {
        const { courseId, userId } = session.metadata;

        await Payment.findOneAndUpdate(
          { stripeSessionId: session.id },
          {
            status: 'completed',
            stripePaymentIntentId: session.payment_intent
          }
        );

        // Add course to user's purchased courses
        await User.findByIdAndUpdate(
          userId,
          { $addToSet: { courses: courseId } }
        );
      }
      break;

    case 'payment_intent.payment_failed':
      const paymentIntent = event.data.object;

      // Update payment status to failed
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        { status: 'failed' }
      );
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
};

// Get user's purchased courses
exports.getPurchasedCourses = async (req, res) => {
  try {
    const { userId } = req.body;
    console.log(userId)

    // Find completed payments for this user
    const payments = await Payment.find({
      userId,
      status: 'completed'
    });

    // Extract course IDs
    const purchasedCourses = payments.map(payment => payment.courseId.toString());

    res.status(200).json({
      success: true,
      purchasedCourses
    });
  } catch (error) {
    console.error('Error fetching purchased courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchased courses',
      error: error.message
    });
  }
};

// Payment success page verification
exports.paymentSuccess = async (req, res) => {
  try {
    const { sessionId } = req.query;

    // Verify the session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const { courseId } = session.metadata;

    if (session.payment_status === 'paid') {
      res.status(200).json({
        success: true,
        message: 'Payment successful',
        courseId
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }
  } catch (error) {
    console.error('Error verifying payment success:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment success',
      error: error.message
    });
  }
};