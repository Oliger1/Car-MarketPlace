import { PublicShell } from "@/components/public-shell";
import { ForgotPasswordForm } from "@/components/forms";
import { Card } from "@/components/ui";

export default function Page() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-lg"><Card><ForgotPasswordForm /></Card></div>
    </PublicShell>
  );
}
