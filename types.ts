
export type Language = 'vi' | 'en';

export interface LookupResult {
  id: string;
  query: string; // The original input (area code or state name)
  state: string;
  cities: string[];
  timezoneName: string; // e.g. ET, CT
  ianaTimezone: string; // e.g. America/New_York
  vnTime: string;
  usTime: string;
  difference: string;
  suggestions: {
    vn: string;
    us: string;
  }[];
  isDST: boolean;
  rawResponse?: string;
  sources?: Array<{ title: string; uri: string }>;
  error?: string;
}

export interface SearchHistoryItem {
  timestamp: number;
  input: string;
  results: LookupResult[];
}
