import { useEffect, useState } from 'react';
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
import { PlusCircle, MoreHorizontal, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useResellerClientsStore } from '@/stores/useResellerClientsStore';
import { CreateResellerClientDialog } from '@/components/CreateResellerClientDialog';
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
import type { ResellerClient } from '@shared/types';
export function ResellerClientsPage() {
  const { clients, loading, fetchClients, deleteClient } = useResellerClientsStore();
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ResellerClient | null>(null);
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);
  const handleDeleteClick = (client: ResellerClient) => {
    setSelectedClient(client);
    setDeleteDialogOpen(true);
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
                <TableHead>{tr.resellerClientsPage.table.provisionedAgents}</TableHead>
                <TableHead>{tr.resellerClientsPage.table.monthlySpend}</TableHead>
                <TableHead>{tr.resellerClientsPage.table.createdAt}</TableHead>
                <TableHead className="text-right">{tr.resellerClientsPage.table.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" /></TableCell></TableRow>
              ) : clients.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center h-24">{tr.resellerClientsPage.emptyState}</TableCell></TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{client.companyName}</TableCell>
                    <TableCell><Badge variant={client.status === 'Active' ? 'default' : 'destructive'} className={client.status === 'Active' ? 'bg-green-500' : ''}>{client.status}</Badge></TableCell>
                    <TableCell>{client.provisionedAgents}</TableCell>
                    <TableCell>${client.monthlySpend.toFixed(2)}</TableCell>
                    <TableCell>{new Date(client.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleDeleteClick(client)} className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50">Delete</DropdownMenuItem>
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
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tr.resellerClientsPage.deleteDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{tr.resellerClientsPage.deleteDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tr.resellerClientsPage.deleteDialog.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">{tr.resellerClientsPage.deleteDialog.confirm}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}