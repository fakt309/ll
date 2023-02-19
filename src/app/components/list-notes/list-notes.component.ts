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
        console.log(this.notes)
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

  sortNotes(): void {
    this.notes.sort((a: Note, b: Note) => a.priority > b.priority ? 1 : -1)
  }

  trackNote(index: number, note: Note) {
      return 'note'+note.id;
  }

  ngOnInit(): void {
    this.prevSizeWindow = window.innerHeight
  }

}
