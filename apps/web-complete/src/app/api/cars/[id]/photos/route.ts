import { forward } from "@/app/api/_proxy";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest, ctx: { params: { id: string } }) {
  return forward(req, `/api/cars/${ctx.params.id}/photos`);
}
