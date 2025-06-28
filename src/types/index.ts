export interface TagInfo {
  name: string;
  icon: string;
  color: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  border: string;
  shadow: string;
}

export interface ThemeIcons {
  home: string;
  diary: string;
  search: string;
  settings: string;
  add: string;
  edit: string;
  delete: string;
  back: string;
  close: string;
  save: string;
  share: string;
  heart: string;
  star: string;
  moon: string;
  sun: string;
  cloud: string;
  rain: string;
  snow: string;
  wind: string;
  thunder: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  category: 'free' | 'premium';
  price?: number;
  colors: ThemeColors;
  icons: ThemeIcons;
  backgroundPattern?: string;
  fontFamily?: string;
  isActive: boolean;
}

export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood?:
    | 'excited'
    | 'happy'
    | 'content'
    | 'neutral'
    | 'sad'
    | 'angry'
    | 'anxious';
  emoji?: string;
  tags?: (string | TagInfo)[];
  selectedWeather?: string[];
  selectedPeople?: string[];
  selectedSchool?: string[];
  selectedCompany?: string[];
  selectedTravel?: string[];
  selectedFood?: string[];
  selectedDessert?: string[];
  selectedDrink?: string[];
  actualResult?: 'realized' | 'not_realized' | string;
  resultStatus?: 'realized' | 'not_realized';
  createdAt: string;
  updatedAt: string;
}

export interface DiaryFilter {
  searchText?: string;
  mood?: 'good' | 'neutral' | 'bad';
  dateRange?: {
    start: string;
    end: string;
  };
}

export type RootStackParamList = {
  MainTabs: undefined;
  WriteEntry: {entry?: DiaryEntry; isEdit?: boolean};
  ViewEntry: {entry: DiaryEntry};
  Login: {onAuthSuccess?: (user: any) => void};
  ThemeStore: undefined;
  SecretStore: undefined;
};

export type TabParamList = {
  Timeline: undefined;
  Home: undefined;
  Calendar: undefined;
  Search: undefined;
  Settings: undefined;
};
