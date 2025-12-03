import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header';
import { WindowComponent } from '../../components/window/window';
import { DeviceList } from './device-list/device-list';
import { DeviceDetails } from './device-details/device-details';
import { VisualizerComponent } from '../../components/visualizer/visualizer';
import { ChatbotComponent } from '../../components/chatbot/chatbot';
import { WindowManagerService } from '../../services/window-manager.service';
import { DeviceService } from '../../services/device.service';
import { WindowId } from '../../models/window.model';

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    WindowComponent,
    DeviceList,
    DeviceDetails,
    VisualizerComponent,
    ChatbotComponent
  ],
  templateUrl: './dashboard-view.html',
  styleUrl: './dashboard-view.scss',
})
export class DashboardView implements OnInit {
  constructor(
    public windowManager: WindowManagerService,
    private deviceService: DeviceService
  ) {}

  // ✅ Déplacer windows ici, APRÈS le constructor
  get windows() {
    return this.windowManager.windows;
  }

  ngOnInit() {
    // Select first device by default
    const devices = this.deviceService.devices();
    if (devices.length > 0) {
      this.deviceService.selectDevice(devices[0].id);
    }
  }

  onChatbotToggle() {
    const chatbotWindow = this.windowManager.getWindow('chatbot');
    if (chatbotWindow?.isOpen) {
      this.windowManager.closeWindow('chatbot');
    } else {
      this.windowManager.openWindow('chatbot');
    }
  }

  onSettingsClick() {
    console.log('Settings clicked - not implemented yet');
  }

  onWindowClose(windowId: WindowId) {
    this.windowManager.closeWindow(windowId);
  }

  onWindowMinimize(windowId: WindowId) {
    this.windowManager.toggleMinimize(windowId);
  }

  onWindowMaximize(windowId: WindowId) {
    this.windowManager.toggleMaximize(windowId);
  }

  onWindowFocus(windowId: WindowId) {
    this.windowManager.focusWindow(windowId);
  }

  onWindowPositionChange(windowId: WindowId, position: { x: number; y: number }) {
    this.windowManager.updateWindowPosition(windowId, position);
  }

  onWindowSizeChange(windowId: WindowId, size: { width: number; height: number }) {
    this.windowManager.updateWindowSize(windowId, size);
  }
}