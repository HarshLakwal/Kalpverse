import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from 'path';
import mainRoute from "./routes/mainRoute.js";
import dbConnection from "./Model/dbConnect.js";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Reading .env file data
dotenv.config();
dbConnection.DBConnection();

const app = express();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
const corsOptions = {
  origin: '*',
  credentials: true,            //access-control-allow-credentials:true
  optionSuccessStatus: 200
}
app.use(express.static(path.resolve(__dirname, "build")));
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "build", "index.html"));
});
app.use(cors(corsOptions));
app.use("/", mainRoute);

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.PORT}🚀 `);
});

export default server;

