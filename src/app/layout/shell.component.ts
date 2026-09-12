import { Component } from '@angular/core';

@Component({
  selector: 'qai-shell',
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
})
export class ShellComponent {
  collapsed = false;

  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
  }
}
