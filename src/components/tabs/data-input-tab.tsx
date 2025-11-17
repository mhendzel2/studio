'use client';

import { useState, useCallback } from 'react';
import { useAppState } from '@/hooks/use-app-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';
import Image from 'next/image';

export function DataInputTab() {
  const { datasets, addDataset, setActiveTab } = useAppState();
  const [datasetName, setDatasetName] = useState('');
  const [files, setFiles] = useState<File[]>([]);
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
        description: 'Please select files to upload.',
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
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    setActiveTab('segmentation');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Input</CardTitle>
        <CardDescription>
          Upload folders of images. Images from the same folder will be grouped into a single dataset.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
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
              <Label htmlFor="file-upload">Image Files</Label>
              <Input
                id="file-upload"
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
            <Upload className="mr-2 h-4 w-4" /> Add Dataset
          </Button>
        </form>

        {datasets.length > 0 && (
          <div className="space-y-4">
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
