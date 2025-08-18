import express from "express";
import dotenv from "dotenv";
import { connectDatabse } from "./config/database";
import cors from "cors";

dotenv.config();
const app = express();

connectDatabse();

app.use(cors({
    origin: "*",
    credentials: true
  }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});