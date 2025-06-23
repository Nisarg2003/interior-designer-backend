import express from "express";
import dotenv, { config } from "dotenv";
import connectDb from "./Config/connectDb.js";
import postRoutes from "./Routes/postRoutes.js";
import queryRoutes from "./Routes/queryRoutes.js";
import userRoutes from "./Routes/userRoutes.js";

dotenv.config();
connectDb();
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api", postRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/user",userRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
