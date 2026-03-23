import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL ?? "";
const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash,
    },
  });

  const existingProduct = await prisma.product.findFirst({
    where: { name: "Apple Juice" },
  });

  if (!existingProduct) {
    await prisma.product.create({
      data: {
        productCode: "P001",
        name: "Apple Juice",
        metrics: {
          create: [
            {
              day: 1,
              inventory: 100,
              procurementQty: 20,
              procurementPrice: 3.5,
              salesQty: 10,
              salesPrice: 5.0,
            },
            {
              day: 2,
              inventory: 110,
              procurementQty: 15,
              procurementPrice: 3.8,
              salesQty: 12,
              salesPrice: 5.2,
            },
            {
              day: 3,
              inventory: 113,
              procurementQty: 10,
              procurementPrice: 4.0,
              salesQty: 8,
              salesPrice: 5.5,
            },
          ],
        },
      },
    });
  }

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });