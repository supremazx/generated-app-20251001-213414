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
import { PlusCircle, Loader2, Edit, Trash2, UserX } from "lucide-react";
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
import { AnimatePresence, motion } from 'framer-motion';
const statusColors: Record<ResellerClient['status'], string> = {
  Active: "bg-green-500",
  Suspended: "bg-red-500",
};
const RowActions = ({ client, onEdit, onDelete, onSuspend }: { client: ResellerClient, onEdit: () => void, onDelete: () => void, onSuspend: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-1 bg-background p-1 rounded-md border shadow-lg"
          >
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}><Edit className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-500 hover:text-yellow-600" onClick={onSuspend}><UserX className="h-4 w-4" /></Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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
  const handleSuspendClick = (client: ResellerClient) => {
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
                <TableHead className="text-right w-20">{tr.resellerClientsPage.table.actions}</TableHead>
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
                  <TableRow key={client.id} className="hover:bg-muted/50 group">
                    <TableCell className="font-medium">{client.companyName}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[client.status]} hover:${statusColors[client.status]}`}>{client.status}</Badge>
                    </TableCell>
                    <TableCell>{agentMap.get(client.agentId) || 'N/A'}</TableCell>
                    <TableCell>{new Date(client.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right relative">
                      <RowActions
                        client={client}
                        onEdit={() => handleEditClick(client)}
                        onDelete={() => handleDeleteClick(client)}
                        onSuspend={() => handleSuspendClick(client)}
                      />
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