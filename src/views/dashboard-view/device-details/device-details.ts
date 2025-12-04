import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusIndicator } from '../../../components/status-indicator/status-indicator';
import { DeviceService } from '../../../services/device.service';
import { Device } from '../../../models/device.model';

@Component({
  selector: 'app-device-details',
  standalone: true,
  imports: [CommonModule, StatusIndicator],
  templateUrl: './device-details.html',
  styleUrl: './device-details.scss',
})
export class DeviceDetails {
  selectedDevice: Device | null = null;

  constructor(private deviceService: DeviceService) {
    effect(() => {
      this.selectedDevice = this.deviceService.selectedDevice();
    });
  }

  getOSIcon(os: string): string {
    const icons: { [key: string]: string } = {
      'windows': 'fab fa-windows',
      'apple': 'fab fa-apple',
      'linux': 'fab fa-linux',
      'debian': 'fab fa-debian'
    };
    return icons[os] || 'fa-desktop';
  }

  // Récupérer les devices connectés
  getConnectedDevices(): Device[] {
    if (!this.selectedDevice || !this.selectedDevice.connections) {
      return [];
    }
    
    return this.selectedDevice.connections
      .map(id => this.deviceService.getDeviceById(id))
      .filter(device => device !== undefined) as Device[];
  }

  // Cliquer sur un link pour sélectionner ce device
  onLinkClick(device: Device) {
    this.deviceService.selectDevice(device.id);
  }

  onIsolate() {
    if (this.selectedDevice) {
      console.log('Isolate device:', this.selectedDevice.name);
      // TODO: Implement isolation logic
    }
  }

  onRestore() {
    if (this.selectedDevice) {
      console.log('Restore device:', this.selectedDevice.name);
      // TODO: Implement restore logic
    }
  }

  onForceScan() {
    if (this.selectedDevice) {
      console.log('Force scan device:', this.selectedDevice.name);
      // TODO: Implement force scan logic
    }
  }

  onUpdatePlugins() {
    if (this.selectedDevice) {
      console.log('Update plugins for device:', this.selectedDevice.name);
      // TODO: Implement update plugins logic
    }
  }
}