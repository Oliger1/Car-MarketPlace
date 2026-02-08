import { forward } from "@/app/api/_proxy";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return forward(req, "/api/auth/register");
}

export async function POST(req: NextRequest) {
  return forward(req, "/api/auth/register");
}

export async function PATCH(req: NextRequest) {
  return forward(req, "/api/auth/register");
}

export async function DELETE(req: NextRequest) {
  return forward(req, "/api/auth/register");
}
