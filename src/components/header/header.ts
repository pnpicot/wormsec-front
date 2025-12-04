import { Component, Output, EventEmitter, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../search-bar/search-bar';
import { WindowManagerService } from '../../services/window-manager.service';
import { WindowId } from '../../models/window.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, SearchBarComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  @Output() chatbotToggle = new EventEmitter<void>();
  @Output() settingsClick = new EventEmitter<void>();

  isSettingsOpen = signal(false);

  constructor(public windowManager: WindowManagerService) {}

  // ✅ Fermer le dropdown si on clique en dehors
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const settingsContainer = target.closest('.settings-dropdown-container');
    
    if (!settingsContainer && this.isSettingsOpen()) {
      this.isSettingsOpen.set(false);
    }
  }

  onChatbotClick() {
    this.chatbotToggle.emit();
  }

  toggleSettingsDropdown(event: MouseEvent) {
    event.stopPropagation(); // Empêche le document click
    this.isSettingsOpen.update(v => !v);
  }

  toggleWindow(windowId: WindowId, event: MouseEvent) {
    event.stopPropagation(); // ✅ Empêche la fermeture du dropdown
    
    const window = this.windowManager.getWindow(windowId);
    if (window?.isOpen) {
      this.windowManager.closeWindow(windowId);
    } else {
      this.windowManager.openWindow(windowId);
    }
  }

  isWindowOpen(windowId: WindowId): boolean {
    const window = this.windowManager.getWindow(windowId);
    return window?.isOpen || false;
  }

  getWindowTitle(windowId: WindowId): string {
    const window = this.windowManager.getWindow(windowId);
    return window?.title || '';
  }

  onSettingsButtonClick(event: MouseEvent) {
    event.stopPropagation();
    console.log('Settings clicked');
    // TODO: Implement settings modal
  }

  onInfoButtonClick(event: MouseEvent) {
    event.stopPropagation();
    console.log('Info clicked');
    // TODO: Implement info modal
  }
}