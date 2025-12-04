import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~~/server/database";
import type { InsertUser } from "~~/server/database/schema";
import { usersTable } from "~~/server/database/schema";

const bodySchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(6),
  name: z.string().min(2).max(100).trim(),
});

export default eventHandler(async (event) => {
  const { email, password, name } = await readValidatedBody(
    event,
    bodySchema.parse
  );

  // buscar si el usuario ya existe en la base de datos
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (user) {
    throw createError({
      statusCode: 400,
      statusMessage: "User already exists with this email",
    });
  }

  // hash de la contraseña
  const hashedPassword = await hashPassword(password);

  // insertar el nuevo usuario en la base de datos
  const newUser: InsertUser = {
    email,
    name,
    password: hashedPassword,
  };

  await db.insert(usersTable).values(newUser);

  return {
    message: "User registered successfully",
  };
});
