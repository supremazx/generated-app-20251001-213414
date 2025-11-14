import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCampaignStore } from '@/stores/useCampaignStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, CheckCircle, Percent, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CampaignStatus } from '@shared/types';
const statusColors: Record<CampaignStatus, string> = {
  Active: "bg-green-500 hover:bg-green-600",
  Paused: "bg-yellow-500 hover:bg-yellow-600",
  Completed: "bg-blue-500 hover:bg-blue-600",
  Draft: "bg-gray-500 hover:bg-gray-600",
};
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
export function CampaignDetailPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const { selectedCampaign, fetchCampaignById, loading } = useCampaignStore();
  useEffect(() => {
    if (campaignId) {
      fetchCampaignById(campaignId);
    }
  }, [campaignId, fetchCampaignById]);
  if (loading || !selectedCampaign) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCardSkeleton />
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
  const connectionRate = selectedCampaign.dialedLeads > 0 
    ? ((selectedCampaign.connections / selectedCampaign.dialedLeads) * 100).toFixed(1)
    : '0.0';
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/campaigns')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-display">{selectedCampaign.name}</h1>
          <Badge className={statusColors[selectedCampaign.status]}>{selectedCampaign.status}</Badge>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Leads" value={selectedCampaign.totalLeads.toLocaleString()} icon={Target} />
        <StatCard title="Dialed Leads" value={selectedCampaign.dialedLeads.toLocaleString()} icon={Phone} />
        <StatCard title="Connections" value={selectedCampaign.connections.toLocaleString()} icon={CheckCircle} />
        <StatCard title="Connection Rate" value={`${connectionRate}%`} icon={Percent} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Campaign Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-2 text-sm text-muted-foreground">
            <span>{selectedCampaign.dialedLeads.toLocaleString()} dialed</span>
            <span>{selectedCampaign.totalLeads.toLocaleString()} total</span>
          </div>
          <Progress value={(selectedCampaign.dialedLeads / selectedCampaign.totalLeads) * 100} className="h-4" />
        </CardContent>
      </Card>
      {/* Placeholder for more detailed charts or tables */}
      <Card>
        <CardHeader>
          <CardTitle>Call List Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Detailed call list information will be displayed here in a future update.</p>
        </CardContent>
      </Card>
    </div>
  );
}