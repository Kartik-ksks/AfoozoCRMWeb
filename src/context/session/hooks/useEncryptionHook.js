// hooks/useEncryptedStorage.js
import { encryptData, decryptData } from '../../../Utils';

export default function useEncryptedStorage() {
  const setItem = (key, value) => {
    console.log('setItem', key, value);
    const encrypted = encryptData(value);
    sessionStorage.setItem(key, encrypted);
  };

  const getItem = (key) => {
    console.log('getItem', key);
    const encrypted = sessionStorage.getItem(key);
    return decryptData(encrypted);
  };

  const removeItem = (key) => {
    sessionStorage.removeItem(key);
  };

  return { setItem, getItem, removeItem };
};
