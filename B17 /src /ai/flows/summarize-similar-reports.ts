'use server';

/**
 * @fileOverview Summarizes reports with similar selections (e.g., location, issue type).
 *
 * - summarizeSimilarReports - A function that summarizes reports based on common selections.
 * - SummarizeSimilarReportsInput - The input type for the summarizeSimilarReports function.
 * - SummarizeSimilarReportsOutput - The return type for the summarizeSimilarReports function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSimilarReportsInputSchema = z.object({
  selectionType: z.string().describe('The type of selection to group reports by (e.g., location, issue type).'),
  selectionValue: z.string().describe('The specific value of the selection (e.g., "Main Street", "Potholes").'),
  reports: z.array(z.string()).describe('An array of report descriptions to summarize.'),
});
export type SummarizeSimilarReportsInput = z.infer<typeof SummarizeSimilarReportsInputSchema>;

const SummarizeSimilarReportsOutputSchema = z.object({
  summary: z.string().describe('A summary of the reports that share the given selection.'),
});
export type SummarizeSimilarReportsOutput = z.infer<typeof SummarizeSimilarReportsOutputSchema>;

export async function summarizeSimilarReports(input: SummarizeSimilarReportsInput): Promise<SummarizeSimilarReportsOutput> {
  return summarizeSimilarReportsFlow(input);
}

const summarizeSimilarReportsPrompt = ai.definePrompt({
  name: 'summarizeSimilarReportsPrompt',
  input: {
    schema: SummarizeSimilarReportsInputSchema,
  },
  output: {
    schema: SummarizeSimilarReportsOutputSchema,
  },
  prompt: `You are an expert in summarizing reports related to civic issues.

  You will receive a list of reports and a selection type and value.

  Your task is to summarize the reports, focusing on the commonalities related to the selection type and value.

  Selection Type: {{{selectionType}}}
  Selection Value: {{{selectionValue}}}
  Reports: {{{reports}}}

  Summary:`,
});

const summarizeSimilarReportsFlow = ai.defineFlow(
  {
    name: 'summarizeSimilarReportsFlow',
    inputSchema: SummarizeSimilarReportsInputSchema,
    outputSchema: SummarizeSimilarReportsOutputSchema,
  },
  async input => {
    const {output} = await summarizeSimilarReportsPrompt(input);
    return output!;
  }
);
