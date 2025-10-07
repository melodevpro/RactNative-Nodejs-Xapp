import express from "express";
import cors from "cors";
import {clerkMiddleware} from "@clerk/express";

import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";

import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.get("/", (req, res) => res.send ("Hola desde el servidor"));

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
});

const startServer = async () => {
    try {
        await connectDB();
        app.listen(ENV.PORT, () => console.log("🚀🚀Servidor escucha en el puerto:", ENV.PORT));
    } catch (error) {
        console.log("Error al iniciar el servidor:", error.message);
        process.exit(1);
    }
};

startServer();



