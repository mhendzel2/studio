'use client';
import { useAppState } from '@/hooks/use-app-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ExportTab() {
  const { datasets, statisticalResults } = useAppState();
  const { toast } = useToast();

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(fieldName => JSON.stringify(row[fieldName])).join(',')
      ),
    ];
    return csvRows.join('\r\n');
  };

  const downloadCSV = (csvString: string, filename: string) => {
    if (!csvString) {
        toast({ title: 'No data to export', variant: 'destructive' });
        return;
    }
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast({ title: `Successfully downloaded ${filename}` });
  };

  const handleExportRawData = () => {
    const rawData = datasets.flatMap(dataset =>
      dataset.images.flatMap(image =>
        (image.features || []).map(feature => ({
          dataset_name: dataset.name,
          image_name: image.file.name,
          nucleus_id: feature.nucleusId,
          area: feature.area,
          perimeter: feature.perimeter,
          circularity: feature.circularity,
          mean_intensity: feature.meanIntensity,
        }))
      )
    );
    const csv = convertToCSV(rawData);
    downloadCSV(csv, 'morphometric_raw_data.csv');
  };

  const handleExportStatsData = () => {
    if (!statisticalResults || statisticalResults.results.length === 0) {
        toast({ title: 'No statistical results to export', variant: 'destructive' });
        return;
    }
    const csv = convertToCSV(statisticalResults.results);
    downloadCSV(csv, 'statistical_analysis_results.csv');
  };
  
  const canExport = datasets.some(d => d.images.some(i => i.features && i.features.length > 0));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Data</CardTitle>
        <CardDescription>
          Download your morphometric and statistical analysis data in CSV format.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-4">
        <Button onClick={handleExportRawData} disabled={!canExport}>
          <FileDown className="mr-2 h-4 w-4" />
          Export Raw Morphometric Data
        </Button>
        <Button onClick={handleExportStatsData} disabled={!statisticalResults}>
          <FileDown className="mr-2 h-4 w-4" />
          Export Statistical Results
        </Button>
      </CardContent>
    </Card>
  );
}
