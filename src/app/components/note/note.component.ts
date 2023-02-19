import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, OnDestroy, AfterViewInit, HostListener } from '@angular/core'
import { Note } from '../../interfaces/note.interface'
import { Subscription } from 'rxjs'

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

  @Output() onWasChangedValue: EventEmitter<{ id: number; newValue: string }> = new EventEmitter<{ id: number; newValue: string }>()
  @Output() onCreate: EventEmitter<{ fromId: number; direction: 'prev' | 'next'; values: Array<string> }> = new EventEmitter<{ fromId: number; direction: 'prev' | 'next'; values: Array<string> }>()
  @Output() onDelete: EventEmitter<{ id: number, by: 'delete' | 'backspace' | 'finger' }> = new EventEmitter<{ id: number, by: 'delete' | 'backspace' | 'finger' }>()
  @Output() onMerge: EventEmitter<{ fromId: number, direction: 'prev' | 'next' }> = new EventEmitter<{ fromId: number, direction: 'prev' | 'next' }>()

  touch: { startX: number | null; startY: number | null; prevX: number | null; prevY: number | null; down: boolean; startElement: any; canDraw: boolean; firstMove: boolean; pathD: Array<Array<number>>, viewBox: Array<number>, doDelete: boolean } = {
    startX: null,
    startY: null,
    prevX: null,
    prevY: null,
    down: false,
    startElement: null,
    canDraw: false,
    firstMove: true,
    pathD: [],
    viewBox: [0, 0, 0, 0],
    doDelete: false
  }

  @ViewChild('textareaRef', { read: ElementRef }) textareaRef!: ElementRef
  @ViewChild('svgRef', { read: ElementRef }) svgRef!: ElementRef

  constructor(
    private host: ElementRef
  ) { }

  @HostListener('window:resize') onResize(): void {
    this.setHeightTextArea()
  }

  @HostListener('touchstart', ['$event']) onTouchStart(e: any): void {
    let { x, y } = this.getCoordFromTouch(e)
    this.touch.startX = x
    this.touch.startY = y
    this.touch.down = true
    this.touch.canDraw = true
    this.touch.firstMove = true
    const rect = this.host.nativeElement.getBoundingClientRect()
    this.touch.pathD.push([x-rect.x, y-rect.y])
    this.touch.viewBox = [0, 0, rect.width, rect.height]
  }

  @HostListener('touchmove', ['$event']) onTouchMove(e: any): void {

    let { x, y } = this.getCoordFromTouch(e)

    if (this.touch.firstMove) {
      if (Math.abs(x - this.touch.startX!) < Math.abs(y - this.touch.startY!) || x - this.touch.startX! < 0) {
        this.touch.canDraw = false
      }
      this.touch.firstMove = false
    }

    if (!this.touch.canDraw) return

    const rect = this.host.nativeElement.getBoundingClientRect()
    const prev = {
      x: this.touch.prevX !== null ? this.touch.prevX-rect.x : this.touch.startX!-rect.x,
      y: this.touch.prevY !== null ? this.touch.prevY-rect.y : this.touch.startY!-rect.y
    }
    this.touch.pathD.push([x-rect.x, y-rect.y])

    if (this.touch.prevX && x < this.touch.prevX) {
      this.touch.pathD = this.cleanPath([...this.touch.pathD], x)
    }

    if (x-this.touch.pathD[0][0] > 80) {
      this.touch.doDelete = true
    } else {
      this.touch.doDelete = false
    }

    this.touch.prevX = x
    this.touch.prevY = y
  }

  @HostListener('touchend', ['$event']) onTouchEnd(e: any): void {
    this.touch.startX = 0
    this.touch.startY = 0
    this.touch.down = false
    this.touch.canDraw = false
    this.touch.startElement = null
    this.touch.firstMove = false
    this.touch.prevX = null
    this.touch.prevY = null
    this.touch.pathD = []

    if (this.touch.doDelete) {
      this.onDelete.emit({ id: this.id, by: 'finger' })
    }
  }

  cleanPath(path: Array<Array<number>>, limit: number): Array<Array<number>> {
    for (let i = 0; i < path.length; i++) {
      if (path[i][0] > limit) path.splice(i, 1)
    }
    return path
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

  ngAfterViewInit(): void {
    this.setHeightTextArea()
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub: Subscription) => sub.unsubscribe())
  }

}
