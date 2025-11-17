'use client';

import { useState } from 'react';
import { useAppState } from '@/hooks/use-app-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, FolderOpen } from 'lucide-react';
import Image from 'next/image';
import { parseNDFile } from '@/ai/flows/nd-file-parser';
import { Separator } from '../ui/separator';
import { scanFolderForNDFiles, validateMicroscopyFolder, type NDFolderScanResult } from '@/lib/nd-folder-utils';

export function DataInputTab() {
  const { datasets, addDataset, setActiveTab } = useAppState();
  const [datasetName, setDatasetName] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isProcessingFolder, setIsProcessingFolder] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const fileList = Array.from(event.target.files);
      setFiles(fileList);
      if (!datasetName) {
        // Auto-populate dataset name from folder structure if possible
        const firstFile = fileList[0];
        if (firstFile.webkitRelativePath) {
          const pathParts = firstFile.webkitRelativePath.split('/');
          if (pathParts.length > 1) {
            setDatasetName(pathParts[0]);
          }
        }
      }
    }
  };

  const handleNDFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const ndFile = event.target.files[0];
      const imageFiles = Array.from(event.target.files).slice(1);
      
      if(imageFiles.length === 0) {
        toast({
            title: 'Please select the .nd file AND its associated image files.',
            variant: 'destructive',
          });
        return;
      }
      setIsParsing(true);
      try {
        const ndFileContent = await ndFile.text();
        const parsedData = await parseNDFile({ ndFileContent });

        if (!parsedData.stagePositions || parsedData.stagePositions.length === 0) {
          throw new Error('No stage positions found in .nd file.');
        }

        // Create a map of image files by name for quick lookup
        const imageFileMap = new Map(imageFiles.map(f => [f.name, f]));
        
        const filesForDataset: File[] = [];
        
        // Process all stage positions and collect all unique images
        const foundImageFilenames = new Set<string>();

        parsedData.stagePositions.forEach(stage => {
          stage.images.forEach(imgInfo => {
            const imageFile = imageFileMap.get(imgInfo.filename);
            if(imageFile && !foundImageFilenames.has(imgInfo.filename)) {
                filesForDataset.push(imageFile);
                foundImageFilenames.add(imgInfo.filename);
            } else if (!imageFile) {
                 console.warn(`Image file not found for channel ${imgInfo.channel}: ${imgInfo.filename}`);
            }
          });
        });


        if (filesForDataset.length > 0) {
            const suggestedName = ndFile.name.replace('.nd', '');
            addDataset(suggestedName, filesForDataset);
            toast({
              title: 'Success',
              description: `${filesForDataset.length} images from ${ndFile.name} added to dataset "${suggestedName}".`,
            });
            setActiveTab('segmentation');
        } else {
            toast({
              title: 'No matching images found',
              description: 'Could not find any of the image files referenced in the .nd file among the selected files.',
              variant: 'destructive',
            });
        }

      } catch (error) {
        console.error("Error parsing .nd file:", error);
        toast({
          title: 'Failed to parse .nd file',
          description: (error instanceof Error) ? error.message : 'The file might be improperly formatted.',
          variant: 'destructive',
        });
      } finally {
        setIsParsing(false);
        // Reset file input
        event.target.value = '';
      }
    }
  };

  const handleFolderChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setIsProcessingFolder(true);
      try {
        const fileList = Array.from(event.target.files);
        
        // Validate folder contents
        const validation = validateMicroscopyFolder(fileList);
        if (!validation.isValid) {
          toast({
            title: 'Invalid folder contents',
            description: validation.issues.join('. '),
            variant: 'destructive',
          });
          return;
        }

        // Scan for .nd files and their associated images
        const ndResults = scanFolderForNDFiles(fileList);
        
        if (ndResults.length === 0) {
          toast({
            title: 'No .nd files found',
            description: 'Could not find any .nd files with matching TIFF images in the selected folder.',
            variant: 'destructive',
          });
          return;
        }

        // Process each .nd file found
        for (const ndResult of ndResults) {
          try {
            const ndFileContent = await ndResult.ndFile.text();
            const parsedData = await parseNDFile({ ndFileContent });

            if (parsedData.stagePositions && parsedData.stagePositions.length > 0) {
              // Create a map of image files by name for quick lookup
              const imageFileMap = new Map(ndResult.imageFiles.map(f => [f.name, f]));
              
              const filesForDataset: File[] = [];
              const foundImageFilenames = new Set<string>();

              parsedData.stagePositions.forEach(stage => {
                stage.images.forEach(imgInfo => {
                  const imageFile = imageFileMap.get(imgInfo.filename);
                  if(imageFile && !foundImageFilenames.has(imgInfo.filename)) {
                      filesForDataset.push(imageFile);
                      foundImageFilenames.add(imgInfo.filename);
                  }
                });
              });

              if (filesForDataset.length > 0) {
                addDataset(ndResult.datasetName, filesForDataset);
                toast({
                  title: 'Dataset loaded',
                  description: `${filesForDataset.length} images loaded from "${ndResult.datasetName}".`,
                });
              }
            }
          } catch (error) {
            console.error(`Error processing .nd file ${ndResult.ndFile.name}:`, error);
            toast({
              title: `Failed to process ${ndResult.ndFile.name}`,
              description: (error instanceof Error) ? error.message : 'The file might be improperly formatted.',
              variant: 'destructive',
            });
          }
        }

        if (ndResults.length > 0) {
          setActiveTab('segmentation');
        }

      } catch (error) {
        console.error("Error processing folder:", error);
        toast({
          title: 'Failed to process folder',
          description: (error instanceof Error) ? error.message : 'An unexpected error occurred.',
          variant: 'destructive',
        });
      } finally {
        setIsProcessingFolder(false);
        // Reset file input
        event.target.value = '';
      }
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!datasetName.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a dataset name.',
        variant: 'destructive',
      });
      return;
    }
    if (files.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select a folder of images.',
        variant: 'destructive',
      });
      return;
    }
    addDataset(datasetName, files);
    toast({
      title: 'Success',
      description: `${files.length} images added to dataset "${datasetName}".`,
    });
    setDatasetName('');
    setFiles([]);
    // This is a bit of a hack to clear the file input
    const fileInput = document.getElementById('folder-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    setActiveTab('segmentation');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Input</CardTitle>
        <CardDescription>
          Load your microscopy data. Choose the method that best fits your data organization. For Cellpose 3.0 segmentation and morphometric analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Option 1: Import from MetaMorph (.nd file)</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select your .nd file along with all the .tif images it references. The app will group them automatically.
              </p>
              <div className="space-y-2">
                <Label htmlFor="nd-file-upload">MetaMorph (.nd) file and Images</Label>
                <Input
                  id="nd-file-upload"
                  type="file"
                  multiple
                  accept=".nd,image/tiff,image/tif"
                  onChange={handleNDFileChange}
                  disabled={isParsing}
                />
              </div>
              {isParsing && <p className="text-sm text-primary animate-pulse">Parsing .nd file...</p>}
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-2">Option 2: Load Folder with .nd files</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select a folder containing .nd files and their associated TIFF images. The app will automatically find and load all datasets.
              </p>
              <div className="space-y-2">
                <Label htmlFor="nd-folder-upload">Microscopy Data Folder</Label>
                <Input
                  id="nd-folder-upload"
                  type="file"
                  onChange={handleFolderChange}
                  disabled={isProcessingFolder}
                  // @ts-ignore
                  webkitdirectory="true"
                  mozdirectory="true"
                />
                <p className="text-sm text-muted-foreground">Select a folder containing .nd files and TIFF images.</p>
              </div>
              {isProcessingFolder && <p className="text-sm text-primary animate-pulse">Processing folder contents...</p>}
            </div>

            <Separator />

            <div>
                 <h3 className="text-lg font-medium mb-2">Option 3: Import from Folder (Images Only)</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Images from the same folder will be grouped into a single dataset.
                  </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="dataset-name">Dataset Name (e.g., Experimental Condition)</Label>
                      <Input
                        id="dataset-name"
                        type="text"
                        value={datasetName}
                        onChange={e => setDatasetName(e.target.value)}
                        placeholder="e.g. 'Control' or 'Treatment A'"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="folder-upload">Image Folder</Label>
                      <Input
                        id="folder-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        // @ts-ignore
                        webkitdirectory="true"
                        mozdirectory="true"
                      />
                      <p className="text-sm text-muted-foreground">Select a folder containing your image files.</p>
                    </div>
                  <Button type="submit" className="w-full md:w-auto">
                    <Upload className="mr-2 h-4 w-4" /> Add Dataset from Folder
                  </Button>
                </form>
            </div>
        </div>

        {datasets.length > 0 && (
          <div className="space-y-4 pt-8">
            <h3 className="text-lg font-semibold">Uploaded Datasets</h3>
            <div className="space-y-6">
              {datasets.map(dataset => (
                <Card key={dataset.id}>
                  <CardHeader>
                    <CardTitle>{dataset.name}</CardTitle>
                    <CardDescription>{dataset.images.length} image(s)</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {dataset.images.slice(0, 6).map(image => (
                      <div key={image.id} className="relative aspect-square overflow-hidden rounded-md border">
                        <Image src={image.dataUrl} alt={image.file.name} layout="fill" objectFit="cover" />
                        <div className="absolute bottom-0 w-full bg-black/50 p-1 text-xs text-white truncate">{image.file.name}</div>
                      </div>
                    ))}
                    {dataset.images.length > 6 && <div className="flex items-center justify-center text-sm text-muted-foreground">...and {dataset.images.length - 6} more</div>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
