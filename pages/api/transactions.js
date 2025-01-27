// ./pages/api/admin/transactions.js
import { stripe } from "../../lib/utils";

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            const { connectedAccountId } = req.query;

            const transactions = await stripe.balanceTransactions.list(
                { limit: 100 },
                { stripeAccount: connectedAccountId }
            );
            console.log('transactions: ', transactions)

            res.json({ transactions: transactions.data });
        } catch (error) {
            console.error("Error fetching transactions:", error);
            res.status(500).json({ error: error.message });
        }
    }
}
