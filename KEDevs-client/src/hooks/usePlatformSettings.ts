import { useState, useEffect } from 'react';
import { paymentService } from '@/services/paymentService';

export interface PlatformSetting {
  settingKey: string;
  settingValue: string;
  description: string;
}

export function usePlatformSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await paymentService.getSettings();
        if (response.success && Array.isArray(response.data)) {
          const mapped = response.data.reduce((acc: any, curr: PlatformSetting) => {
            acc[curr.settingKey] = curr.settingValue;
            return acc;
          }, {});
          setSettings(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch platform settings', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const getPrice = (key: string, defaultValue: string = '0') => {
    return settings[key] || defaultValue;
  };

  return { settings, loading, getPrice };
}
