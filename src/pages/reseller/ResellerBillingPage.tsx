import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export function ResellerBillingPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reseller Billing</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Reseller-specific billing and invoicing features will be available here in a future update.
        </p>
      </CardContent>
    </Card>
  );
}