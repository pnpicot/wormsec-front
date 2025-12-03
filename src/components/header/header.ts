import { Component, Output, EventEmitter } from '@angular/core';
import { SearchBarComponent } from '../search-bar/search-bar';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SearchBarComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  @Output() chatbotToggle = new EventEmitter<void>();
  @Output() settingsClick = new EventEmitter<void>();

  onChatbotClick() {
    this.chatbotToggle.emit();
  }

  onSettingsClick() {
    this.settingsClick.emit();
  }
}