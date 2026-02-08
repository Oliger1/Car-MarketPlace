import { forward } from "@/app/api/_proxy";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  const p = ctx.params.path.join("/");
  return forward(req, `/api/files/${p}`);
}
