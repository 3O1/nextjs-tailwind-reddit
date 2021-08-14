import "reflect-metadata";
import { createConnection } from "typeorm";
import User from "./entities/User";
import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

/**
 * call dotenv before routes
 * - process.env available throughout app
 */
dotenv.config();

import authRoutes from "./routes/auth";

import trim from "./middleware/trim";

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(morgan("dev"));
app.use(trim);
app.use(cookieParser());

app.get("/", (_, res) => {
  res.send("hello world");
});

app.use("/api/auth", authRoutes);

app.listen(PORT, async () => {
  console.log(`server running at http://localhost:${PORT}`);

  try {
    await createConnection();
    console.log("db connected");
  } catch (err) {
    console.log(err);
  }
});
