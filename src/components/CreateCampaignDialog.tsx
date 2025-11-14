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
import { CreateCampaignSchema, type CreateCampaignData } from '@shared/types';
import { useCampaignStore } from '@/stores/useCampaignStore';
import { useCallListStore } from '@/stores/useCallListStore';
import { useAgentStore } from '@/stores/useAgentStore';
import { useEffect, useMemo } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { MultiSelect } from './ui/multi-select';
import { tr } from '@/lib/locales/tr';
interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function CreateCampaignDialog({ open, onOpenChange }: CreateCampaignDialogProps) {
  const addCampaign = useCampaignStore((state) => state.addCampaign);
  const callLists = useCallListStore((state) => state.callLists);
  const fetchCallLists = useCallListStore((state) => state.fetchCallLists);
  const agents = useAgentStore((state) => state.agents);
  const fetchAgents = useAgentStore((state) => state.fetchAgents);
  const form = useForm<CreateCampaignData>({
    resolver: zodResolver(CreateCampaignSchema),
    defaultValues: {
      name: '',
      callListId: '',
      agentIds: [],
    },
  });
  useEffect(() => {
    if (open) {
      fetchCallLists();
      fetchAgents();
    }
  }, [open, fetchCallLists, fetchAgents]);
  const agentOptions = useMemo(() => agents.map(agent => ({ value: agent.id, label: agent.name })), [agents]);
  const onSubmit = async (data: CreateCampaignData) => {
    await addCampaign(data);
    form.reset();
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tr.createCampaignDialog.title}</DialogTitle>
          <DialogDescription>
            {tr.createCampaignDialog.description}
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              name="agentIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tr.createCampaignDialog.assignAgentsLabel}</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={agentOptions}
                      selected={field.value || []}
                      onChange={(selected) => field.onChange(selected)}
                      placeholder={tr.createCampaignDialog.assignAgentsPlaceholder}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {tr.createCampaignDialog.cancel}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {tr.createCampaignDialog.submit}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}