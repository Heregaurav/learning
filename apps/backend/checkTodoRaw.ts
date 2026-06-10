import { prismaClient } from "db/client";

(async () => {
  try {
    console.log("Running raw SQL: SELECT * FROM \"Todo\" LIMIT 5");
    const rows: any = await prismaClient.$queryRawUnsafe('SELECT * FROM "Todo" LIMIT 5');
    console.log("Rows:", rows);
    await prismaClient.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Raw DB query failed:", err);
    try { await prismaClient.$disconnect(); } catch {}
    process.exit(1);
  }
})();
