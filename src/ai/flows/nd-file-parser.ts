'use server';

/**
 * @fileOverview Parses MetaMorph (.nd) files to extract multichannel dataset information.
 *
 * - parseNDFile - A function that parses the content of an .nd file.
 * - NDFileInput - The input type for the parseNDFile function.
 * - NDFileOutput - The return type for the parseNDFile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NDFileInputSchema = z.object({
  ndFileContent: z.string().describe('The string content of the .nd file.'),
});
export type NDFileInput = z.infer<typeof NDFileInputSchema>;

const StagePositionSchema = z.object({
  position: z.number().describe('The stage position index.'),
  images: z.array(
    z.object({
      channel: z.string().describe('The name of the channel (e.g., "DAPI", "FITC").'),
      filename: z.string().describe('The filename of the image for this channel.'),
    })
  ).describe('A list of images for each channel at this stage position.'),
});

const NDFileOutputSchema = z.object({
  version: z.string().describe('The version of the ND file format.'),
  liveMode: z.boolean().describe('Indicates if live mode was enabled.'),
  stagePositions: z.array(StagePositionSchema).describe('An array of stage positions, each containing multichannel image information.'),
});
export type NDFileOutput = z.infer<typeof NDFileOutputSchema>;


export async function parseNDFile(input: NDFileInput): Promise<NDFileOutput> {
  return ndFileParserFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ndFileParserPrompt',
  input: {schema: NDFileInputSchema},
  output: {schema: NDFileOutputSchema},
  prompt: `You are an expert in parsing microscopy file formats.
The user has provided the content of a MetaMorph (.nd) file.
Analyze the content and extract the structured data from it.

The file format consists of key-value pairs.
- "ND_VERSION" indicates the version.
- "LiveMode" is a boolean.
- The main data is under "STAGES". It contains a list of stage positions.
- Each stage position ("Stage X") has a list of image files, one for each channel ("do_channel_X"). The value for "do_channel_X" is the filename. The channel name is defined by "channel_name_X".

Your task is to parse the provided .nd file content and return a JSON object that strictly conforms to the NDFileOutput schema. Pay close attention to mapping "channel_name_X" and "do_channel_X" to the corresponding channel and filename for each stage position.

.nd File Content:
\`\`\`
{{{ndFileContent}}}
\`\`\`

Return only the valid JSON object.
`,
});

const ndFileParserFlow = ai.defineFlow(
  {
    name: 'ndFileParserFlow',
    inputSchema: NDFileInputSchema,
    outputSchema: NDFileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
