/**
 * @fileOverview Configuration stub - AI functionality has been replaced with real image processing
 * 
 * This file is kept for compatibility but no longer provides AI services.
 * All analysis functions now use real computational libraries.
 */

// Placeholder for any shared utilities needed by the analysis flows
export const config = {
  imageProcessing: {
    maxImageSize: 2048,
    supportedFormats: ['jpg', 'jpeg', 'png', 'tiff', 'tif']
  },
  statistics: {
    significanceLevel: 0.05,
    defaultCorrection: 'Benjamini-Hochberg'
  }
};