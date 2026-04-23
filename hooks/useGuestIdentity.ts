import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_ID_KEY = '@tabletalk_guest_id';
const GUEST_NAME_KEY = '@tabletalk_guest_name';

export interface GuestIdentity {
  id: string;
  name: string;
}

export function useGuestIdentity() {
  const [identity, setIdentity] = useState<GuestIdentity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIdentity();
  }, []);

  const loadIdentity = async () => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }
    
    try {
      const id = await AsyncStorage.getItem(GUEST_ID_KEY);
      const name = await AsyncStorage.getItem(GUEST_NAME_KEY);
      
      if (id && name) {
        setIdentity({ id, name });
      }
    } catch (e) {
      console.error('Failed to load guest identity', e);
    } finally {
      setLoading(false);
    }
  };

  const saveIdentity = async (name: string) => {
    try {
      const id = 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      
      if (typeof window !== 'undefined') {
        await AsyncStorage.setItem(GUEST_ID_KEY, id);
        await AsyncStorage.setItem(GUEST_NAME_KEY, name);
      }
      
      setIdentity({ id, name });
      return { id, name };
    } catch (e) {
      console.error('Failed to save guest identity', e);
      throw e;
    }
  };

  const clearIdentity = async () => {
    try {
      if (typeof window !== 'undefined') {
        await AsyncStorage.removeItem(GUEST_ID_KEY);
        await AsyncStorage.removeItem(GUEST_NAME_KEY);
      }
      setIdentity(null);
    } catch (e) {
      console.error('Failed to clear guest identity', e);
    }
  };

  return {
    identity,
    loading,
    saveIdentity,
    clearIdentity
  };
}
