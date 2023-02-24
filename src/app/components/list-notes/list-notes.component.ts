import { Component, OnInit, EventEmitter, ElementRef, HostListener, ViewChild } from '@angular/core'
import { Note } from '../../interfaces/note.interface'
import { NoteService } from '../../services/note.service'

@Component({
  selector: 'app-list-notes',
  templateUrl: './list-notes.component.html',
  styleUrls: ['./list-notes.component.scss']
})
export class ListNotesComponent implements OnInit {

  @ViewChild('dragNoteRef', { read: ElementRef }) dragNoteRef!: ElementRef

  focusNote: EventEmitter<{ id: number, position: number }> = new EventEmitter<{ id: number, position: number }>()
  noteIdInFocus: number | null = null
  showDrag: boolean = false
  // prevSizeWindow: number | null = null

  notes: Array<Note> = this.noteService.get()

  timerDrag: any = setTimeout(() => {}, 0)

  touch: any = {
    down: false,
    element: null,
    firstMove: false,
    startX: 0,
    startY: 0,
    startDX: 0,
    startDY: 0,
    currentX: 0,
    currentY: 0,
    indexDrag: null,
    interval: setTimeout(() => {}, 0)
  }

  constructor(
    private host: ElementRef,
    private noteService: NoteService
  ) { }

  @HostListener('window:resize') onResize(): void {
    // if (this.prevSizeWindow !== null && this.prevSizeWindow > window.innerHeight) {
    //   (document.activeElement as any)?.blur()
    // }
    // this.prevSizeWindow = window.innerHeight
  }

  @HostListener('click') onClick(): void {
    if (this.notes.length === 0) {
      const newNote = this.noteService.create()
      this.notes.push(newNote)
      setTimeout(() => {
        this.focusNote.emit({
          id: newNote.id,
          position: 0
        })
      }, 0)
    }
  }

  getCoordFromTouch(e: TouchEvent): { x: number; y: number } {
    return {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }
  }

  onWasChangedValueNote(data: { id: number, newValue: string }): void {

    const note = this.notes.find((n: Note) => n.id === data.id)
    if (!note) return
    note.value = data.newValue
    this.noteService.change(data.id, {
      value: data.newValue
    })
  }

  onCreateNote(data: { fromId: number; direction: 'prev' | 'next'; values: Array<string> }): void {

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
      }, 0)
    }
  }

  onDeleteNote(data: { id: number, by: 'delete' | 'backspace' | 'finger' }): void {
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
  }

  onFocusNote(data: { id: number; in: boolean; direction?: 'prev' | 'current' | 'next' }): void {
    if (data.in) {
      this.sortNotes()
      const note: Note | null = this.notes.find((n: Note) => n.id === data.id) || null
      if (!note) return
      const prevNote: Note | null = this.notes[this.notes.indexOf(note)-1]  || null
      const nextNote: Note | null = this.notes[this.notes.indexOf(note)+1] || null
      if (data.direction === 'current') {
        this.noteIdInFocus = note.id
      } else if (data.direction === 'prev' && prevNote) {
        this.noteIdInFocus = prevNote.id
      } else if (data.direction === 'next' && nextNote) {
        this.noteIdInFocus = nextNote.id
      }
    } else {
      setTimeout(() => {
        this.noteIdInFocus = null
      }, 0)
    }
  }

  sortNotes(): void {
    this.notes.sort((a: Note, b: Note) => a.priority > b.priority ? 1 : -1)
  }

  trackNote(index: number, note: Note) {
      return 'note'+note.id;
  }

  onTouchstartNote(e: any): void {
    const { x, y } = this.getCoordFromTouch(e)
    this.touch.down = true
    this.touch.startX = x
    this.touch.startY = y
    let noteElement = e.target
    while (noteElement.tagName !== 'BODY') {
      if (noteElement.tagName === 'APP-NOTE') {
        this.touch.element = noteElement
        break
      }
      noteElement = noteElement.parentNode
    }
    const rect = noteElement.getBoundingClientRect()
    this.touch.startDX = x-rect.x
    this.touch.startDY = y-rect.y
    this.touch.currentX = x
    this.touch.currentY = y
    this.touch.firstMove = true
    this.timerDrag = setTimeout(() => {
      if (this.touch.down && this.touch.firstMove) {
        this.showDrag = true
        this.focusNote.emit({ id: 0, position: 0 })
        this.host.nativeElement.style.overflowY = 'hidden'
        this.touch.element.style.position = 'absolute'
        this.touch.element.style.width = 'inherit'
        this.touch.element.style.backgroundColor = '#ffffff11'
        this.touch.element.style.backdropFilter = 'blur(2px)'
        this.touch.element.style.left = `0px`
        this.touch.element.style.top = `${this.touch.startY-this.touch.startDY}px`
        this.touch.interval = setInterval(() => {
          if (this.touch.down) {
            const speed = (this.touch.currentY-this.touch.startY)*0.03
            this.host.nativeElement.scrollTop += speed
            const notesElements = this.host.nativeElement.querySelectorAll('app-note')
            let minEl: any = null
            notesElements.forEach((el: any) => {
              if (el === this.touch.element) return
              el.style.marginTop = '0px'
              if (minEl === null) minEl = el
              const rect1 = minEl.getBoundingClientRect()
              const rect2 = el.getBoundingClientRect()
              if (Math.abs(this.touch.currentY-(rect1.y+rect1.height/2)) > Math.abs(this.touch.currentY-(rect2.y+rect2.height/2))) {
                minEl = el
              }
            })

            const rectDragging = this.touch.element.getBoundingClientRect()
            if (minEl === notesElements[notesElements.length-1]) {
              const rect = minEl.getBoundingClientRect()
              if (this.touch.currentY > rect.y+rect.height/2) {
                minEl.style.marginBottom = `${rectDragging.height}px`
                this.touch.indexDrag = 'last'
              } else {
                minEl.style.marginTop = `${rectDragging.height}px`
                this.touch.indexDrag = minEl.getAttribute('idnote')
              }
            } else {
              minEl.style.marginTop = `${rectDragging.height}px`
              this.touch.indexDrag = minEl.getAttribute('idnote')
            }
          }
        }, 10)
      }
    }, 200)
  }

  onTouchmoveNote(e: any): void {
    this.touch.firstMove = false
    if (!this.showDrag) return
    const { x, y } = this.getCoordFromTouch(e)
    this.touch.currentX = x
    this.touch.currentY = y
    this.touch.element.style.top = `${y-this.touch.startDY}px`
  }

  onTouchendNote(e: any): void {
    clearTimeout(this.timerDrag)
    if (!this.showDrag) return
    const dragginNote =  this.notes.find((n: Note) => n.id === parseInt(this.touch.element.getAttribute('idnote')))
    if (!dragginNote) return
    if (this.touch.indexDrag === 'last') {
      let maxPriority = 0
      this.notes.forEach((n: Note) => {
        if (n.priority > dragginNote.priority) {
          n.priority--
          this.noteService.change(n.id, { priority: n.priority })
        }
        if (n.priority > maxPriority) maxPriority = n.priority
      })
      dragginNote.priority = maxPriority+1
      this.noteService.change(dragginNote.id, { priority: dragginNote.priority })
      this.sortNotes()
    } else {
      const insertNote =  this.notes.find((n: Note) => n.id === parseInt(this.touch.indexDrag))
      if (!insertNote) return
      this.notes.forEach((n: Note) => {
        if (n.priority > dragginNote.priority && n.id !== dragginNote.id && n.id !== insertNote.id) {
          n.priority--
          this.noteService.change(n.id, { priority: n.priority })
        }
      })
      this.notes.forEach((n: Note) => {
        if (n.priority >= insertNote.priority && n.id !== dragginNote.id && n.id !== insertNote.id) {
          n.priority++
          this.noteService.change(n.id, { priority: n.priority })
        }
      })
      insertNote.priority++
      this.noteService.change(insertNote.id, { priority: insertNote.priority })
      dragginNote.priority = insertNote.priority-1
      this.noteService.change(dragginNote.id, { priority: dragginNote.priority })
      this.sortNotes()
    }

    const notesElements = this.host.nativeElement.querySelectorAll('app-note')
    notesElements.forEach((el: any) => {
      el.style.marginTop = '0px'
      el.style.marginBottom = '0px'
      setTimeout(() => {
        el.style.removeProperty('marginTop')
        el.style.removeProperty('marginBottom')
      }, 0)
    })
    this.touch.element.style.removeProperty('position')
    this.touch.element.style.removeProperty('width')
    this.touch.element.style.removeProperty('background-color')
    this.touch.element = null
    this.touch.down = false
    this.showDrag = false
    this.host.nativeElement.style.overflowY = 'scroll'
    clearInterval(this.touch.interval)
  }

  ngOnInit(): void {
    // this.prevSizeWindow = window.innerHeight
  }

}
