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
import { CreateKnowledgeBaseSchema, type CreateKnowledgeBaseData } from '@shared/types';
import { useKnowledgeBaseStore } from '@/stores/useKnowledgeBaseStore';
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
interface UploadKnowledgeBaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const ACCEPTED_FILE_TYPES = {
  'text/csv': ['.csv'],
  'application/pdf': ['.pdf'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/plain': ['.txt'],
};
export function UploadKnowledgeBaseDialog({ open, onOpenChange }: UploadKnowledgeBaseDialogProps) {
  const addKnowledgeBase = useKnowledgeBaseStore((state) => state.addKnowledgeBase);
  const form = useForm<CreateKnowledgeBaseData>({
    resolver: zodResolver(CreateKnowledgeBaseSchema),
    defaultValues: {
      name: '',
      file: null,
    },
  });
  const onSubmit = async (data: CreateKnowledgeBaseData) => {
    if (!data.file) return;
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('file', data.file);
    await addKnowledgeBase(formData);
    form.reset();
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tr.uploadKnowledgeBaseDialog.title}</DialogTitle>
          <DialogDescription>
            {tr.uploadKnowledgeBaseDialog.description}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tr.uploadKnowledgeBaseDialog.nameLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={tr.uploadKnowledgeBaseDialog.namePlaceholder} {...field} />
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
                  <FormLabel>{tr.uploadKnowledgeBaseDialog.fileLabel}</FormLabel>
                  <FormControl>
                    <FileDropzone
                      onFileChange={field.onChange}
                      file={field.value}
                      accept={Object.values(ACCEPTED_FILE_TYPES).flat().join(',')}
                      acceptedMimeTypes={Object.keys(ACCEPTED_FILE_TYPES)}
                      description={tr.uploadKnowledgeBaseDialog.fileDescription}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { form.reset(); onOpenChange(false); }}>
                {tr.uploadKnowledgeBaseDialog.cancel}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {tr.uploadKnowledgeBaseDialog.submit}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}