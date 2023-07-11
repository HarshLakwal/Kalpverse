import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mainRoute from "./routes/mainRoute.js";
import dbConnection from "./Model/dbConnect.js";
import cors from "cors";
// Reading .env file data
dotenv.config();
dbConnection.DBConnection();

const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", mainRoute);
app.use(cors(corsOptions));

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.PORT}🚀 `);
});

export default server;
