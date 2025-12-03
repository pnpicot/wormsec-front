import { Injectable, signal } from '@angular/core';
import { WindowState, WindowConfig, WindowId } from '../models/window.model';

@Injectable({
  providedIn: 'root'
})
export class WindowManagerService {
  private readonly GAP = 20; // Espacement entre fenêtres

  private windowConfigs: WindowConfig[] = [
    {
      id: 'devices',
      title: 'Devices',
      component: 'device-list',
      defaultPosition: { x: 20, y: 80 },
      defaultSize: { width: 0, height: 0 },
      minSize: { width: 400, height: 300 },
      openByDefault: true
    },
    {
      id: 'details',
      title: 'Device Details',
      component: 'device-details',
      defaultPosition: { x: 0, y: 80 },
      defaultSize: { width: 0, height: 0 },
      minSize: { width: 350, height: 300 },
      openByDefault: false
    },
    {
      id: 'visualizer',
      title: 'Visualizer',
      component: 'visualizer',
      defaultPosition: { x: 20, y: 0 },
      defaultSize: { width: 0, height: 0 },
      minSize: { width: 400, height: 250 },
      openByDefault: true
    },
    {
      id: 'chatbot',
      title: 'Chatbot',
      component: 'chatbot',
      defaultPosition: { x: 0, y: 0 },
      defaultSize: { width: 0, height: 0 },
      minSize: { width: 350, height: 250 },
      openByDefault: false
    }
  ];

  private windowsSignal = signal<WindowState[]>(
    this.windowConfigs.map((config, index) => this.createWindowState(config, index))
  );

  private maxZIndexSignal = signal<number>(1000);

  windows = this.windowsSignal.asReadonly();

  private createWindowState(config: WindowConfig, index: number): WindowState {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight - 60 : 1020;

    let position = { ...config.defaultPosition };
    let size = { ...config.defaultSize };

    if (config.id === 'devices') {
      size = { 
        width: viewportWidth - 40, 
        height: (viewportHeight - this.GAP) / 2 - 30
      };
      position = { x: 20, y: 80 };
    } else if (config.id === 'visualizer') {
      size = { 
        width: viewportWidth - 40, 
        height: (viewportHeight - this.GAP) / 2 - 30
      };
      position = { x: 20, y: 80 + (viewportHeight - this.GAP) / 2 + this.GAP };
    } else if (config.id === 'details') {
      const devicesWidth = viewportWidth - 40;
      const detailsWidth = Math.floor(devicesWidth * 0.4);
      size = { 
        width: detailsWidth - this.GAP, 
        height: (viewportHeight - this.GAP) / 2 - 30
      };
      position = { 
        x: 20 + (devicesWidth - detailsWidth) + this.GAP, 
        y: 80 
      };
    } else if (config.id === 'chatbot') {
      const vizWidth = viewportWidth - 40;
      const chatbotWidth = Math.floor(vizWidth * 0.3);
      size = { 
        width: chatbotWidth - this.GAP, 
        height: (viewportHeight - this.GAP) / 2 - 30
      };
      position = { 
        x: 20 + (vizWidth - chatbotWidth) + this.GAP, 
        y: 80 + (viewportHeight - this.GAP) / 2 + this.GAP
      };
    }

    return {
      id: config.id,
      title: config.title,
      component: config.component,
      isOpen: config.openByDefault,
      isMinimized: false,
      isMaximized: false,
      position,
      size,
      minSize: { ...config.minSize },
      zIndex: 1000 + index,
      data: null
    };
  }

  openWindow(windowId: WindowId, data?: any) {
    const windows = this.windowsSignal();
    const index = windows.findIndex(w => w.id === windowId);
    
    if (index !== -1) {
      const currentWindow = windows[index];
      const newWindows = [...windows];

      if (windowId === 'details') {
        const devicesWindow = windows.find(w => w.id === 'devices');
        if (devicesWindow && devicesWindow.isOpen) {
          const totalWidth = devicesWindow.size.width;
          const devicesNewWidth = Math.floor(totalWidth * 0.6) - this.GAP / 2;
          const detailsWidth = totalWidth - devicesNewWidth - this.GAP;

          const devicesIndex = windows.findIndex(w => w.id === 'devices');
          newWindows[devicesIndex] = {
            ...windows[devicesIndex],
            size: { ...windows[devicesIndex].size, width: devicesNewWidth }
          };

          newWindows[index] = {
            ...currentWindow,
            isOpen: true,
            isMinimized: false,
            zIndex: this.maxZIndexSignal() + 1,
            data: data || currentWindow.data,
            position: { 
              x: devicesWindow.position.x + devicesNewWidth + this.GAP, 
              y: devicesWindow.position.y 
            },
            size: { width: detailsWidth, height: devicesWindow.size.height }
          };
        } else {
          newWindows[index] = {
            ...currentWindow,
            isOpen: true,
            isMinimized: false,
            zIndex: this.maxZIndexSignal() + 1,
            data: data || currentWindow.data
          };
        }
      } else if (windowId === 'chatbot') {
        const vizWindow = windows.find(w => w.id === 'visualizer');
        if (vizWindow && vizWindow.isOpen) {
          const totalWidth = vizWindow.size.width;
          const vizNewWidth = Math.floor(totalWidth * 0.7) - this.GAP / 2;
          const chatbotWidth = totalWidth - vizNewWidth - this.GAP;

          const vizIndex = windows.findIndex(w => w.id === 'visualizer');
          newWindows[vizIndex] = {
            ...windows[vizIndex],
            size: { ...windows[vizIndex].size, width: vizNewWidth }
          };

          newWindows[index] = {
            ...currentWindow,
            isOpen: true,
            isMinimized: false,
            zIndex: this.maxZIndexSignal() + 1,
            data: data || currentWindow.data,
            position: { 
              x: vizWindow.position.x + vizNewWidth + this.GAP, 
              y: vizWindow.position.y 
            },
            size: { width: chatbotWidth, height: vizWindow.size.height }
          };
        } else {
          newWindows[index] = {
            ...currentWindow,
            isOpen: true,
            isMinimized: false,
            zIndex: this.maxZIndexSignal() + 1,
            data: data || currentWindow.data
          };
        }
      } else {
        newWindows[index] = {
          ...currentWindow,
          isOpen: true,
          isMinimized: false,
          zIndex: this.maxZIndexSignal() + 1,
          data: data || currentWindow.data
        };
      }
      
      this.windowsSignal.set(newWindows);
      this.maxZIndexSignal.update(z => z + 1);
    }
  }

  closeWindow(windowId: WindowId) {
    const windows = this.windowsSignal();
    const index = windows.findIndex(w => w.id === windowId);
    
    if (index !== -1) {
      const newWindows = [...windows];
      newWindows[index] = { ...newWindows[index], isOpen: false };

      if (windowId === 'details') {
        const devicesIndex = windows.findIndex(w => w.id === 'devices');
        if (devicesIndex !== -1 && windows[devicesIndex].isOpen) {
          const devicesWindow = windows[devicesIndex];
          const detailsWindow = windows[index];
          const totalWidth = devicesWindow.size.width + detailsWindow.size.width + this.GAP;
          
          newWindows[devicesIndex] = {
            ...devicesWindow,
            size: { ...devicesWindow.size, width: totalWidth }
          };
        }
      } else if (windowId === 'chatbot') {
        const vizIndex = windows.findIndex(w => w.id === 'visualizer');
        if (vizIndex !== -1 && windows[vizIndex].isOpen) {
          const vizWindow = windows[vizIndex];
          const chatbotWindow = windows[index];
          const totalWidth = vizWindow.size.width + chatbotWindow.size.width + this.GAP;
          
          newWindows[vizIndex] = {
            ...vizWindow,
            size: { ...vizWindow.size, width: totalWidth }
          };
        }
      }
      
      this.windowsSignal.set(newWindows);
    }
  }

  toggleMinimize(windowId: WindowId) {
    const windows = this.windowsSignal();
    const index = windows.findIndex(w => w.id === windowId);
    
    if (index !== -1) {
      const newWindows = [...windows];
      newWindows[index] = {
        ...newWindows[index],
        isMinimized: !newWindows[index].isMinimized
      };
      this.windowsSignal.set(newWindows);
    }
  }

  toggleMaximize(windowId: WindowId) {
    const windows = this.windowsSignal();
    const index = windows.findIndex(w => w.id === windowId);
    
    if (index !== -1) {
      const newWindows = [...windows];
      const window = newWindows[index];
      
      if (window.isMaximized) {
        const config = this.windowConfigs.find(c => c.id === windowId);
        if (config) {
          newWindows[index] = {
            ...window,
            isMaximized: false,
            position: { ...config.defaultPosition },
            size: { ...config.defaultSize }
          };
        }
      } else {
        newWindows[index] = {
          ...window,
          isMaximized: true,
          position: { x: 0, y: 60 },
          size: { width: window.size.width, height: window.size.height }
        };
      }
      
      this.windowsSignal.set(newWindows);
    }
  }

  focusWindow(windowId: WindowId) {
    const windows = this.windowsSignal();
    const index = windows.findIndex(w => w.id === windowId);
    
    if (index !== -1) {
      const newWindows = [...windows];
      newWindows[index] = {
        ...newWindows[index],
        zIndex: this.maxZIndexSignal() + 1
      };
      this.windowsSignal.set(newWindows);
      this.maxZIndexSignal.update(z => z + 1);
    }
  }

  updateWindowPosition(windowId: WindowId, position: { x: number; y: number }) {
    const windows = this.windowsSignal();
    const index = windows.findIndex(w => w.id === windowId);
    
    if (index !== -1) {
      const newWindows = [...windows];
      newWindows[index] = { ...newWindows[index], position };
      this.windowsSignal.set(newWindows);
    }
  }

  updateWindowSize(windowId: WindowId, size: { width: number; height: number }) {
    const windows = this.windowsSignal();
    const index = windows.findIndex(w => w.id === windowId);
    
    if (index !== -1) {
      const newWindows = [...windows];
      const window = newWindows[index];
      
      const finalSize = {
        width: Math.max(size.width, window.minSize.width),
        height: Math.max(size.height, window.minSize.height)
      };
      
      newWindows[index] = { ...window, size: finalSize };
      this.windowsSignal.set(newWindows);
    }
  }

  getWindow(windowId: WindowId): WindowState | undefined {
    return this.windowsSignal().find(w => w.id === windowId);
  }
}