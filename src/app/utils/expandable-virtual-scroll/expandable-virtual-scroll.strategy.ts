import {CdkVirtualScrollViewport, FixedSizeVirtualScrollStrategy} from '@angular/cdk/scrolling';
import {BehaviorSubject} from 'rxjs';

export class ExpandableVirtualScrollStrategy extends FixedSizeVirtualScrollStrategy {
  private _indexToHeight = new Map<number, number>();
  private viewport: CdkVirtualScrollViewport | null = null;

  override scrolledIndexChange = new BehaviorSubject<number>(0);
  private itemSize: number = 28;
  private minBufferPx: number = 100;
  private maxBufferPx: number = 200;

  constructor() {
    console.log('Expandable Virtual Scroll Strategy.');
    super(28, 100, 200);
  }

  override attach(viewport: CdkVirtualScrollViewport): void {
    // super.attach(viewport);
    this.viewport = viewport;
    console.log('Attempting to attach', viewport);
  }

  setItemHeight(index: number, height: number) {
    if (height && (this._indexToHeight.has(index) || height !== this.itemSize)) {
      if (height === this.itemSize) {
        this._indexToHeight.delete(index);
      } else {
        this._indexToHeight.set(index, height);
      }
      console.log(index, height);
      this._updateViewport();
    }
  }

  private _updateViewport() {
    if (!this.viewport) return;

    const dataLength = this.viewport.getDataLength();
    const scrollOffset = this.viewport.measureScrollOffset();
    const viewportSize = this.viewport.getViewportSize();

    // === Step 1: Determine start index ===
    let offset = 0;
    let start = 0;
    while (
      start < dataLength &&
      offset + this._getItemHeight(start) < scrollOffset - this.minBufferPx
      ) {
      offset += this._getItemHeight(start);
      start++;
    }

    // === Step 2: Determine end index ===
    let end = start;
    let visibleHeight = 0;
    while (
      end < dataLength &&
      visibleHeight < viewportSize + this.maxBufferPx
      ) {
      visibleHeight += this._getItemHeight(end);
      end++;
    }

    const renderedContentOffset = this._getOffsetForIndex(start);
    const totalContentSize = this._getTotalContentSize(dataLength);

    this.viewport.setRenderedRange({ start, end });
    this.viewport.setRenderedContentOffset(renderedContentOffset);
    this.viewport.setTotalContentSize(totalContentSize);
    this.scrolledIndexChange.next(start);
  }

  private _getItemHeight(index: number): number {
    return this._indexToHeight.get(index) ?? this.itemSize;
  }

  private _getOffsetForIndex(index: number): number {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += this._getItemHeight(i);
    }
    return offset;
  }

  private _getTotalContentSize(dataLength: number): number {
    let total = 0;
    for (let i = 0; i < dataLength; i++) {
      total += this._getItemHeight(i);
    }
    return total;
  }

  // === Hook triggers ===

  override onContentScrolled(): void {
    this._updateViewport();
  }

  override onDataLengthChanged(): void {
    this._updateViewport();
  }

  override onContentRendered(): void {
    this._updateViewport();
  }

  override onRenderedOffsetChanged(): void {
    // Optional, usually not needed unless scrollToIndex used
  }

  override scrollToIndex(index: number, behavior: ScrollBehavior): void {
    const offset = this._getOffsetForIndex(index);
    this.viewport?.scrollToOffset(offset, behavior);
  }
}
