import {Injectable, signal} from '@angular/core';
import {trace} from "vectorious";


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

export interface DownloadOptions {
  animate: boolean,
  includeLegend: boolean,
  includeTimeline: boolean,
  timePerFrame: number,
  transitionTime: number,
}

export const defaultDownloadOptions : DownloadOptions= {
  animate: false,
  includeLegend: true,
  includeTimeline: true,
  timePerFrame: 2,
  transitionTime: 0.1,
}

export type ImageType = typeof IMAGES_FORMAT[keyof typeof IMAGES_FORMAT];

export type DownloadRequest = {
  target: DownloadTarget.DIAGRAM | DownloadTarget.REACFOAM;
  format: DownloadFormat;
  options?: DownloadOptions;
} | null

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  readonly downloadRequest = signal<DownloadRequest>(null)

  requestDownload(target: DownloadTarget, format: DownloadFormat, options?: DownloadOptions) {
    this.downloadRequest.set({target, format, options: options || defaultDownloadOptions})
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
