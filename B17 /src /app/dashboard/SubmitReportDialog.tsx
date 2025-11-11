'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { socialIssues } from '@/lib/issues';
import { Input } from '@/components/ui/input';
import type { Report } from './page';

const reportSchema = z.object({
  problemType: z.string({ required_error: 'Please select an issue type.' }).min(1, { message: 'Please select an issue type.' }),
  description: z.string().optional(),
  location: z.string().min(1, { message: 'Please enter a location.' }),
  photo: z.instanceof(File).refine((file) => file, "Please upload a photo."),
});

// Helper to convert file to Base64 Data URL
const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export function SubmitReportDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      problemType: '',
      description: '',
      location: '',
      photo: undefined,
    },
  });

  // This function now handles saving to local storage with an image.
  async function onSubmit(values: z.infer<typeof reportSchema>) {
    setIsSubmitting(true);

    try {
      let photoUrl: string | undefined = undefined;
      if (values.photo) {
        photoUrl = await fileToDataUrl(values.photo);
      }
      
      // Create a new report object
      const newReport: Report = {
        id: new Date().toISOString(), // Simple unique ID
        problemType: values.problemType,
        description: values.description || 'No description provided.',
        location: values.location,
        status: 'Submitted',
        submissionDate: new Date().toISOString(), // Use ISO string for simplicity
        userId: 'local-user', // Dummy user ID
        photoUrl: photoUrl,
      };

      // Get existing reports from local storage
      const existingReportsStr = localStorage.getItem('reports');
      let reports: Report[] = existingReportsStr ? JSON.parse(existingReportsStr) : [];

      // Add the new report to the beginning of the array
      reports.unshift(newReport);
      
      // Save the updated list back to local storage
      localStorage.setItem('reports', JSON.stringify(reports));

      // Manually trigger an event to notify other components to re-fetch from local storage
      window.dispatchEvent(new Event('storage'));

      toast({
        title: 'Report Submitted!',
        description: 'Your report has been saved locally.',
      });

      form.reset();
      setOpen(false);

    } catch (error) {
      console.error("Error submitting report to local storage:", error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Could not save the report to local storage.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            form.reset();
        }
    }}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Submit New Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit a Report</DialogTitle>
          <DialogDescription>
            Select an issue and provide the location. Your reports will be saved locally.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="problemType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Problem Selection</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an issue" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {socialIssues.map((issue) => (
                        <SelectItem key={issue} value={issue}>
                          {issue}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Problem Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., A large pothole in the middle of the road" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                   <FormControl>
                     <Input placeholder="e.g., Corner of Main St and 1st Ave" {...field} />
                   </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="photo"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Add a Photo</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        onChange(file);
                      }}
                      {...rest}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Submit Report"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
