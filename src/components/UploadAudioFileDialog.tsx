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
import { CreateAudioFileSchema, type CreateAudioFileData } from '@shared/types';
import { useAudioFileStore } from '@/stores/useAudioFileStore';
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
interface UploadAudioFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const ACCEPTED_FILE_TYPES = {
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
};
export function UploadAudioFileDialog({ open, onOpenChange }: UploadAudioFileDialogProps) {
  const addAudioFile = useAudioFileStore((state) => state.addAudioFile);
  const form = useForm<CreateAudioFileData>({
    resolver: zodResolver(CreateAudioFileSchema),
    defaultValues: {
      name: '',
      file: null,
    },
  });
  const onSubmit = async (data: CreateAudioFileData) => {
    if (!data.file) return;
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('file', data.file);
    await addAudioFile(formData);
    form.reset();
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tr.uploadAudioFileDialog.title}</DialogTitle>
          <DialogDescription>
            {tr.uploadAudioFileDialog.description}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tr.uploadAudioFileDialog.nameLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={tr.uploadAudioFileDialog.namePlaceholder} {...field} />
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
                  <FormLabel>{tr.uploadAudioFileDialog.fileLabel}</FormLabel>
                  <FormControl>
                    <FileDropzone
                      onFileChange={field.onChange}
                      file={field.value}
                      accept={Object.values(ACCEPTED_FILE_TYPES).flat().join(',')}
                      acceptedMimeTypes={Object.keys(ACCEPTED_FILE_TYPES)}
                      description={tr.uploadAudioFileDialog.fileDescription}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { form.reset(); onOpenChange(false); }}>
                {tr.uploadAudioFileDialog.cancel}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {tr.uploadAudioFileDialog.submit}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}