import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

import { RootComponent } from './components/root/root.component';
import { PageHomeComponent } from './components/page-home/page-home.component';
import { NoteComponent } from './components/note/note.component';
import { ListNotesComponent } from './components/list-notes/list-notes.component';
import { ScrollDirective } from './directives/scroll.directive';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

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
    BrowserModule,
    // ServiceWorkerModule.register('ngsw-worker.js', {
    //   enabled: !isDevMode(),
    //   // Register the ServiceWorker as soon as the application is stable
    //   // or after 30 seconds (whichever comes first).
    //   registrationStrategy: 'registerWhenStable:30000'
    // }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [],
  bootstrap: [RootComponent]
})
export class AppModule { }
