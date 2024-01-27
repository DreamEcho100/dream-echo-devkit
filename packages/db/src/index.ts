import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import * as auth from "./schema/auth";
import * as post from "./schema/post";

export const schema = { ...auth, ...post };

export { mySqlTable as tableCreator } from "./schema/_table";

export * from "drizzle-orm";

const connection = mysql.createPool({
  host: process.env.DB_HOST!,
  user: process.env.DB_USERNAME!,
	password: process.env.DB_PASSWORD!,
	database: process.env.DB_DATABASE!,
});
// DrizzleTypeError<"Seems like the schema generic is missing - did you forget to add it to your DB type?">.$drizzleTypeError: "Seems like the schema generic is missing - did you forget to add it to your DB type?"
export const db = drizzle(connection, {
  schema: schema,
  logger: process.env.NODE_ENV !== "production",
  mode: "default",
});
