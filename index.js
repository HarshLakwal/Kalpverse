import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from 'path';
import mainRoute from "./routes/mainRoute.js";
import dbConnection from "./Model/dbConnect.js";
import cors from "cors";
// Reading .env file data
dotenv.config();
dbConnection.DBConnection();

const app = express();
const dirname = path.resolve();
app.use('/uploads', express.static(path.join(dirname, '/uploads')));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,            //access-control-allow-credentials:true
  optionSuccessStatus: 200
}
app.use(cors(corsOptions));
app.use("/", mainRoute);

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.PORT}🚀 `);
});

export default server;
