import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-checkbox',
    imports: [],
    templateUrl: './checkbox.html',
    styleUrl: './checkbox.scss',
})
export class Checkbox {
    @Input() checked: boolean = false;

    onClick(): void
    {
        this.checked = !this.checked;
        console.log("test");
    }
}
