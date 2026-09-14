export type Language = 
  | 'en' 
  | 'hi' 
  | 'kn' 
  | 'ta' 
  | 'te' 
  | 'mr' 
  | 'tulu' 
  | 'kok'
  | 'ml'
  | 'gu'
  | 'bn'
  | 'or'
  | 'as'
  | 'pa'
  | 'hry'
  | 'mni'
  | 'ks';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
}
