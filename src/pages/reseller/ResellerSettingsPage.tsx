import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export function ResellerSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reseller Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Configuration for reseller branding, pricing models, and API integrations will be available here in a future update.
        </p>
      </CardContent>
    </Card>
  );
}