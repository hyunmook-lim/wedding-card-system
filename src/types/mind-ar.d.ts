import * as THREE from 'three';

export interface MindARThreeOptions {
  container: HTMLElement;
  imageTargetSrc: string;
  maxTrack?: number;
  uiLoading?: string;
  uiScanning?: string;
  uiError?: string;
  filterMinCF?: number;
  filterBeta?: number;
}

export interface MindARThree {
  start(): Promise<void>;
  stop(): void;
  addAnchor(targetIndex: number): {
    group: THREE.Group;
    onTargetFound: () => void;
    onTargetLost: () => void;
  };
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
}

declare global {
  interface Window {
    MindARThree: new (options: MindARThreeOptions) => MindARThree;
    MindARTHREE: typeof THREE;
    MINDAR: {
      IMAGE: {
        MindARThree: new (options: MindARThreeOptions) => MindARThree;
      };
    };
  }
}

declare module 'mind-ar/dist/mindar-image-three.prod.js' {
  export { MindARThreeOptions, MindARThree };
}
