import { Component, OnInit, EventEmitter, ElementRef, HostListener } from '@angular/core'
import { Note } from '../../interfaces/note.interface'
import { UpdateNote } from '../../interfaces/update-note.interface'
import { NoteService } from '../../services/note.service'

@Component({
  selector: 'app-list-notes',
  templateUrl: './list-notes.component.html',
  styleUrls: ['./list-notes.component.scss']
})
export class ListNotesComponent implements OnInit {

  focusNote: EventEmitter<{ note: Note, position: number }> = new EventEmitter<{ note: Note, position: number }>()
  setNote: EventEmitter<Note> = new EventEmitter<Note>()
  focusedNote: Note | null = null
  prevSizeWindow: number | null = null

  notes: Array<Note> = this.noteService.get()
  // notes: Array<Note> = [
    // {
    //   id: 1,
    //   value: 'some text here',
    //   status: 'notDone',
    //   updateList: [],
    //   createTimestamp: 0
    // }, {
    //   id: 2,
    //   value: 'какой-то текст здесь',
    //   status: 'notDone',
    //   updateList: [],
    //   createTimestamp: 0
    // }, {
    //   id: 3,
    //   value: 'дададада дадада',
    //   status: 'notDone',
    //   updateList: [],
    //   createTimestamp: 0
    // }, {
    //   id: 4,
    //   value: 'текстовый текс ради теста текста',
    //   status: 'notDone',
    //   updateList: [],
    //   createTimestamp: 0
    // }, {
    //   id: 5,
    //   value: 'текстовый текс ради теста текста',
    //   status: 'notDone',
    //   updateList: [],
    //   createTimestamp: 0
    // }, {
    //   id: 6,
    //   value: 'текстовый текс ради теста текста',
    //   status: 'notDone',
    //   updateList: [],
    //   createTimestamp: 0
    // }, {
    //   id: 7,
    //   value: 'текстовый текс ради теста текста',
    //   status: 'notDone',
    //   updateList: [],
    //   createTimestamp: 0
    // }, {
    //   id: 8,
    //   value: 'текстовый текс ради теста текста',
    //   status: 'notDone',
    //   updateList: [],
    //   createTimestamp: 0
    // }, {
    //   id: 9,
    //   value: 'текстовый текс ради теста текста',
    //   status: 'notDone',
    //   updateList: [],
    //   createTimestamp: 0
    // }
  // ]

  constructor(
    private host: ElementRef,
    private noteService: NoteService
  ) { }

  @HostListener('window:resize') onResize(): void {
    if (this.prevSizeWindow !== null && this.prevSizeWindow > window.innerHeight) {
      (document.activeElement as any)?.blur()
    }
    this.prevSizeWindow = window.innerHeight
  }

  @HostListener('click') onClick(): void {
    if (this.notes.length === 0) this.createNote()
  }

  // @HostListener('window:touchstart', ['$event']) onTouchStart(e: any): void {
  //   let { x, y } = this.getCoordFromTouch(e)
  //   this.touch.startX = x
  //   this.touch.startY = y
  //   this.touch.down = true
  //   this.touch.startElement = e.target
  //   this.touch.firstMove = true
  //   const rect = this.touch.startElement.getBoundingClientRect()
  //   this.touch.pathD = `M ${x-rect.x} ${y-rect.y}`
  //   let el: any = this.touch.startElement
  //   while(el && el.tagName !== 'BODY') {
  //     if (el.tagName === 'APP-NOTE') {
  //       this.touch.canDraw = true
  //       break
  //     }
  //     el = el.parentNode
  //   }
  // }
  //
  // @HostListener('window:touchmove', ['$event']) onTouchMove(e: any): void {
  //   if (!this.touch.canDraw || this.focusedNote !== null) return
  //
  //   let { x, y } = this.getCoordFromTouch(e)
  //
  //   if (this.touch.firstMove) {
  //     if (Math.abs(x - this.touch.startX!) < Math.abs(y - this.touch.startY!) || x - this.touch.startX! < 0) {
  //       this.touch.canDraw = false
  //     }
  //     this.touch.firstMove = false
  //   }
  //
  //   if (!this.touch.canDraw) return
  //
  //   const rect = this.touch.startElement.getBoundingClientRect()
  //   if (!this.touch.svg) {
  //     this.touch.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  //     this.touch.svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  //     this.touch.svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`)
  //     this.touch.svg.style.position = 'absolute'
  //     this.touch.svg.style.left = `${rect.x}px`
  //     this.touch.svg.style.top = `${rect.y}px`
  //     this.touch.svg.style.width = `${rect.width}px`
  //     this.touch.svg.style.height = `${rect.height}px`
  //
  //     const path: any = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  //     path.setAttribute('class', 'first-line')
  //     path.setAttribute('stroke', '#ffffff')
  //     path.setAttribute('stroke-width', '5')
  //     path.setAttribute('stroke-linecap', 'round')
  //     path.setAttribute('fill', 'transparent')
  //     this.touch.svg.appendChild(path)
  //
  //     this.host.nativeElement.appendChild(this.touch.svg)
  //   }
  //   const prev = {
  //     x: this.touch.prevX !== null ? this.touch.prevX-rect.x : this.touch.startX!-rect.x,
  //     y: this.touch.prevY !== null ? this.touch.prevY-rect.y : this.touch.startY!-rect.y
  //   }
  //   this.touch.pathD += ` C ${prev.x} ${prev.y}, ${prev.x} ${prev.y}, ${x-rect.x} ${y-rect.y}`
  //
  //   let path: any = this.touch.svg.querySelector('.first-line')
  //   path.setAttribute('d', this.touch.pathD)
  //
  //   this.touch.prevX = x
  //   this.touch.prevY = y
  // }
  //
  // @HostListener('window:touchend', ['$event']) onTouchEnd(e: any): void {
  //   this.touch.startX = 0
  //   this.touch.startY = 0
  //   this.touch.down = false
  //   this.touch.canDraw = false
  //   this.touch.startElement = null
  //   this.touch.firstMove = false
  //   //if (this.touch.svg) this.touch.svg.remove()
  //   this.touch.svg = null
  //   this.touch.prevX = null
  //   this.touch.prevY = null
  // }

  // getCoordFromTouch(e: TouchEvent): { x: number; y: number } {
  //   return {
  //     x: e.touches[0].clientX,
  //     y: e.touches[0].clientY
  //   }
  // }

  generateId(length: number = 16) {
      let text = '';
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (var i = 0; i < length; ++i) text += chars.charAt(Math.floor(Math.random()*chars.length));
      return -1*Math.floor(Math.random()*(10**9));
  }

  createNote(data?: { note?: Note, before?: boolean, withValue?: string }): void {
    const newNote: Note = {
      id: this.generateId(),
      value: data && data.withValue ? data.withValue : '',
      status: 'notDone',
      updateList: [],
      createTimestamp: 0
    }
    if (!data || !data.note) {
      this.notes.push(newNote)
      this.noteService.create(newNote)
    } else if (!data.before) {
      const index = this.notes.indexOf(data.note)
      this.notes.splice(index+1, 0, newNote)
      this.noteService.create(newNote, index+1)
    } else {
      const index = this.notes.indexOf(data.note)
      this.notes.splice(index, 0, newNote)
      this.noteService.create(newNote, index)
    }
    setTimeout(() => this.focusNote.next({ note: newNote, position: 0 }), 0)
  }

  deleteNote(data: { note: Note, withAddToPrev?: string }): void {
    const index = this.notes.indexOf(data.note)
    this.notes.splice(index, 1)
    let nextIndex: any = null
    if (this.notes[index-1]) {
      nextIndex = index-1
    } else if (this.notes[index]) {
      nextIndex = index
    }
    if (data.withAddToPrev && this.notes[index-1]) {
      const position = this.notes[index-1].value.length
      this.notes[index-1].value += ' '+data.withAddToPrev
      this.noteService.update(this.notes[index-1])
      this.noteService.delete(data.note)
      if (nextIndex !== null) {
        setTimeout(() => this.focusNote.next({ note: this.notes[nextIndex], position: position }), 0)
      }
    } else {
      this.noteService.delete(data.note)
      if (nextIndex !== null) {
        setTimeout(() => this.focusNote.next({ note: this.notes[nextIndex], position: this.notes[nextIndex].value.length }), 0)
      }
    }

  }

  setFocusedNote(change: { note: Note | null, in: boolean, e: Event | null }): void {

    if (change.in) {
      this.focusedNote = change.note
      // setTimeout(() => {
      //   let el: any = (change.e as any).target
      //   const rectWrap = this.host.nativeElement.getBoundingClientRect()
      //   const rectEl = el.getBoundingClientRect()
      //   // this.host.nativeElement.scrollTop = el.offsetTop-rectWrap.height/2+rectEl.height/2
      //   this.host.nativeElement.scrollTo({
      //     top: el.offsetTop-rectWrap.height/2+rectEl.height/2,
      //     left: 0,
      //     behavior: 'smooth'
      //   })
      // }, 300)

    } else {
      this.focusedNote = null
    }
  }

  changeNoteValue(change: { note: Note, newValue: string }): void {
    if (!change || !change.note || !change.newValue) return

    change.note.value = change.newValue

    this.noteService.update(change.note)
  }

  trackNote(index: number, note: Note) {
      return 'note'+note.id;
  };

  ngOnInit(): void {
    this.prevSizeWindow = window.innerHeight
  }

}
