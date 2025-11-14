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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUserDashboardStore } from '@/stores/useUserDashboardStore';
import { ChangePasswordSchema, type ChangePasswordData, ChangeEmailSchema, type ChangeEmailData } from '@shared/types';
import { tr } from '@/lib/locales/tr';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
function ChangeEmailForm() {
  const { changeEmail } = useUserDashboardStore();
  const form = useForm<ChangeEmailData>({
    resolver: zodResolver(ChangeEmailSchema),
    defaultValues: { newEmail: '', password: '' },
  });
  const onSubmit = async (data: ChangeEmailData) => {
    const success = await changeEmail(data);
    if (success) {
      form.reset();
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>{tr.accountSettingsPage.changeEmail.title}</CardTitle>
        <CardDescription>{tr.accountSettingsPage.changeEmail.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tr.accountSettingsPage.changeEmail.newEmailLabel}</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tr.accountSettingsPage.changeEmail.passwordLabel}</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tr.accountSettingsPage.changeEmail.submitButton}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
function ChangePasswordForm() {
  const { changePassword } = useUserDashboardStore();
  const form = useForm<ChangePasswordData>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const onSubmit = async (data: ChangePasswordData) => {
    const success = await changePassword(data);
    if (success) {
      form.reset();
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>{tr.accountSettingsPage.changePassword.title}</CardTitle>
        <CardDescription>{tr.accountSettingsPage.changePassword.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tr.accountSettingsPage.changePassword.currentPasswordLabel}</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tr.accountSettingsPage.changePassword.newPasswordLabel}</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tr.accountSettingsPage.changePassword.confirmPasswordLabel}</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tr.accountSettingsPage.changePassword.submitButton}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
export function AccountSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-display">{tr.accountSettingsPage.title}</h1>
        <p className="text-muted-foreground">{tr.accountSettingsPage.description}</p>
      </div>
      <Separator />
      <div className="grid gap-8 md:grid-cols-2">
        <ChangeEmailForm />
        <ChangePasswordForm />
      </div>
    </div>
  );
}