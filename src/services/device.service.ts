import { Injectable, signal } from '@angular/core';
import { Device } from '../models/device.model';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private devicesSignal = signal<Device[]>([
    {
      id: '1',
      name: 'Desktop-1',
      status: 'online',
      risk: 'low',
      os: 'windows',
      ip: '10.0.0.28',
      connections: ['2', '4'],
      events: [
        {
          id: 'e1',
          icon: 'fa-plug-circle-check',
          iconColor: 'success',
          title: 'Plugin updated',
          timestamp: 'Today, 10:55'
        },
        {
          id: 'e2',
          icon: 'fa-plug-circle-exclamation',
          iconColor: 'warning',
          title: 'Outdated plugin detected',
          timestamp: 'Today, 10:48AM'
        },
        {
          id: 'e3',
          icon: 'fa-link',
          iconColor: 'success',
          title: 'Device linked',
          timestamp: 'Today, 8:21AM'
        }
      ]
    },
    {
      id: '2',
      name: 'Laptop-1',
      status: 'online',
      risk: 'medium',
      os: 'windows',
      ip: '10.0.0.29',
      connections: ['1', '3'],
      events: []
    },
    {
      id: '3',
      name: 'Server-1',
      status: 'online',
      risk: 'high',
      os: 'debian',
      ip: '10.0.0.30',
      connections: ['2', '4'],
      events: []
    },
    {
      id: '4',
      name: 'Laptop-2',
      status: 'online',
      risk: 'low',
      os: 'linux',
      ip: '10.0.0.31',
      connections: ['1', '3'],
      events: []
    },
    {
      id: '5',
      name: 'Desktop-2',
      status: 'compromised',
      risk: 'low',
      os: 'windows',
      ip: '10.0.0.32',
      connections: [],
      events: []
    },
    {
      id: '6',
      name: 'Laptop-3',
      status: 'isolated',
      risk: 'medium',
      os: 'apple',
      ip: '10.0.0.33',
      connections: [],
      events: []
    }
  ]);

  private selectedDeviceSignal = signal<Device | null>(null);

  devices = this.devicesSignal.asReadonly();
  selectedDevice = this.selectedDeviceSignal.asReadonly();

  selectDevice(deviceId: string | null) {
    if (deviceId === null) {
      this.selectedDeviceSignal.set(null);
      return;
    }
    const device = this.devicesSignal().find(d => d.id === deviceId);
    this.selectedDeviceSignal.set(device || null);
  }

  getDeviceById(id: string): Device | undefined {
    return this.devicesSignal().find(d => d.id === id);
  }
}