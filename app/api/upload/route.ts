import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { parse } from "csv-parse/sync";

type UploadRow = {
  ID?: string;
  "Product Name"?: string;
  "Opening Inventory"?: string | number;
  "Procurement Qty (Day 1)"?: string | number;
  "Procurement Price (Day 1)"?: string | number;
  "Procurement Qty (Day 2)"?: string | number;
  "Procurement Price (Day 2)"?: string | number;
  "Procurement Qty (Day 3)"?: string | number;
  "Procurement Price (Day 3)"?: string | number;
  "Sales Qty (Day 1)"?: string | number;
  "Sales Price (Day 1)"?: string | number;
  "Sales Qty (Day 2)"?: string | number;
  "Sales Price (Day 2)"?: string | number;
  "Sales Qty (Day 3)"?: string | number;
  "Sales Price (Day 3)"?: string | number;
};

function toNumber(value: string | number | undefined): number {
  if (value === undefined || value === null || value === "") return 0;
  if (typeof value === "number") return value;

  const cleaned = String(value).replace(/[$,]/g, "").trim();
  const num = Number(cleaned);
  return Number.isNaN(num) ? 0 : num;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    let rows: UploadRow[] = [];

    if (fileName.endsWith(".xlsx")) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const workbook = XLSX.read(buffer, { type: "buffer" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      rows = XLSX.utils.sheet_to_json<UploadRow>(worksheet, {
        defval: "",
      });
    } else if (fileName.endsWith(".csv")) {
      const text = await file.text();
      rows = parse(text, {
        columns: true,
        skip_empty_lines: true,
      }) as UploadRow[];
    } else {
      return NextResponse.json(
        { error: "Only .csv and .xlsx files are supported." },
        { status: 400 }
      );
    }

    let processedProducts = 0;
    let createdMetricRows = 0;
    let updatedMetricRows = 0;

    for (const row of rows) {
      const productName = row["Product Name"]?.toString().trim();
      const productCode = row["ID"]?.toString().trim();

      if (!productName || !productCode) {
        continue;
      }

      processedProducts += 1;

      const openingInventory = toNumber(row["Opening Inventory"]);

      const product = await prisma.product.upsert({
        where: { productCode },
        update: {
          name: productName,
        },
        create: {
          name: productName,
          productCode,
        },
      });

      const day1Exists = await prisma.dailyMetric.findUnique({
        where: {
          productId_day: {
            productId: product.id,
            day: 1,
          },
        },
      });

      await prisma.dailyMetric.upsert({
        where: {
          productId_day: {
            productId: product.id,
            day: 1,
          },
        },
        update: {
          inventory: openingInventory,
          procurementQty: toNumber(row["Procurement Qty (Day 1)"]),
          procurementPrice: toNumber(row["Procurement Price (Day 1)"]),
          salesQty: toNumber(row["Sales Qty (Day 1)"]),
          salesPrice: toNumber(row["Sales Price (Day 1)"]),
        },
        create: {
          day: 1,
          inventory: openingInventory,
          procurementQty: toNumber(row["Procurement Qty (Day 1)"]),
          procurementPrice: toNumber(row["Procurement Price (Day 1)"]),
          salesQty: toNumber(row["Sales Qty (Day 1)"]),
          salesPrice: toNumber(row["Sales Price (Day 1)"]),
          productId: product.id,
        },
      });

      if (day1Exists) {
        updatedMetricRows += 1;
      } else {
        createdMetricRows += 1;
      }

      const day2Inventory =
        openingInventory +
        toNumber(row["Procurement Qty (Day 1)"]) -
        toNumber(row["Sales Qty (Day 1)"]);

      const day2Exists = await prisma.dailyMetric.findUnique({
        where: {
          productId_day: {
            productId: product.id,
            day: 2,
          },
        },
      });

      await prisma.dailyMetric.upsert({
        where: {
          productId_day: {
            productId: product.id,
            day: 2,
          },
        },
        update: {
          inventory: day2Inventory,
          procurementQty: toNumber(row["Procurement Qty (Day 2)"]),
          procurementPrice: toNumber(row["Procurement Price (Day 2)"]),
          salesQty: toNumber(row["Sales Qty (Day 2)"]),
          salesPrice: toNumber(row["Sales Price (Day 2)"]),
        },
        create: {
          day: 2,
          inventory: day2Inventory,
          procurementQty: toNumber(row["Procurement Qty (Day 2)"]),
          procurementPrice: toNumber(row["Procurement Price (Day 2)"]),
          salesQty: toNumber(row["Sales Qty (Day 2)"]),
          salesPrice: toNumber(row["Sales Price (Day 2)"]),
          productId: product.id,
        },
      });

      if (day2Exists) {
        updatedMetricRows += 1;
      } else {
        createdMetricRows += 1;
      }

      const day3Inventory =
        day2Inventory +
        toNumber(row["Procurement Qty (Day 2)"]) -
        toNumber(row["Sales Qty (Day 2)"]);

      const day3Exists = await prisma.dailyMetric.findUnique({
        where: {
          productId_day: {
            productId: product.id,
            day: 3,
          },
        },
      });

      await prisma.dailyMetric.upsert({
        where: {
          productId_day: {
            productId: product.id,
            day: 3,
          },
        },
        update: {
          inventory: day3Inventory,
          procurementQty: toNumber(row["Procurement Qty (Day 3)"]),
          procurementPrice: toNumber(row["Procurement Price (Day 3)"]),
          salesQty: toNumber(row["Sales Qty (Day 3)"]),
          salesPrice: toNumber(row["Sales Price (Day 3)"]),
        },
        create: {
          day: 3,
          inventory: day3Inventory,
          procurementQty: toNumber(row["Procurement Qty (Day 3)"]),
          procurementPrice: toNumber(row["Procurement Price (Day 3)"]),
          salesQty: toNumber(row["Sales Qty (Day 3)"]),
          salesPrice: toNumber(row["Sales Price (Day 3)"]),
          productId: product.id,
        },
      });

      if (day3Exists) {
        updatedMetricRows += 1;
      } else {
        createdMetricRows += 1;
      }
    }

    return NextResponse.json({
      message: "Upload successful",
      processedProducts,
      createdMetricRows,
      updatedMetricRows,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}