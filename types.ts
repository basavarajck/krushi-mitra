export interface FarmerProfile {
  name: string;
  location: string;
  landSize: number;
  mainCrop: string;
  soilType: string;
  irrigationMethod: string;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  image?: string; // base64 encoded image for display
}

export interface WeatherDay {
  day: string;
  temp_high: number;
  temp_low: number;
  condition: string;
  precipitation_chance: number;
}

export interface WeatherForecast {
  location: string;
  forecast: WeatherDay[];
}

export interface PriceDataPoint {
  date: string; // "YYYY-MM-DD"
  price: number;
}

export interface PriceTrendData {
  crop: string;
  location: string;
  historical: PriceDataPoint[];
  predicted: PriceDataPoint[];
  summary: string;
}

export interface SchemeReminder {
  schemeName: string;
  description: string;
  eligibility: string;
  deadline: string; // "YYYY-MM-DD"
  applicationLink: string;
}

export interface ActivityLog {
  id: string; 
  date: string; // "YYYY-MM-DD"
  activityType: 'Sowing' | 'Irrigation' | 'Fertilization' | 'Pest Control' | 'Harvesting' | 'Observation';
  notes: string;
}

export interface SmartAlert {
  id: string;
  title: string;
  message: string;
  priority: 'High' | 'Medium' | 'Low';
  timestamp: string; // ISO string
}
