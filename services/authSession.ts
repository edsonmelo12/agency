import { AuthUser, clearAuthToken, clearAuthUser, clearRefreshToken, writeAuthUser, writeAuthToken, writeRefreshToken } from './authStorage';

export type AuthSessionPayload = {
  accessToken: string;
  refreshToken?: string;
  user?: AuthUser;
};

const AUTH_CHANGE_EVENT = 'lb-auth-change';

export const applyAuthSession = (payload: AuthSessionPayload) => {
  if (payload.accessToken) {
    writeAuthToken(payload.accessToken);
  }
  if (payload.refreshToken) {
    writeRefreshToken(payload.refreshToken);
  }
  if (payload.user) {
    writeAuthUser(payload.user);
  }
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const clearAuthSession = () => {
  clearAuthToken();
  clearRefreshToken();
  clearAuthUser();
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};
