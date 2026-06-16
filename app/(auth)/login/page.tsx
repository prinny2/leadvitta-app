import { VisualAuthPanel } from "@/components/visual-auth-panel";
import { Card, CardBody } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md">
      <CardBody className="p-6 sm:p-8">
        <VisualAuthPanel mode="login" next="/dashboard" />
      </CardBody>
    </Card>
  );
}
