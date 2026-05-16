export type TravelerListing = {
  id: string;
  origin: { city: string; country: string; flag: string };
  destination: { city: string; country: string; flag: string };
  arrives: string;
  capacity: string;
  service: string;
  rating: number;
  verified: boolean;
  categories: string[];
};
