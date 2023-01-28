import { Directive, ElementRef, Input, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appScroll]'
})
export class ScrollDirective implements AfterViewInit {

  @Input() config: { refreshable: boolean } = { refreshable: false }

  private protrusion: number = 50

  constructor(
    private host: ElementRef
  ) { }

  genereate(el: HTMLElement): void {
    const rect = el.getBoundingClientRect()

    el.style.width = rect.width+'px'
    el.style.height = rect.height+'px'
    el.style.overflowY = 'scroll'
    el.style.display = 'flex'
    el.style.flexDirection = 'column'
    el.style.alignItems = 'stretch'
    el.style.justifyContent = 'flex-start'

    const heightMargin = rect.height-this.protrusion

    const firstMargin = document.createElement('div')
    firstMargin.classList.add('scroll-margin', 'scroll-margin_last')
    firstMargin.style.height = heightMargin+'px'

    const lastMargin = document.createElement('div')
    lastMargin.classList.add('scroll-margin', 'scroll-margin_first')
    lastMargin.style.height = heightMargin+'px'

    el.prepend(firstMargin)
    el.append(lastMargin)

    Array.from(el.children).forEach((child: any) => child.style.flexShrink = '0');

    el.scrollTop = heightMargin
  }

  ngAfterViewInit(): void {
    this.genereate(this.host.nativeElement)
  }

}
