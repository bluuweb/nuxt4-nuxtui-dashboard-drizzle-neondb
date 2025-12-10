import { registerZodSchema } from "#shared/zod/register.schema";
import { eq } from "drizzle-orm";
import { db } from "~~/server/database";
import type { InsertUser } from "~~/server/database/schema";
import { usersTable } from "~~/server/database/schema";

export default eventHandler(async (event) => {
  const { email, password, username } = await readValidatedBody(
    event,
    registerZodSchema.parse
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

  // Buscando si el nombre de usuario ya existe en la base de datos
  const [existingUsername] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));

  if (existingUsername) {
    throw createError({
      statusCode: 400,
      statusMessage: "Username is already taken",
    });
  }

  // hash de la contraseña
  const hashedPassword = await hashPassword(password);

  // insertar el nuevo usuario en la base de datos
  const newUser: InsertUser = {
    email,
    username,
    password: hashedPassword,
  };

  await db.insert(usersTable).values(newUser);

  return {
    message: "User registered successfully",
  };
});
