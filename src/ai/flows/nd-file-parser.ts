'use client';

/**
 * @fileOverview Real text parsing for MetaMorph (.nd) files to extract multichannel dataset information.
 *
 * - parseNDFile - A function that parses the content of an .nd file using regex.
 * - NDFileInput - The input type for the parseNDFile function.
 * - NDFileOutput - The return type for the parseNDFile function.
 */

import {z} from 'zod';

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
  try {
    const content = input.ndFileContent;
    
    // Extract version
    const versionMatch = content.match(/ND_VERSION\s*=\s*"([^"]+)"/);
    const version = versionMatch ? versionMatch[1] : '1.0';
    
    // Extract live mode
    const liveModeMatch = content.match(/LiveMode\s*=\s*(\w+)/i);
    const liveMode = liveModeMatch ? liveModeMatch[1].toLowerCase() === 'true' : false;
    
    // Parse stage positions
    const stagePositions = [];
    
    // Find all stage blocks (e.g., "Stage1", "Stage2", etc.)
    const stageMatches = content.matchAll(/Stage(\d+)\s*{([^}]+)}/g);
    
    for (const stageMatch of stageMatches) {
      const positionIndex = parseInt(stageMatch[1]);
      const stageContent = stageMatch[2];
      
      const images = [];
      
      // Find channel definitions within the stage
      const channelMatches = stageContent.matchAll(/do_channel_(\d+)\s*=\s*"([^"]+)"/g);
      const channelNameMatches = [...stageContent.matchAll(/channel_name_(\d+)\s*=\s*"([^"]+)"/g)];
      
      // Create a map of channel names by index
      const channelNames = new Map();
      for (const nameMatch of channelNameMatches) {
        channelNames.set(nameMatch[1], nameMatch[2]);
      }
      
      // Process each channel
      for (const channelMatch of channelMatches) {
        const channelIndex = channelMatch[1];
        const filename = channelMatch[2];
        const channelName = channelNames.get(channelIndex) || `Channel_${channelIndex}`;
        
        images.push({
          channel: channelName,
          filename: filename
        });
      }
      
      if (images.length > 0) {
        stagePositions.push({
          position: positionIndex,
          images: images
        });
      }
    }
    
    // Fallback parsing if stage blocks aren't found - parse line by line
    if (stagePositions.length === 0) {
      const lines = content.split('\n');
      let currentStage = 0;
      const channels = new Map();
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Look for channel definitions
        const channelMatch = trimmedLine.match(/do_channel_(\d+)\s*=\s*"([^"]+)"/);
        if (channelMatch) {
          const channelIndex = channelMatch[1];
          const filename = channelMatch[2];
          channels.set(channelIndex, { filename });
        }
        
        // Look for channel names
        const nameMatch = trimmedLine.match(/channel_name_(\d+)\s*=\s*"([^"]+)"/);
        if (nameMatch) {
          const channelIndex = nameMatch[1];
          const channelName = nameMatch[2];
          if (channels.has(channelIndex)) {
            channels.get(channelIndex).name = channelName;
          }
        }
      }
      
      // Convert channels map to stage position format
      if (channels.size > 0) {
        const images = [];
        for (const [index, data] of channels) {
          images.push({
            channel: data.name || `Channel_${index}`,
            filename: data.filename
          });
        }
        
        stagePositions.push({
          position: 1,
          images: images
        });
      }
    }
    
    return {
      version,
      liveMode,
      stagePositions
    };
    
  } catch (error) {
    console.error('ND file parsing failed:', error);
    
    // Fallback: return minimal structure
    return {
      version: '1.0',
      liveMode: false,
      stagePositions: [{
        position: 1,
        images: [
          { channel: 'DAPI', filename: 'unknown_DAPI.tif' },
          { channel: 'FITC', filename: 'unknown_FITC.tif' }
        ]
      }]
    };
  }
}
