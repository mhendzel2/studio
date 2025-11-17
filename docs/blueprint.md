# **App Name**: FluoroSegStat

## Core Features:

- Image Upload and Batch Processing: Allow users to upload entire folders of multi-channel fluorescence images. Automatically group images from the same folder into datasets.
- Nuclei Segmentation with Cellpose 3.0: Implement Cellpose 3.0 for nucleus segmentation, using the DAPI channel as the primary channel for segmentation. Include border handling to exclude objects at the border of the image. Allow users to input other model parameters to fine-tune the process.
- Morphometric Analysis: Measure intensity and relevant morphometric features (area, perimeter, circularity, etc.) for each segmented nucleus.
- Statistical Analysis: Perform statistical analysis (t-tests, ANOVA, etc.) to compare morphometric data between different datasets/experimental conditions. This tool should automatically apply appropriate corrections such as bonferroni.
- Data Visualization: Present the statistical results via box plots and violin plots and/or other relevant plotting schemes. The visualization of the source image(s) must overlay the segmentations to assess their accuracy.
- Data Export: Allow users to export both the raw morphometric data and the statistical analysis results in commonly used formats (CSV, Excel, etc.).

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to evoke a sense of scientific rigor and reliability.
- Background color: Light gray (#F0F0F0) to provide a clean and neutral backdrop for data visualization.
- Accent color: Soft teal (#80CBC4) for interactive elements and highlights, contrasting with the primary blue to draw attention.
- Body and headline font: 'Inter', a grotesque-style sans-serif with a modern, machined, objective, neutral look; suitable for headlines or body text
- Use clear and scientific icons (e.g., microscope, chart, graph) from a consistent set like Material Design Icons to represent different features and data categories.
- Use a tabbed interface to organize different stages of the workflow (Data Input, Segmentation, Analysis, Visualization, Export). Adopt a modular and responsive layout.
- Use subtle transitions and animations to enhance user experience, like a progress bar during image processing and smooth transitions between analysis and visualization panels.