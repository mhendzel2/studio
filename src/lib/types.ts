import type { CellposeSegmentationOutput, MorphometricFeatureExtractionOutput, AnalysisOutput } from "@/ai/flows/statistical-analysis";

export type ImageFile = {
  id: string;
  file: File;
  dataUrl: string;
  segmentationResult?: CellposeSegmentationOutput;
  features?: MorphometricFeatureExtractionOutput['features'];
};

export type Dataset = {
  id: string;
  name: string;
  images: ImageFile[];
};

export type AppState = {
  datasets: Dataset[];
  statisticalResults?: AnalysisOutput;
  activeTab: string;
};

export type AppContextType = AppState & {
  addDataset: (name: string, files: File[]) => void;
  updateImage: (datasetId: string, imageId: string, updates: Partial<ImageFile>) => void;
  updateDataset: (datasetId: string, updates: Partial<Dataset>) => void;
  setStatisticalResults: (results: AnalysisOutput) => void;
  setActiveTab: (tab: string) => void;
  resetState: () => void;
};
