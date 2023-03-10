import { Directive, ElementRef, Input, AfterViewInit, HostListener, OnDestroy, OnInit, EventEmitter } from '@angular/core'
import { Subscription } from 'rxjs'

@Directive({
  selector: '[appScroll]'
})
export class ScrollDirective implements AfterViewInit, OnInit, OnDestroy {

  @Input('appScrollConfig') config: { refreshable: boolean } = { refreshable: false }
  @Input() doScrollToStart: EventEmitter<void> = new EventEmitter<void>()

  subs: Array<Subscription> = []

  private protrusion: number = 50
  private maxRefreshHeight: number = 50

  private refreshRotating: boolean = false

  private prevHeightRefresh: number = 0

  private touch: { startX: number, startY: number, firstMove: boolean, axis: 'vertical' | 'horizontal' } = {
    startX: 0,
    startY: 0,
    firstMove: true,
    axis: 'vertical'
  }
  private scrollPositionAtStartTouch: number = 0

  constructor(
    private host: ElementRef
  ) { }

  getCoordFromTouch(event: TouchEvent): { x: number, y: number } {
    return {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    }
  }

  @HostListener('window:resize') onResize(): void {
    this.generate()
  }

  @HostListener('window:touchstart', ['$event']) onTouchstart(e: TouchEvent): void {
    const { x, y } = this.getCoordFromTouch(e)
    const el = this.host.nativeElement as HTMLElement

    this.touch.startX = x
    this.touch.startY = y
    this.scrollPositionAtStartTouch = el.scrollTop
  }

  @HostListener('window:touchmove', ['$event']) onTouchmove(e: TouchEvent): void {
    const { x, y } = this.getCoordFromTouch(e)

    if (this.touch.firstMove) {
      if (Math.abs(x-this.touch.startX) > Math.abs(y-this.touch.startY)) {
        this.touch.axis = 'horizontal'
      } else {
        this.touch.axis = 'vertical'
      }
      this.touch.firstMove = false
    }

    if (this.touch.axis === 'vertical') {
      if (this.scrollPositionAtStartTouch === 0 && this.config.refreshable) {
        this.setHeightRefresh(y-this.touch.startY)
      }
    }
  }

  @HostListener('window:touchend', ['$event']) onTouchend(e: TouchEvent): void {
    this.touch.firstMove = true

    const el: HTMLElement = this.host.nativeElement
    const refresh = el.querySelector('.scroll-refresh') as HTMLElement
    const rect = refresh.getBoundingClientRect()
    if (rect.height >= this.maxRefreshHeight) {
      this.refreshPage()
    } else {
      this.setHeightRefresh(0, true)
    }
  }

  refreshPage(): void {
    window.location.reload()
  }

  setHeightRefresh(height: number, animated: boolean = false): void {
    let el: HTMLElement = this.host.nativeElement
    if (height > this.maxRefreshHeight) height = this.maxRefreshHeight
    if (height < 0) height = 0
    let refresh = el.querySelector('.scroll-refresh') as HTMLElement

    if (height === this.maxRefreshHeight && this.prevHeightRefresh !== this.maxRefreshHeight) this.rotateRefresh()

    if (animated) {
      const ms = 200
      refresh.style.transition = `all ease ${ms}ms`
      setTimeout(() => {
        refresh!.style.height = height+'px'
        setTimeout(() => {
          refresh.style.removeProperty('transition')
        }, ms+50)
      }, 10)
    } else {
      refresh!.style.height = height+'px'
      // refresh!.style.transform = `translateY(${-100+200*(height/this.maxRefreshHeight)}px)`
      // const icon: any = refresh.querySelector('.scroll-refresh__icon')
      // const text: any = refresh.querySelector('.scroll-refresh__text')
      // icon.style.opacity = `${height/this.maxRefreshHeight}`
      // text.style.opacity = `${height/this.maxRefreshHeight}`
    }

    this.prevHeightRefresh = height
  }

  generate(): void {
    let el: HTMLElement = this.host.nativeElement

    const oldScrollPosition = el.scrollTop

    const margins = Array.from(el.querySelectorAll('.scroll-margin'))
    margins.forEach(element => element.remove());

    const refreshes = Array.from(el.querySelectorAll('.scroll-refresh'))
    refreshes.forEach(element => element.remove());

    const backgrounds = Array.from(el.querySelectorAll('.scroll-background'))
    backgrounds.forEach(element => element.remove());

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

    const refresh = document.createElement('div')
    refresh.classList.add('scroll-refresh')
    refresh.style.position = 'absolute'
    refresh.style.width = 'inherit'
    refresh.style.height = '0px'
    // refresh.style.backgroundColor = '#00000022'
    refresh.style.display = 'flex'
    refresh.style.flexDirection = 'row'
    refresh.style.alignItems = 'flex-end'
    refresh.style.justifyContent = 'center'
    refresh.style.overflow = 'hidden'
    // refresh.style.boxShadow = 'inset 0px 0px 5px #00000033'
    const refreshIcon = document.createElement('div')
    refreshIcon.classList.add('scroll-refresh__icon')
    refreshIcon.style.margin = '10px'
    refreshIcon.style.width = '30px'
    refreshIcon.style.height = '30px'
    refreshIcon.style.backgroundImage = 'url(assets/refresh.svg)'
    refreshIcon.style.backgroundPosition = 'center'
    refreshIcon.style.backgroundSize = 'contain'
    refreshIcon.style.backgroundRepeat = 'no-repeat'
    refresh.append(refreshIcon)
    const refreshText = document.createElement('div')
    refreshText.classList.add('scroll-refresh__text')
    refreshText.style.color = '#ffffff'
    refreshText.style.fontFamily = '"Noto Sans", sans-serif'
    refreshText.style.fontSize = '14px'
    refreshText.style.marginBottom = '15px'
    refreshText.innerHTML = 'refresh'
    refresh.append(refreshText)

    const lastMargin = document.createElement('div')
    lastMargin.classList.add('scroll-margin', 'scroll-margin_first')
    lastMargin.style.height = heightMargin+'px'

    el.prepend(refresh)
    el.prepend(firstMargin)
    el.append(lastMargin)

    Array.from(el.children).forEach((child: any) => child.style.flexShrink = '0')

    el.scrollTop = oldScrollPosition
  }

  scrollToStart(): void {
    const el: HTMLElement = this.host.nativeElement
    const rect = el.getBoundingClientRect()
    const heightMargin = rect.height-this.protrusion
    const heightContent = el.scrollHeight-2*heightMargin
    if (el.scrollHeight < 2*heightMargin+rect.height) {
      this.host.nativeElement.scrollTop = heightMargin-rect.height/2+heightContent/2
    } else {
      this.host.nativeElement.scrollTop = heightMargin
    }
  }

  rotateRefresh(): void {
    if (this.refreshRotating) return

    this.refreshRotating = true
    const el = this.host.nativeElement
    const refreshIcon = el.querySelector('.scroll-refresh .scroll-refresh__icon')
    refreshIcon.style.transition = 'all ease 0.5s'

    setTimeout(() => {
      refreshIcon.style.transform = 'rotate(360deg)'
      setTimeout(() => {
        refreshIcon.style.removeProperty('transition')
        refreshIcon.style.removeProperty('transform')
        this.refreshRotating = false
      }, 500)
    }, 10)
  }

  ngOnInit(): void {
    this.subs.push(
      this.doScrollToStart.subscribe(() => {
        this.scrollToStart()
      })
    )
  }

  ngAfterViewInit(): void {
    this.generate()
    this.scrollToStart()
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub: Subscription) => sub.unsubscribe())
  }

}
