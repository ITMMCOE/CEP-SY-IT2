'use client';

import { useState, useEffect } from 'react';
import { SubmitReportDialog } from './SubmitReportDialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, FileText, Loader2, Camera, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

// This type is now used for local storage data.
export type Report = {
  id: string;
  problemType: string;
  description?: string;
  location: string;
  submissionDate: string; // Using ISO string for simplicity
  status: 'Submitted' | 'In Progress' | 'Resolved';
  userId: string;
  photoUrl?: string;
};

export default function DashboardPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Effect to load reports from local storage on mount and on 'storage' event
  useEffect(() => {
    const loadReports = () => {
      setIsLoading(true);
      try {
        const storedReports = localStorage.getItem('reports');
        if (storedReports) {
          setReports(JSON.parse(storedReports));
        } else {
          setReports([]);
        }
      } catch (e) {
        console.error("Failed to parse reports from local storage", e);
        setReports([]);
      }
      setIsLoading(false);
    };

    loadReports();

    // Listen for the custom 'storage' event dispatched on new submission
    window.addEventListener('storage', loadReports);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('storage', loadReports);
    };
  }, []);

  const handleClearReports = () => {
    localStorage.removeItem('reports');
    window.dispatchEvent(new Event('storage'));
  };

  const getStatusVariant = (status: 'Submitted' | 'In Progress' | 'Resolved') => {
    switch (status) {
      case 'Submitted':
        return 'secondary';
      case 'In Progress':
        return 'default';
      case 'Resolved':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <Dialog>
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight font-headline">Welcome, User!</h2>
            <p className="text-muted-foreground">Submit and track your reports.</p>
          </div>
          <div className="flex items-center gap-2">
            <SubmitReportDialog />
            <Button variant="outline" size="icon" onClick={handleClearReports} title="Clear all reports">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12 h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading your reports...</p>
          </div>
        ) : reports && reports.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <Card key={report.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{report.problemType}</CardTitle>
                    <Badge variant={getStatusVariant(report.status)}>{report.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 mt-0.5 shrink-0" />
                    <p>{report.description || 'No description provided.'}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{report.location}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 shrink-0" />
                    <span>Submitted on {formatDate(report.submissionDate)}</span>
                  </div>
                  {report.photoUrl && (
                    <DialogTrigger asChild>
                      <button onClick={() => setSelectedImage(report.photoUrl!)} className="text-muted-foreground hover:text-primary transition-colors">
                        <Camera className="h-4 w-4" />
                      </button>
                    </DialogTrigger>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-muted rounded-lg flex flex-col items-center justify-center p-12 h-[60vh]">
            <h3 className="text-xl font-semibold text-muted-foreground">No reports submitted yet.</h3>
            <p className="text-muted-foreground mt-2">Click the button above to submit your first report.</p>
          </div>
        )}
      </div>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
            <DialogTitle>Report Photo</DialogTitle>
        </DialogHeader>
        {selectedImage && (
          <div className="relative mt-4" style={{'paddingBottom': '75%'}}>
            <Image src={selectedImage} alt="Report photo" layout="fill" objectFit="contain" className="rounded-md"/>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
