import {Injectable, signal} from '@angular/core';


export enum DownloadTarget {
  REACFOAM = 'reacfoam',
  DIAGRAM = 'diagram'
}

export enum DownloadFormat {
  SVG = 'svg',
  PNG = 'png',
  JPEG = 'jpeg',
  PPTX = 'pptx',
  GIF = 'gif',
}

export const IMAGES_FORMAT = {
  PNG: DownloadFormat.PNG,
  JPEG: DownloadFormat.JPEG
} as const;


export type ImageType = typeof IMAGES_FORMAT[keyof typeof IMAGES_FORMAT];

export type DownloadRequest = {
  target: DownloadTarget.DIAGRAM | DownloadTarget.REACFOAM;
  format: DownloadFormat;
} | null

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  readonly downloadRequest = signal<DownloadRequest>(null)

  requestDownload(target: DownloadTarget, format: DownloadFormat) {
    this.downloadRequest.set({target, format})
  }

  resetDownload() {
    this.downloadRequest.set(null);
  }

  constructor() {
  }

  isFoamtreeFormat(format: DownloadFormat): format is ImageType {
    return format === DownloadFormat.PNG || format === DownloadFormat.JPEG;
  }

  toFoamtreeType(format: ImageType) {
    return `image/${format}` as 'image/png' | 'image/jpeg';
  }

}
