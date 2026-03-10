import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, `.env.${process.env.NODE_ENV || 'development'}`) });

export const PORT = process.env.PORT || 3000;
export const DB_URL = process.env.MONGO_URI;
export const SECRET_KEY = process.env.JWT_SECRET;