import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
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
};

const cursorClass: { [side: string]: string } = {
  [ResizableSide.TOP]: 'cursor-row-resize',
  [ResizableSide.RIGHT]: 'cursor-col-resize',
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

  @HostListener('mousemove', ['$event']) onMouseMove(event: MouseEvent) {
    if (this.isInEdge(event.clientX, event.clientY)) {
      this.addBorderStyles();
    } else {
      this.removeBorderStyles();
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.removeBorderStyles();
  }

  private isInEdge(mouseX: number, mouseY: number) {
    const elementRect = this.#elementRef.nativeElement.getBoundingClientRect();

    return (
      (this.resizableSides().includes(ResizableSide.TOP) &&
        mouseY < elementRect.top + this.edgeWidth()) ||
      (this.resizableSides().includes(ResizableSide.RIGHT) &&
        mouseX > elementRect.right - this.edgeWidth())
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
