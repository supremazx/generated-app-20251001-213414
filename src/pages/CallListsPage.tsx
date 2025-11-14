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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, MoreHorizontal, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCallListStore } from '@/stores/useCallListStore';
import { UploadCallListDialog } from '@/components/UploadCallListDialog';
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
export function CallListsPage() {
  const { callLists, loading, fetchCallLists, deleteCallList } = useCallListStore();
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    fetchCallLists();
  }, [fetchCallLists]);
  const handleDeleteClick = (id: string) => {
    setSelectedListId(id);
    setDeleteDialogOpen(true);
  };
  const handleViewDetailsClick = (id: string) => {
    navigate(`/call-lists/${id}`);
  };
  const confirmDelete = () => {
    if (selectedListId) {
      deleteCallList(selectedListId);
    }
    setDeleteDialogOpen(false);
    setSelectedListId(null);
  };
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{tr.callListsPage.title}</CardTitle>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            {tr.callListsPage.uploadList}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tr.callListsPage.table.name}</TableHead>
                <TableHead>{tr.callListsPage.table.totalLeads}</TableHead>
                <TableHead>{tr.callListsPage.table.dialedLeads}</TableHead>
                <TableHead>{tr.callListsPage.table.uploadedAt}</TableHead>
                <TableHead className="text-right">{tr.callListsPage.table.actions}</TableHead>
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
              ) : callLists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    {tr.callListsPage.emptyState}
                  </TableCell>
                </TableRow>
              ) : (
                callLists.map((list) => (
                  <TableRow key={list.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{list.name}</TableCell>
                    <TableCell>{list.totalLeads.toLocaleString()}</TableCell>
                    <TableCell>{list.dialedLeads.toLocaleString()}</TableCell>
                    <TableCell>{new Date(list.uploadedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleViewDetailsClick(list.id)}>{tr.callListsPage.actions.viewDetails}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(list.id)} className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50">
                            {tr.callListsPage.actions.delete}
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
      <UploadCallListDialog open={isUploadDialogOpen} onOpenChange={setUploadDialogOpen} />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tr.callListsPage.deleteDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {tr.callListsPage.deleteDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tr.callListsPage.deleteDialog.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              {tr.callListsPage.deleteDialog.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}