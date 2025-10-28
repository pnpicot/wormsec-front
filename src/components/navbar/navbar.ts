import { Component } from '@angular/core';
import { SearchBar } from "../search-bar/search-bar";

@Component({
    selector: 'app-navbar',
    imports: [SearchBar],
    templateUrl: './navbar.html',
    styleUrl: './navbar.scss',
})
export class Navbar {

}
