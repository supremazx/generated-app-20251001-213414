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
import { useAudioFileStore } from '@/stores/useAudioFileStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { UploadAudioFileDialog } from '@/components/UploadAudioFileDialog';
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
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
export function AudioFilesPage() {
  const { audioFiles, loading, fetchAudioFiles, deleteAudioFile } = useAudioFileStore();
  const user = useAuthStore(s => s.user);
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    const userId = user?.role === 'user' ? user.id : undefined;
    fetchAudioFiles(userId);
  }, [fetchAudioFiles, user]);
  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = () => {
    if (selectedId) {
      deleteAudioFile(selectedId);
    }
    setDeleteDialogOpen(false);
    setSelectedId(null);
  };
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{tr.audioFilesPage.title}</CardTitle>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            {tr.audioFilesPage.upload}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tr.audioFilesPage.table.name}</TableHead>
                <TableHead>{tr.audioFilesPage.table.fileName}</TableHead>
                <TableHead>{tr.audioFilesPage.table.size}</TableHead>
                <TableHead>{tr.audioFilesPage.table.uploadedAt}</TableHead>
                <TableHead className="text-right">{tr.audioFilesPage.table.actions}</TableHead>
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
              ) : audioFiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    {tr.audioFilesPage.emptyState}
                  </TableCell>
                </TableRow>
              ) : (
                audioFiles.map((file) => (
                  <TableRow key={file.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{file.name}</TableCell>
                    <TableCell>{file.fileName}</TableCell>
                    <TableCell>{formatBytes(file.size)}</TableCell>
                    <TableCell>{new Date(file.uploadedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleDeleteClick(file.id)} className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50">
                            {tr.audioFilesPage.actions.delete}
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
      <UploadAudioFileDialog open={isUploadDialogOpen} onOpenChange={setUploadDialogOpen} />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tr.audioFilesPage.deleteDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {tr.audioFilesPage.deleteDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tr.audioFilesPage.deleteDialog.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              {tr.audioFilesPage.deleteDialog.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}