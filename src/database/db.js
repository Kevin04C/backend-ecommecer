import { createPool } from "mysql2";
import * as dotenv from "dotenv";
dotenv.config();

export const connection = createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});
