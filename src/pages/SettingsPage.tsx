import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { SettingsSchema, type Settings } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { tr } from '@/lib/locales/tr';
export function SettingsPage() {
  const { settings, loading, fetchSettings, updateSettings } = useSettingsStore();
  const form = useForm<Settings>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      serverAddress: '',
      dbHost: '',
      dbPort: 5432,
      dbUsername: '',
      dbPassword: '',
      timezone: 'est',
      emailNotifications: false,
      aiBasePricePerMinute: 0,
      aiAgentSipMinuteCost: 0,
      sippulseApiKey: '',
    },
  });
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);
  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);
  const onSubmit = async (data: Settings) => {
    await updateSettings(data);
    toast.success(tr.toasts.settingsSaved);
  };
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
        </div>
        <div className="flex justify-start">
            <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>{tr.settingsPage.connection.title}</CardTitle>
                <CardDescription>{tr.settingsPage.connection.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="serverAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tr.settingsPage.connection.serverAddress}</FormLabel>
                      <FormControl>
                        <Input placeholder="pbx.yourcompany.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dbHost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tr.settingsPage.connection.dbHost}</FormLabel>
                      <FormControl>
                        <Input placeholder="localhost" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dbPort"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tr.settingsPage.connection.dbPort}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="5432" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dbUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tr.settingsPage.connection.dbUsername}</FormLabel>
                      <FormControl>
                        <Input placeholder="fusionpbx" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dbPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tr.settingsPage.connection.dbPassword}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{tr.settingsPage.preferences.title}</CardTitle>
                <CardDescription>{tr.settingsPage.preferences.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tr.settingsPage.preferences.timezone}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="est">Eastern Time (EST)</SelectItem>
                          <SelectItem value="cst">Central Time (CST)</SelectItem>
                          <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>{tr.settingsPage.preferences.emailNotifications}</FormLabel>
                        <p className="text-sm text-muted-foreground">{tr.settingsPage.preferences.emailDescription}</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{tr.settingsPage.pricing.title}</CardTitle>
                <CardDescription>{tr.settingsPage.pricing.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="aiBasePricePerMinute"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tr.settingsPage.pricing.aiBasePrice}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.001" placeholder="e.g., 0.025" {...field} />
                      </FormControl>
                      <FormDescription>
                        {tr.settingsPage.pricing.aiBasePriceDescription}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aiAgentSipMinuteCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tr.settingsPage.pricing.sipCost}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.001" placeholder="e.g., 0.015" {...field} />
                      </FormControl>
                      <FormDescription>
                        {tr.settingsPage.pricing.sipCostDescription}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{tr.settingsPage.integrations.title}</CardTitle>
                <CardDescription>{tr.settingsPage.integrations.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="sippulseApiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tr.settingsPage.integrations.sippulseApiKey}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••••••••••" {...field} />
                      </FormControl>
                      <FormDescription>
                        {tr.settingsPage.integrations.sippulseDescription}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
        </div>
        <div className="flex justify-start">
            <Button type="submit" disabled={form.formState.isSubmitting}>{tr.settingsPage.saveButton}</Button>
        </div>
      </form>
    </Form>
  );
}