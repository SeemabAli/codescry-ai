"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dns_1 = require("dns");
(0, dns_1.setDefaultResultOrder)("ipv4first");
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const PORT = process.env.PORT || 5000;
async function startServer() {
    await (0, db_1.connectDB)();
    app_1.default.listen(PORT, () => {
        console.log(`CodeScry API running on http://localhost:${PORT}`);
    });
}
startServer();
