import { stripe } from "../../lib/utils";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const accountSession = await stripe.accountSessions.create({
        account: req.body.account,
        components: {
          account_onboarding: { enabled: true },
        },
      });

      res.json({
        client_secret: accountSession.client_secret,
      });
    } catch (error) {
      console.error("An error occurred when calling the Stripe API to create an account session", error);
      res.status(500);
      res.json({ error: error.message });
    }
  }
}
