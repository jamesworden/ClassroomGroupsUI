import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  Renderer2,
} from '@angular/core';

export enum ResizableSide {
  TOP,
  RIGHT,
  BOTTOM,
  LEFT,
}

const borderClass: { [side: string]: string } = {
  [ResizableSide.TOP]: 'resizeable-border-top',
  [ResizableSide.RIGHT]: 'resizeable-border-right',
  [ResizableSide.BOTTOM]: 'resizeable-border-bottom',
  [ResizableSide.LEFT]: 'resizeable-border-left',
};

const cursorClass: { [side: string]: string } = {
  [ResizableSide.TOP]: 'cursor-row-resize',
  [ResizableSide.RIGHT]: 'cursor-col-resize',
  [ResizableSide.BOTTOM]: 'cursor-row-resize',
  [ResizableSide.LEFT]: 'cursor-col-resize',
};

@Directive({
  selector: '[appResizeable]',
  standalone: true,
})
export class ResizeableDirective {
  readonly #elementRef = inject(ElementRef<HTMLElement>);
  readonly #renderer2 = inject(Renderer2);

  readonly resizableSides = input<ResizableSide[]>([]);
  readonly edgeWidth = input(10);
  readonly panelWidth = input(300);
  readonly maxWidth = input(400);
  readonly minWidth = input(200);
  readonly panelHeight = input(300);
  readonly maxHeight = input(600);
  readonly minHeight = input(200);
  readonly persistenceKey = input<string | null>(null);

  readonly resizedWidth = output<number>();
  readonly resizedHeight = output<number>();

  private startDragX = 0;
  private startDragY = 0;
  private startDragWidth = 0;
  private startDragHeight = 0;
  private mouseIsOnEdge = false;
  private isResizing = false;

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const isInEdge = this.isInEdge(mouseX, mouseY);

    if (isInEdge) {
      this.addBorderStyles();
      this.mouseIsOnEdge = true;
    } else {
      this.mouseIsOnEdge = false;
      if (!this.isResizing) {
        this.removeBorderStyles();
        return;
      }
    }

    if (this.isResizing) {
      this.shapeshift(mouseX, mouseY);
    }
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    if (!this.isResizing) {
      this.removeBorderStyles();
    }
    this.mouseIsOnEdge = false;
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (this.mouseIsOnEdge) {
      this.isResizing = true;
      this.startDragX = event.clientX;
      this.startDragY = event.clientY;
      this.startDragWidth = this.panelWidth();
      this.startDragHeight = this.panelHeight();
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isResizing = false;
    if (!this.mouseIsOnEdge) {
      this.removeBorderStyles();
    }
  }

  private shapeshift(mouseX: number, mouseY: number) {
    if (
      this.resizableSides().includes(ResizableSide.TOP) ||
      this.resizableSides().includes(ResizableSide.BOTTOM)
    ) {
      const deltaY = this.startDragY - mouseY;
      const height = this.startDragHeight + deltaY;
      if (height > this.minHeight() && height < this.maxHeight()) {
        this.resizedHeight.emit(height);
      }
    }
    if (
      this.resizableSides().includes(ResizableSide.RIGHT) ||
      this.resizableSides().includes(ResizableSide.LEFT)
    ) {
      const deltaX = mouseX - this.startDragX;
      const width = this.startDragWidth + deltaX;
      if (width > this.minWidth() && width < this.maxWidth()) {
        this.resizedWidth.emit(width);
      }
    }
  }

  /**
   * Warning: For a RIGHT or LEFT resize, there is no check to make sure
   * the mouse is close to the div that's being resized itself.
   *
   * There is also no support for TOP and LEFT checks at the moment.
   */
  private isInEdge(mouseX: number, mouseY: number) {
    const elementRect = this.#elementRef.nativeElement.getBoundingClientRect();
    return (
      (this.resizableSides().includes(ResizableSide.TOP) &&
        mouseY < elementRect.top + this.edgeWidth() &&
        mouseY > elementRect.top &&
        mouseX < elementRect.right &&
        mouseX > elementRect.left) ||
      (this.resizableSides().includes(ResizableSide.RIGHT) &&
        mouseX > elementRect.right - this.edgeWidth() &&
        mouseX < elementRect.right)
    );
  }

  private addBorderStyles() {
    for (const side of this.resizableSides()) {
      this.#renderer2.addClass(
        this.#elementRef.nativeElement,
        borderClass[side]
      );
      this.#renderer2.addClass(
        this.#elementRef.nativeElement,
        cursorClass[side]
      );
    }
  }

  private removeBorderStyles() {
    for (const side of this.resizableSides()) {
      this.#renderer2.removeClass(
        this.#elementRef.nativeElement,
        borderClass[side]
      );
      this.#renderer2.removeClass(
        this.#elementRef.nativeElement,
        cursorClass[side]
      );
    }
  }
}
