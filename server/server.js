import express from 'express';
import cors from 'cors';
import bodyparser from 'body-parser';
import Stripe from 'stripe';
import createPurchase from './controllers/purchaseControllers.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.static('public'));
app.use('/images', express.static('images'));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(cors({ origin: true, credentials: true }));

const { PORT, STRIPE_API_KEY, HOST_URL } = process.env;

const stripe = new Stripe(STRIPE_API_KEY);

app.post('/checkout', async (req, res, next) => {
  try {
    const { email } = req.body;

    let customer;
    try {
      customer = await stripe.customers.list({ email: email, limit: 1 });
      customer = customer.data[0];
    } catch (error) {
      next(error);
      return;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      shipping_address_collection: {
        allowed_countries: ['UA', 'PL'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'PLN',
            },
            display_name: 'Free shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 4,
              },
              maximum: {
                unit: 'business_day',
                value: 8,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 1500,
              currency: 'PLN',
            },
            display_name: 'Next day air',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 1,
              },
              maximum: {
                unit: 'business_day',
                value: 1,
              },
            },
          },
        },
      ],
      line_items: req.body.items.map((item) => ({
        price_data: {
          currency: 'PLN',
          product_data: {
            name: item.title,
            images: item.images,
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      phone_number_collection: {
        enabled: true,
      },
      mode: 'payment',
      success_url: `${HOST_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${HOST_URL}/cancel.html`,
    });

    res.status(200).json(session);
  } catch (error) {
    next(error);
  }
});

app.get('/success', async (req, res) => {
  const session_id = req.query.session_id;

  const session = await stripe.checkout.sessions.retrieve(session_id);
  const customer = await stripe.customers.retrieve(session.customer);
  const lineItems = await stripe.checkout.sessions.listLineItems(session_id);
  const minimizeProducts = lineItems.data.map((product) => ({
    price_id: product.price.id,
    product_id: product.price.product,
    quantity: product.quantity,
  }));
  const purchaseItem = {
    productsIds: minimizeProducts,
    payment_intent: session.payment_intent,
    total_price: session.amount_total / 100,
    customer_id: customer.id,
    session_id: session_id,
  };
  createPurchase(purchaseItem);
  res.send(
    `<html>
    <head>
      <title>Thanks for your order!</title>
      <link rel="stylesheet" href="/style.css" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    </head>
    <body>
      <section class="success">
      <img class="image" src="/images/check.png" alt="success purchasing" />
        <div class="info">
        <div class="info-inner">
          <p>Thank you for your order, ${customer.name}!</p>
          <p>
            You will receive an order confirmation email with details of your
            order. Here are your ordered items:
          </p>
          <h4 style="text-align: end;">Total price: ${
            session.amount_total / 100
          }
          ${session.currency.toUpperCase()}</h4>

          ${lineItems.data
            .map(
              (item) =>
                `<ul>
              <li>Name: ${item.description}</li>
              <li>Price: ${item.amount_total / 100}
              ${item.currency.toUpperCase()}</li>
              <li>Quantity: ${item.quantity}</li></ul>`
            )
            .join('')}
          </div>
        </div>
        <a
            class="go-back-link"
            href="https://ngrx-internet-shop.netlify.app"
            style="text-align: center"
            >Go back to shop</a
          >
      </section>
    </body>
  </html>`
  );
});

app.listen(PORT, () => console.log('App is running on 4242...'));
