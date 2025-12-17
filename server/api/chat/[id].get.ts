import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~~/server/database";
import { chatsTable, messagesTable } from "~~/server/database/schema";

const paramsSchema = z.object({
  id: z.string(),
});

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const { id } = await getValidatedRouterParams(event, paramsSchema.parse);

  const [chat] = await db
    .select()
    .from(chatsTable)
    .where(and(eq(chatsTable.id, id), eq(chatsTable.userId, user.id)));

  if (!chat) {
    throw createError({
      statusCode: 404,
      statusMessage: "Chat not found",
    });
  }

  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.chatId, chat.id))
    .orderBy(messagesTable.createdAt);

  return {
    messages,
    chat,
  };
});
