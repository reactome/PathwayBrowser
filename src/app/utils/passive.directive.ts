import {computed, Directive, effect, ElementRef, input, OnDestroy, OnInit, Renderer2} from '@angular/core';

type EventType = keyof HTMLElementEventMap;

@Directive({
  selector: '[passive]'
})
export class PassiveDirective implements OnInit, OnDestroy {
  listeners = input.required<{
    [K in keyof HTMLElementEventMap]?: (event: HTMLElementEventMap[K]) => void
  }>({alias: 'passive'})
  once = input(false)
  capture = input(false)

  options = computed(() => ({passive: true, once: this.once(), capture: this.capture()}))

  private removers: (() => void)[] = []

  constructor(private element: ElementRef, private renderer: Renderer2) {
    effect(() => {
      this.clear();
      const [listeners, options] = [this.listeners(), this.options()];
      if (!listeners) return console.warn('No listeners provided');
      this.removers = Object.entries(listeners)
        .map(([type, listener]) =>
          this.renderer.listen(this.element.nativeElement, type, listener, options)
        );
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.clear()
  }

  clear() {
    this.removers.forEach(remove => remove());
    this.removers = [];
  }

}
