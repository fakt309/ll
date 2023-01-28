import { Component, OnInit } from '@angular/core';
import { Note } from '../../interfaces/note.interface';
import { UpdateNote } from '../../interfaces/update-note.interface';

@Component({
  selector: 'app-list-notes',
  templateUrl: './list-notes.component.html',
  styleUrls: ['./list-notes.component.scss']
})
export class ListNotesComponent implements OnInit {

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
    }
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
