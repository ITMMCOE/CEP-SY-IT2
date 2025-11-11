'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  userId: z.string().min(1, { message: 'User ID is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

// This is a "dummy" domain for creating a Firebase-compatible email from a user ID.
const AUTHORITY_EMAIL_DOMAIN = 'civicconnect.authority';

export default function AuthorityLoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Firebase not initialized',
        description: 'Please try again later.',
      });
      return;
    }
    
    // Construct the email from the userId
    const email = `${values.userId}@${AUTHORITY_EMAIL_DOMAIN}`;
    
    try {
      // Step 1: Authenticate the user with their credentials
      const userCredential = await signInWithEmailAndPassword(auth, email, values.password);
      const user = userCredential.user;

      // Step 2: Authorize - check if the user is a designated authority
      const authorityRef = doc(firestore, 'authorities', user.uid);
      const authoritySnap = await getDoc(authorityRef);

      if (authoritySnap.exists()) {
        // Confirmed authority, proceed to dashboard
        router.push('/authority-dashboard');
      } else {
        // This user is authenticated but NOT an authority. Deny access.
        await signOut(auth); // Sign them out immediately
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: 'This account does not have authority permissions.',
        });
      }

    } catch (error) {
      let title = 'An unknown error occurred.';
      let description = 'Please try again.';
      if (error instanceof FirebaseError) {
        title = 'Authentication Error';
        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            description = 'The User ID or password you entered is incorrect. Please try again.';
            break;
          default:
            description = 'An error occurred during login. Please try again later.';
            break;
        }
      }
      toast({
        variant: 'destructive',
        title: title,
        description: description,
      });
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">Authority Login</CardTitle>
        <CardDescription>Enter your official credentials to access the dashboard.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="userId">User ID</Label>
                  <FormControl>
                    <Input id="userId" placeholder="your-user-id" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="password">Password</Label>
                  <FormControl>
                    <Input id="password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              New Authority?{' '}
              <Link href="/register/authority" className="font-medium text-accent hover:underline">
                Register here
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
