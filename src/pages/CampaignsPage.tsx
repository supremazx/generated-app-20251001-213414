import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MoreHorizontal, Loader2, Play, Pause, Square } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Campaign, CampaignStatus } from "@shared/types";
import { Progress } from "@/components/ui/progress";
import { useCampaignStore } from '@/stores/useCampaignStore';
import { CreateCampaignDialog } from '@/components/CreateCampaignDialog';
import { EditCampaignDialog } from '@/components/EditCampaignDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { tr } from '@/lib/locales/tr';
const statusColors: Record<CampaignStatus, string> = {
  Active: "bg-green-500 hover:bg-green-600",
  Paused: "bg-yellow-500 hover:bg-yellow-600",
  Completed: "bg-blue-500 hover:bg-blue-600",
  Draft: "bg-gray-500 hover:bg-gray-600",
};
export function CampaignsPage() {
  const { campaigns, loading, fetchCampaigns, deleteCampaign, updateCampaignStatus } = useCampaignStore();
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    fetchCampaigns();
    const intervalId = setInterval(fetchCampaigns, 5000); // Poll for updates from simulation
    return () => clearInterval(intervalId);
  }, [fetchCampaigns]);
  const handleDeleteClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDeleteDialogOpen(true);
  };
  const handleEditClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setEditDialogOpen(true);
  };
  const handleViewDetailsClick = (campaignId: string) => {
    navigate(`/campaigns/${campaignId}`);
  };
  const confirmDelete = () => {
    if (selectedCampaign) {
      deleteCampaign(selectedCampaign.id);
    }
    setDeleteDialogOpen(false);
    setSelectedCampaign(null);
  };
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{tr.campaignsPage.title}</CardTitle>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {tr.campaignsPage.newCampaign}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tr.campaignsPage.table.name}</TableHead>
                <TableHead>{tr.campaignsPage.table.status}</TableHead>
                <TableHead>{tr.campaignsPage.table.progress}</TableHead>
                <TableHead>{tr.campaignsPage.table.connections}</TableHead>
                <TableHead>{tr.campaignsPage.table.createdAt}</TableHead>
                <TableHead className="text-right">{tr.campaignsPage.table.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <div className="flex justify-center items-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    {tr.campaignsPage.emptyState}
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[campaign.status]}>{campaign.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={campaign.totalLeads > 0 ? (campaign.dialedLeads / campaign.totalLeads) * 100 : 0} className="w-32 h-2" />
                        <span className="text-xs text-muted-foreground">
                          {campaign.totalLeads > 0 ? ((campaign.dialedLeads / campaign.totalLeads) * 100).toFixed(0) : 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{campaign.connections.toLocaleString()}</TableCell>
                    <TableCell>{new Date(campaign.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => updateCampaignStatus(campaign.id, 'Active')} disabled={campaign.status === 'Active' || campaign.status === 'Completed'}>
                            <Play className="mr-2 h-4 w-4" /> {tr.campaignsPage.actions.start}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateCampaignStatus(campaign.id, 'Paused')} disabled={campaign.status !== 'Active'}>
                            <Pause className="mr-2 h-4 w-4" /> {tr.campaignsPage.actions.pause}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateCampaignStatus(campaign.id, 'Completed')} disabled={campaign.status === 'Completed'}>
                            <Square className="mr-2 h-4 w-4" /> {tr.campaignsPage.actions.stop}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewDetailsClick(campaign.id)}>{tr.campaignsPage.actions.viewDetails}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(campaign)}>{tr.campaignsPage.actions.edit}</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteClick(campaign)} className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50">
                            {tr.campaignsPage.actions.delete}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <CreateCampaignDialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen} />
      <EditCampaignDialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen} campaign={selectedCampaign} />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tr.campaignsPage.deleteDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {tr.campaignsPage.deleteDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tr.campaignsPage.deleteDialog.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              {tr.campaignsPage.deleteDialog.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}