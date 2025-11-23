import { AspectRatio, Resolution } from "./types";

export const ASPECT_RATIOS: AspectRatio[] = [
  '1:1', '3:4', '4:3', '3:2', '2:3', '16:9', '9:16', '21:9'
];

export const RESOLUTIONS: Resolution[] = ['1K', '2K', '4K'];

export const DEFAULT_SETTINGS = {
  temperature: 0.7,
  resolution: '1K' as Resolution,
  aspectRatio: '1:1' as AspectRatio,
  numberOfImages: 1,
  useGrounding: false,
};

export const MAX_IMAGES = 4;
