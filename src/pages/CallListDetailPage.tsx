import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCallListStore } from '@/stores/useCallListStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Target, Phone, Percent } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
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
export function CallListDetailPage() {
  const { callListId } = useParams<{ callListId: string }>();
  const navigate = useNavigate();
  const { selectedCallList, fetchCallListById, loading } = useCallListStore();
  useEffect(() => {
    if (callListId) {
      fetchCallListById(callListId);
    }
  }, [callListId, fetchCallListById]);
  if (loading || !selectedCallList) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
          <CardContent><Skeleton className="h-24 w-full" /></CardContent>
        </Card>
      </div>
    );
  }
  const dialedPercentage = selectedCallList.totalLeads > 0
    ? ((selectedCallList.dialedLeads / selectedCallList.totalLeads) * 100).toFixed(1)
    : '0.0';
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/call-lists')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-display">{selectedCallList.name}</h1>
          <p className="text-sm text-muted-foreground">Uploaded on {new Date(selectedCallList.uploadedAt).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Leads" value={selectedCallList.totalLeads.toLocaleString()} icon={Target} />
        <StatCard title="Dialed Leads" value={selectedCallList.dialedLeads.toLocaleString()} icon={Phone} />
        <StatCard title="Dialed Percentage" value={`${dialedPercentage}%`} icon={Percent} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Dialing Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-2 text-sm text-muted-foreground">
            <span>{selectedCallList.dialedLeads.toLocaleString()} dialed</span>
            <span>{selectedCallList.totalLeads.toLocaleString()} total</span>
          </div>
          <Progress value={parseFloat(dialedPercentage)} className="h-4" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-center text-muted-foreground">
            A detailed view of individual leads will be available in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}