import express from "express";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";

const app = express();

app.get("/", (req, res) => res.send ("Hola desde el servidor"));

const startServer = async () => {
    try {
        await connectDB();
        app.listen(ENV.CLOUDINARY_API_SECRET, () => console.log("🚀🚀Servidor escucha en el puerto:", ENV.PORT));
    } catch (error) {
        console.log("Error al iniciar el servidor:", error.message);
        process.exit(1);
    }
};

startServer();



