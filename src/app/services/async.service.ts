import { Injectable } from '@angular/core'
import { Note } from '../interfaces/note.interface'

@Injectable({
  providedIn: 'root'
})
export class AsyncService {

  constructor() { }

  async delay(ms: number): Promise<void> {
    return new Promise((res) => {
      setTimeout(() => {
        res()
      }, ms)
    })
  }
}
