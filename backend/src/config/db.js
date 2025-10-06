import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
    try {
        await mongoose.connect(ENV.MONGO_URI)
        console.log("Conectado a DB MONGODB 🚀 🚀");

    } catch (error) {
        console.log("Error al conectarse a MONGODB");
        process.exit(1);
    }
}