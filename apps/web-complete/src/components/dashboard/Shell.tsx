import { ReactNode } from "react";
import { Nav } from "@/components/dashboard/Nav";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-0 noise opacity-[0.35]" />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Nav />
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
