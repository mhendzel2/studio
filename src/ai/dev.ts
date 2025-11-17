import { config } from 'dotenv';
config();

import '@/ai/flows/cellpose-segmentation.ts';
import '@/ai/flows/statistical-analysis.ts';
import '@/ai/flows/morphometric-feature-extraction.ts';
import '@/ai/flows/nd-file-parser.ts';
