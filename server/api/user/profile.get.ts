import { eq } from "drizzle-orm";
import { db } from "~~/server/database";
import { usersTable } from "~~/server/database/schema";

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  // buscar el usuario en la base de datos
  const [userProfile] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, user.id));

  if (!userProfile) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  return {
    id: userProfile.id,
    email: userProfile.email,
    name: userProfile.name,
    username: userProfile.username,
    bio: userProfile.bio,
    avatarUrl: userProfile.avatarUrl,
  };
});
