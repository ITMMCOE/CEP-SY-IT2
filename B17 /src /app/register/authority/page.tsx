'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

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
import { FirebaseError } from 'firebase/app';

const formSchema = z
  .object({
    userId: z.string().min(3, { message: 'User ID must be at least 3 characters.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
  
const AUTHORITY_EMAIL_DOMAIN = 'civicconnect.authority';

export default function RegisterAuthorityPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: '',
      password: '',
      confirmPassword: '',
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
    
    const email = `${values.userId}@${AUTHORITY_EMAIL_DOMAIN}`;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, values.password);
      const user = userCredential.user;
      
      // Create a document in the 'authorities' collection to mark this user as an authority
      const authorityRef = doc(firestore, 'authorities', user.uid);
      await setDoc(authorityRef, { userId: values.userId });
      
      // Also create a minimal user profile
      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, {
        id: user.uid,
        userId: values.userId,
        email: email, // Store the "fake" email
        registrationDate: serverTimestamp(),
      });
      
      toast({
        title: 'Authority Registration Successful!',
        description: "You can now log in with your new User ID.",
      });
      
      router.push('/login/authority');
    } catch (error) {
      let title = 'An unknown error occurred.';
      let description = 'Please try again.';
       if (error instanceof FirebaseError) {
        title = 'Registration Error';
        switch (error.code) {
          case 'auth/email-already-in-use':
            description = 'This User ID is already taken. Please choose another one.';
            break;
          case 'auth/weak-password':
            description = 'The password is too weak. Please choose a stronger password.';
            break;
          default:
            description = 'An error occurred during registration. Please try again later.';
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
        <CardTitle className="text-2xl font-headline">Authority Registration</CardTitle>
        <CardDescription>Create an authority account to manage reports.</CardDescription>
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
                    <Input id="userId" placeholder="your-chosen-id" {...field} />
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
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <FormControl>
                    <Input id="confirmPassword" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={form.formState.isSubmitting}>
               {form.formState.isSubmitting ? 'Registering...' : 'Register'}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login/authority" className="font-medium text-accent hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
