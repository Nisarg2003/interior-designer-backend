import express from 'express';
import dotenv, { config } from 'dotenv';
import connectDb from './Config/connectDb.js';
import postRoutes from "./Routes/postRoutes.js"
import queryRoutes from "./Routes/queryRoutes.js"

dotenv.config();
connectDb();
const app = express();

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use("/api",postRoutes)
app.use("/api/queries",queryRoutes)

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
