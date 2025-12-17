import { z } from "zod";
import { db } from "~~/server/database";
import {
  chatsTable,
  InsertChat,
  InsertMessage,
  messagesTable,
} from "~~/server/database/schema";

import { generateText } from "ai";

const bodySchema = z.object({
  input: z.string().trim().min(1),
});

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { input } = await readValidatedBody(event, bodySchema.parse);

  const { text: title } = await generateText({
    model: "openai/gpt-4o-mini",
    system: "Generete a short title (max 30 chars)",
    prompt: JSON.stringify(input),
  });

  const newChat: InsertChat = {
    userId: user.id,
    title,
  };

  const [chat] = await db.insert(chatsTable).values(newChat).returning();

  if (!chat) {
    throw createError({
      statusCode: 500,
      statusMessage: "Could not create chat",
    });
  }

  const newMessage: InsertMessage = {
    chatId: chat.id,
    role: "user",
    parts: [{ type: "text", text: input }],
  };

  await db.insert(messagesTable).values(newMessage);

  return chat;
});
