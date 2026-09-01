import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDatabase } from "@/db";
import { foods } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDatabase();
    await db.execute(sql`SELECT 1`);

    let tkpi = false;
    try {
      const result = await db.select({ count: sql<number>`count(*)` }).from(foods);
      const count = Number(result[0]?.count ?? 0);
      tkpi = count > 0;
    } catch {
      tkpi = false;
    }

    return NextResponse.json(
      {
        status: "ok",
        database: "connected",
        tkpi,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        tkpi: false,
      },
      { status: 503 }
    );
  }
}
