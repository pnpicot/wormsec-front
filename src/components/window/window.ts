import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, effect, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { WindowState } from '../../models/window.model';

@Component({
  selector: 'app-window',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './window.html',
  styleUrl: './window.scss',
})
export class WindowComponent implements AfterViewInit {
  @Input({ required: true }) window!: WindowState;
  @Output() close = new EventEmitter<void>();
  @Output() minimize = new EventEmitter<void>();
  @Output() maximize = new EventEmitter<void>();
  @Output() focus = new EventEmitter<void>();
  @Output() positionChange = new EventEmitter<{ x: number; y: number }>();
  @Output() sizeChange = new EventEmitter<{ width: number; height: number }>();

  @ViewChild('windowElement') windowElement!: ElementRef<HTMLDivElement>;

  private platformId = inject(PLATFORM_ID);
  private isDragging = false;
  private isResizing = false;
  private resizeDirection: string = '';
  private dragStartX = 0;
  private dragStartY = 0;
  private dragStartWindowX = 0;
  private dragStartWindowY = 0;
  private resizeStartX = 0;
  private resizeStartY = 0;
  private resizeStartWidth = 0;
  private resizeStartHeight = 0;

  ngAfterViewInit() {
    // ✅ Vérifier si on est dans le navigateur avant d'accéder à document
    if (isPlatformBrowser(this.platformId)) {
      this.setupEventListeners();
    }
  }

  private setupEventListeners() {
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  onHeaderMouseDown(event: MouseEvent) {
    if ((event.target as HTMLElement).closest('.window-controls')) {
      return;
    }

    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragStartWindowX = this.window.position.x;
    this.dragStartWindowY = this.window.position.y;
    this.focus.emit();
    event.preventDefault();
  }

  onResizeHandleMouseDown(event: MouseEvent, direction: string) {
    this.isResizing = true;
    this.resizeDirection = direction;
    this.resizeStartX = event.clientX;
    this.resizeStartY = event.clientY;
    this.resizeStartWidth = this.window.size.width;
    this.resizeStartHeight = this.window.size.height;
    this.dragStartWindowX = this.window.position.x;
    this.dragStartWindowY = this.window.position.y;
    this.focus.emit();
    event.preventDefault();
    event.stopPropagation();
  }

  private onMouseMove(event: MouseEvent) {
    if (this.isDragging && !this.window.isMaximized) {
      const deltaX = event.clientX - this.dragStartX;
      const deltaY = event.clientY - this.dragStartY;

      const maxX = window.innerWidth - 200;
      const maxY = window.innerHeight - 100;

      this.positionChange.emit({
        x: Math.max(0, Math.min(maxX, this.dragStartWindowX + deltaX)),
        y: Math.max(60, Math.min(maxY, this.dragStartWindowY + deltaY))
      });
    } else if (this.isResizing) {
      const deltaX = event.clientX - this.resizeStartX;
      const deltaY = event.clientY - this.resizeStartY;

      let newWidth = this.resizeStartWidth;
      let newHeight = this.resizeStartHeight;
      let newX = this.dragStartWindowX;
      let newY = this.dragStartWindowY;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const maxWidth = viewportWidth - this.dragStartWindowX;
      const maxHeight = viewportHeight - this.dragStartWindowY;

      if (this.resizeDirection.includes('e')) {
        const potentialWidth = this.resizeStartWidth + deltaX;
        newWidth = Math.max(
          this.window.minSize.width, 
          Math.min(maxWidth, potentialWidth)
        );
      }
      
      if (this.resizeDirection.includes('s')) {
        const potentialHeight = this.resizeStartHeight + deltaY;
        newHeight = Math.max(
          this.window.minSize.height, 
          Math.min(maxHeight, potentialHeight)
        );
      }
      
      if (this.resizeDirection.includes('w')) {
        const potentialWidth = this.resizeStartWidth - deltaX;
        if (potentialWidth >= this.window.minSize.width) {
          newWidth = potentialWidth;
          newX = Math.max(0, this.dragStartWindowX + deltaX);
        }
      }
      
      if (this.resizeDirection.includes('n')) {
        const potentialHeight = this.resizeStartHeight - deltaY;
        if (potentialHeight >= this.window.minSize.height) {
          newHeight = potentialHeight;
          newY = Math.max(60, this.dragStartWindowY + deltaY);
        }
      }

      this.sizeChange.emit({ width: newWidth, height: newHeight });
      if (newX !== this.dragStartWindowX || newY !== this.dragStartWindowY) {
        this.positionChange.emit({ 
          x: Math.max(0, newX), 
          y: Math.max(60, newY) 
        });
      }
    }
  }

  private onMouseUp() {
    this.isDragging = false;
    this.isResizing = false;
    this.resizeDirection = '';
  }

  onWindowClick() {
    this.focus.emit();
  }

  onClose() {
    this.close.emit();
  }

  onMinimize() {
    this.minimize.emit();
  }

  onMaximize() {
    this.maximize.emit();
  }
}