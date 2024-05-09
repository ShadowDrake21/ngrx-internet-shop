const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");

const app = express();
app.use(express.static("public"));
app.use("/images", express.static("images"));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(cors({ origin: true, credentials: true }));

const stripe = require("stripe")(
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
      console.log("customer already exists", customer);
    } else {
      customer = await stripe.customers.create({
        email,
      });
      console.log("customer created: ", customer.id);
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
      success_url: "http://localhost:4242/success.html",
      cancel_url: "http://localhost:4242/cancel.html",
    });

    res.status(200).json(session);
  } catch (error) {
    next(error);
  }
});

app.listen(4242, () => console.log("App is running on 4242..."));
