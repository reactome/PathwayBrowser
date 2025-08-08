import {AfterViewInit, Directive, ElementRef, OnDestroy, output} from "@angular/core";

@Directive({
  selector: '[item-resize]',
})
export class ItemResizeObserverDirective implements AfterViewInit, OnDestroy {
   heightChange = output<number>()

  private ro = new ResizeObserver(entries => {
    for (const entry of entries) {
      this.heightChange.emit(entry.contentRect.height);
    }
  });

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    this.ro.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    this.ro.disconnect();
  }
}
