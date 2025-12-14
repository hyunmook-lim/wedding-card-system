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

export interface SectionConfig {
  id: string;
  type: SectionType;
  variant: string; // 'basic', '3d', 'interactive'
  isVisible: boolean;
  content: Record<string, unknown>; // Specific content for each section
}

export interface SectionProps {
  config: Record<string, unknown>;
  isVisible: boolean;
}
