import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core'
import { Note } from '../../interfaces/note.interface'
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent implements OnInit, OnDestroy {

  subs: Array<Subscription> = []
  @Input() note!: Note
  @Input() focus: EventEmitter<Note> = new EventEmitter<Note>()

  @Output() change: EventEmitter<{ note: Note; newValue: string }> = new EventEmitter<{ note: Note; newValue: string }>()
  @Output() create: EventEmitter<Note> = new EventEmitter<Note>()
  @Output() delete: EventEmitter<Note> = new EventEmitter<Note>()

  @ViewChild('textareaRef', { read: ElementRef }) textareaRef!: ElementRef

  constructor() { }

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
    const rows = textarea.scrollHeight/30
    textarea.remove()

    return Math.floor(rows)
  }

  setHeightTextArea(el: any): void {
    const padding = 20
    const lineHeight = 28

    const rect = el.getBoundingClientRect()
    let rows = this.getRowsTextareaForString(el)

    el.style.height = `${ rows < 2 ? 30 : lineHeight*rows}px`
  }

  onInput(e: any): void {
    const el = e.target
    this.setHeightTextArea(el)
    this.change.emit({ note: this.note, newValue: e.target.value as string })
  }

  pressEnterNote(e: Event): void {
    this.create.emit(this.note)
    e.preventDefault()
  }

  pressBackspaceNote(e: any): void {
    if (e.target.value === '') this.delete.emit(this.note)
  }

  ngOnInit(): void {
    this.focus.subscribe((note: Note) => {
      if (this.note.id === note.id) {
        this.textareaRef.nativeElement.focus()
      }
    })
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub: Subscription) => sub.unsubscribe())
  }

}
