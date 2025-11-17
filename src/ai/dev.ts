import { config } from 'dotenv';
config();

import '@/ai/flows/cellpose-segmentation.ts';
import '@/ai/flows/statistical-analysis.ts';
import '@/ai/flows/morphometric-feature-extraction.ts';