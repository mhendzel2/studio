'use server';

/**
 * @fileOverview Nuclei segmentation using Cellpose 3.0.
 *
 * - cellposeSegmentation - A function that performs nuclei segmentation using Cellpose 3.0.
 * - CellposeSegmentationInput - The input type for the cellposeSegmentation function.
 * - CellposeSegmentationOutput - The return type for the cellposeSegmentation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CellposeSegmentationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A fluorescence image with nuclei, as a data URI that must include a MIME type and use Base64 encoding. The DAPI channel should be present. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  cellposeModelParameters: z.string().optional().describe('Optional parameters to fine-tune the Cellpose model.'),
});
export type CellposeSegmentationInput = z.infer<typeof CellposeSegmentationInputSchema>;

const CellposeSegmentationOutputSchema = z.object({
  segmentationResult: z.string().describe('The segmentation result in a suitable format (e.g., a data URI for an overlay image or a JSON containing segmentation data).'),
  nucleiCount: z.number().describe('The number of nuclei detected in the image.'),
});
export type CellposeSegmentationOutput = z.infer<typeof CellposeSegmentationOutputSchema>;

export async function cellposeSegmentation(input: CellposeSegmentationInput): Promise<CellposeSegmentationOutput> {
  return cellposeSegmentationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cellposeSegmentationPrompt',
  input: {schema: CellposeSegmentationInputSchema},
  output: {schema: CellposeSegmentationOutputSchema},
  prompt: `You are an expert in image analysis, specializing in nuclei segmentation of fluorescence microscopy images using Cellpose 3.0.

  You will use Cellpose 3.0 to segment nuclei in the provided fluorescence image, using the DAPI channel as the primary segmentation channel. Return the segmentation result and the number of nuclei detected.

  Ensure that the segmentation result is in a suitable format for visualization and further analysis (e.g., a data URI for an overlay image or a JSON containing segmentation data).

  Fluorescence Image: {{media url=photoDataUri}}
  Cellpose Model Parameters: {{{cellposeModelParameters}}}
  `,
});

const cellposeSegmentationFlow = ai.defineFlow(
  {
    name: 'cellposeSegmentationFlow',
    inputSchema: CellposeSegmentationInputSchema,
    outputSchema: CellposeSegmentationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
