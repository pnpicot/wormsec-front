import { Injectable, signal } from '@angular/core';
import { WindowState, WindowConfig, WindowId } from '../models/window.model';

@Injectable({
  providedIn: 'root'
})
export class WindowManagerService {
  private readonly GAP = 20;
  private readonly HEADER_HEIGHT = 60;
  private readonly MARGIN = 20;

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
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight - this.HEADER_HEIGHT : 1020;

    let position = { ...config.defaultPosition };
    let size = { ...config.defaultSize };

    const availableHeight = viewportHeight - (this.MARGIN * 2);
    const topRowHeight = Math.floor((availableHeight - this.GAP) / 2);
    const bottomRowHeight = Math.floor((availableHeight - this.GAP) / 2);
    const availableWidth = viewportWidth - (this.MARGIN * 2);

    if (config.id === 'devices') {
      size = { width: availableWidth, height: topRowHeight };
      position = { x: this.MARGIN, y: this.HEADER_HEIGHT + this.MARGIN };
    } else if (config.id === 'visualizer') {
      size = { width: availableWidth, height: bottomRowHeight };
      position = { x: this.MARGIN, y: this.HEADER_HEIGHT + this.MARGIN + topRowHeight + this.GAP };
    } else if (config.id === 'details') {
      const detailsWidth = Math.floor(availableWidth * 0.4);
      size = { width: detailsWidth - this.GAP, height: topRowHeight };
      position = { x: this.MARGIN + (availableWidth - detailsWidth) + this.GAP, y: this.HEADER_HEIGHT + this.MARGIN };
    } else if (config.id === 'chatbot') {
      const chatbotWidth = Math.floor(availableWidth * 0.3);
      size = { width: chatbotWidth - this.GAP, height: bottomRowHeight };
      position = { x: this.MARGIN + (availableWidth - chatbotWidth) + this.GAP, y: this.HEADER_HEIGHT + this.MARGIN + topRowHeight + this.GAP };
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
      
      if (currentWindow.isOpen) {
        this.focusWindow(windowId);
        return;
      }
      
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
            position: { x: devicesWindow.position.x + devicesNewWidth + this.GAP, y: devicesWindow.position.y },
            size: { width: detailsWidth, height: devicesWindow.size.height }
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
            position: { x: vizWindow.position.x + vizNewWidth + this.GAP, y: vizWindow.position.y },
            size: { width: chatbotWidth, height: vizWindow.size.height }
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
          const restored = this.createWindowState(config, index);
          newWindows[index] = {
            ...window,
            isMaximized: false,
            position: restored.position,
            size: restored.size
          };
        }
      } else {
        newWindows[index] = {
          ...window,
          isMaximized: true,
          position: { x: 0, y: this.HEADER_HEIGHT },
          size: { 
            width: typeof globalThis.window !== 'undefined' ? globalThis.window.innerWidth : 1920, 
            height: (typeof globalThis.window !== 'undefined' ? globalThis.window.innerHeight : 1080) - this.HEADER_HEIGHT
          }
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
      
      let finalSize = {
        width: Math.max(size.width, window.minSize.width),
        height: Math.max(size.height, window.minSize.height)
      };

      newWindows[index] = { ...window, size: finalSize };

      // ✅ DEVICES : affecte details (horizontal) ET visualizer (vertical)
      if (windowId === 'devices') {
        const detailsWindow = windows.find(w => w.id === 'details');
        const vizWindow = windows.find(w => w.id === 'visualizer');
        
        // Horizontal : devices ↔ details
        if (detailsWindow && detailsWindow.isOpen) {
          const detailsIndex = windows.findIndex(w => w.id === 'details');
          const totalWidth = window.size.width + detailsWindow.size.width + this.GAP;
          const newDetailsWidth = Math.max(totalWidth - finalSize.width - this.GAP, detailsWindow.minSize.width);
          
          // ✅ LIMITE : Ne pas dépasser le bord droit
          const maxTotalWidth = (typeof globalThis.window !== 'undefined' ? globalThis.window.innerWidth : 1920) - (this.MARGIN * 2);
          if (finalSize.width + newDetailsWidth + this.GAP > maxTotalWidth) {
            finalSize.width = maxTotalWidth - newDetailsWidth - this.GAP;
          }
          
          newWindows[detailsIndex] = {
            ...detailsWindow,
            size: { ...detailsWindow.size, width: newDetailsWidth },
            position: { x: window.position.x + finalSize.width + this.GAP, y: detailsWindow.position.y }
          };
          
          newWindows[index].size = finalSize;
        }
        
        // Vertical : devices ↔ visualizer
        if (vizWindow && vizWindow.isOpen) {
          const vizIndex = windows.findIndex(w => w.id === 'visualizer');
          const totalHeight = window.size.height + vizWindow.size.height + this.GAP;
          const newVizHeight = Math.max(totalHeight - finalSize.height - this.GAP, vizWindow.minSize.height);
          
          // ✅ LIMITE : Ne pas dépasser le bas
          const maxTotalHeight = (typeof globalThis.window !== 'undefined' ? globalThis.window.innerHeight : 1080) - this.HEADER_HEIGHT - (this.MARGIN * 2);
          if (finalSize.height + newVizHeight + this.GAP > maxTotalHeight) {
            finalSize.height = maxTotalHeight - newVizHeight - this.GAP;
          }
          
          newWindows[vizIndex] = {
            ...vizWindow,
            size: { ...vizWindow.size, height: newVizHeight },
            position: { x: vizWindow.position.x, y: window.position.y + finalSize.height + this.GAP }
          };
          
          newWindows[index].size = finalSize;
          
          // ✅ PROPAGATION : Si chatbot est ouvert, ajuster sa hauteur aussi
          const chatbotWindow = windows.find(w => w.id === 'chatbot');
          if (chatbotWindow && chatbotWindow.isOpen) {
            const chatbotIndex = windows.findIndex(w => w.id === 'chatbot');
            newWindows[chatbotIndex] = {
              ...chatbotWindow,
              size: { ...chatbotWindow.size, height: newVizHeight },
              position: { x: chatbotWindow.position.x, y: window.position.y + finalSize.height + this.GAP }
            };
          }
        }
      } 
      
      // ✅ DETAILS : affecte devices (horizontal) ET chatbot (vertical)
      else if (windowId === 'details') {
        const devicesWindow = windows.find(w => w.id === 'devices');
        const chatbotWindow = windows.find(w => w.id === 'chatbot');
        
        // Horizontal : details ↔ devices
        if (devicesWindow && devicesWindow.isOpen) {
          const devicesIndex = windows.findIndex(w => w.id === 'devices');
          const totalWidth = devicesWindow.size.width + window.size.width + this.GAP;
          const newDevicesWidth = Math.max(totalWidth - finalSize.width - this.GAP, devicesWindow.minSize.width);
          
          const maxTotalWidth = (typeof globalThis.window !== 'undefined' ? globalThis.window.innerWidth : 1920) - (this.MARGIN * 2);
          if (newDevicesWidth + finalSize.width + this.GAP > maxTotalWidth) {
            finalSize.width = maxTotalWidth - newDevicesWidth - this.GAP;
          }
          
          newWindows[devicesIndex] = {
            ...devicesWindow,
            size: { ...devicesWindow.size, width: newDevicesWidth }
          };
          newWindows[index].position = { 
            x: devicesWindow.position.x + newDevicesWidth + this.GAP, 
            y: window.position.y 
          };
          newWindows[index].size = finalSize;
        }
        
        // Vertical : details ↔ chatbot
        if (chatbotWindow && chatbotWindow.isOpen) {
          const chatbotIndex = windows.findIndex(w => w.id === 'chatbot');
          const totalHeight = window.size.height + chatbotWindow.size.height + this.GAP;
          const newChatbotHeight = Math.max(totalHeight - finalSize.height - this.GAP, chatbotWindow.minSize.height);
          
          const maxTotalHeight = (typeof globalThis.window !== 'undefined' ? globalThis.window.innerHeight : 1080) - this.HEADER_HEIGHT - (this.MARGIN * 2);
          if (finalSize.height + newChatbotHeight + this.GAP > maxTotalHeight) {
            finalSize.height = maxTotalHeight - newChatbotHeight - this.GAP;
          }
          
          newWindows[chatbotIndex] = {
            ...chatbotWindow,
            size: { ...chatbotWindow.size, height: newChatbotHeight },
            position: { x: chatbotWindow.position.x, y: window.position.y + finalSize.height + this.GAP }
          };
          
          newWindows[index].size = finalSize;
          
          // ✅ PROPAGATION : Si visualizer est ouvert, ajuster sa hauteur aussi
          const vizWindow = windows.find(w => w.id === 'visualizer');
          if (vizWindow && vizWindow.isOpen) {
            const vizIndex = windows.findIndex(w => w.id === 'visualizer');
            newWindows[vizIndex] = {
              ...vizWindow,
              size: { ...vizWindow.size, height: newChatbotHeight },
              position: { x: vizWindow.position.x, y: window.position.y + finalSize.height + this.GAP }
            };
          }
        }
      } 
      
      // ✅ VISUALIZER : affecte chatbot (horizontal) ET devices (vertical)
      else if (windowId === 'visualizer') {
        const chatbotWindow = windows.find(w => w.id === 'chatbot');
        const devicesWindow = windows.find(w => w.id === 'devices');
        
        // Horizontal : visualizer ↔ chatbot
        if (chatbotWindow && chatbotWindow.isOpen) {
          const chatbotIndex = windows.findIndex(w => w.id === 'chatbot');
          const totalWidth = window.size.width + chatbotWindow.size.width + this.GAP;
          const newChatbotWidth = Math.max(totalWidth - finalSize.width - this.GAP, chatbotWindow.minSize.width);
          
          const maxTotalWidth = (typeof globalThis.window !== 'undefined' ? globalThis.window.innerWidth : 1920) - (this.MARGIN * 2);
          if (finalSize.width + newChatbotWidth + this.GAP > maxTotalWidth) {
            finalSize.width = maxTotalWidth - newChatbotWidth - this.GAP;
          }
          
          newWindows[chatbotIndex] = {
            ...chatbotWindow,
            size: { ...chatbotWindow.size, width: newChatbotWidth },
            position: { x: window.position.x + finalSize.width + this.GAP, y: chatbotWindow.position.y }
          };
          
          newWindows[index].size = finalSize;
        }
        
        // Vertical : visualizer ↔ devices
        if (devicesWindow && devicesWindow.isOpen) {
          const devicesIndex = windows.findIndex(w => w.id === 'devices');
          const totalHeight = devicesWindow.size.height + window.size.height + this.GAP;
          const newDevicesHeight = Math.max(totalHeight - finalSize.height - this.GAP, devicesWindow.minSize.height);
          
          const maxTotalHeight = (typeof globalThis.window !== 'undefined' ? globalThis.window.innerHeight : 1080) - this.HEADER_HEIGHT - (this.MARGIN * 2);
          if (newDevicesHeight + finalSize.height + this.GAP > maxTotalHeight) {
            finalSize.height = maxTotalHeight - newDevicesHeight - this.GAP;
          }
          
          newWindows[devicesIndex] = {
            ...devicesWindow,
            size: { ...devicesWindow.size, height: newDevicesHeight }
          };
          newWindows[index].position = { 
            x: window.position.x, 
            y: devicesWindow.position.y + newDevicesHeight + this.GAP 
          };
          newWindows[index].size = finalSize;
          
          // ✅ PROPAGATION : Si details est ouvert, ajuster sa hauteur aussi
          const detailsWindow = windows.find(w => w.id === 'details');
          if (detailsWindow && detailsWindow.isOpen) {
            const detailsIndex = windows.findIndex(w => w.id === 'details');
            newWindows[detailsIndex] = {
              ...detailsWindow,
              size: { ...detailsWindow.size, height: newDevicesHeight }
            };
          }
        }
      } 
      
      // ✅ CHATBOT : affecte visualizer (horizontal) ET details (vertical)
      else if (windowId === 'chatbot') {
        const vizWindow = windows.find(w => w.id === 'visualizer');
        const detailsWindow = windows.find(w => w.id === 'details');
        
        // Horizontal : chatbot ↔ visualizer
        if (vizWindow && vizWindow.isOpen) {
          const vizIndex = windows.findIndex(w => w.id === 'visualizer');
          const totalWidth = vizWindow.size.width + window.size.width + this.GAP;
          const newVizWidth = Math.max(totalWidth - finalSize.width - this.GAP, vizWindow.minSize.width);
          
          const maxTotalWidth = (typeof globalThis.window !== 'undefined' ? globalThis.window.innerWidth : 1920) - (this.MARGIN * 2);
          if (newVizWidth + finalSize.width + this.GAP > maxTotalWidth) {
            finalSize.width = maxTotalWidth - newVizWidth - this.GAP;
          }
          
          newWindows[vizIndex] = {
            ...vizWindow,
            size: { ...vizWindow.size, width: newVizWidth }
          };
          newWindows[index].position = { 
            x: vizWindow.position.x + newVizWidth + this.GAP, 
            y: window.position.y 
          };
          newWindows[index].size = finalSize;
        }
        
        // Vertical : chatbot ↔ details
        if (detailsWindow && detailsWindow.isOpen) {
          const detailsIndex = windows.findIndex(w => w.id === 'details');
          const totalHeight = detailsWindow.size.height + window.size.height + this.GAP;
          const newDetailsHeight = Math.max(totalHeight - finalSize.height - this.GAP, detailsWindow.minSize.height);
          
          const maxTotalHeight = (typeof globalThis.window !== 'undefined' ? globalThis.window.innerHeight : 1080) - this.HEADER_HEIGHT - (this.MARGIN * 2);
          if (newDetailsHeight + finalSize.height + this.GAP > maxTotalHeight) {
            finalSize.height = maxTotalHeight - newDetailsHeight - this.GAP;
          }
          
          newWindows[detailsIndex] = {
            ...detailsWindow,
            size: { ...detailsWindow.size, height: newDetailsHeight }
          };
          newWindows[index].position = { 
            x: window.position.x, 
            y: detailsWindow.position.y + newDetailsHeight + this.GAP 
          };
          newWindows[index].size = finalSize;
          
          // ✅ PROPAGATION : Si devices est ouvert, ajuster sa hauteur aussi
          const devicesWindow = windows.find(w => w.id === 'devices');
          if (devicesWindow && devicesWindow.isOpen) {
            const devicesIndex = windows.findIndex(w => w.id === 'devices');
            newWindows[devicesIndex] = {
              ...devicesWindow,
              size: { ...devicesWindow.size, height: newDetailsHeight }
            };
          }
        }
      }
      
      this.windowsSignal.set(newWindows);
    }
  }

  getWindow(windowId: WindowId): WindowState | undefined {
    return this.windowsSignal().find(w => w.id === windowId);
  }
}