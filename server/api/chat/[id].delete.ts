import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~~/server/database";
import { chatsTable } from "~~/server/database/schema";

const paramsSchema = z.object({
  id: z.string(),
});

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const { id } = await getValidatedRouterParams(event, paramsSchema.parse);

  return await db
    .delete(chatsTable)
    .where(and(eq(chatsTable.id, id), eq(chatsTable.userId, user.id)))
    .returning();
});
