export interface WindowState {
  id: WindowId;
  title: string;
  component: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  minSize: { width: number; height: number };
  zIndex: number;
  data?: any;
}

export type WindowId = 'devices' | 'details' | 'visualizer' | 'chatbot';

export interface WindowConfig {
  id: WindowId;
  title: string;
  component: string;
  defaultPosition: { x: number; y: number };
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
  openByDefault: boolean;
}