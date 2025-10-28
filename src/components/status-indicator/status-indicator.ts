import { Component, Input } from '@angular/core';

type DeviceStatus = 'online' | 'compromised' | 'isolated';

@Component({
    selector: 'app-status-indicator',
    imports: [],
    templateUrl: './status-indicator.html',
    styleUrl: './status-indicator.scss',
})
export class StatusIndicator {
    @Input() status: DeviceStatus = 'online';
}
