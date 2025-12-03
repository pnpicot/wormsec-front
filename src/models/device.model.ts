export type DeviceStatus = 'online' | 'compromised' | 'isolated';
export type DeviceRisk = 'low' | 'medium' | 'high';
export type DeviceOS = 'windows' | 'debian' | 'apple' | 'linux';

export interface Device {
  id: string;
  name: string;
  status: DeviceStatus;
  risk: DeviceRisk;
  os: DeviceOS;
  ip?: string;
  connections?: string[];
  events?: DeviceEvent[];
}

export interface DeviceEvent {
  id: string;
  icon: string;
  iconColor: 'success' | 'warning' | 'error' | 'info';
  title: string;
  timestamp: string;
}