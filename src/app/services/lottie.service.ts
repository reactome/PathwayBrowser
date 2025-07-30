import {Injectable} from '@angular/core';
import {Data, DotLottie, DotLottieWorker, EventManager, Layout, Mode, RenderConfig} from "@lottiefiles/dotlottie-web";

let module: {
  DotLottie: typeof DotLottie;
  DotLottieWorker?: typeof DotLottieWorker;
  EventManager?: typeof EventManager;
} | undefined = undefined


interface Config {
  animationId?: string;
  autoplay?: boolean;
  backgroundColor?: string;
  canvas: HTMLCanvasElement | OffscreenCanvas;
  data?: Data;
  layout?: Layout;
  loop?: boolean;
  marker?: string;
  mode?: Mode;
  renderConfig?: RenderConfig;
  segment?: [number, number];
  speed?: number;
  src?: string;
  themeId?: string;
  useFrameInterpolation?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LottieService {


  constructor() {

  }

  async buildLottie(params: Config) {
    if (module === undefined) module = await import('@lottiefiles/dotlottie-web')
    return new module.DotLottie(params)
  }


}
