/**
 * Utility functions for handling .nd files and their associated images in folders
 */

export interface NDFolderScanResult {
  ndFile: File;
  imageFiles: File[];
  datasetName: string;
}

/**
 * Scans a list of files from a folder to find .nd files and their associated images
 * @param files - Array of files from a folder
 * @returns Array of NDFolderScanResult objects, one for each .nd file found
 */
export function scanFolderForNDFiles(files: File[]): NDFolderScanResult[] {
  const results: NDFolderScanResult[] = [];
  
  // Find all .nd files
  const ndFiles = files.filter(file => file.name.toLowerCase().endsWith('.nd'));
  
  // For each .nd file, find associated images
  for (const ndFile of ndFiles) {
    const baseName = ndFile.name.replace(/\.nd$/i, '');
    
    // Find all image files that might be associated with this .nd file
    // This includes various naming patterns commonly used with MetaMorph
    const associatedImages = files.filter(file => {
      const fileName = file.name.toLowerCase();
      const fileBaseName = baseName.toLowerCase();
      
      // Check if it's a TIFF file
      if (!fileName.endsWith('.tif') && !fileName.endsWith('.tiff')) {
        return false;
      }
      
      // Common naming patterns for MetaMorph files:
      // 1. Direct match with base name (basename_w1DAPI.tif, basename_w2FITC.tif, etc.)
      // 2. Sequential naming (basename001.tif, basename002.tif, etc.)
      // 3. Channel-based naming with various separators
      
      return (
        fileName.startsWith(fileBaseName) || // Direct prefix match
        fileName.includes(fileBaseName) ||   // Partial match (for complex naming)
        // Check for common channel indicators in the filename
        (fileName.includes('w1') || fileName.includes('w2') || fileName.includes('w3') || fileName.includes('w4') ||
         fileName.includes('dapi') || fileName.includes('fitc') || fileName.includes('tritc') || fileName.includes('cy5') ||
         fileName.includes('phase') || fileName.includes('bf') || fileName.includes('dic'))
      );
    });
    
    if (associatedImages.length > 0) {
      results.push({
        ndFile,
        imageFiles: associatedImages,
        datasetName: baseName
      });
    }
  }
  
  return results;
}

/**
 * Groups files by their likely dataset based on naming patterns
 * This is useful when there are multiple .nd files in the same folder
 */
export function groupFilesByDataset(files: File[]): Map<string, File[]> {
  const groups = new Map<string, File[]>();
  
  for (const file of files) {
    const fileName = file.name;
    let groupKey = fileName;
    
    // Try to extract a common base name for grouping
    // Remove common suffixes and channel indicators
    groupKey = groupKey.replace(/(_w\d+.*|_\d+.*|_[a-zA-Z]+\d*.*)\.(tif|tiff|nd)$/i, '');
    
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(file);
  }
  
  return groups;
}

/**
 * Validates that a folder contains the expected file types for microscopy work
 */
export function validateMicroscopyFolder(files: File[]): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  const ndFiles = files.filter(f => f.name.toLowerCase().endsWith('.nd'));
  const tiffFiles = files.filter(f => f.name.toLowerCase().endsWith('.tif') || f.name.toLowerCase().endsWith('.tiff'));
  
  if (ndFiles.length === 0) {
    issues.push('No .nd files found in the selected folder');
  }
  
  if (tiffFiles.length === 0) {
    issues.push('No TIFF image files found in the selected folder');
  }
  
  if (ndFiles.length > 0 && tiffFiles.length > 0) {
    // Check if we can find associated images for each .nd file
    const scanResults = scanFolderForNDFiles(files);
    const ndFilesWithImages = scanResults.filter(result => result.imageFiles.length > 0);
    
    if (ndFilesWithImages.length === 0) {
      issues.push('No TIFF files could be matched with the .nd files found');
    } else if (ndFilesWithImages.length < ndFiles.length) {
      issues.push(`Only ${ndFilesWithImages.length} of ${ndFiles.length} .nd files have matching TIFF files`);
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}