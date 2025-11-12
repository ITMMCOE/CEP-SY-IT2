export type Report = {
  id: string;
  problemType: string;
  description: string;
  location: string;
  submissionDate: string;
  status: 'Submitted' | 'In Progress' | 'Resolved';
};

export const mockReports: Report[] = [
  {
    id: 'REP001',
    problemType: 'Potholes',
    description: 'Multiple large potholes on the main road, causing traffic issues.',
    location: 'Main Street',
    submissionDate: '2024-07-15',
    status: 'Submitted',
  },
  {
    id: 'REP002',
    problemType: 'Garbage',
    description: 'Community bins are overflowing. Waste has not been collected for 3 days.',
    location: 'Oak Avenue',
    submissionDate: '2024-07-14',
    status: 'In Progress',
  },
  {
    id: 'REP003',
    problemType: 'Street Light Outage',
    description: 'The street light at the corner of Pine and Maple is not working.',
    location: 'Pine Street',
    submissionDate: '2024-07-14',
    status: 'Resolved',
  },
  {
    id: 'REP004',
    problemType: 'Potholes',
    description: 'A deep pothole near the school entrance.',
    location: 'Main Street',
    submissionDate: '2024-07-13',
    status: 'In Progress',
  },
  {
    id: 'REP005',
    problemType: 'Water Leakage',
    description: 'Clean water is leaking from a pipe on the sidewalk.',
    location: 'Elm Drive',
    submissionDate: '2024-07-12',
    status: 'Submitted',
  },
  {
    id: 'REP006',
    problemType: 'Graffiti',
    description: 'The park wall has been vandalized with spray paint.',
    location: 'Central Park',
    submissionDate: '2024-07-11',
    status: 'Resolved',
  },
  {
    id: 'REP007',
    problemType: 'Potholes',
    description: 'Road surface is severely damaged along the entire block.',
    location: 'Main Street',
    submissionDate: '2024-07-10',
    status: 'Submitted',
  },
    {
    id: 'REP008',
    problemType: 'Garbage',
    description: 'Illegal dumping of construction debris behind the supermarket.',
    location: 'Oak Avenue',
    submissionDate: '2024-07-09',
    status: 'Submitted',
  },
];
