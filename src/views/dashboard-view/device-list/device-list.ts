import { Component, effect, signal, ChangeDetectorRef, untracked, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusIndicator } from '../../../components/status-indicator/status-indicator';
import { DeviceService } from '../../../services/device.service';
import { WindowManagerService } from '../../../services/window-manager.service';
import { Device, DeviceStatus, DeviceRisk } from '../../../models/device.model';

@Component({
  selector: 'app-device-list',
  standalone: true,
  imports: [CommonModule, StatusIndicator],
  templateUrl: './device-list.html',
  styleUrl: './device-list.scss',
})
export class DeviceList {
  selectedDeviceId: string | null = null;
  isFilterOpen = signal(false);
  dropdownPosition = signal({ top: 0, left: 0 });
  
  filters = signal({
    status: [] as DeviceStatus[],
    risk: [] as DeviceRisk[],
    os: [] as string[]
  });

  constructor(
    private deviceService: DeviceService,
    private windowManager: WindowManagerService,
    private cdr: ChangeDetectorRef
  ) {
    effect(() => {
      const selected = this.deviceService.selectedDevice();
      untracked(() => {
        this.selectedDeviceId = selected?.id || null;
      });
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const filterContainer = target.closest('.filter-dropdown-container');
    
    if (!filterContainer && this.isFilterOpen()) {
      this.isFilterOpen.set(false);
    }
  }

  get devices() {
    const allDevices = this.deviceService.devices();
    const currentFilters = this.filters();
    
    return allDevices.filter(device => {
      if (currentFilters.status.length > 0 && !currentFilters.status.includes(device.status)) {
        return false;
      }
      
      if (currentFilters.risk.length > 0 && !currentFilters.risk.includes(device.risk)) {
        return false;
      }
      
      if (currentFilters.os.length > 0 && !currentFilters.os.includes(device.os)) {
        return false;
      }
      
      return true;
    });
  }

  toggleFilterDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.isFilterOpen.update(v => !v);
    
    if (this.isFilterOpen()) {
      setTimeout(() => {
        const button = event.target as HTMLElement;
        const filterBtn = button.closest('.btn-filter') as HTMLElement;
        
        if (filterBtn) {
          const rect = filterBtn.getBoundingClientRect();
          const dropdownWidth = 280;
          const dropdownMaxHeight = 500;
          
          // ✅ Position : aligner le coin supérieur droit du dropdown avec le bouton
          let top = rect.top;
          let left = rect.right - dropdownWidth;
          
          // Vérifier si ça dépasse en bas
          const viewportHeight = window.innerHeight;
          if (top + dropdownMaxHeight > viewportHeight) {
            top = Math.max(60, viewportHeight - dropdownMaxHeight - 20);
          }
          
          // Vérifier si ça dépasse à gauche
          if (left < 20) {
            left = 20;
          }
          
          this.dropdownPosition.set({ top, left });
        }
      }, 0);
    }
  }

  toggleStatusFilter(status: DeviceStatus) {
    this.filters.update(f => {
      const statusIndex = f.status.indexOf(status);
      if (statusIndex > -1) {
        f.status.splice(statusIndex, 1);
      } else {
        f.status.push(status);
      }
      return { ...f };
    });
  }

  toggleRiskFilter(risk: DeviceRisk) {
    this.filters.update(f => {
      const riskIndex = f.risk.indexOf(risk);
      if (riskIndex > -1) {
        f.risk.splice(riskIndex, 1);
      } else {
        f.risk.push(risk);
      }
      return { ...f };
    });
  }

  toggleOSFilter(os: string) {
    this.filters.update(f => {
      const osIndex = f.os.indexOf(os);
      if (osIndex > -1) {
        f.os.splice(osIndex, 1);
      } else {
        f.os.push(os);
      }
      return { ...f };
    });
  }

  isStatusFilterActive(status: DeviceStatus): boolean {
    return this.filters().status.includes(status);
  }

  isRiskFilterActive(risk: DeviceRisk): boolean {
    return this.filters().risk.includes(risk);
  }

  isOSFilterActive(os: string): boolean {
    return this.filters().os.includes(os);
  }

  clearFilters() {
    this.filters.set({ status: [], risk: [], os: [] });
  }

  hasActiveFilters(): boolean {
    const f = this.filters();
    return f.status.length > 0 || f.risk.length > 0 || f.os.length > 0;
  }

  onDeviceClick(device: Device) {
    this.deviceService.selectDevice(device.id);
    
    const detailsWindow = this.windowManager.getWindow('details');
    if (!detailsWindow?.isOpen) {
      this.windowManager.openWindow('details');
    }
  }

  isSelected(device: Device): boolean {
    return this.selectedDeviceId === device.id;
  }
}