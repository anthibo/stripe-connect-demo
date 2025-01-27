// ./pages/api/create_payment_link.js
import { stripe } from "../../lib/utils";

export default async function handler(req, res) {
    if (req.method === "POST") {
        const { accountId, amount, currency, description } = req.body;

        try {
            const price = await stripe.prices.create({
                currency: currency || "usd",
                unit_amount: amount,
                product_data: {
                    name: description || "Custom Payment",
                },
            }, {
                stripeAccount: accountId, // Pass connected account ID
            });
            console.log('created price: ', price)
            const paymentLink = await stripe.paymentLinks.create({
                line_items: [
                    {
                        price: price.id,
                        quantity: 1,
                    },
                ],
                application_fee_amount: Math.round(amount * 0.1), // Take a 10% fee
                // application_fee_percent
            }, {
                stripeAccount: accountId, // Pass connected account ID
            });

            res.json({ paymentLink: paymentLink.url });
        } catch (error) {
            console.error("Error creating payment link:", error);
            res.status(500).json({ error: error.message });
        }
    }
}
