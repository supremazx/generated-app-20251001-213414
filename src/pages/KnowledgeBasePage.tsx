import { useEffect, useState } from 'react';
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
import { useKnowledgeBaseStore } from '@/stores/useKnowledgeBaseStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { UploadKnowledgeBaseDialog } from '@/components/UploadKnowledgeBaseDialog';
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
export function KnowledgeBasePage() {
  const { knowledgeBases, loading, fetchKnowledgeBases, deleteKnowledgeBase } = useKnowledgeBaseStore();
  const user = useAuthStore(s => s.user);
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    const userId = user?.role === 'user' ? user.id : undefined;
    fetchKnowledgeBases(userId);
  }, [fetchKnowledgeBases, user]);
  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = () => {
    if (selectedId) {
      deleteKnowledgeBase(selectedId);
    }
    setDeleteDialogOpen(false);
    setSelectedId(null);
  };
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{tr.knowledgeBasePage.title}</CardTitle>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            {tr.knowledgeBasePage.upload}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tr.knowledgeBasePage.table.name}</TableHead>
                <TableHead>{tr.knowledgeBasePage.table.leadCount}</TableHead>
                <TableHead>{tr.knowledgeBasePage.table.uploadedAt}</TableHead>
                <TableHead className="text-right">{tr.knowledgeBasePage.table.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    <div className="flex justify-center items-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : knowledgeBases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    {tr.knowledgeBasePage.emptyState}
                  </TableCell>
                </TableRow>
              ) : (
                knowledgeBases.map((kb) => (
                  <TableRow key={kb.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{kb.name}</TableCell>
                    <TableCell>{kb.leadCount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(kb.uploadedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleDeleteClick(kb.id)} className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50">
                            {tr.knowledgeBasePage.actions.delete}
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
      <UploadKnowledgeBaseDialog open={isUploadDialogOpen} onOpenChange={setUploadDialogOpen} />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tr.knowledgeBasePage.deleteDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {tr.knowledgeBasePage.deleteDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tr.knowledgeBasePage.deleteDialog.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              {tr.knowledgeBasePage.deleteDialog.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}