import { Directive, ElementRef, Input, AfterViewInit, HostListener } from '@angular/core';

@Directive({
  selector: '[appScroll]'
})
export class ScrollDirective implements AfterViewInit {

  @Input() config: { refreshable: boolean } = { refreshable: false }

  private protrusion: number = 50

  constructor(
    private host: ElementRef
  ) { }

  @HostListener('window:resize') onResize(): void {
    this.generate()
  }

  generate(): void {
    let el: HTMLElement = this.host.nativeElement

    if (el.firstChild && (el.firstChild as any)?.classList?.contains('scroll-margin')) el.firstChild.remove()
    if (el.lastChild && (el.lastChild as any)?.classList?.contains('scroll-margin')) el.lastChild.remove()

    const rect = el.getBoundingClientRect()

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
  }

  scrollToStart(): void {
    const el: HTMLElement = this.host.nativeElement
    const rect = el.getBoundingClientRect()
    const heightMargin = rect.height-this.protrusion
    this.host.nativeElement.scrollTop = heightMargin
  }

  ngAfterViewInit(): void {
    this.generate()
    this.scrollToStart()

  }

}
