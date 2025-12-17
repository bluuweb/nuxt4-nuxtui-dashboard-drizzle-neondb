import { desc, eq } from "drizzle-orm";
import { db } from "~~/server/database";
import { chatsTable } from "~~/server/database/schema";

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const chats = await db
    .select()
    .from(chatsTable)
    .where(eq(chatsTable.userId, user.id))
    .orderBy(desc(chatsTable.createdAt));

  return chats;
});
