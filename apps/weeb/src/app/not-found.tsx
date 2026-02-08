import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="text-6xl font-bold">404</div>
        <p className="mt-3 text-zinc-400">Kjo faqe nuk ekziston.</p>
        <div className="mt-6 flex justify-center">
          <Link href="/">
            <Button>Kthehu në Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
