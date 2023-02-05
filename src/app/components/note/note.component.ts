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
  @Input() note!: Note
  @Input() focus: EventEmitter<{ note: Note, position: number }> = new EventEmitter<{ note: Note, position: number }>()
  @Input() value: EventEmitter<string> = new EventEmitter<string>()
  @Input() disabled: boolean = false

  @Output() onChange: EventEmitter<{ note: Note; newValue: string }> = new EventEmitter<{ note: Note; newValue: string }>()
  @Output() onCreate: EventEmitter<{ note?: Note; before?: boolean; withValue?: string }> = new EventEmitter<{ note?: Note; before?: boolean; withValue?: string }>()
  @Output() onDelete: EventEmitter<{ note: Note, withAddToPrev?: string }> = new EventEmitter<{ note: Note, withAddToPrev?: string }>()
  @Output() onFocus: EventEmitter<{ note: Note; in: boolean; e: Event }> = new EventEmitter<{ note: Note, in: boolean, e: Event }>()
  touch: { startX: number | null; startY: number | null; prevX: number | null; prevY: number | null; down: boolean; startElement: any; canDraw: boolean; firstMove: boolean; pathD: Array<Array<number>>, viewBox: Array<number>, doAction: boolean } = {
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
    doAction: false
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
      this.touch.doAction = true
    } else {
      this.touch.doAction = false
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

    if (this.touch.doAction) {
      this.onDelete.emit({ note: this.note })
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

  getTextWidthFromTextarea(el: any): number {
    let value = el.value
    const style = window.getComputedStyle(el)

    let span = document.createElement('span')
    span.innerHTML = el.value
    span.style.fontSize = style.fontSize
    span.style.fontFamily = style.fontFamily
    span.style.position = 'absolute'
    span.style.whiteSpace = 'nowrap'

    document.body.append(span)
    const width = span.getBoundingClientRect().width
    span.remove()

    return width
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

  onInput(e: any): void {
    console.log(e)
    if (e.inputType === 'insertCompositionText' && e.data === null) {
      this.pressEnterNote(e)
      e.preventDefault()
      e.stopPropagation()
      return
    }
    const el = e.target
    const val = e.target.value.replace(/\n/g, '')
    this.onChange.emit({ note: this.note, newValue: val as string })
    e.target.value = val
    this.setHeightTextArea()
  }

  pressEnterNote(e: any): void {
    console.log(e)
    console.log(e.target)
    console.log(e.target.selectionStart)
    if (e.target.selectionStart === 0) {
      this.onCreate.emit({ note: this.note, before: true })
    } else {
      const stringBefore = e.target.value.slice(0, e.target.selectionStart).trim()
      const stringAfter = e.target.value.slice(e.target.selectionStart).trim()
      this.onChange.emit({ note: this.note, newValue: stringBefore as string })
      e.target.value = stringBefore
      this.onCreate.emit({ note: this.note, before: false, withValue: stringAfter })
    }
    e.preventDefault()
    e.stopPropagation()
  }

  pressBackspaceNote(e: any): void {
    if (e.target.value === '') {
      this.onDelete.emit({ note: this.note })
      return
    }

    if (e.target.selectionStart === 0) {
      this.onDelete.emit({ note: this.note, withAddToPrev: e.target.value })
      return
    }
  }

  ngOnInit(): void {
    this.focus.subscribe((data: { note: Note, position: number }) => {
      if (this.note.id === data.note.id) {
        this.textareaRef.nativeElement.focus()
        this.textareaRef.nativeElement.selectionStart = data.position
        this.textareaRef.nativeElement.selectionEnd = data.position
      }
    })
  }

  ngAfterViewInit(): void {
    this.setHeightTextArea()
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub: Subscription) => sub.unsubscribe())
  }

}
