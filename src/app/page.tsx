'use client';

import { AppProvider } from '@/context/app-context';
import { Header } from '@/components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataInputTab } from '@/components/tabs/data-input-tab';
import { SegmentationTab } from '@/components/tabs/segmentation-tab';
import { AnalysisTab } from '@/components/tabs/analysis-tab';
import { VisualizationTab } from '@/components/tabs/visualization-tab';
import { ExportTab } from '@/components/tabs/export-tab';
import {
  FileUp,
  Scissors,
  Calculator,
  BarChart,
  FileDown,
} from 'lucide-react';
import { useAppState } from '@/hooks/use-app-state';
import { useMemo } from 'react';

function MainContent() {
  const { datasets, activeTab, setActiveTab } = useAppState();

  const isDataInputComplete = useMemo(() => {
    return datasets.length > 0 && datasets.some(d => d.images.length > 0);
  }, [datasets]);

  const isSegmentationComplete = useMemo(() => {
    if (!isDataInputComplete) return false;
    return datasets.every(d => 
      d.images.every(img => img.segmentationResult)
    );
  }, [datasets, isDataInputComplete]);

  const isAnalysisComplete = useMemo(() => {
    if(!isSegmentationComplete) return false;
    return datasets.every(d => d.images.every(img => img.features && img.features.length > 0));
  },[datasets, isSegmentationComplete]);

  return (
    <main className="flex-1 p-4 md:p-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
          <TabsTrigger value="data-input" className="flex gap-2">
            <FileUp size={16} /> Data Input
          </TabsTrigger>
          <TabsTrigger value="segmentation" disabled={!isDataInputComplete} className="flex gap-2">
            <Scissors size={16} /> Segmentation
          </TabsTrigger>
          <TabsTrigger value="analysis" disabled={!isSegmentationComplete} className="flex gap-2">
            <Calculator size={16} /> Analysis
          </TabsTrigger>
          <TabsTrigger value="visualization" disabled={!isAnalysisComplete} className="flex gap-2">
            <BarChart size={16} /> Visualization
          </TabsTrigger>
          <TabsTrigger value="export" disabled={!isAnalysisComplete} className="flex gap-2">
            <FileDown size={16} /> Export
          </TabsTrigger>
        </TabsList>
        <TabsContent value="data-input">
          <DataInputTab />
        </TabsContent>
        <TabsContent value="segmentation">
          <SegmentationTab />
        </TabsContent>
        <TabsContent value="analysis">
          <AnalysisTab />
        </TabsContent>
        <TabsContent value="visualization">
          <VisualizationTab />
        </TabsContent>
        <TabsContent value="export">
          <ExportTab />
        </TabsContent>
      </Tabs>
    </main>
  );
}


export default function Home() {
  return (
    <AppProvider>
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <MainContent />
      </div>
    </AppProvider>
  );
}
