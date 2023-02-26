import { Component, OnInit, HostListener } from '@angular/core'
import { SidebarOption } from '../sidebar/sidebar.component'

@Component({
  selector: 'app-page-home',
  templateUrl: './page-home.component.html',
  styleUrls: ['./page-home.component.scss']
})
export class PageHomeComponent implements OnInit {

  navigation: Array<SidebarOption> = [
    { value: 'changeTime', icon: 'assets/changeTime.svg', text: 'change life time' },
    { value: 'changeTime', icon: 'assets/changeStage.svg', text: 'change life stage' },
    { value: 'history', icon: 'assets/history.svg', text: 'history' },
    { value: 'synchronization', icon: 'assets/synchronization.svg', text: 'synchronization' },
    { value: 'installPwa', icon: 'assets/install.svg', text: 'install app' },
    { value: 'author', icon: 'assets/install.svg', text: 'about the author' }
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
