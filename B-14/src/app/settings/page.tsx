
'use client';

import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteUser, sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const auth = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const handleChangePassword = async () => {
    if (!user || !user.email || !auth) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your inbox for a link to reset your password.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !auth) return;
    try {
      await deleteUser(user);
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      router.push('/login');
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Error Deleting Account",
        description: error.message,
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
            <CardTitle className="font-headline text-3xl">Settings</CardTitle>
            <CardDescription>Manage your application settings.</CardDescription>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                    <h3 className="font-semibold">Theme</h3>
                    <p className="text-sm text-muted-foreground">Select a light or dark theme, or sync with your system.</p>
                </div>
                <ThemeToggle />
            </div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                    <h3 className="font-semibold">Change Password</h3>
                    <p className="text-sm text-muted-foreground">Update your account password.</p>
                </div>
                <Button variant="outline" onClick={handleChangePassword}>Change</Button>
            </div>
             <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
                <div>
                    <h3 className="font-semibold text-destructive">Delete Account</h3>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} className={''}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
