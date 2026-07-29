import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
// import postRoute from "./routes/post.routes.js"; // pendiente de crear

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// app.use("/", postRoute);

export default app;
