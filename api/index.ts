import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import * as fs from "fs";
import logger from "morgan";
import * as path from "path";

// The following line sets up the environment variables before everything else.
dotenv.config();

import MongoStore from "connect-mongo";
import multer from "multer";
import { connectDb } from "../server/db";
import { appRouter } from "../server/routes";
const { v4: uuidv4 } = require("uuid");
const upload = multer({ dest: "uploads/" });

export const app = express();
const PORT = process.env.PORT || 3000;
app.use(logger("dev"));

app.use(cors()); // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

app.use(express.json()); // Enable parsing JSON in requests and responses.
app.use(express.urlencoded({ extended: false })); // Also enable URL encoded request and responses.

const finalUploadsDir = path.resolve(__dirname, "uploads");
if (!fs.existsSync(finalUploadsDir)) {
  fs.mkdirSync(finalUploadsDir, { recursive: true });
}

app.post("/api/upload", upload.single("image"), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
  const filePath = path.join(__dirname, "uploads", fileName);

  // Move the file to the desired location
  fs.rename(file.path, filePath, (err: any) => {
    if (err) {
      return res.status(500).json({ error: "Error saving file." });
    }
    res.json({ imageUrl: `/uploads/${fileName}` });
  });
});

// Serve static files from the uploads directory
app.use("/uploads", express.static(finalUploadsDir));

// Session allows us to store a cookie 🍪.
app.use(
  session({
    secret: process.env.SECRET || "Hello 6.1040",
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_SRV,
      dbName: "mongo-sessions",
    }),
  }),
);

app.use(express.static(path.join(__dirname, "../public")));
app.use("/api/", appRouter);

// For all unrecognized requests, return a not found message.
app.all("*", (req, res) => {
  res.status(404).json({
    msg: "Page not found",
  });
});

void connectDb().then(() => {
  app.listen(PORT, () => {
    console.log("Started listening on port", PORT);
  });
});

export default app;
