import { Injectable } from '@angular/core'
import { Note } from '../interfaces/note.interface'

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  constructor() { }

  create(): Note {
    const notes: Array<Note> = JSON.parse(window.localStorage.getItem('notes') || '[]')
    let id: number = -1
    notes.forEach((n: Note) => {
      if (n.id <= id) id = n.id-1
    })
    const note: Note = {
      id,
      value: '',
      status: 'active',
      priority: 0
    }
    notes.push(note)
    window.localStorage.setItem('notes', JSON.stringify(notes))
    return note
  }

  delete(id: number): Note | null {
    let notes: Array<Note> = JSON.parse(window.localStorage.getItem('notes') || '[]')
    const note = notes.find((n: Note) => n.id === id)
    notes = notes.filter((n: Note) => n.id !== id)
    window.localStorage.setItem('notes', JSON.stringify(notes))
    return note || null
  }

  change(id: number, changes: { value?: string; status?: 'active' | 'done' | 'canceled'; priority?: number }): Note | null {
    let notes: Array<Note> = JSON.parse(window.localStorage.getItem('notes') || '[]')
    let note = notes.find((n: Note) => n.id === id)
    if (!note) return null
    if (changes.value !== undefined) note.value = changes.value
    if (changes.status !== undefined) note.status = changes.status
    if (changes.priority !== undefined) note.priority = changes.priority
    window.localStorage.setItem('notes', JSON.stringify(notes))
    return note
  }

  get(): Array<Note>
  get(id: number): Note | null
  get(id?: number): Array<Note> | Note | null {
    const notes: Array<Note> = JSON.parse(window.localStorage.getItem('notes') || '[]')
    if (id === undefined) {
      notes.sort((a: Note, b: Note) => a.priority > b.priority ? 1 : -1)
      return notes
    } else {
      return notes.find((n: Note) => n.id === id) || null
    }
  }
}
