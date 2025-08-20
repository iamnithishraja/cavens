import express from "express";
import dotenv from "dotenv";
import { connectDatabse } from "./config/database";
import cors from "cors";
import userRoute from "./routes/userRoute";
import fileRoute from "./routes/fileRoute";
import clubRoute from "./routes/clubRoute";

dotenv.config();
const app = express();

connectDatabse();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/user", userRoute);
app.use("/api/file", fileRoute);
app.use("/api/club", clubRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
