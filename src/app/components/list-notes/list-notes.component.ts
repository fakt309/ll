import { Component, OnInit, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { Note } from '../../interfaces/note.interface';
import { UpdateNote } from '../../interfaces/update-note.interface';

@Component({
  selector: 'app-list-notes',
  templateUrl: './list-notes.component.html',
  styleUrls: ['./list-notes.component.scss']
})
export class ListNotesComponent implements OnInit {

  focusNote: EventEmitter<Note> = new EventEmitter<Note>()
  focusedNote: Note | null = null

  notes: Array<Note> = [
    {
      id: 1,
      value: 'some text here',
      status: 'notDone',
      updateList: [],
      createTimestamp: 0
    }, {
      id: 2,
      value: 'какой-то текст здесь',
      status: 'notDone',
      updateList: [],
      createTimestamp: 0
    }, {
      id: 3,
      value: 'дададада дадада',
      status: 'notDone',
      updateList: [],
      createTimestamp: 0
    }, {
      id: 4,
      value: 'текстовый текс ради теста текста',
      status: 'notDone',
      updateList: [],
      createTimestamp: 0
    }, {
      id: 5,
      value: 'текстовый текс ради теста текста',
      status: 'notDone',
      updateList: [],
      createTimestamp: 0
    }, {
      id: 6,
      value: 'текстовый текс ради теста текста',
      status: 'notDone',
      updateList: [],
      createTimestamp: 0
    }, {
      id: 7,
      value: 'текстовый текс ради теста текста',
      status: 'notDone',
      updateList: [],
      createTimestamp: 0
    }, {
      id: 8,
      value: 'текстовый текс ради теста текста',
      status: 'notDone',
      updateList: [],
      createTimestamp: 0
    }, {
      id: 9,
      value: 'текстовый текс ради теста текста',
      status: 'notDone',
      updateList: [],
      createTimestamp: 0
    }
  ]

  constructor(
    private host: ElementRef
  ) { }

  @HostListener('window:resize') onResize(): void {
    (document.activeElement as any)?.blur()
  }

  generateId(length: number = 16) {
      let text = '';
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (var i = 0; i < length; ++i) text += chars.charAt(Math.floor(Math.random()*chars.length));
      return -1*Math.floor(Math.random()*(10**9));
  }

  createNote(note: Note): void {
    const newNote: Note = {
      id: this.generateId(),
      value: '',
      status: 'notDone',
      updateList: [],
      createTimestamp: 0
    }
    const index = this.notes.indexOf(note)
    this.notes.splice(index+1, 0, newNote)
    setTimeout(() => this.focusNote.next(newNote), 0)
  }

  deleteNote(note: Note): void {
    const index = this.notes.indexOf(note)
    this.notes.splice(index, 1)
    let nextIndex: any = null
    if (this.notes[index-1]) {
      nextIndex = index-1
    } else if (this.notes[index]) {
      nextIndex = index
    }
    if (nextIndex !== null) {
      setTimeout(() => this.focusNote.next(this.notes[nextIndex]), 0)
    }
  }

  setFocusedNote(change: { note: Note | null, in: boolean, e: Event | null }): void {

    if (change.in) {
      this.focusedNote = change.note
      setTimeout(() => {
        let el: any = (change.e as any).target
        const rectWrap = this.host.nativeElement.getBoundingClientRect()
        const rectEl = el.getBoundingClientRect()
        this.host.nativeElement.scrollTop = el.offsetTop-rectWrap.height/2+rectEl.height/2
      }, 200)

    } else {
      this.focusedNote = null
    }
  }

  changeNoteValue(change: { note: Note, newValue: string }): void {
    if (!change || !change.note || !change.newValue) return

    change.note.value = change.newValue
  }

  trackNote(index: number, note: Note) {
      return 'note'+note.id;
  };

  ngOnInit(): void {
  }

}
