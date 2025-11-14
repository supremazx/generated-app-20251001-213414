import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useResellerBillingStore } from '@/stores/useResellerBillingStore';
import { DollarSign, Download, TrendingUp, Users } from 'lucide-react';
import { tr } from '@/lib/locales/tr';
import type { ResellerInvoice } from '@shared/types';
const StatCard = ({ title, value, icon: Icon }: { title: string, value: string, icon: React.ElementType }) => (
  <Card className="shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
    </CardContent>
  </Card>
);
const StatCardSkeleton = () => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-5 w-5" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-8 w-1/2" />
        </CardContent>
    </Card>
);
const statusColors: Record<ResellerInvoice['status'], string> = {
  Paid: "bg-green-500",
  Due: "bg-yellow-500",
  Overdue: "bg-red-500",
};
export function ResellerBillingPage() {
  const { billingInfo, loading, fetchBillingInfo } = useResellerBillingStore();
  useEffect(() => {
    fetchBillingInfo();
  }, [fetchBillingInfo]);
  if (loading || !billingInfo) {
    return (
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-3">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-2">{tr.resellerBillingPage.overview}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard title={tr.resellerBillingPage.statCards.totalRevenue} value={`$${billingInfo.totalRevenue.toLocaleString()}`} icon={DollarSign} />
          <StatCard title={tr.resellerBillingPage.statCards.activeSubscriptions} value={billingInfo.activeSubscriptions.toLocaleString()} icon={Users} />
          <StatCard title={tr.resellerBillingPage.statCards.mrr} value={`$${billingInfo.monthlyRecurringRevenue.toLocaleString()}`} icon={TrendingUp} />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{tr.resellerBillingPage.invoiceHistory.title}</CardTitle>
          <CardDescription>{tr.resellerBillingPage.invoiceHistory.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tr.resellerBillingPage.invoiceHistory.invoiceId}</TableHead>
                <TableHead>{tr.resellerBillingPage.invoiceHistory.clientName}</TableHead>
                <TableHead>{tr.resellerBillingPage.invoiceHistory.date}</TableHead>
                <TableHead>{tr.resellerBillingPage.invoiceHistory.amount}</TableHead>
                <TableHead>{tr.resellerBillingPage.invoiceHistory.status}</TableHead>
                <TableHead className="text-right">{tr.resellerBillingPage.invoiceHistory.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingInfo.invoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.clientName}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[invoice.status]} hover:${statusColors[invoice.status]}`}>
                      {tr.resellerBillingPage.status[invoice.status.toLowerCase() as keyof typeof tr.resellerBillingPage.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      {tr.resellerBillingPage.invoiceHistory.download}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}