import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

/**
 * call dotenv before routes
 * - process.env available throughout app
 */
dotenv.config();

import authRoutes from "./routes/auth";
import postsRoutes from "./routes/posts";
import subRoutes from "./routes/subs";
import miscRoutes from "./routes/misc";

import trim from "./middleware/trim";

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(morgan("dev"));
app.use(trim);
app.use(cookieParser());
/**
 * @param credentials:
 * When setting `credentials` to `true`, need to specify an origin or list of origins
 *
 * @param origin: In prod, set to domain name
 * @param optionsSuccessStatus Status of the request before the request is sent
 *  - setting to `200` is best for browser compatibility for older browsers/devices
 */
app.use(
  cors({
    credentials: true,
    origin: process.env.ORIGIN,
    optionsSuccessStatus: 200,
  })
);

app.get("/", (_, res) => {
  res.send("hello world");
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/subs", subRoutes);
app.use("/api/misc", miscRoutes);

app.listen(PORT, async () => {
  console.log(`server running at http://localhost:${PORT}`);

  try {
    await createConnection();
    console.log("db connected");
  } catch (err) {
    console.log(err);
  }
});
