import * as SecureStore from "expo-secure-store";

const tokenKey = "auth-token";

export function getToken() {
  return SecureStore.getItemAsync(tokenKey);
}

export function setToken(token: string) {
  return SecureStore.setItemAsync(tokenKey, token);
}

export function deleteToken() {
  return SecureStore.deleteItemAsync(tokenKey);
}
