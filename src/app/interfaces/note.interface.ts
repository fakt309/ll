import { UpdateNote } from './update-note.interface';

export interface Note {
  id: number
  value: string
  status: 'notDone' | 'done'
  updateList: Array<UpdateNote>
  createTimestamp: number
}
