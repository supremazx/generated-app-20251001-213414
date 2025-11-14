import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCampaignStore } from '@/stores/useCampaignStore';
import { useKnowledgeBaseStore } from '@/stores/useKnowledgeBaseStore';
import { useAudioFileStore } from '@/stores/useAudioFileStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, CheckCircle, Percent, Target, BrainCircuit, Music, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CampaignStatus, CallLogStatus } from '@shared/types';
import { tr } from '@/lib/locales/tr';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
const statusColors: Record<CampaignStatus, string> = {
  Active: "bg-green-500 hover:bg-green-600",
  Paused: "bg-yellow-500 hover:bg-yellow-600",
  Completed: "bg-blue-500 hover:bg-blue-600",
  Draft: "bg-gray-500 hover:bg-gray-600",
};
const callLogStatusColors: Record<CallLogStatus, string> = {
  Answered: "bg-green-500",
  Busy: "bg-yellow-500",
  Failed: "bg-red-500",
  Dialing: "bg-blue-500",
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
  const { selectedCampaign, fetchCampaignById, loading, callLogs, callLogsLoading, fetchCallLogs } = useCampaignStore();
  const { knowledgeBases, fetchKnowledgeBases } = useKnowledgeBaseStore();
  const { audioFiles, fetchAudioFiles } = useAudioFileStore();
  useEffect(() => {
    if (campaignId) {
      fetchCampaignById(campaignId);
      fetchCallLogs(campaignId);
      const intervalId = setInterval(() => fetchCallLogs(campaignId), 5000);
      return () => clearInterval(intervalId);
    }
  }, [campaignId, fetchCampaignById, fetchCallLogs]);
  useEffect(() => {
    fetchKnowledgeBases();
    fetchAudioFiles();
  }, [fetchKnowledgeBases, fetchAudioFiles]);
  const knowledgeBaseName = useMemo(() => {
    if (!selectedCampaign?.knowledgeBaseId || knowledgeBases.length === 0) return null;
    return knowledgeBases.find(kb => kb.id === selectedCampaign.knowledgeBaseId)?.name;
  }, [selectedCampaign, knowledgeBases]);
  const audioFileName = useMemo(() => {
    if (!selectedCampaign?.audioFileId || audioFiles.length === 0) return null;
    return audioFiles.find(af => af.id === selectedCampaign.audioFileId)?.name;
  }, [selectedCampaign, audioFiles]);
  if (loading || !selectedCampaign) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCardSkeleton /> <StatCardSkeleton /> <StatCardSkeleton /> <StatCardSkeleton />
        </div>
        <Card><CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
      </div>
    );
  }
  const connectionRate = selectedCampaign.dialedLeads > 0 ? ((selectedCampaign.connections / selectedCampaign.dialedLeads) * 100).toFixed(1) : '0.0';
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/campaigns')}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-3xl font-bold font-display">{selectedCampaign.name}</h1>
          <Badge className={statusColors[selectedCampaign.status]}>{tr.campaignStatus[selectedCampaign.status]}</Badge>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title={tr.campaignDetailPage.totalLeads} value={selectedCampaign.totalLeads.toLocaleString()} icon={Target} />
        <StatCard title={tr.campaignDetailPage.dialedLeads} value={selectedCampaign.dialedLeads.toLocaleString()} icon={Phone} />
        <StatCard title={tr.campaignDetailPage.connections} value={selectedCampaign.connections.toLocaleString()} icon={CheckCircle} />
        <StatCard title={tr.campaignDetailPage.connectionRate} value={`${connectionRate}%`} icon={Percent} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>{tr.campaignDetailPage.progress}</CardTitle></CardHeader><CardContent><div className="flex justify-between mb-2 text-sm text-muted-foreground"><span>{selectedCampaign.dialedLeads.toLocaleString()} arandı</span><span>{selectedCampaign.totalLeads.toLocaleString()} toplam</span></div><Progress value={(selectedCampaign.dialedLeads / selectedCampaign.totalLeads) * 100} className="h-4" /></CardContent></Card>
        <Card><CardHeader><CardTitle>{tr.campaignDetailPage.knowledgeBase}</CardTitle></CardHeader><CardContent className="flex items-center gap-3"><BrainCircuit className="h-6 w-6 text-muted-foreground" /><p className="text-md font-medium">{knowledgeBaseName || 'Atanmamış'}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>{tr.campaignDetailPage.audioFile}</CardTitle></CardHeader><CardContent className="flex items-center gap-3"><Music className="h-6 w-6 text-muted-foreground" /><p className="text-md font-medium">{audioFileName || 'Atanmamış'}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>{tr.campaignDetailPage.callListDetails}</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{tr.campaignDetailPage.callListDescription}</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>{tr.campaignDetailPage.callLogs.title}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>{tr.campaignDetailPage.callLogs.phoneNumber}</TableHead><TableHead>{tr.campaignDetailPage.callLogs.status}</TableHead><TableHead>{tr.campaignDetailPage.callLogs.duration}</TableHead><TableHead>{tr.campaignDetailPage.callLogs.timestamp}</TableHead></TableRow></TableHeader>
            <TableBody>
              {callLogsLoading && callLogs.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell><Skeleton className="h-5 w-32" /></TableCell><TableCell><Skeleton className="h-5 w-20" /></TableCell><TableCell><Skeleton className="h-5 w-16" /></TableCell><TableCell><Skeleton className="h-5 w-40" /></TableCell></TableRow>
                ))
              ) : callLogs.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center h-24">Arama kaydı bulunamadı.</TableCell></TableRow>
              ) : (
                callLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono">{log.phoneNumber}</TableCell>
                    <TableCell><Badge className={`${callLogStatusColors[log.status]} hover:${callLogStatusColors[log.status]}`}>{tr.callLogStatus[log.status]}</Badge></TableCell>
                    <TableCell>{log.duration > 0 ? `${log.duration}s` : '-'}</TableCell>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}