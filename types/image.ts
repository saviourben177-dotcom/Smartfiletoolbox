export type ImageFormat = 'jpeg' | 'png' | 'webp';

export interface ImageAsset {
  uri: string;
  width: number;
  height: number;
  fileSize?: number;
  fileName?: string;
}

export interface ImageEditState {
  rotationDeg: number;
  cropEnabled: boolean;
  crop?: { originX: number; originY: number; width: number; height: number };
}
