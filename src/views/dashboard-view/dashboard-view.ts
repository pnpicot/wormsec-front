import { Component } from '@angular/core';
import { DeviceList } from "./device-list/device-list";
import { Filters } from "./filters/filters";
import { DeviceDetails } from "./device-details/device-details";

@Component({
    selector: 'app-dashboard-view',
    imports: [DeviceList, Filters, DeviceDetails],
    templateUrl: './dashboard-view.html',
    styleUrl: './dashboard-view.scss',
})
export class DashboardView {

}
