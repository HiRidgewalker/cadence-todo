import AsyncStorage from "@react-native-async-storage/async-storage";

export function getItem(key: string) {
  return AsyncStorage.getItem(key);
}

export function setItem(key: string, value: string) {
  return AsyncStorage.setItem(key, value);
}

export function removeItem(key: string) {
  return AsyncStorage.removeItem(key);
}
