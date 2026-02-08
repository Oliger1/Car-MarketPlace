import { forward } from "@/app/api/_proxy";
import type { NextRequest } from "next/server";

export async function DELETE(req: NextRequest, ctx: { params: { id: string; photo_id: string } }) {
  return forward(req, `/api/cars/${ctx.params.id}/photos/${ctx.params.photo_id}`);
}
