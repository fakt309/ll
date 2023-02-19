import { Component, OnInit, EventEmitter, ElementRef, HostListener } from '@angular/core'
import { Note } from '../../interfaces/note.interface'
import { NoteService } from '../../services/note.service'

@Component({
  selector: 'app-list-notes',
  templateUrl: './list-notes.component.html',
  styleUrls: ['./list-notes.component.scss']
})
export class ListNotesComponent implements OnInit {

  focusNote: EventEmitter<{ id: number, position: number }> = new EventEmitter<{ id: number, position: number }>()
  setNote: EventEmitter<Note> = new EventEmitter<Note>()
  focusedNote: Note | null = null
  prevSizeWindow: number | null = null

  notes: Array<Note> = this.noteService.get()

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
    if (this.notes.length === 0) {
      this.notes.push(this.noteService.create())
    }
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

  // insertNote(changes?: { value?: string; priority?: number }): void {
  //   let newNote: Note | null = this.noteService.create()
  //   newNote = this.noteService.change(newNote.id, { value: changes?.value, priority: changes?.priority })
  //   if (newNote) this.notes.push(newNote)
  //   //this.notes = this.noteService.get()
  //   // const newNote: Note = {
  //   //   id: this.generateId(),
  //   //   value: data && data.withValue ? data.withValue : '',
  //   //   status: 'active',
  //   //   updateList: [],
  //   //   createTimestamp: 0
  //   // }
  //   // if (!data || !data.note) {
  //   //   this.notes.push(newNote)
  //   //   this.noteService.create(newNote)
  //   // } else if (!data.before) {
  //   //   const index = this.notes.indexOf(data.note)
  //   //   this.notes.splice(index+1, 0, newNote)
  //   //   this.noteService.create(newNote, index+1)
  //   // } else {
  //   //   const index = this.notes.indexOf(data.note)
  //   //   this.notes.splice(index, 0, newNote)
  //   //   this.noteService.create(newNote, index)
  //   // }
  //   // setTimeout(() => this.focusNote.next({ note: newNote, position: 0 }), 0)
  // }

  // deleteNote(data: { note: Note, withAddToPrev?: string }): void {
  //   const index = this.notes.indexOf(data.note)
  //   this.notes.splice(index, 1)
  //   let nextIndex: any = null
  //   if (this.notes[index-1]) {
  //     nextIndex = index-1
  //   } else if (this.notes[index]) {
  //     nextIndex = index
  //   }
  //   if (data.withAddToPrev && this.notes[index-1]) {
  //     const position = this.notes[index-1].value.length
  //     this.notes[index-1].value += ' '+data.withAddToPrev
  //     this.noteService.update(this.notes[index-1])
  //     this.noteService.delete(data.note)
  //     if (nextIndex !== null) {
  //       setTimeout(() => this.focusNote.next({ note: this.notes[nextIndex], position: position }), 0)
  //     }
  //   } else {
  //     this.noteService.delete(data.note)
  //     if (nextIndex !== null) {
  //       setTimeout(() => this.focusNote.next({ note: this.notes[nextIndex], position: this.notes[nextIndex].value.length }), 0)
  //     }
  //   }
  //
  // }

  // setFocusedNote(change: { note: Note | null, in: boolean, e: Event | null }): void {
  //
  //   if (change.in) {
  //     this.focusedNote = change.note
  //     // setTimeout(() => {
  //     //   let el: any = (change.e as any).target
  //     //   const rectWrap = this.host.nativeElement.getBoundingClientRect()
  //     //   const rectEl = el.getBoundingClientRect()
  //     //   // this.host.nativeElement.scrollTop = el.offsetTop-rectWrap.height/2+rectEl.height/2
  //     //   this.host.nativeElement.scrollTo({
  //     //     top: el.offsetTop-rectWrap.height/2+rectEl.height/2,
  //     //     left: 0,
  //     //     behavior: 'smooth'
  //     //   })
  //     // }, 300)
  //
  //   } else {
  //     this.focusedNote = null
  //   }
  // }

  // changeNoteValue(change: { note: Note, newValue: string }): void {
  //   if (!change || !change.note || !change.newValue) return
  //
  //   change.note.value = change.newValue
  //
  //   this.noteService.update(change.note)
  // }

  onWasChangedValueNote(data: { id: number, newValue: string }): void {
    console.log('CHANGE VALUE================')
    console.log(data)
    console.log('============================')
    const note = this.notes.find((n: Note) => n.id === data.id)
    if (!note) return
    note.value = data.newValue
    this.noteService.change(data.id, {
      value: data.newValue
    })
  }

  onCreateNote(data: { fromId: number; direction: 'prev' | 'next'; values: Array<string> }): void {
    console.log('CREATE NEW==================')
    console.log(data)
    console.log('============================')
    const baseNote = this.notes.find((n: Note) => n.id === data.fromId)
    let idFocus: any = null
    let posFocus: any = null
    if (!baseNote) return
    if (data.direction === 'prev') {
      this.notes.forEach((n: Note) => {
        if (baseNote.id !== n.id && n.priority >= baseNote.priority) {
          n.priority += data.values.length
        }
      })
      baseNote.priority += data.values.length
      for (let i = 0; i < data.values.length; i++) {
        let newNote: Note | null = this.noteService.create()
        newNote = this.noteService.change(newNote.id, {
          value: data.values[i],
          priority: baseNote.priority-(data.values.length-i)
        })
        if (newNote) {
          this.notes.push(newNote)
          if (i === 0) {
            idFocus = newNote.id
            posFocus = newNote.value.length
          }
        }
      }
    } else if (data.direction === 'next') {
      this.notes.forEach((n: Note) => {
        if (n.priority > baseNote.priority) {
          n.priority += data.values.length
        }
      })
      for (let i = 0; i < data.values.length; i++) {
        let newNote: Note | null = this.noteService.create()
        newNote = this.noteService.change(newNote.id, {
          value: data.values[i],
          priority: baseNote.priority+1+i
        })
        if (newNote) {
          this.notes.push(newNote)
          if (i === data.values.length-1) {
            idFocus = newNote.id
            posFocus = 0
          }
        }
      }
    }
    this.sortNotes()

    if (idFocus !== null && posFocus !== null) {
      setTimeout(() => {
        this.focusNote.emit({
          id: idFocus,
          position: posFocus
        })
        console.log(this.notes)
      }, 0)
    }
  }

  onDeleteNote(data: { id: number, by: 'delete' | 'backspace' | 'finger' }): void {
    console.log('DELETE OLD==================')
    console.log(data)
    console.log('============================')
    const baseNote = this.notes.find((n: Note) => data.id === n.id)
    if (!baseNote) return
    this.notes.forEach((n: Note) => {
      if (n.priority > baseNote.priority) {
        n.priority
        this.noteService.change(n.id, {
          priority: n.priority
        })
      }
    })
    let prevNoteId = this.notes[this.notes.indexOf(baseNote)-1]?.id || null
    let nextNoteId = this.notes[this.notes.indexOf(baseNote)+1]?.id || null
    this.noteService.delete(baseNote.id)
    this.notes.splice(this.notes.indexOf(baseNote), 1)
    this.sortNotes()

    let noteToFocus: Note | null = null
    if (data.by === 'backspace') {
      if (prevNoteId) {
        noteToFocus = this.notes.find((n: Note) => n.id === prevNoteId) || null
      } else if (nextNoteId) {
        noteToFocus = this.notes.find((n: Note) => n.id === nextNoteId) || null
      }
    } else if (data.by === 'delete') {
      if (nextNoteId) {
        noteToFocus = this.notes.find((n: Note) => n.id === nextNoteId) || null
      } else if (prevNoteId) {
        noteToFocus = this.notes.find((n: Note) => n.id === prevNoteId) || null
      }
    }
    setTimeout(() => {
      if (noteToFocus === null) return
      this.focusNote.emit({
        id: noteToFocus.id,
        position: data.by === 'backspace' ? noteToFocus.value.length : 0
      })
    }, 0)
  }

  onMergeNote(data: { fromId: number, direction: 'prev' | 'next' }): void {
    console.log('MERGE TOGETHER==============')
    console.log(data)
    console.log('============================')

    const baseNote = this.notes.find((n: Note) => n.id === data.fromId)
    if (!baseNote) return

    this.focusNote.emit({
      id: 0,
      position: 0
    })
    if (data.direction === 'prev') {
      const prevNote = this.notes[this.notes.indexOf(baseNote)-1]
      if (!prevNote) return
      const focusPosition = prevNote.value.length
      prevNote.value += baseNote.value
      this.noteService.change(prevNote.id, { value: prevNote.value })
      this.notes.forEach((n: Note) => {
        if (n.id !== baseNote.id && n.priority >= baseNote.priority) {
          n.priority--
          this.noteService.change(n.id, { priority: n.priority })
        }
      })
      this.noteService.delete(baseNote.id)
      this.notes.splice(this.notes.indexOf(baseNote), 1)
      this.sortNotes()
      setTimeout(() => {
        this.focusNote.emit({
          id: prevNote.id,
          position: focusPosition
        })
      }, 0)
    } else if (data.direction === 'next') {
      const nextNote = this.notes[this.notes.indexOf(baseNote)+1]
      if (!nextNote) return
      const focusPosition = baseNote.value.length
      baseNote.value += nextNote.value
      this.noteService.change(baseNote.id, { value: baseNote.value })
      this.notes.forEach((n: Note) => {
        if (n.id !== nextNote.id && n.priority >= nextNote.priority) {
          n.priority--
          this.noteService.change(n.id, { priority: n.priority })
        }
      })
      this.noteService.delete(nextNote.id)
      this.notes.splice(this.notes.indexOf(nextNote), 1)
      this.sortNotes()
      setTimeout(() => {
        this.focusNote.emit({
          id: baseNote.id,
          position: focusPosition
        })
      }, 0)
    }

    // const notes = this.sortedNotes()
    // const note = notes.find((n: Note) => n.id === data.id)
    // if (!note) return
    // const index = notes.indexOf(note)
    // if (data.direction === 'prev') {
    //   this.noteService.change(notes[index-1].id, {
    //     value: notes[index-1].value+notes[index].value
    //   })
    //   this.notes[index-1].value = notes[index-1].value+notes[index].value
    //
    //   this.noteService.delete(notes[index].id)
    //   this.notes.splice(index, 1)
    //
    //   for (let i = 0; i < this.notes.length; i++) {
    //     if (this.notes[i].priority > notes[index-1].priority) this.notes[i].priority--;
    //   }
    // }
  }

  // onFocusNote(data: { id: number, direction: 'prev' | 'next' }): void {
  //   console.log('FOCUS')
  //   console.log(data)
  //   const notes = this.sortedNotes()
  //   const note = notes.find((n: Note) => n.id === data.id)
  //   if (!note) return
  //   const index = this.notes.indexOf(note)
  //   if (data.direction === 'prev' && notes[index-1]) {
  //     this.focusNote.emit({ id: notes[index-1].id, position: notes[index-1].value.length })
  //   } else if (data.direction === 'prev' && notes[index+1]) {
  //     this.focusNote.emit({ id: notes[index+1].id, position: 0 })
  //   }
  //   if (data.direction === 'next' && notes[index+1]) {
  //     this.focusNote.emit({ id: notes[index+1].id, position: 0 })
  //   } else if (data.direction === 'next' && notes[index-1]) {
  //     this.focusNote.emit({ id: notes[index-1].id, position: notes[index-1].value.length })
  //   }
  // }

  sortNotes(): void {
    this.notes.sort((a: Note, b: Note) => a.priority > b.priority ? 1 : -1)
  }

  trackNote(index: number, note: Note) {
      return 'note'+note.id;
  };

  ngOnInit(): void {
    this.prevSizeWindow = window.innerHeight
  }

}
