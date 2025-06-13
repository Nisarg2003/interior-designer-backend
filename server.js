import express from 'express';
import dotenv from 'dotenv';
import connectDb from './Config/connectDb.js';
import postRoutes from "./Routes/postRoutes.js";
import queryRoutes from "./Routes/queryRoutes.js";
import cors from 'cors';

dotenv.config();
connectDb();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});


app.use("/api", postRoutes);
app.use("/api/queries", queryRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
