import { useEffect } from 'react';
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
import { EditResellerClientSchema, type EditResellerClientData, type ResellerClient } from '@shared/types';
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
interface EditClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ResellerClient | null;
}
export function EditClientDialog({ open, onOpenChange, client }: EditClientDialogProps) {
  const updateClient = useResellerClientsStore((state) => state.updateClient);
  const form = useForm<EditResellerClientData>({
    resolver: zodResolver(EditResellerClientSchema),
  });
  useEffect(() => {
    if (client) {
      form.reset({
        companyName: client.companyName,
        contactEmail: client.contactEmail,
        provisionedAgents: client.provisionedAgents,
      });
    }
  }, [client, form, open]);
  const onSubmit = async (data: EditResellerClientData) => {
    if (!client) return;
    await updateClient(client.id, data);
    form.reset();
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tr.editClientDialog.title}</DialogTitle>
          <DialogDescription>{tr.editClientDialog.description}</DialogDescription>
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{tr.editClientDialog.cancel}</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>{tr.editClientDialog.submit}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}