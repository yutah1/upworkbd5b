import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fetch from "node-fetch"; // We might need to install node-fetch or use native fetch if Node 18+

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Create Payment Endpoint
  app.post("/api/create-payment", async (req, res) => {
    const { amount, userId, method } = req.body;
    const apiKey = process.env.PAYMENT_API_KEY || 'dummy_key';

    try {
      // Mocking the request to https://securecheckoutio.com/api/payment/create
      // const response = await fetch('https://securecheckoutio.com/api/payment/create', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      //   body: JSON.stringify({ amount, userId, method, callbackUrl: `${process.env.APP_URL}/wallet` })
      // });
      // const data = await response.json();
      
      // Simulated response
      const mockTransactionId = `TRX${Math.floor(Math.random() * 100000000)}`;
      res.json({ 
        success: true, 
        paymentUrl: `https://securecheckoutio.com/checkout/${mockTransactionId}`,
        transactionId: mockTransactionId
      });
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ success: false, message: "Failed to create payment." });
    }
  });

  // Verify Transaction Endpoint
  app.post("/api/verify-transaction", async (req, res) => {
    const { transactionId } = req.body;
    const apiKey = process.env.PAYMENT_API_KEY || 'dummy_key';

    if (!transactionId) {
      return res.status(400).json({ success: false, message: "Transaction ID is required." });
    }

    try {
      // Mocking the request to https://securecheckoutio.com/api/payment/verify
      // const response = await fetch('https://securecheckoutio.com/api/payment/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      //   body: JSON.stringify({ transactionId })
      // });
      // const data = await response.json();
      
      // Simulated response
      if (transactionId.length >= 8) {
        res.json({ success: true, amount: 100, message: "Transaction verified successfully." });
      } else {
        res.json({ success: false, message: "Invalid transaction ID." });
      }
    } catch (error) {
      console.error("Error verifying transaction:", error);
      res.status(500).json({ success: false, message: "Failed to verify transaction." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
