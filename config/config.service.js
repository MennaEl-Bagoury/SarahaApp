import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, `.env.${process.env.NODE_ENV || 'development'}`) });

export const PORT = process.env.PORT || 3000;
export const DB_URL = process.env.MONGO_ONLINE_URI || process.env.MONGO_URI;
export const SECRET_KEY = process.env.JWT_SECRET;
export const REDIS_URL = process.env.REDIS_URL;
export const EMAIL = process.env.EMAIL;
export const PASSWORD = process.env.PASSWORD;
export const CLOUD_NAME = process.env.CLOUD_NAME;
export const API_KEY = process.env.API_KEY;
export const API_SECRET = process.env.API_SECRET;