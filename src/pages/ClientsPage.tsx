import { useEffect, useState, useMemo } from 'react';
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
import { PlusCircle, Loader2, Edit, Trash2, UserX, UserCheck, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useResellerClientsStore } from '@/stores/useResellerClientsStore';
import { useAgentStore } from '@/stores/useAgentStore';
import { CreateResellerClientDialog } from '@/components/CreateResellerClientDialog';
import { EditClientDialog } from '@/components/EditClientDialog';
import { tr } from '@/lib/locales/tr';
import type { ResellerClient } from '@shared/types';
const statusColors: Record<ResellerClient['status'], string> = {
  Active: "bg-green-500",
  Suspended: "bg-red-500",
};
export function ClientsPage() {
  const { clients, loading, fetchClients, deleteClient, updateClientStatus } = useResellerClientsStore();
  const { agents, fetchAgents } = useAgentStore();
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ResellerClient | null>(null);
  useEffect(() => {
    fetchClients();
    fetchAgents();
  }, [fetchClients, fetchAgents]);
  const agentMap = useMemo(() => new Map(agents.map(agent => [agent.id, agent.name])), [agents]);
  const handleDeleteClick = (client: ResellerClient) => {
    setSelectedClient(client);
    setDeleteDialogOpen(true);
  };
  const handleEditClick = (client: ResellerClient) => {
    setSelectedClient(client);
    setEditDialogOpen(true);
  };
  const handleStatusToggleClick = (client: ResellerClient) => {
    const newStatus = client.status === 'Active' ? 'Suspended' : 'Active';
    updateClientStatus(client.id, newStatus);
  };
  const confirmDelete = () => {
    if (selectedClient) {
      deleteClient(selectedClient.id);
    }
    setDeleteDialogOpen(false);
    setSelectedClient(null);
  };
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{tr.resellerClientsPage.title}</CardTitle>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {tr.resellerClientsPage.newClient}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tr.resellerClientsPage.table.companyName}</TableHead>
                <TableHead>{tr.resellerClientsPage.table.status}</TableHead>
                <TableHead>Atanan Agent</TableHead>
                <TableHead>{tr.resellerClientsPage.table.createdAt}</TableHead>
                <TableHead className="text-right w-[100px]">{tr.resellerClientsPage.table.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    <div className="flex justify-center items-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    {tr.resellerClientsPage.emptyState}
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{client.companyName}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[client.status]} hover:${statusColors[client.status]}`}>{client.status}</Badge>
                    </TableCell>
                    <TableCell>{agentMap.get(client.agentId) || 'N/A'}</TableCell>
                    <TableCell>{new Date(client.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(client)}>
                            <Edit className="mr-2 h-4 w-4" />
                            {tr.resellerClientsPage.actions.edit}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusToggleClick(client)}>
                            {client.status === 'Active' ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                {tr.resellerClientsPage.actions.suspend}
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                {tr.resellerClientsPage.actions.activate}
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteClick(client)} className="text-red-500 focus:text-red-500">
                            <Trash2 className="mr-2 h-4 w-4" />
                            {tr.resellerClientsPage.actions.delete}
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
      <CreateResellerClientDialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen} />
      <EditClientDialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen} client={selectedClient} />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tr.resellerClientsPage.deleteDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{tr.resellerClientsPage.deleteDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tr.resellerClientsPage.deleteDialog.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              {tr.resellerClientsPage.deleteDialog.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}