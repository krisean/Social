// Venue types and configuration

export interface VenueFeatures {
  comments: boolean;
  // Future features (commented for extensibility):
  // vibox?: boolean;
  // polls?: boolean;
  // challenges?: boolean;
}

export interface Venue {
  id: string;
  name: string;
  slug: string;
  description?: string;
  features: VenueFeatures;
  createdAt: string;
  updatedAt: string;
}
