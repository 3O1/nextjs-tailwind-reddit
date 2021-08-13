import "reflect-metadata";
import { createConnection } from "typeorm";
import { User } from "./entities/User";
import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";

/**
 * call dotenv before routes
 * - process.env available throughout app
 */
dotenv.config();

import authRoutes from "./routes/auth";

import trim from "./middleware/trim";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

// middleware before routes
app.use(trim);

app.get("/", (_, res) => {
  res.send("hello world");
});

app.use("/api/auth", authRoutes);

app.listen(5000, async () => {
  console.log("server running at http://localhost:5000");

  try {
    await createConnection();
    console.log("db connected");
  } catch (err) {
    console.log(err);
  }
});
