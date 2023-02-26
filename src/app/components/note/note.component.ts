import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, OnDestroy, AfterViewInit, HostListener } from '@angular/core'
import { Note } from '../../interfaces/note.interface'
import { Subscription } from 'rxjs'
import { AsyncService } from '../../services/async.service'

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent implements OnInit, AfterViewInit, OnDestroy {

  subs: Array<Subscription> = []

  @Input() id!: number
  @Input() value!: string
  @Input() focus: EventEmitter<{ id: number; position: number }> = new EventEmitter<{ id: number; position: number }>()
  @Input() blur: boolean = false
  @Input() disable: boolean = false

  @Output() onWasChangedValue: EventEmitter<{ id: number; newValue: string }> = new EventEmitter<{ id: number; newValue: string }>()
  @Output() onCreate: EventEmitter<{ fromId: number; direction: 'prev' | 'next'; values: Array<string> }> = new EventEmitter<{ fromId: number; direction: 'prev' | 'next'; values: Array<string> }>()
  @Output() onDelete: EventEmitter<{ id: number, by: 'delete' | 'backspace' | 'finger' }> = new EventEmitter<{ id: number, by: 'delete' | 'backspace' | 'finger' }>()
  @Output() onMerge: EventEmitter<{ fromId: number, direction: 'prev' | 'next' }> = new EventEmitter<{ fromId: number, direction: 'prev' | 'next' }>()
  @Output() onFocus: EventEmitter<{ id: number; in: boolean; direction?: 'prev' | 'current' | 'next' }> = new EventEmitter<{ id: number; in: boolean; direction?: 'prev' | 'current' | 'next' }>()

  touch: { startX: number | null; startY: number | null; prevX: number | null; prevY: number | null; down: boolean; startElement: any; canDraw: boolean; firstMove: boolean; pathD: Array<Array<number>>; pathD2: Array<Array<number>>; viewBox: Array<number>; doDelete: boolean } = {
    startX: null,
    startY: null,
    prevX: null,
    prevY: null,
    down: false,
    startElement: null,
    canDraw: false,
    firstMove: true,
    pathD: [],
    pathD2: [],
    viewBox: [0, 0, 0, 0],
    doDelete: false
  }

  timer: { x: number; y: number; value: number; show: boolean; interval: any; action: string } = {
    x: 0,
    y: 0,
    value: 0,
    show: false,
    interval: null,
    action: ''
  }

  @ViewChild('textareaRef', { read: ElementRef }) textareaRef!: ElementRef
  @ViewChild('svgRef', { read: ElementRef }) svgRef!: ElementRef

  constructor(
    private host: ElementRef,
    private asyncService: AsyncService
  ) { }

  @HostListener('window:resize') onResize(): void {
    this.setHeightTextArea()
  }

  @HostListener('touchstart', ['$event']) onTouchStart(e: any): void {
    const rect = this.host.nativeElement.getBoundingClientRect()
    let { x, y } = this.getCoordFromTouch(e)
    this.touch.startX = x
    this.touch.startY = y
    this.touch.firstMove = true
    this.touch.down = true
    this.touch.canDraw = true
    this.touch.viewBox = [0, 0, rect.width, rect.height]

    if (this.textareaRef.nativeElement !== document.activeElement && !this.disable) {
      if (this.timer.action === '') {
        this.touch.doDelete = false
        this.touch.pathD.push([x-rect.x, y-rect.y])
      } else if (this.timer.action === 'successDelete') {
        this.touch.doDelete = false
        this.touch.pathD2.push([x-rect.x, y-rect.y])
        this.cancelTimer()
      }
    }
  }

  @HostListener('touchmove', ['$event']) onTouchMove(e: any): void {

    let { x, y } = this.getCoordFromTouch(e)

    if (this.touch.firstMove) {
      if (this.textareaRef.nativeElement === document.activeElement || (Math.abs(x - this.touch.startX!) < Math.abs(y - this.touch.startY!) || x - this.touch.startX! < 0)) {
        this.touch.canDraw = false
      }
      this.touch.firstMove = false
    }

    if (!this.touch.canDraw || this.disable) return

    const rect = this.host.nativeElement.getBoundingClientRect()
    const prev = {
      x: this.touch.prevX !== null ? this.touch.prevX-rect.x : this.touch.startX!-rect.x,
      y: this.touch.prevY !== null ? this.touch.prevY-rect.y : this.touch.startY!-rect.y
    }

    if (this.timer.action === '') {
      this.touch.pathD.push([x-rect.x, y-rect.y])
    } else if (this.timer.action === 'successDelete') {
      this.touch.pathD2.push([x-rect.x, y-rect.y])
    }

    if (this.touch.prevX && x < this.touch.prevX) {
      if (this.timer.action === '') {
        this.touch.pathD = this.cleanPath([...this.touch.pathD], x)
      } else if (this.timer.action === 'successDelete') {
        this.touch.pathD2 = this.cleanPath([...this.touch.pathD2], x)
      }
    }

    if (this.timer.action === '') {
      if (x-this.touch.pathD[0][0] > 80) {
        this.touch.doDelete = true
      } else {
        this.touch.doDelete = false
      }
    } else if (this.timer.action === 'successDelete') {
      if (x-this.touch.pathD2[0][0] > 80) {
        this.touch.doDelete = true
      } else {
        this.touch.doDelete = false
      }
    }

    this.touch.prevX = x
    this.touch.prevY = y
  }

  @HostListener('touchend', ['$event']) onTouchEnd(e: any): void {
    if (this.timer.action === '') {
      if (this.touch.doDelete) {
        let deepClonePath = JSON.parse(JSON.stringify(this.touch.pathD))
        this.animatePath(this.touch.pathD, this.alignLine(deepClonePath), 100).then(() => {
          this.timer.action = 'successDelete'
          this.startTimer(2)
        })
      } else {
        this.timer.action = ''
        this.touch.startX = 0
        this.touch.startY = 0
        this.touch.down = false
        this.touch.canDraw = false
        this.touch.startElement = null
        this.touch.firstMove = false
        this.touch.prevX = null
        this.touch.prevY = null
        this.touch.pathD = []
        this.touch.pathD2 = []
        this.touch.doDelete = false
      }
    } else if (this.timer.action === 'successDelete') {
      e.preventDefault()
      e.stopPropagation()
      if (this.touch.firstMove) {
        this.timer.action = ''
        this.touch.startX = 0
        this.touch.startY = 0
        this.touch.down = false
        this.touch.canDraw = false
        this.touch.startElement = null
        this.touch.firstMove = false
        this.touch.prevX = null
        this.touch.prevY = null
        this.touch.pathD = []
        this.touch.pathD2 = []
        this.touch.doDelete = false
        this.timer.action = ''
        setTimeout(() => {
          this.textareaRef.nativeElement.blur()
          this.onFocus.emit({ id: this.id, in: false })
        }, 0)
      } else if (this.touch.doDelete) {
        const rect = this.host.nativeElement.getBoundingClientRect()
        const margin = rect.height*0.05
        let deepClonePath1 = this.alignLine(JSON.parse(JSON.stringify(this.touch.pathD))).map((coord: Array<number>) => {
          coord[1] -= margin
          return coord
        })
        this.animatePath(this.touch.pathD, deepClonePath1, 100)
        let deepClonePath2 = this.alignLine(JSON.parse(JSON.stringify(this.touch.pathD2))).map((coord: Array<number>) => {
          coord[1] += margin
          return coord
        })
        this.animatePath(this.touch.pathD2, deepClonePath2, 100).then(() => {
          this.timer.action = 'cancelDelete'
          this.startTimer(2)
        })
      } else {
        this.touch.pathD2 = []
        this.startTimer(2)
      }
    } else if (this.timer.action === 'cancelDelete') {
      e.preventDefault()
      e.stopPropagation()
      if (this.touch.firstMove) {
        this.timer.action = ''
        this.touch.startX = 0
        this.touch.startY = 0
        this.touch.down = false
        this.touch.canDraw = false
        this.touch.startElement = null
        this.touch.firstMove = false
        this.touch.prevX = null
        this.touch.prevY = null
        this.touch.pathD = []
        this.touch.pathD2 = []
        this.touch.doDelete = false
        this.timer.action = ''
        setTimeout(() => {
          this.textareaRef.nativeElement.blur()
          this.onFocus.emit({ id: this.id, in: false })
        }, 0)
      }
    }
  }

  startTimer(sec: number): void {
    const rect = this.host.nativeElement.getBoundingClientRect()
    this.timer.x = rect.width/2
    this.timer.y = rect.height/2
    this.timer.value = sec
    this.timer.show = true
    if (this.timer.interval) clearInterval(this.timer.interval)
    this.timer.interval = setInterval(() => {
      const rect = this.host.nativeElement.getBoundingClientRect()
      this.timer.x = rect.width/2
      this.timer.y = rect.height/2
      this.timer.value--
      if (this.timer.value <= 0) {
        this.timer.show = false
        clearInterval(this.timer.interval)
        this.endTimer()
      }
    }, 1000)
  }

  checkActive(): boolean {
    return document.activeElement === this.textareaRef?.nativeElement || false
  }

  cancelTimer(): void {
    clearInterval(this.timer.interval)
    this.timer.show = false
    this.timer.value = 0
  }

  endTimer(): void {
    if (this.timer.action === 'successDelete') {
      this.onDelete.emit({ id: this.id, by: 'finger' })
    } else if (this.timer.action === 'cancelDelete') {
      this.onDelete.emit({ id: this.id, by: 'finger' })
    }
  }

  cleanPath(path: Array<Array<number>>, limit: number): Array<Array<number>> {
    for (let i = 0; i < path.length; i++) {
      if (path[i][0] > limit) path.splice(i, 1)
    }
    return path
  }

  alignLine(path: Array<Array<number>>): Array<Array<number>> {
    const marging = 20
    const rect = this.host.nativeElement.getBoundingClientRect()

    for(let i = 0; i < path.length; i++) {
      if (i === path.length-1) {
        path[i][0] = rect.width-marging
        path[i][1] = rect.height/2
      } else {
        path[i][0] = marging+(rect.width-2*marging)*(i/path.length)
        path[i][1] = rect.height/2
      }
    }

    return path
  }

  async animatePath(start: Array<Array<number>>, finish: Array<Array<number>>, time: number): Promise<void> {
    const msToOneTime = 10
    const times = time/msToOneTime
    for (let i = 0; i < times; i++) {
      for (let j = 0; j < start.length; j++) {
        if (i === times-1) {
          start[j][0] = finish[j][0]
          start[j][1] = finish[j][1]
        } else {
          start[j][0] += (finish[j][0]-start[j][0])*(i/times)
          start[j][1] += (finish[j][1]-start[j][1])*(i/times)
        }
      }
      await this.asyncService.delay(msToOneTime)
    }
    return new Promise((res) => res())
  }

  getStringPath(path: Array<Array<number>>): string {
    if (!path[0] || !path[0][0]) return ''
    let answer = `M ${path[0][0]} ${path[0][1]}`
    for (let i = 1; i < path.length; i++) {
      answer += ` C ${path[i-1][0]} ${path[i-1][1]}, ${path[i-1][0]} ${path[i-1][1]} ${path[i][0]} ${path[i][1]}`
    }
    return answer
  }

  getCoordFromTouch(e: TouchEvent): { x: number; y: number } {
    return {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }
  }

  getRowsTextareaForString(el: any): number {
    const rect = el.getBoundingClientRect()
    const style = window.getComputedStyle(el)
    const lineHeight = 20
    const padding = 20

    const textarea = document.createElement('textarea')
    textarea.value = el.value
    textarea.style.position = 'fixed'
    textarea.style.width = style.width
    textarea.style.height = '24px'
    textarea.style.fontSize = style.fontSize
    textarea.style.fontWeight = style.fontWeight
    textarea.style.fontFamily = style.fontFamily
    textarea.style.padding = style.padding
    textarea.style.border = style.border
    textarea.style.outline = style.outline

    document.body.append(textarea)
    const rows = (textarea.scrollHeight-2*padding)/lineHeight
    textarea.remove()

    return Math.floor(rows)
  }

  setHeightTextArea(): void {
    const el = this.textareaRef.nativeElement
    const padding = 20
    const lineHeight = 20

    const rect = el.getBoundingClientRect()
    let rows = this.getRowsTextareaForString(el)

    el.style.height = `${ rows < 2 ? 24 : lineHeight*rows}px`
  }

  onInput(e: Event): void {
    const el = this.textareaRef.nativeElement
    const value = el.value as string

    const valueSplitByEnter = value.split('\n')

    if (valueSplitByEnter[0] === '' && valueSplitByEnter[1] !== '' && valueSplitByEnter.length == 2) {
      this.onWasChangedValue.emit({
        id: this.id,
        newValue: valueSplitByEnter[1]
      })
      el.value = valueSplitByEnter[1]

      this.onCreate.emit({
        fromId: this.id,
        direction: 'prev',
        values: ['']
      })
    } else {
      this.onWasChangedValue.emit({
        id: this.id,
        newValue: valueSplitByEnter[0]
      })
      el.value = valueSplitByEnter[0]

      if (valueSplitByEnter.length > 1) {
        this.onCreate.emit({
          fromId: this.id,
          direction: 'next',
          values: valueSplitByEnter.slice(1)
        })
      }
    }

    e.preventDefault()
    e.stopPropagation()
  }

  onKeydown(e: any): void {
    const el = this.textareaRef.nativeElement
    const value = el.value as string

    if (e.keyCode === 8 || e.keyCode === 46) {
      if (value === '') {
        this.onDelete.emit({ id: this.id, by: e.keyCode === 8 ? 'backspace' : 'delete' })
        e.preventDefault()
        e.stopPropagation()
      } else {
        const position = el.selectionStart
        if (position === 0 && e.keyCode === 8) {
          this.onMerge.emit({
            fromId: this.id,
            direction: 'prev'
          })
          e.preventDefault()
          e.stopPropagation()
        } else if (position === value.length  && e.keyCode === 46) {
          this.onMerge.emit({
            fromId: this.id,
            direction: 'next'
          })
          e.preventDefault()
          e.stopPropagation()
        }
      }
    }

    this.setHeightTextArea()

  }

  ngOnInit(): void {
    this.subs.push(
      this.focus.subscribe((data: { id: number, position: number }) => {
        if (this.id === data.id) {
          this.textareaRef.nativeElement.focus()
          this.textareaRef.nativeElement.selectionStart = data.position
          this.textareaRef.nativeElement.selectionEnd = data.position
        }
      })
    )
  }

  focusAtTheEnd(): void {
    this.textareaRef.nativeElement.focus()
    this.textareaRef.nativeElement.selectionStart = this.textareaRef.nativeElement.value.length
    this.textareaRef.nativeElement.selectionEnd = this.textareaRef.nativeElement.value.length
  }

  ngAfterViewInit(): void {
    this.setHeightTextArea()
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub: Subscription) => sub.unsubscribe())
  }

}
