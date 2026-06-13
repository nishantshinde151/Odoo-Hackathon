import dotenv from 'dotenv';
dotenv.config();

export const databaseConfig = {
  url: process.env.DATABASE_URL,
};
