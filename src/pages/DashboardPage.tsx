import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Users, CheckCircle, Activity } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { useDashboardStore } from '@/stores/useDashboardStore';
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
export function DashboardPage() {
  const { stats, loading, fetchStats } = useDashboardStore();
  useEffect(() => {
    fetchStats();
    const intervalId = setInterval(fetchStats, 5000); // Poll every 5 seconds
    return () => clearInterval(intervalId);
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
          <Card className="shadow-sm">
            <CardHeader><CardTitle><Skeleton className="h-6 w-1/3" /></CardTitle></CardHeader>
            <CardContent><Skeleton className="w-full h-[300px]" /></CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader><CardTitle><Skeleton className="h-6 w-1/2" /></CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="flex justify-between mb-1">
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-5 w-1/4" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                </div>
                <div>
                    <div className="flex justify-between mb-1">
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-5 w-1/4" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title={tr.dashboardPage.statCards.callsMade} value={stats.callsMade.toLocaleString()} icon={Phone} />
        <StatCard title={tr.dashboardPage.statCards.connectionRate} value={`${stats.connectionRate}%`} icon={CheckCircle} />
        <StatCard title={tr.dashboardPage.statCards.activeAgents} value={stats.activeAgents.toString()} icon={Users} />
        <StatCard title={tr.dashboardPage.statCards.liveCampaigns} value={stats.liveCampaigns.toString()} icon={Activity} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{tr.dashboardPage.charts.callsOverTime}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.callsOverTime}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="calls" stroke="hsl(var(--brand-blue))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{tr.dashboardPage.charts.campaignProgress}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.campaignProgress.length > 0 ? stats.campaignProgress.map((campaign) => (
              <div key={campaign.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{campaign.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {campaign.dialed.toLocaleString()} / {campaign.total.toLocaleString()}
                  </span>
                </div>
                <Progress value={(campaign.dialed / campaign.total) * 100} className="h-3" />
              </div>
            )) : <p className="text-sm text-muted-foreground">{tr.dashboardPage.charts.noActiveCampaigns}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}