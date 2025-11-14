import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserDashboardStore } from '@/stores/useUserDashboardStore';
import { DollarSign, Bot, Phone, Timer, KeyRound, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChangePasswordDialog } from '@/components/ChangePasswordDialog';
import { tr } from '@/lib/locales/tr';
const InfoCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
  <div className="flex items-center space-x-4">
    <div className="p-3 rounded-full bg-muted text-muted-foreground">
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  </div>
);
const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};
export function UserDashboardPage() {
  const { userInfo, loading, fetchUserInfo } = useUserDashboardStore();
  const [isPasswordDialogOpen, setPasswordDialogOpen] = useState(false);
  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);
  if (loading || !userInfo) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-64" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-10 w-1/2" />
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <>
      <div className="space-y-8 max-w-4xl mx-auto">
        <Card className="overflow-hidden shadow-lg">
          <div className="bg-muted/20 p-8">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 border-4 border-background">
                <AvatarImage src={`https://i.pravatar.cc/150?u=${userInfo.userEmail}`} />
                <AvatarFallback className="text-2xl">{userInfo.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold font-display">{userInfo.userName}</h1>
                <p className="text-lg text-muted-foreground">{userInfo.userEmail}</p>
              </div>
              <Button variant="outline" className="ml-auto" onClick={() => setPasswordDialogOpen(true)}>
                <KeyRound className="mr-2 h-4 w-4" />
                {tr.userDashboardPage.changePassword}
              </Button>
            </div>
          </div>
          <CardContent className="p-8 space-y-6">
            <div className="text-center bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 p-6 rounded-lg">
              <p className="text-lg font-medium">{tr.userDashboardPage.accountBalance}</p>
              <p className="text-5xl font-bold tracking-tight flex items-center justify-center">
                <DollarSign className="h-10 w-10 mr-2" />
                {userInfo.accountBalance.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{tr.userDashboardPage.availableFunds}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
              <CardTitle>{tr.userDashboardPage.usageStatistics.title}</CardTitle>
              <CardDescription>{tr.userDashboardPage.usageStatistics.description}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8 md:grid-cols-3 pt-2">
              <InfoCard title={tr.userDashboardPage.usageStatistics.aiMinutes} value={`${userInfo.totalAiMinutesUsed.toLocaleString()} min`} icon={Bot} />
              <InfoCard title={tr.userDashboardPage.usageStatistics.callsMade} value={userInfo.totalCallsMade.toLocaleString()} icon={Phone} />
              <InfoCard title={tr.userDashboardPage.usageStatistics.avgCallDuration} value={formatDuration(userInfo.averageCallDuration)} icon={Timer} />
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>{tr.userDashboardPage.aiCostAnalysis.title}</CardTitle>
                <CardDescription>{tr.userDashboardPage.aiCostAnalysis.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
                <div className="flex items-center space-x-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                        <TrendingUp className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{tr.userDashboardPage.aiCostAnalysis.estimatedCost}</p>
                        <p className="text-3xl font-bold">${userInfo.aiCostThisCycle.toFixed(2)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
      <ChangePasswordDialog open={isPasswordDialogOpen} onOpenChange={setPasswordDialogOpen} />
    </>
  );
}