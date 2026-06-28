import { setDefaultResultOrder } from "dns";
setDefaultResultOrder("ipv4first");

import "dotenv/config";
import app from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`CodeScry API running on http://localhost:${PORT}`);
  });
}

startServer();
