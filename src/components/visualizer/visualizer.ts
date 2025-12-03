import { Component, OnInit, effect, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DeviceService } from '../../services/device.service';
import { WindowManagerService } from '../../services/window-manager.service';
import { Device } from '../../models/device.model';

interface Node {
  id: string;
  x: number;
  y: number;
  device: Device;
}

interface Edge {
  from: string;
  to: string;
}

@Component({
  selector: 'app-visualizer',
  standalone: true,
  imports: [],
  templateUrl: './visualizer.html',
  styleUrl: './visualizer.scss',
})
export class VisualizerComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  
  nodes: Node[] = [];
  edges: Edge[] = [];
  selectedDeviceId: string | null = null;
  
  // Zoom et ViewBox
  private baseViewBox = { x: 0, y: 0, width: 600, height: 350 };
  viewBox = signal('0 0 600 350');
  zoomLevel = signal(1);
  private minZoom = 0.5;
  private maxZoom = 3;

  constructor(
    private deviceService: DeviceService,
    private windowManager: WindowManagerService
  ) {
    effect(() => {
      const selected = this.deviceService.selectedDevice();
      this.selectedDeviceId = selected?.id || null;
      
      // Zoom sur la machine sélectionnée si elle existe
      if (selected && this.nodes.length > 0) {
        this.zoomToNode(selected.id);
      }
    });

    // Observer la fermeture de la fenêtre details
    effect(() => {
      const detailsWindow = this.windowManager.getWindow('details');
      if (detailsWindow && !detailsWindow.isOpen && this.selectedDeviceId) {
        // Réinitialiser la sélection et le zoom
        this.deviceService.selectDevice(null);
        this.resetZoom();
      }
    });
  }

  ngOnInit() {
    this.generateVisualization();
    this.resetZoom(); // Vue globale par défaut
    
    // Ajouter le listener pour le zoom avec la molette
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        const svgElement = document.querySelector('.visualizer-svg');
        if (svgElement) {
          svgElement.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
        }
      }, 100);
    }
  }

  private generateVisualization() {
    const devices = this.deviceService.devices();
    const centerX = 300;
    const centerY = 175;
    const radius = 120;

    // Afficher TOUTES les 6 machines en cercle
    this.nodes = devices.map((device, index) => {
      const angle = (index * 2 * Math.PI) / devices.length - Math.PI / 2;
      return {
        id: device.id,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        device
      };
    });

    // Créer les edges
    this.edges = [];
    devices.forEach(device => {
      if (device.connections) {
        device.connections.forEach(targetId => {
          const targetExists = this.nodes.find(n => n.id === targetId);
          if (targetExists && !this.edges.find(e => 
            (e.from === device.id && e.to === targetId) || 
            (e.from === targetId && e.to === device.id)
          )) {
            this.edges.push({ from: device.id, to: targetId });
          }
        });
      }
    });
  }

  onNodeClick(nodeId: string) {
    // Si c'est déjà la machine sélectionnée, ne rien faire
    if (this.selectedDeviceId === nodeId) {
      return;
    }
    
    // Sélectionner le device
    this.deviceService.selectDevice(nodeId);
    
    // Ouvrir la fenêtre details seulement si elle n'est pas déjà ouverte
    const detailsWindow = this.windowManager.getWindow('details');
    if (!detailsWindow?.isOpen) {
      this.windowManager.openWindow('details');
    }
  }

  private zoomToNode(nodeId: string) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Zoom sur le node sélectionné
    const targetZoom = 2.5;
    const newWidth = this.baseViewBox.width / targetZoom;
    const newHeight = this.baseViewBox.height / targetZoom;
    const newX = node.x - newWidth / 2;
    const newY = node.y - newHeight / 2;

    this.viewBox.set(`${newX} ${newY} ${newWidth} ${newHeight}`);
    this.zoomLevel.set(targetZoom);
  }

  resetZoom() {
    this.viewBox.set(`${this.baseViewBox.x} ${this.baseViewBox.y} ${this.baseViewBox.width} ${this.baseViewBox.height}`);
    this.zoomLevel.set(1);
  }

  zoomIn() {
    const currentZoom = this.zoomLevel();
    if (currentZoom >= this.maxZoom) return;

    const newZoom = Math.min(currentZoom * 1.2, this.maxZoom);
    this.applyZoom(newZoom);
  }

  zoomOut() {
    const currentZoom = this.zoomLevel();
    if (currentZoom <= this.minZoom) return;

    const newZoom = Math.max(currentZoom / 1.2, this.minZoom);
    this.applyZoom(newZoom);
  }

  private onWheel(event: Event) {
    // ✅ Caster l'event en WheelEvent
    const wheelEvent = event as WheelEvent;
    wheelEvent.preventDefault();
    
    const delta = wheelEvent.deltaY;
    const currentZoom = this.zoomLevel();
    
    if (delta < 0) {
      // Zoom in
      const newZoom = Math.min(currentZoom * 1.1, this.maxZoom);
      this.applyZoom(newZoom);
    } else {
      // Zoom out
      const newZoom = Math.max(currentZoom / 1.1, this.minZoom);
      this.applyZoom(newZoom);
    }
  }

  private applyZoom(newZoom: number) {
    const centerX = this.baseViewBox.x + this.baseViewBox.width / 2;
    const centerY = this.baseViewBox.y + this.baseViewBox.height / 2;
    
    const newWidth = this.baseViewBox.width / newZoom;
    const newHeight = this.baseViewBox.height / newZoom;
    const newX = centerX - newWidth / 2;
    const newY = centerY - newHeight / 2;

    this.viewBox.set(`${newX} ${newY} ${newWidth} ${newHeight}`);
    this.zoomLevel.set(newZoom);
  }

  getNodePosition(nodeId: string): { x: number; y: number } {
    const node = this.nodes.find(n => n.id === nodeId);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  }

  getNodeClass(device: Device): string {
    const classes = ['node'];
    if (device.status === 'compromised') classes.push('compromised');
    if (device.status === 'isolated') classes.push('isolated');
    if (this.selectedDeviceId === device.id) classes.push('selected');
    return classes.join(' ');
  }
}