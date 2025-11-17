'use server';

/**
 * @fileOverview Extracts morphometric features from segmented nuclei images.
 *
 * - extractMorphometricFeatures - A function that extracts morphometric features from segmented nuclei.
 * - MorphometricFeatureExtractionInput - The input type for the extractMorphometricFeatures function.
 * - MorphometricFeatureExtractionOutput - The return type for the extractMorphometricFeatures function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MorphometricFeatureExtractionInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A multi-channel fluorescence image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  segmentationDataUri: z
    .string()
    .describe(
      "A segmentation mask image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  dapiChannel: z.number().describe('The channel number corresponding to the DAPI stain.'),
});
export type MorphometricFeatureExtractionInput = z.infer<typeof MorphometricFeatureExtractionInputSchema>;

const MorphometricFeatureExtractionOutputSchema = z.object({
  features: z.array(
    z.object({
      nucleusId: z.number().describe('The unique identifier for the nucleus.'),
      area: z.number().describe('The area of the nucleus in pixels.'),
      perimeter: z.number().describe('The perimeter of the nucleus in pixels.'),
      circularity: z
        .number()
        .describe('The circularity of the nucleus (4*pi*area/perimeter^2).'),
      meanIntensity: z
        .number()
        .describe('The mean intensity of the DAPI channel within the nucleus.'),
    })
  ),
});
export type MorphometricFeatureExtractionOutput = z.infer<typeof MorphometricFeatureExtractionOutputSchema>;

export async function extractMorphometricFeatures(
  input: MorphometricFeatureExtractionInput
): Promise<MorphometricFeatureExtractionOutput> {
  return morphometricFeatureExtractionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'morphometricFeatureExtractionPrompt',
  input: {schema: MorphometricFeatureExtractionInputSchema},
  output: {schema: MorphometricFeatureExtractionOutputSchema},
  prompt: `You are an expert in image analysis, skilled in extracting morphometric features from segmented nuclei in fluorescence microscopy images.

You will be given a multi-channel fluorescence image and its corresponding segmentation mask.

The DAPI channel (channel {{{dapiChannel}}}) is used for nuclear segmentation. For each segmented nucleus, extract the following features:

*   **Area:** The number of pixels within the nucleus boundary.
*   **Perimeter:** The length of the nucleus boundary in pixels.
*   **Circularity:** Calculated as 4*pi*area/perimeter^2. A perfect circle has a circularity of 1. Values closer to 0 indicate elongated shapes.
*   **Mean Intensity:** The average intensity of the DAPI channel within the nucleus.

Ensure that the extracted features are accurate and correspond to the correct nucleus ID. Segmentations at the edge of the image have already been excluded.

Multi-channel Fluorescence Image: {{media url=imageDataUri}}
Segmentation Mask: {{media url=segmentationDataUri}}

Return the results in JSON format.
`,
});

const morphometricFeatureExtractionFlow = ai.defineFlow(
  {
    name: 'morphometricFeatureExtractionFlow',
    inputSchema: MorphometricFeatureExtractionInputSchema,
    outputSchema: MorphometricFeatureExtractionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
