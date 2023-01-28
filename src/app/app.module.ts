import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

import { RootComponent } from './components/root/root.component';
import { PageHomeComponent } from './components/page-home/page-home.component';
import { NoteComponent } from './components/note/note.component';
import { ListNotesComponent } from './components/list-notes/list-notes.component';
import { ScrollDirective } from './directives/scroll.directive';

const routes: Routes = [
  { path: '', component: PageHomeComponent }
];

@NgModule({
  declarations: [
    RootComponent,
    PageHomeComponent,
    NoteComponent,
    ListNotesComponent,
    ScrollDirective
  ],
  imports: [
    RouterModule.forRoot(routes),
    BrowserModule
  ],
  providers: [],
  bootstrap: [RootComponent]
})
export class AppModule { }
