import { Suspense } from "react";
import { PublicShell } from "@/components/public-shell";
import { ResetPasswordForm } from "@/components/forms";
import { Card } from "@/components/ui";

export default function Page() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-lg">
        <Card>
          <Suspense fallback={<p className="text-sm text-muted">Duke ngarkuar...</p>}>
            <ResetPasswordForm />
          </Suspense>
        </Card>
      </div>
    </PublicShell>
  );
}
