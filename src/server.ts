import path from "path";

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import fileUpload from "express-fileupload";
import mongoose from "mongoose";

import routes from "./routes";

require("dotenv").config();

mongoose.connect(process.env.DATABASE as string);
mongoose.connection.on("error", (err) => {
  console.log(`DB connection error: ${err.message}`);
});

const app = express();

app.use(
  cors({
    credentials: true,
    origin: process.env.ORIGIN,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

app.use(express.static(path.join(__dirname, "../public")));
app.use("/", routes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.BASE}`);
});
