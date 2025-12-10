import { profileZodSchema } from "#shared/zod/profile.schema";
import { eq } from "drizzle-orm";
import { db } from "~~/server/database";
import { usersTable } from "~~/server/database/schema";

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const { username, bio, name } = await readValidatedBody(
    event,
    profileZodSchema.parse
  );

  // validar username
  const [existingUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));

  if (existingUser && existingUser.id !== user.id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Username is already taken",
    });
  }

  // actualizar el perfil del usuario
  await db
    .update(usersTable)
    .set({
      username,
      bio,
      name,
    })
    .where(eq(usersTable.id, user.id));

  return { message: "Profile updated successfully" };
});
