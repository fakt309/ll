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
  @Input() focus: EventEmitter<Note> = new EventEmitter<Note>()
  @Input() disabled: boolean = false

  @Output() onChange: EventEmitter<{ note: Note; newValue: string }> = new EventEmitter<{ note: Note; newValue: string }>()
  @Output() onCreate: EventEmitter<Note> = new EventEmitter<Note>()
  @Output() onDelete: EventEmitter<Note> = new EventEmitter<Note>()
  @Output() onFocus: EventEmitter<{ note: Note, in: boolean, e: Event }> = new EventEmitter<{ note: Note, in: boolean, e: Event }>()

  @ViewChild('textareaRef', { read: ElementRef }) textareaRef!: ElementRef

  constructor() { }

  @HostListener('window:resize') onResize(): void {
    this.setHeightTextArea()
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
    const lineHeight = 30
    const padding = 20

    const textarea = document.createElement('textarea')
    textarea.value = el.value
    textarea.style.position = 'fixed'
    textarea.style.width = style.width
    textarea.style.height = '30px'
    textarea.style.fontSize = style.fontSize
    textarea.style.fontFamily = style.fontFamily
    textarea.style.padding = style.padding
    textarea.style.border = style.border
    textarea.style.outline = style.outline

    document.body.append(textarea)
    const rows = (textarea.scrollHeight-padding-1)/lineHeight
    textarea.remove()

    return Math.floor(rows)
  }

  setHeightTextArea(): void {
    const el = this.textareaRef.nativeElement
    const padding = 20
    const lineHeight = 28

    const rect = el.getBoundingClientRect()
    let rows = this.getRowsTextareaForString(el)

    el.style.height = `${ rows < 2 ? 30 : lineHeight*rows}px`
  }

  onInput(e: any): void {
    const el = e.target
    this.setHeightTextArea()
    this.onChange.emit({ note: this.note, newValue: e.target.value as string })
  }

  pressEnterNote(e: Event): void {
    this.onCreate.emit(this.note)
    e.preventDefault()
  }

  pressBackspaceNote(e: any): void {
    if (e.target.value === '') this.onDelete.emit(this.note)
  }

  ngOnInit(): void {
    this.focus.subscribe((note: Note) => {
      if (this.note.id === note.id) {
        this.textareaRef.nativeElement.focus()
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
