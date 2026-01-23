import {
  AfterViewInit,
  Component,
  contentChild,
  effect,
  ElementRef,
  input,
  linkedSignal,
  OnDestroy,
  viewChild
} from '@angular/core';
import {CdkScrollable} from "@angular/cdk/scrolling";
import {KeyValuePipe, NgClass} from "@angular/common";
import {Subscription} from "rxjs";

export type Side = "top" | "bottom" | "left" | "right";

@Component({
  selector: 'shadow-scroll',
  imports: [
    CdkScrollable,
    KeyValuePipe,
    NgClass
  ],
  templateUrl: './shadow-scroll.component.html',
  styleUrl: './shadow-scroll.component.scss'
})
export class ShadowScrollComponent implements AfterViewInit, OnDestroy {
  marginDetection = input(5)
  scroll = viewChild.required(CdkScrollable)
  height = input<number | undefined>(undefined)
  width = input<number | undefined>(undefined)


  visibility = new Map<Side, boolean>([
      ["top", false],
      ["bottom", false],
      ["left", false],
      ["right", false],
    ]
  )

  scrollDimensions = linkedSignal(() => this.getScrollDimensions());
  scrollDimensionsObserver = new ResizeObserver(() => this.scrollDimensions.set(this.getScrollDimensions()));

  getScrollDimensions() {
    const scrollPanel = this.scroll().getElementRef().nativeElement;
    return {
      bottom: scrollPanel.offsetHeight - scrollPanel.clientHeight,
      right: scrollPanel.offsetWidth - scrollPanel.clientWidth,
    };
  }

  constructor(public elementRef: ElementRef<HTMLElement>) {
  }

  private onScroll!: Subscription;

  ngAfterViewInit(): void {
    this.resizeObserver.observe(this.scroll().getElementRef().nativeElement)
    this.updateShadows();
    this.onScroll = this.scroll().elementScrolled().subscribe(() => this.updateShadows());
  }

  ngOnDestroy(): void {
  this.resizeObserver.disconnect();
  this.onScroll.unsubscribe();
  }

  private resizeObserver = new ResizeObserver(() => this.updateShadows());

  updateShadows() {
    this.visibility.forEach((v, k) => {
      this.visibility.set(k, this.scroll().measureScrollOffset(k) > this.marginDetection())
    });
  }
}
