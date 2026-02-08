import { forward } from "@/app/api/_proxy";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return forward(req, "/api/billing/plans");
}

export async function POST(req: NextRequest) {
  return forward(req, "/api/billing/plans");
}

export async function PATCH(req: NextRequest) {
  return forward(req, "/api/billing/plans");
}

export async function DELETE(req: NextRequest) {
  return forward(req, "/api/billing/plans");
}
