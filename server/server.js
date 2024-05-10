// const express = require("express");
// const cors = require("cors");
// const bodyparser = require("body-parser");

import express from "express";
import cors from "cors";
import bodyparser from "body-parser";
import Stripe from "stripe";
import createPurchase from "./controllers/purchaseControllers.js";

const app = express();
app.use(express.static("public"));
app.use("/images", express.static("images"));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(cors({ origin: true, credentials: true }));

const stripe = new Stripe(
  "sk_test_51OSDbAAGBN9qzN7ZebHv8tsmZYaQwHC0xDtAaZ3GAJJTJbO8DJpTGvLtaIMcJAsgCrW69d2W8Vx5E356Mw04dAqM00EkfSFmu1"
);

app.post("/checkout", async (req, res, next) => {
  try {
    const { email } = req.body;

    let customer;
    try {
      customer = await stripe.customers.list({ email: email, limit: 1 });
    } catch (error) {
      next(error);
      return;
    }

    if (customer.data.length > 0) {
      customer = customer.data[0];
    } else {
      customer = await stripe.customers.create({
        email,
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      shipping_address_collection: {
        allowed_countries: ["UA", "PL"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: "PLN",
            },
            display_name: "Free shipping",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 4,
              },
              maximum: {
                unit: "business_day",
                value: 8,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 1500,
              currency: "PLN",
            },
            display_name: "Next day air",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 1,
              },
              maximum: {
                unit: "business_day",
                value: 1,
              },
            },
          },
        },
      ],

      line_items: req.body.items.map((item) => ({
        price_data: {
          currency: "PLN",
          product_data: {
            name: item.title,
            images: item.images,
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url:
        "http://localhost:4242/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:4242/cancel.html",
    });

    res.status(200).json(session);
  } catch (error) {
    next(error);
  }
});

app.get("/success", async (req, res) => {
  const session_id = req.query.session_id;

  const session = await stripe.checkout.sessions.retrieve(session_id);
  const customer = await stripe.customers.retrieve(session.customer);
  const lineItems = await stripe.checkout.sessions.listLineItems(session_id);
  console.log(session);
  const purchaseItem = {
    products: lineItems.data,
    payment_intent: session.payment_intent,
    customer_id: customer.id,
    session_id: session_id,
  };
  createPurchase(purchaseItem);
  res.send(
    `<html>
    <head>
      <title>Thanks for your order!</title>
      <link rel="stylesheet" href="/style.css" />
    </head>
    <body>
      <section class="success">
      <img class="image" src="/images/check.png" alt="success purchasing" />
        <div class="info">
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
            .join("")}
        </div>
        <a
            class="go-back-link"
            href="http://localhost:4200/"
            style="text-align: center"
            >Go back to shop</a
          >
      </section>
    </body>
  </html>`
  );
});

app.listen(4242, () => console.log("App is running on 4242..."));
