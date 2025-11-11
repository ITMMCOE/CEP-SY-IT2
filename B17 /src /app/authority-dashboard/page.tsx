'use client';

import { useState, useEffect } from 'react';
import { ReportsClient, type Report } from './ReportsClient';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export default function AuthorityDashboardPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Effect to load reports from local storage on mount and on 'storage' event
  useEffect(() => {
    const loadReports = () => {
      setIsLoading(true);
      try {
        const storedReports = localStorage.getItem('reports');
        if (storedReports) {
          const parsedReports: any[] = JSON.parse(storedReports);
          const formattedReports: Report[] = parsedReports.map(r => ({
              ...r,
              submissionDate: r.submissionDate ? { seconds: new Date(r.submissionDate).getTime() / 1000, nanoseconds: 0 } : { seconds: 0, nanoseconds: 0 },
          }));
          setReports(formattedReports);
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
    // Optionally, show a toast notification
  };


  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">Community Reports</h2>
            <p className="text-muted-foreground">View, manage, and analyze reports submitted by users.</p>
        </div>
        <Button variant="outline" onClick={handleClearReports}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All Reports
        </Button>
      </div>
      <ReportsClient reports={reports} isLoading={isLoading} />
    </div>
  );
}
