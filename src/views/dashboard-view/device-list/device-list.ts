import { Component } from '@angular/core';
import { StatusIndicator } from "../../../components/status-indicator/status-indicator";

interface Device {
    name: string;
    status: 'online' | 'compromised' | 'isolated';
    risk: 'low' | 'medium' | 'high';
    os: 'windows' | 'debian' | 'apple' | 'linux';
}

@Component({
    selector: 'app-device-list',
    imports: [StatusIndicator],
    templateUrl: './device-list.html',
    styleUrl: './device-list.scss',
})
export class DeviceList {
    protected devices: Device[] = [
        {
            name: 'Desktop-1',
            status: 'online',
            risk: 'low',
            os: 'windows'
        },
        {
            name: 'Laptop-1',
            status: 'online',
            risk: 'medium',
            os: 'windows'
        },
        {
            name: 'Server-1',
            status: 'online',
            risk: 'high',
            os: 'debian'
        },
        {
            name: 'Laptop-2',
            status: 'online',
            risk: 'low',
            os: 'linux'
        },
        {
            name: 'Desktop-2',
            status: 'compromised',
            risk: 'low',
            os: 'windows'
        },
        {
            name: 'Laptop-3',
            status: 'isolated',
            risk: 'medium',
            os: 'apple'
        }
    ];
}
