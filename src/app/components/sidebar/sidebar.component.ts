import { Component, OnInit, Input, HostListener, ElementRef, EventEmitter } from '@angular/core'
import { AsyncService } from '../../services/async.service'

export interface SidebarOption {
  value: string
  text: string
  icon: string
  link?: string
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  @Input() options: Array<SidebarOption> = []

  showMenu: boolean = false

  doScrollToStart: EventEmitter<void> = new EventEmitter<void>()

  touch: any = {
    down: false,
    startX: 0,
    startY: 0,
    prevX: 0,
    prevY: 0,
    speed: 0,
    startPositionMenu: 0,
    timeoutSpeed: setTimeout(() => {}, 0),
    disabled: true,
    firstMove: true
  }

  constructor(
    private host: ElementRef,
    private asyncService: AsyncService
  ) { }

  getCoordFromTouch(e: TouchEvent): { x: number; y: number } {
    return {
      x: e.touches[0]?.clientX || e.changedTouches[0].clientX,
      y: e.touches[0]?.clientY || e.changedTouches[0].clientY
    }
  }

  @HostListener('window:touchstart', ['$event']) onTouchStart(e: any): void {
    let { x, y } = this.getCoordFromTouch(e)
    this.touch.down = true
    this.touch.startX = x
    this.touch.startY = y
    this.touch.startPositionMenu = this.showMenu ? -(window.innerWidth-50) : 0
    this.touch.firstMove = true
  }

  @HostListener('window:touchmove', ['$event']) onTouchMove(e: any): void {
    if (!this.touch.down) return

    let { x, y } = this.getCoordFromTouch(e)
    const el: HTMLElement = this.host.nativeElement

    if (this.touch.firstMove) {
      this.touch.disabled = false
      if (
        Math.abs(y-this.touch.startY) > Math.abs(x-this.touch.startX) ||
        (x-this.touch.startX >= 0 && !this.showMenu) ||
        (x-this.touch.startX <= 0 && this.showMenu)
      ) {
        this.touch.disabled = true
      }
      this.touch.firstMove = false
    }

    if (this.touch.disabled) return

    clearTimeout(this.touch.timeoutSpeed)
    this.touch.timeoutSpeed = setTimeout(() => {
      this.touch.speed = 0
    }, 100)
    this.touch.speed = this.touch.startX-this.touch.prevX

    let pos = this.touch.startPositionMenu+x-this.touch.startX
    if (pos > 0) pos = 0
    if (pos < -(window.innerWidth-50)) pos = -(window.innerWidth-50)

    el.style.transform = `translateX(${pos}px)`
    // (el.parentNode! as any).style.transform = `translateX(${pos}px)`

    this.touch.prevX = x
    this.touch.prevY = y
  }

  @HostListener('window:touchend', ['$event']) onTouchEnd(e: any): void {
    this.touch.down = false
    if (this.touch.disabled) return
    if (this.touch.speed === 0) {
      let { x, y } = this.getCoordFromTouch(e)
      let pos = this.touch.startPositionMenu+x-this.touch.startX
      if (pos > 0) pos = 0
      if (pos < -(window.innerWidth-50)) pos = -(window.innerWidth-50)
      if (pos <= -(window.innerWidth-50)/2) {
        this.animateMenu('show')
      } else {
        this.animateMenu('hide')
      }
    } else if (this.touch.speed < 0) {
      this.animateMenu('hide')
    } else if (this.touch.speed > 0) {
      this.animateMenu('show')
    }
  }

  async animateMenu(action: 'show' | 'hide'): Promise<void> {
    const el = this.host.nativeElement
    el.style.transition = 'all ease 0.2s'
    await this.asyncService.delay(1)
    if (action === 'show') {
      this.showMenu = true
      el.style.transform = `translateX(${-(window.innerWidth-50)}px)`
    } else if (action === 'hide') {
      this.showMenu = false
      el.style.transform = `translateX(${0}px)`
    }
    await this.asyncService.delay(200)
    el.style.removeProperty('transition')
    if (action === 'hide') this.doScrollToStart.emit()
    return new Promise(res => res())
  }

  ngOnInit(): void {
  }

}
