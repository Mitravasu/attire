import { PageLayout } from "app/layouts/PageLayout";
import { Card } from "components/ui/Card";
import { EmptyState } from "components/feedback/EmptyState";

export function LoginPage() {
  return (
    <PageLayout
      title="Login"
      description="Authentication is intentionally deferred until the core product screens are implemented."
    >
      <Card title="Auth Deferred">
        <EmptyState
          title="Login screen placeholder"
          description="This route exists now so auth can be integrated later without restructuring the app shell."
        />
      </Card>
    </PageLayout>
  );
}

