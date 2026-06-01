import en from '../locales/en.json';
import hi from '../locales/hi.json';
import es from '../locales/es.json';
import { useAppStore } from '../store/useAppStore';

const translations: Record<string, any> = { en, hi, es };

export function useTranslation() {
  const language = useAppStore((state) => state.language);
  
  const t = (key: string) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Fallback to key if not found
      }
    }
    return value as string;
  };

  return { t, language };
}
