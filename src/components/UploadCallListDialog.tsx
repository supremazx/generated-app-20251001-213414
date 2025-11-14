import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCallListSchema, type CreateCallListData } from '@shared/types';
import { useCallListStore } from '@/stores/useCallListStore';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { FileDropzone } from './FileDropzone';
import { tr } from '@/lib/locales/tr';
interface UploadCallListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function UploadCallListDialog({ open, onOpenChange }: UploadCallListDialogProps) {
  const addCallList = useCallListStore((state) => state.addCallList);
  const form = useForm<CreateCallListData>({
    resolver: zodResolver(CreateCallListSchema),
    defaultValues: {
      name: '',
      file: null,
    },
  });
  const onSubmit = async (data: CreateCallListData) => {
    if (!data.file) return;
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('file', data.file);
    await addCallList(formData);
    form.reset();
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tr.uploadCallListDialog.title}</DialogTitle>
          <DialogDescription>
            {tr.uploadCallListDialog.description}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tr.uploadCallListDialog.nameLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={tr.uploadCallListDialog.namePlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tr.uploadCallListDialog.fileLabel}</FormLabel>
                  <FormControl>
                    <FileDropzone onFileChange={field.onChange} file={field.value} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { form.reset(); onOpenChange(false); }}>
                {tr.uploadCallListDialog.cancel}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {tr.uploadCallListDialog.submit}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}