'use client';

import { useState } from 'react';
import { useAppState } from '@/hooks/use-app-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';
import Image from 'next/image';
import { parseNDFile } from '@/ai/flows/nd-file-parser';
import { Separator } from '../ui/separator';

export function DataInputTab() {
  const { datasets, addDataset, setActiveTab } = useAppState();
  const [datasetName, setDatasetName] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isParsing, setIsParsing] = useState(false);
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

        // For now, we only support the first stage position
        const firstStage = parsedData.stagePositions[0];
        if(!firstStage) {
            throw new Error('No stage positions found in .nd file.');
        }

        const stageImages = firstStage.images;

        // Create a map of image files by name for quick lookup
        const imageFileMap = new Map(imageFiles.map(f => [f.name, f]));
        
        const filesForDataset: File[] = [];
        stageImages.forEach(imgInfo => {
            const imageFile = imageFileMap.get(imgInfo.filename);
            if(imageFile) {
                filesForDataset.push(imageFile);
            } else {
                 console.warn(`Image file not found for channel ${imgInfo.channel}: ${imgInfo.filename}`);
            }
        });

        if (filesForDataset.length > 0) {
            // Suggest a dataset name from the ND file, e.g., 'Experiment-1'
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
          description: 'The file might be improperly formatted.',
          variant: 'destructive',
        });
      } finally {
        setIsParsing(false);
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
          Upload your data. You can either upload a folder of images as a dataset, or import a MetaMorph (.nd) file with its associated images.
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
                 <h3 className="text-lg font-medium mb-2">Option 2: Import from Folder</h3>
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
