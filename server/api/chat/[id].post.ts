import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  UIMessage,
} from "ai";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { db } from "~~/server/database";
import {
  chatsTable,
  InsertMessage,
  messagesTable,
} from "~~/server/database/schema";

const bodySchema = z.object({
  model: z.string().trim().min(1),
  messages: z.array(z.custom<UIMessage>()),
});

const paramsSchema = z.object({
  id: z.string(),
});

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const { messages, model } = await readValidatedBody(event, bodySchema.parse);
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

  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role === "user" && messages.length > 1) {
    const userMessage: InsertMessage = {
      chatId: chat.id,
      role: "user",
      parts: lastMessage.parts,
    };
    await db.insert(messagesTable).values(userMessage);
  }

  const stream = createUIMessageStream({
    execute({ writer }) {
      const result = streamText({
        model,
        maxOutputTokens: 10000,
        system: "You are a helpful assistant.",
        messages: convertToModelMessages(messages),
        stopWhen: stepCountIs(5),
      });

      writer.merge(
        result.toUIMessageStream({
          sendReasoning: true,
        })
      );
    },
    onFinish: async ({ messages }) => {
      await db.insert(messagesTable).values(
        messages.map((msg) => ({
          chatId: chat.id,
          role: msg.role,
          parts: msg.parts,
        }))
      );
    },
  });

  return createUIMessageStreamResponse({
    stream,
  });
});
