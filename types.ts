export type AspectRatio = '1:1' | '3:4' | '4:3' | '3:2' | '2:3' | '16:9' | '9:16' | '21:9';
export type Resolution = '1K' | '2K' | '4K';

export interface GenerationSettings {
  prompt: string;
  temperature: number;
  resolution: Resolution;
  aspectRatio: AspectRatio;
  numberOfImages: number;
  useGrounding: boolean;
  referenceImage?: {
    data: string;
    mimeType: string;
  } | null;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  settings: GenerationSettings;
  createdAt: number;
}

export interface ModelConfig {
  modelName: string;
  requiresPaidKey: boolean;
}