export type SectionType = 
  | 'greeting' 
  | 'intro' 
  | 'bride_groom'
  | 'date'
  | 'location' 
  | 'account' 
  | 'gallery' 
  | 'guestbook'
  | 'share';

export interface WeddingConfig {
  id: string;
  couple: {
    groom: {
      name: string;
      relation: string; // ex. '장남'
      parents: {
        father: string;
        mother: string;
      };
      contact?: string;
    };
    bride: {
      name: string;
      relation: string;
      parents: {
        father: string;
        mother: string;
      };
      contact?: string;
    };
  };
  event: {
    date: string; // ISO string
    location: {
      name: string;
      address: string;
      lat: number;
      lng: number;
      mapUrl?: string;
    };
  };
  sections: SectionConfig[];
}

export interface BackgroundConfig {
  type: 'color' | 'image' | 'video' | 'component' | 'none';
  value?: string; // hex color, image url, or video url
  componentName?: string; // name of the custom react component to render
  opacity?: number; // Base background opacity
  effects?: string[]; // e.g. ['snow', 'floating-photos']
  effectConfig?: Record<string, unknown>; // Specific configs for effects or custom components
}

export interface SectionConfig {
  id: string;
  type: SectionType;
  variant: string; // 'basic', '3d', 'interactive'
  isVisible: boolean;
  content: {
    background?: BackgroundConfig;
    [key: string]: unknown; // Allow other specific content for each section
  }; 
}

export interface SectionProps {
  config: Record<string, unknown>;
  isVisible: boolean;
  onEnter?: () => void;
}
