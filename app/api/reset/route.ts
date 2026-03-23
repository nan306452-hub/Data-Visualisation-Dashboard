import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // delete child records first
    await prisma.dailyMetric.deleteMany();

    // then delete products
    await prisma.product.deleteMany();

    return NextResponse.json({
      message: "All product data has been reset.",
    });
  } catch (error) {
    console.error("Reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset data." },
      { status: 500 }
    );
  }
}