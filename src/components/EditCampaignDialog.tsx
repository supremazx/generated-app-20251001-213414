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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EditCampaignSchema, type EditCampaignData, type Campaign } from '@shared/types';
import { useCampaignStore } from '@/stores/useCampaignStore';
import { useCallListStore } from '@/stores/useCallListStore';
import { useAgentStore } from '@/stores/useAgentStore';
import { useEffect } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { tr } from '@/lib/locales/tr';
interface EditCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
}
export function EditCampaignDialog({ open, onOpenChange, campaign }: EditCampaignDialogProps) {
  const updateCampaign = useCampaignStore((state) => state.updateCampaign);
  const callLists = useCallListStore((state) => state.callLists);
  const fetchCallLists = useCallListStore((state) => state.fetchCallLists);
  const agents = useAgentStore((state) => state.agents);
  const fetchAgents = useAgentStore((state) => state.fetchAgents);
  const form = useForm<EditCampaignData>({
    resolver: zodResolver(EditCampaignSchema),
    defaultValues: {
      name: '',
      callListId: '',
      agentId: '',
    },
  });
  const { reset } = form;
  useEffect(() => {
    if (campaign) {
      reset({
        name: campaign.name,
        callListId: campaign.callListId,
        agentId: campaign.agentId || '',
      });
    }
  }, [campaign, reset]);
  useEffect(() => {
    if (open) {
      fetchCallLists();
      fetchAgents();
    }
  }, [open, fetchCallLists, fetchAgents]);
  const onSubmit = async (data: EditCampaignData) => {
    if (!campaign) return;
    await updateCampaign(campaign.id, data);
    form.reset();
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tr.editCampaignDialog.title}</DialogTitle>
          <DialogDescription>
            {tr.editCampaignDialog.description}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tr.createCampaignDialog.nameLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={tr.createCampaignDialog.namePlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="callListId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tr.createCampaignDialog.callListLabel}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={tr.createCampaignDialog.callListPlaceholder} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {callLists.map((list) => (
                        <SelectItem key={list.id} value={list.id}>
                          {list.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="agentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tr.createCampaignDialog.assignAgentsLabel}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={tr.createCampaignDialog.assignAgentsPlaceholder} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {tr.editCampaignDialog.cancel}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {tr.editCampaignDialog.submit}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}