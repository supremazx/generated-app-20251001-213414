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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useResellerSettingsStore } from '@/stores/useResellerSettingsStore';
import { ResellerSettingsSchema, type ResellerSettings } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { tr } from '@/lib/locales/tr';
export function ResellerSettingsPage() {
  const { settings, loading, fetchSettings, updateSettings } = useResellerSettingsStore();
  const form = useForm<ResellerSettings>({
    resolver: zodResolver(ResellerSettingsSchema),
    defaultValues: {
      resellerCompanyName: '',
      resellerPricePerMinute: 0,
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
  const onSubmit = async (data: ResellerSettings) => {
    await updateSettings(data);
  };
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
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
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{tr.resellerSettingsPage.branding.title}</CardTitle>
              <CardDescription>{tr.resellerSettingsPage.branding.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="resellerCompanyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tr.resellerSettingsPage.branding.companyName}</FormLabel>
                    <FormControl>
                      <Input placeholder={tr.resellerSettingsPage.branding.companyNamePlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{tr.resellerSettingsPage.pricing.title}</CardTitle>
              <CardDescription>{tr.resellerSettingsPage.pricing.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="resellerPricePerMinute"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tr.resellerSettingsPage.pricing.pricePerMinute}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.001" placeholder={tr.resellerSettingsPage.pricing.pricePerMinutePlaceholder} {...field} />
                    </FormControl>
                    <FormDescription>
                      {tr.resellerSettingsPage.pricing.pricePerMinuteDescription}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-start">
          <Button type="submit" disabled={form.formState.isSubmitting}>{tr.resellerSettingsPage.saveButton}</Button>
        </div>
      </form>
    </Form>
  );
}