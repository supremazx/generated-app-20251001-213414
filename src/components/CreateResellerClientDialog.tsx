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
import { CreateResellerClientSchema, type CreateResellerClientData } from '@shared/types';
import { useResellerClientsStore } from '@/stores/useResellerClientsStore';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { tr } from '@/lib/locales/tr';
interface CreateResellerClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function CreateResellerClientDialog({ open, onOpenChange }: CreateResellerClientDialogProps) {
  const addClient = useResellerClientsStore((state) => state.addClient);
  const form = useForm<CreateResellerClientData>({
    resolver: zodResolver(CreateResellerClientSchema),
    defaultValues: {
      companyName: '',
      contactEmail: '',
      provisionedAgents: 1,
    },
  });
  const onSubmit = async (data: CreateResellerClientData) => {
    const client = await addClient(data);
    if (client) {
      form.reset();
      onOpenChange(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tr.createResellerClientDialog.title}</DialogTitle>
          <DialogDescription>{tr.createResellerClientDialog.description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tr.createResellerClientDialog.companyNameLabel}</FormLabel>
                  <FormControl><Input placeholder={tr.createResellerClientDialog.companyNamePlaceholder} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tr.createResellerClientDialog.contactEmailLabel}</FormLabel>
                  <FormControl><Input type="email" placeholder={tr.createResellerClientDialog.contactEmailPlaceholder} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="provisionedAgents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tr.createResellerClientDialog.provisionedAgentsLabel}</FormLabel>
                  <FormControl><Input type="number" min="1" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{tr.createResellerClientDialog.cancel}</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>{tr.createResellerClientDialog.submit}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}