import { prismaClient } from "db/client";

(async () => {
  try {
    console.log("(backend) Connecting to DB and running a test query...");
    const users = await prismaClient.user.findMany();
    console.log("(backend) Success: found users:", users);
    await prismaClient.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error("(backend) DB check failed:", err);
    try {
      await prismaClient.$disconnect();
    } catch {}
    process.exit(1);
  }
})();
