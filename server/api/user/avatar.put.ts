import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { db } from "~~/server/database";
import { usersTable } from "~~/server/database/schema";

import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const parts = await readMultipartFormData(event);
  const file = parts?.find((p: any) => p.type?.startsWith("image/"));

  if (!file) {
    throw createError({ statusCode: 400, statusMessage: "No image uploaded" });
  }

  // obtener buffer (h3/nitro puede exponer _data, data o buffer)
  const data =
    (file as any)._data ?? (file as any).data ?? (file as any).buffer;
  if (!data) {
    throw createError({ statusCode: 400, statusMessage: "Invalid file data" });
  }
  const buffer = Buffer.from(data);

  // validaciones básicas de tamaño
  const MAX_BYTES = 2 * 1024 * 1024; // 2 MB (ajusta según necesites)
  if (buffer.length > MAX_BYTES) {
    throw createError({ statusCode: 413, statusMessage: "File too large" });
  }

  // detectar tipo real desde buffer
  const ft = await fileTypeFromBuffer(buffer);
  const mime = ft?.mime ?? (file as any).type;
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!mime || !allowed.includes(mime)) {
    throw createError({
      statusCode: 415,
      statusMessage: "Unsupported image type",
    });
  }

  // buscar usuario existente para borrar avatar anterior si corresponde
  const [existingUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, user.id))
    .limit(1);
  if (!existingUser) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  // procesar imagen: 500x500, cover (recorta centrado), convertir a jpg y bajar calidad
  const processedBuffer = await sharp(buffer)
    .rotate() // auto-rotate según EXIF
    .resize(500, 500, { fit: "cover", position: "centre" })
    .jpeg({ quality: 75 })
    .toBuffer();

  // carpeta pública para servir archivos
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
  await fs.mkdir(uploadsDir, { recursive: true });

  // eliminar avatar anterior si está en nuestra carpeta pública
  if (
    existingUser.avatarUrl &&
    typeof existingUser.avatarUrl === "string" &&
    existingUser.avatarUrl.startsWith("/uploads/avatars/")
  ) {
    try {
      const prevPath = path.join(
        process.cwd(),
        "public",
        existingUser.avatarUrl.replace(/^\//, "")
      );
      await fs.unlink(prevPath).catch(() => null);
    } catch {
      // ignorar errores de borrado
    }
  }

  const filename = `${user.id}-${Date.now()}-${randomUUID()}.jpg`;
  const filePath = path.join(uploadsDir, filename);
  await fs.writeFile(filePath, processedBuffer);

  const url = `/uploads/avatars/${filename}`;

  // actualizar la DB: solo un avatar por usuario (se sobreescribe)
  await db
    .update(usersTable)
    .set({ avatarUrl: url })
    .where(eq(usersTable.id, user.id));

  return { url };
});
