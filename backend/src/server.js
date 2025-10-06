import express from "express";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";

const app = express();

connectDB();

app.get("/", (req, res) => res.send ("Hola desde el servidor"));

app.listen(ENV.PORT, () => console.log("🚀 Servidor escucha en el puerto", ENV.PORT));
