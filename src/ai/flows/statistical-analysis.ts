'use server';

/**
 * @fileOverview Performs statistical analysis on morphometric data to compare different experimental conditions.
 *
 * - analyzeData - A function that performs statistical analysis on the input data.
 * - AnalysisInput - The input type for the analyzeData function.
 * - AnalysisOutput - The return type for the analyzeData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalysisInputSchema = z.object({
  data: z.array(
    z.object({
      dataset: z.string().describe('The name of the dataset.'),
      features: z.record(z.number()).describe('Morphometric features for each nucleus.'),
    })
  ).describe('Array of datasets with morphometric features for nuclei.'),
  statisticalTest: z.enum(['t-test', 'ANOVA']).describe('The type of statistical test to perform.'),
  correctionMethod: z.enum(['Bonferroni', 'Benjamini-Hochberg', 'None']).describe('The method for multiple comparisons correction.'),
});

export type AnalysisInput = z.infer<typeof AnalysisInputSchema>;

const AnalysisOutputSchema = z.object({
  results: z.array(
    z.object({
      comparison: z.string().describe('The comparison between datasets.'),
      p_value: z.number().describe('The p-value of the statistical test.'),
      corrected_p_value: z.number().describe('The p-value after multiple comparisons correction.'),
    })
  ).describe('Results of the statistical analysis.'),
});

export type AnalysisOutput = z.infer<typeof AnalysisOutputSchema>;

export async function analyzeData(input: AnalysisInput): Promise<AnalysisOutput> {
  return analysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'statisticalAnalysisPrompt',
  input: {schema: AnalysisInputSchema},
  output: {schema: AnalysisOutputSchema},
  prompt: `You are an expert biostatistician.

You will perform statistical analysis on the provided morphometric data from different experimental conditions (datasets).
Based on the user's selection, perform either t-tests or ANOVA to compare the datasets.
Apply the specified multiple comparisons correction method (Bonferroni, Benjamini-Hochberg, or None).

Input Data:
{{#each data}}
Dataset: {{this.dataset}}
Features: {{JSONstringify this.features}}
{{/each}}

Statistical Test: {{{statisticalTest}}}
Correction Method: {{{correctionMethod}}}

Present the results in a JSON format, including the comparison, p-value, and corrected p-value for each comparison.
Ensure the output conforms to the AnalysisOutputSchema. Only return a valid JSON object.
`,
});

const analysisFlow = ai.defineFlow(
  {
    name: 'analysisFlow',
    inputSchema: AnalysisInputSchema,
    outputSchema: AnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
