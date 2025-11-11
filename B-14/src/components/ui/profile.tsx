
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  skills: z.string().optional(),
  education: z.string().optional(),
  goals: z.string().optional(),
});

export function Profile() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [isSuccessAlertOpen, setIsSuccessAlertOpen] = useState(false);

  const userProfileRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, status } = useDoc(userProfileRef);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      skills: '',
      education: '',
      goals: '',
    },
  });

  const { reset, handleSubmit, formState, control } = form;

  useEffect(() => {
    const defaultValues = {
        name: user?.displayName ?? '',
        email: user?.email ?? '',
        skills: '',
        education: '',
        goals: '',
    };

    if (userProfile) {
        reset({
            name: userProfile.name ?? defaultValues.name,
            email: userProfile.email ?? defaultValues.email,
            skills: userProfile.skills ?? '',
            education: userProfile.education ?? '',
            goals: userProfile.goals ?? '',
        });
    } else if(user) {
        reset(defaultValues);
    }
  }, [user, userProfile, reset]);

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!userProfileRef) return;
    
    const dataToSave = {
      ...values,
      updatedAt: serverTimestamp(),
    };

    setDoc(userProfileRef, dataToSave, { merge: true })
      .then(() => {
        setIsSuccessAlertOpen(true);
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: userProfileRef.path,
            operation: 'update',
            requestResourceData: dataToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
        <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 border-2 border-primary">
                {user?.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} data-ai-hint="person portrait" />}
                <AvatarFallback className="text-3xl">{user?.displayName ? user.displayName.charAt(0) : 'U'}</AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-3xl font-bold font-headline">{user?.displayName}</h1>
                <p className="text-muted-foreground">{user?.email}</p>
            </div>
        </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
                <CardTitle>User Details</CardTitle>
                <CardDescription>Manage your name and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your.email@example.com" {...field} readOnly disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </CardContent>
          </Card>
          
          <Card>
             <CardHeader>
                <CardTitle>Professional Profile</CardTitle>
                <CardDescription>This information helps the AI provide personalized career recommendations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <FormField
                control={control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormControl>
                      <Textarea placeholder="List your skills, separated by commas (e.g., Python, Project Management, Public Speaking)" {...field} className="min-h-[100px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="education"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Education & Certifications</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Bachelor of Science in Computer Science, Google Project Management Certificate" {...field} className="min-h-[100px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Career Goals</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your ideal career path or what you hope to achieve professionally." {...field} className="min-h-[100px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-center">
              <Button type="submit" disabled={formState.isSubmitting} size="lg">
                {formState.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
          </div>
        </form>
      </Form>
      
      <AlertDialog open={isSuccessAlertOpen} onOpenChange={setIsSuccessAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 mb-4">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <AlertDialogTitle>Profile Saved!</AlertDialogTitle>
            <AlertDialogDescription>
              Your information has been successfully updated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsSuccessAlertOpen(false)} className="w-full">OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    