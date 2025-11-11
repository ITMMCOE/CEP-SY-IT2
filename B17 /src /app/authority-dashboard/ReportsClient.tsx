'use client';

import { useState, useMemo } from 'react';
import { BarChart, Bot, Loader2, MapPin, Tag, Camera } from 'lucide-react';
import { summarizeSimilarReports } from '@/ai/flows/summarize-similar-reports';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

// Define a type for the report, matching the Firestore data structure.
export type Report = {
  id: string;
  problemType: string;
  description?: string;
  location: string;
  submissionDate: { seconds: number; nanoseconds: number };
  status: 'Submitted' | 'In Progress' | 'Resolved';
  userId: string;
  photoUrl?: string;
};

type SelectionType = 'location' | 'problemType';

export function ReportsClient({ reports, isLoading: isLoadingReports }: { reports: Report[] | null; isLoading: boolean; }) {
  const [selectionType, setSelectionType] = useState<SelectionType>('location');
  const [selectionValue, setSelectionValue] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const selectionOptions = useMemo(() => {
    if (!reports) return [];
    // For location, we should probably group by proximity, but for now we'll use the exact string.
    const uniqueValues = [...new Set(reports.map((report) => report[selectionType]))];
    return uniqueValues;
  }, [selectionType, reports]);
  
  const handleGenerateSummary = async () => {
    if (!selectionValue || !reports) return;

    setIsGeneratingSummary(true);
    setSummary('');

    const relevantReports = reports
      .filter((report) => report[selectionType] === selectionValue)
      .map((report) => `Report ID ${report.id}: "${report.description}"`);

    if (relevantReports.length === 0) {
      setSummary('No reports found for this selection.');
      setIsGeneratingSummary(false);
      return;
    }

    try {
      const result = await summarizeSimilarReports({
        selectionType,
        selectionValue,
        reports: relevantReports,
      });
      setSummary(result.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary('Failed to generate summary. Please try again.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };
  
  const handleStatusChange = (reportId: string, newStatus: Report['status']) => {
    const existingReportsStr = localStorage.getItem('reports');
    if (!existingReportsStr) return;

    let storedReports: Report[] = JSON.parse(existingReportsStr);
    
    // Find the index of the report to update
    const reportIndex = storedReports.findIndex(report => report.id === reportId);
    
    if (reportIndex !== -1) {
      // Update the status of the specific report
      storedReports[reportIndex].status = newStatus;
      
      // Save the updated list back to local storage
      localStorage.setItem('reports', JSON.stringify(storedReports));
      
      // Dispatch a storage event to trigger a re-render in components that listen for it
      window.dispatchEvent(new Event('storage'));
    }
  };

  const getStatusVariant = (status: Report['status']) => {
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
  
  const formatDate = (timestamp: Report['submissionDate']) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString();
  };


  return (
    <Dialog>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Report Analysis</CardTitle>
              <CardDescription>
                Select a category and value to generate an AI summary of related reports.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="grid gap-2 flex-1 w-full">
                <label htmlFor="selection-type" className="text-sm font-medium">Group by</label>
                <Select value={selectionType} onValueChange={(v) => {
                    setSelectionType(v as SelectionType);
                    setSelectionValue('');
                    setSummary('');
                }}>
                  <SelectTrigger id="selection-type">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="location"><MapPin className="inline-block mr-2 h-4 w-4"/>Location</SelectItem>
                    <SelectItem value="problemType"><Tag className="inline-block mr-2 h-4 w-4"/>Issue Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 flex-1 w-full">
                <label htmlFor="selection-value" className="text-sm font-medium">Value</label>
                <Select value={selectionValue} onValueChange={setSelectionValue} disabled={!selectionType}>
                  <SelectTrigger id="selection-value">
                    <SelectValue placeholder="Select a value" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectionOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleGenerateSummary} disabled={!selectionValue || isGeneratingSummary} className="w-full sm:w-auto">
                {isGeneratingSummary ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <BarChart className="mr-2 h-4 w-4" />
                )}
                Generate Summary
              </Button>
            </CardContent>
          </Card>

          {summary && (
            <Card className="bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="text-primary"/> AI Summary for {selectionType}: {selectionValue}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">{summary}</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>All Submitted Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report ID</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Photo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingReports ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : reports && reports.length > 0 ? (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.id.substring(0, 6)}...</TableCell>
                      <TableCell>{report.problemType}</TableCell>
                      <TableCell>{report.location}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs truncate">{report.description}</TableCell>
                      <TableCell className="hidden sm:table-cell">{formatDate(report.submissionDate)}</TableCell>
                      <TableCell>
                        <Select
                          value={report.status}
                          onValueChange={(newStatus) => handleStatusChange(report.id, newStatus as Report['status'])}
                        >
                          <SelectTrigger className={`w-[120px] text-xs h-auto py-1 px-2.5 rounded-full border-none ${
                              report.status === 'Submitted' ? 'bg-secondary text-secondary-foreground' : 
                              report.status === 'In Progress' ? 'bg-primary text-primary-foreground' : 
                              'bg-background border'
                            }`}
                          >
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Submitted">Submitted</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {report.photoUrl ? (
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedImage(report.photoUrl!)}>
                              <Camera className="h-5 w-5" />
                            </Button>
                          </DialogTrigger>
                        ) : (
                          <span className="text-muted-foreground text-xs">N/A</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">No reports submitted yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
