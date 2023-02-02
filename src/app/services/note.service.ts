import { Injectable } from '@angular/core'
import { Note } from '../interfaces/note.interface'

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  constructor() { }

  create(note: Note, index?: number): void {
    let notes: any = window.localStorage.getItem('notes')
    notes = notes === null ? null : JSON.parse(notes)
    if (!notes) notes = []
    if (index !== undefined) {
      notes.splice(index, 0, note)
    } else {
      notes.push(note)
    }
    window.localStorage.setItem('notes', JSON.stringify(notes))
  }

  update(note: Note): void {
    let notes: any = window.localStorage.getItem('notes')
    notes = notes === null ? null : JSON.parse(notes)
    notes = notes.map((n: Note) => {
      if (n.id === note.id) {
        n.value = note.value
      }
      return n
    })
    window.localStorage.setItem('notes', JSON.stringify(notes))
  }

  get(): Array<Note> {
    let notes: any = window.localStorage.getItem('notes')
    notes = notes === null ? null : JSON.parse(notes)
    return notes ? notes : []
  }

  delete(note: Note): void {
    let notes: any = window.localStorage.getItem('notes')
    notes = notes === null ? null : JSON.parse(notes)
    if (notes) {
      notes = notes.filter((n: Note) => note.id !== n.id)
    }
    window.localStorage.setItem('notes', JSON.stringify(notes))
  }
}
