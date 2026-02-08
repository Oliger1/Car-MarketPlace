import { forward } from "@/app/api/_proxy";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest, ctx: { params: { slug: string } }) {
  return forward(req, `/api/public/company/${ctx.params.slug}/cars`);
}
