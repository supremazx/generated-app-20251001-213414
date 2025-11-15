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
import { useKnowledgeBaseStore } from '@/stores/useKnowledgeBaseStore';
import { useAudioFileStore } from '@/stores/useAudioFileStore';
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
import { cn } from '@/lib/utils';
interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignType: 'ai' | 'audio' | null;
}
export function CreateCampaignDialog({ open, onOpenChange, campaignType }: CreateCampaignDialogProps) {
  const addCampaign = useCampaignStore((state) => state.addCampaign);
  const callLists = useCallListStore((state) => state.callLists);
  const fetchCallLists = useCallListStore((state) => state.fetchCallLists);
  const agents = useAgentStore((state) => state.agents);
  const fetchAgents = useAgentStore((state) => state.fetchAgents);
  const { knowledgeBases, fetchKnowledgeBases } = useKnowledgeBaseStore();
  const { audioFiles, fetchAudioFiles } = useAudioFileStore();
  const form = useForm<CreateCampaignData>({
    resolver: zodResolver(CreateCampaignSchema),
    defaultValues: {
      name: '',
      callListId: '',
      agentId: '',
      knowledgeBaseId: '',
      audioFileId: '',
    },
  });
  useEffect(() => {
    if (open) {
      fetchCallLists();
      fetchAgents();
      fetchKnowledgeBases();
      fetchAudioFiles();
    }
  }, [open, fetchCallLists, fetchAgents, fetchKnowledgeBases, fetchAudioFiles]);
  const onSubmit = async (data: CreateCampaignData) => {
    await addCampaign(data);
    form.reset();
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[500px]">
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
              name="agentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tr.createCampaignDialog.assignAgentsLabel}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            <FormField
              control={form.control}
              name="knowledgeBaseId"
              render={({ field }) => (
                <FormItem className={cn(campaignType === 'audio' && 'opacity-50')}>
                  <FormLabel>{tr.createCampaignDialog.knowledgeBaseLabel}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={campaignType === 'audio'}>
                    <FormControl>
                      <SelectTrigger className={cn(campaignType === 'ai' && 'ring-2 ring-blue-500')}>
                        <SelectValue placeholder={tr.createCampaignDialog.knowledgeBasePlaceholder} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {knowledgeBases.map((kb) => (
                        <SelectItem key={kb.id} value={kb.id}>
                          {kb.name}
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
              name="audioFileId"
              render={({ field }) => (
                <FormItem className={cn(campaignType === 'ai' && 'opacity-50')}>
                  <FormLabel>{tr.createCampaignDialog.audioFileLabel}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={campaignType === 'ai'}>
                    <FormControl>
                      <SelectTrigger className={cn(campaignType === 'audio' && 'ring-2 ring-blue-500')}>
                        <SelectValue placeholder={tr.createCampaignDialog.audioFilePlaceholder} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {audioFiles.map((af) => (
                        <SelectItem key={af.id} value={af.id}>
                          {af.name}
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