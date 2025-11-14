import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Agent, AgentStatus } from "@shared/types";
import { Phone, User, PauseCircle, XCircle } from "lucide-react";
import { useAgentStore } from '@/stores/useAgentStore';
import { Skeleton } from '@/components/ui/skeleton';
import { tr } from '@/lib/locales/tr';
const statusInfo: Record<AgentStatus, { color: string; icon: React.ElementType, label: string }> = {
  'On Call': { color: "bg-red-500", icon: Phone, label: tr.agentsPage.status.onCall },
  'Waiting': { color: "bg-green-500", icon: User, label: tr.agentsPage.status.waiting },
  'Paused': { color: "bg-yellow-500", icon: PauseCircle, label: tr.agentsPage.status.paused },
  'Offline': { color: "bg-gray-500", icon: XCircle, label: tr.agentsPage.status.offline },
};
const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};
const AgentCard = ({ agent }: { agent: Agent }) => {
  const { color, icon: Icon, label } = statusInfo[agent.status];
  return (
    <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={agent.avatarUrl} alt={agent.name} />
          <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-lg">{agent.name}</CardTitle>
          <p className="text-sm text-muted-foreground">Ext: {agent.extension}</p>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <Badge className={`${color} hover:${color} text-white`}>
          <Icon className="mr-2 h-4 w-4" />
          {label}
        </Badge>
        {agent.status === 'On Call' && (
          <span className="text-sm font-mono font-medium">
            {formatDuration(agent.currentCallDuration)}
          </span>
        )}
      </CardContent>
    </Card>
  );
};
const AgentCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </CardHeader>
    <CardContent className="flex items-center justify-between">
      <Skeleton className="h-6 w-24 rounded-full" />
    </CardContent>
  </Card>
);
export function AgentsPage() {
  const { agents, loading, fetchAgents } = useAgentStore();
  useEffect(() => {
    fetchAgents();
    const intervalId = setInterval(fetchAgents, 5000); // Poll every 5 seconds
    return () => clearInterval(intervalId);
  }, [fetchAgents]);
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {loading ? (
        Array.from({ length: 8 }).map((_, index) => <AgentCardSkeleton key={index} />)
      ) : (
        agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))
      )}
    </div>
  );
}