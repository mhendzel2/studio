'use client';

import { createContext, useState, ReactNode, useCallback } from 'react';
import type { AppState, AppContextType, Dataset, ImageFile, AnalysisOutput } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialState: AppState = {
  datasets: [],
  statisticalResults: undefined,
  activeTab: 'data-input',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  const addDataset = useCallback((name: string, files: File[]) => {
    const newImages: ImageFile[] = files.map(file => ({
      id: uuidv4(),
      file,
      dataUrl: URL.createObjectURL(file),
    }));

    const existingDatasetIndex = state.datasets.findIndex(d => d.name === name);

    if (existingDatasetIndex > -1) {
      // Add images to existing dataset
      setState(prevState => {
        const newDatasets = [...prevState.datasets];
        newDatasets[existingDatasetIndex] = {
          ...newDatasets[existingDatasetindex],
          images: [...newDatasets[existingDatasetIndex].images, ...newImages],
        };
        return { ...prevState, datasets: newDatasets };
      });
    } else {
      // Create new dataset
      const newDataset: Dataset = {
        id: uuidv4(),
        name,
        images: newImages,
      };
      setState(prevState => ({
        ...prevState,
        datasets: [...prevState.datasets, newDataset],
      }));
    }
  }, [state.datasets]);

  const updateImage = useCallback((datasetId: string, imageId: string, updates: Partial<ImageFile>) => {
    setState(prevState => ({
      ...prevState,
      datasets: prevState.datasets.map(dataset =>
        dataset.id === datasetId
          ? {
              ...dataset,
              images: dataset.images.map(image =>
                image.id === imageId ? { ...image, ...updates } : image
              ),
            }
          : dataset
      ),
    }));
  }, []);

  const updateDataset = useCallback((datasetId: string, updates: Partial<Dataset>) => {
    setState(prevState => ({
      ...prevState,
      datasets: prevState.datasets.map(dataset =>
        dataset.id === datasetId ? { ...dataset, ...updates } : dataset
      ),
    }));
  }, []);

  const setStatisticalResults = useCallback((results: AnalysisOutput) => {
    setState(prevState => ({ ...prevState, statisticalResults: results }));
  }, []);

  const setActiveTab = useCallback((tab: string) => {
    setState(prevState => ({ ...prevState, activeTab: tab }));
  }, []);
  
  const resetState = useCallback(() => {
    state.datasets.forEach(dataset => {
        dataset.images.forEach(image => {
            URL.revokeObjectURL(image.dataUrl);
        });
    });
    setState(initialState);
  }, [state.datasets]);

  return (
    <AppContext.Provider
      value={{
        ...state,
        addDataset,
        updateImage,
        updateDataset,
        setStatisticalResults,
        setActiveTab,
        resetState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export { AppContext };
