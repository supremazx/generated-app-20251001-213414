import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, DollarSign, Bot } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useResellerDashboardStore } from '@/stores/useResellerDashboardStore';
import { Skeleton } from '@/components/ui/skeleton';
import { tr } from '@/lib/locales/tr';
const StatCard = ({ title, value, icon: Icon }: { title: string, value: string, icon: React.ElementType }) => (
  <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300">
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
export function ResellerDashboardPage() {
  const { stats, loading, fetchStats } = useResellerDashboardStore();
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  if (loading || !stats) {
    return (
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-sm"><CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader><CardContent><Skeleton className="w-full h-[300px]" /></CardContent></Card>
          <Card className="shadow-sm"><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="w-full h-[300px]" /></CardContent></Card>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title={tr.resellerDashboardPage.statCards.totalClients} value={stats.totalClients.toLocaleString()} icon={Users} />
        <StatCard title={tr.resellerDashboardPage.statCards.activeClients} value={stats.activeClients.toLocaleString()} icon={UserCheck} />
        <StatCard title={tr.resellerDashboardPage.statCards.mrr} value={`$${stats.monthlyRecurringRevenue.toLocaleString()}`} icon={DollarSign} />
        <StatCard title={tr.resellerDashboardPage.statCards.totalAgents} value={stats.totalProvisionedAgents.toString()} icon={Bot} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader><CardTitle>{tr.resellerDashboardPage.charts.clientGrowth}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.clientGrowth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                <Line type="monotone" dataKey="count" name="Clients" stroke="hsl(var(--brand-blue))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader><CardTitle>{tr.resellerDashboardPage.charts.revenueOverTime}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.revenueOverTime}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `$${value}`} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} formatter={(value) => `$${value}`} />
                <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--brand-teal))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}