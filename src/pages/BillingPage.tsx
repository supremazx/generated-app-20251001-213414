import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBillingStore } from '@/stores/useBillingStore';
import { Clock, DollarSign, Calendar, Download, TrendingUp, ChevronsUp, Wallet, Timer, PhoneForwarded } from 'lucide-react';
import { tr } from '@/lib/locales/tr';
const StatCard = ({ title, value, icon: Icon, description }: { title: string, value: string, icon: React.ElementType, description?: string }) => (
  <Card className="shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
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
            <Skeleton className="h-3 w-1/3 mt-1" />
        </CardContent>
    </Card>
);
export function BillingPage() {
  const { billingInfo, loading, fetchBillingInfo } = useBillingStore();
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
  const nextInvoiceAmount = (billingInfo.currentUsageMinutes * billingInfo.pricePerMinute).toFixed(2);
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-2">{tr.billingPage.usageOverview}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard title={tr.billingPage.statCards.currentUsage} value={`${billingInfo.currentUsageMinutes.toLocaleString()} min`} icon={Clock} />
          <StatCard title={tr.billingPage.statCards.nextInvoice} value={`$${nextInvoiceAmount}`} icon={DollarSign} description={`$${billingInfo.pricePerMinute.toFixed(4)}${tr.billingPage.statCards.pricePerMinute}`} />
          <StatCard title={tr.billingPage.statCards.cycleEnds} value={billingInfo.cycleEndDate} icon={Calendar} />
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">{tr.billingPage.profitabilityAnalysis.title}</h2>
        <Card>
            <CardContent className="pt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                        <Wallet className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{tr.billingPage.profitabilityAnalysis.aiServiceCost}</p>
                        <p className="text-xl font-bold">${billingInfo.aiServiceCostPerMinute.toFixed(4)}{tr.billingPage.profitabilityAnalysis.perMinute}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400">
                        <PhoneForwarded className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{tr.billingPage.profitabilityAnalysis.sipCost}</p>
                        <p className="text-xl font-bold">${billingInfo.sipCostPerMinute.toFixed(4)}{tr.billingPage.profitabilityAnalysis.perMinute}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">
                        <ChevronsUp className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{tr.billingPage.profitabilityAnalysis.profitMargin}</p>
                        <p className="text-xl font-bold">${billingInfo.profitPerMinute.toFixed(4)}{tr.billingPage.profitabilityAnalysis.perMinute}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{tr.billingPage.profitabilityAnalysis.totalProfit}</p>
                        <p className="text-xl font-bold">${billingInfo.totalProfit.toFixed(2)}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                        <Timer className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{tr.billingPage.profitabilityAnalysis.costPerMs}</p>
                        <p className="text-xl font-bold">${billingInfo.costUsdPerMs.toFixed(8)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{tr.billingPage.history.title}</CardTitle>
          <CardDescription>{tr.billingPage.history.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tr.billingPage.history.invoiceId}</TableHead>
                <TableHead>{tr.billingPage.history.date}</TableHead>
                <TableHead>{tr.billingPage.history.amount}</TableHead>
                <TableHead>{tr.billingPage.history.status}</TableHead>
                <TableHead className="text-right">{tr.billingPage.history.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingInfo.history.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>${item.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'Paid' ? 'default' : 'destructive'} className={item.status === 'Paid' ? 'bg-green-500' : ''}>
                      {item.status === 'Paid' ? tr.billingPage.history.paid : item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      {tr.billingPage.history.download}
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