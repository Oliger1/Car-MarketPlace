import { forward } from "@/app/api/_proxy";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest, ctx: { params: { id: string } }) {
  return forward(req, `/api/cars/${ctx.params.id}`);
}
export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  return forward(req, `/api/cars/${ctx.params.id}`);
}
export async function DELETE(req: NextRequest, ctx: { params: { id: string } }) {
  return forward(req, `/api/cars/${ctx.params.id}`);
}
