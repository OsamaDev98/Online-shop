import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import path from "path";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const dbUrl = process.env.DATABASE_URL || "file:./dev.db";

// حل المسار النسبي لقاعدة البيانات إلى مسار مطلق لضمان ثبات الاتصال في Next.js
let finalDbUrl = dbUrl;
if (dbUrl.startsWith("file:")) {
  const relativePath = dbUrl.replace("file:", "");
  if (!path.isAbsolute(relativePath)) {
    const absolutePath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), relativePath);
    finalDbUrl = `file:${absolutePath}`;
  }
}

// إنشاء اتصال قاعدة البيانات باستخدام خيارات المحول في Prisma 7
const adapter = new PrismaBetterSqlite3({ url: finalDbUrl });

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
