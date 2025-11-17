'use client';
import { useAppState } from '@/hooks/use-app-state';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Image from 'next/image';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export function VisualizationTab() {
  const { datasets, statisticalResults } = useAppState();
  const [selectedFeature, setSelectedFeature] = useState('area');
  
  const featureOptions = datasets[0]?.images[0]?.features?.[0] ? Object.keys(datasets[0].images[0].features[0]).filter(k => k !== 'nucleusId') : ['area', 'perimeter', 'circularity', 'meanIntensity'];
  
  const allImages = datasets.flatMap(d => d.images);

  const chartData = datasets.map(dataset => {
    const allFeatures = dataset.images.flatMap(img => img.features || []);
    const featureData = allFeatures.map(f => (f as any)[selectedFeature] || 0);
    const mean = featureData.reduce((a, b) => a + b, 0) / (featureData.length || 1);
    return {
      name: dataset.name,
      [selectedFeature]: mean,
    };
  });
  
  const pValueData = statisticalResults?.results.map(r => ({
      ...r,
      significant: r.corrected_p_value < 0.05
  }));


  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Data Visualization</CardTitle>
          <CardDescription>
            Visualize the morphometric and statistical analysis results.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="feature-select">Select Feature to Plot</Label>
            <Select value={selectedFeature} onValueChange={setSelectedFeature}>
              <SelectTrigger id="feature-select" className="w-[200px]">
                <SelectValue placeholder="Select feature" />
              </SelectTrigger>
              <SelectContent>
                {featureOptions.map(f => (
                  <SelectItem key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                tickFormatter={(value) => value.toExponential(1)}
                label={{ value: `Mean ${selectedFeature}`, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip formatter={(value: number) => value.toFixed(2)} />
              <Legend />
              <Bar dataKey={selectedFeature} fill="var(--color-primary)" name={`Mean ${selectedFeature}`}>
                 <LabelList dataKey={selectedFeature} position="top" formatter={(value: number) => value.toFixed(0)} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {pValueData && pValueData.length > 0 &&
        <Card>
            <CardHeader>
                <CardTitle>Statistical Significance</CardTitle>
                <CardDescription>Corrected P-values for pairwise comparisons.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={pValueData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="comparison" type="category" width={150} />
                      <Tooltip formatter={(value: number) => value.toExponential(3)} />
                      <Legend />
                      <Bar dataKey="corrected_p_value" name="Corrected p-value" fill="var(--color-accent)" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      }

      <Card>
        <CardHeader>
            <CardTitle>Segmentation Viewer</CardTitle>
            <CardDescription>Review segmentation accuracy for each image.</CardDescription>
        </CardHeader>
        <CardContent>
            <Carousel className="w-full max-w-4xl mx-auto">
                <CarouselContent>
                    {allImages.map(image => (
                        <CarouselItem key={image.id}>
                            <div className="p-1">
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                                        <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                                            <Image src={image.dataUrl} alt={image.file.name} layout="fill" objectFit="contain" />
                                            {image.segmentationResult && (
                                                <Image 
                                                    src={image.segmentationResult.segmentationResult} 
                                                    alt="Segmentation Mask" 
                                                    layout="fill" 
                                                    objectFit="contain" 
                                                    className="opacity-50 mix-blend-screen"
                                                />
                                            )}
                                        </div>
                                        <span className="text-sm font-medium truncate">{image.file.name}</span>
                                        <span className="text-xs text-muted-foreground">Nuclei: {image.segmentationResult?.nucleiCount ?? 'N/A'}</span>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </CardContent>
      </Card>
    </div>
  );
}
