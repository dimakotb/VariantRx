import { env } from '@/config/env';
import { apiGet, apiPost } from '@/services/api/client';
import type { ApiResponse, AuthCredentials, RegisterPayload, User } from '@/types';

const MOCK_USER_KEY = 'variantrx_mock_user';

function getMockUser(): User | null {
  const raw = localStorage.getItem(MOCK_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function setMockUser(user: User | null) {
  if (user) localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(MOCK_USER_KEY);
}

export async function login(credentials: AuthCredentials): Promise<User> {
  if (env.useMockApi) {
    await new Promise((r) => setTimeout(r, 400));
    const user: User = {
      _id: 'mock-1',
      username: credentials.email.split('@')[0],
      email: credentials.email,
      token: 'mock-jwt-token',
    };
    localStorage.setItem('token', user.token!);
    setMockUser(user);
    return user;
  }

  const res = await apiPost<ApiResponse<User & { token: string }>>('/auth/login', credentials);
  if (!res.success) throw new Error('Login failed');
  localStorage.setItem('token', res.data.token);
  const { token: _t, ...user } = res.data;
  return user;
}

export async function register(payload: RegisterPayload): Promise<User> {
  if (env.useMockApi) {
    await new Promise((r) => setTimeout(r, 500));
    const user: User = {
      _id: 'mock-1',
      username: payload.username,
      email: payload.email,
      token: 'mock-jwt-token',
    };
    localStorage.setItem('token', user.token!);
    setMockUser(user);
    return user;
  }

  const res = await apiPost<ApiResponse<User & { token: string }>>('/auth/register', payload);
  if (!res.success) throw new Error('Registration failed');
  localStorage.setItem('token', res.data.token);
  const { token: _t, ...user } = res.data;
  return user;
}

export async function fetchCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem('token');
  if (!token) return null;

  if (env.useMockApi) {
    return getMockUser();
  }

  try {
    const res = await apiGet<ApiResponse<User>>('/auth/me');
    return res.success ? res.data : null;
  } catch {
    return getMockUser();
  }
}

export function logout(): void {
  localStorage.removeItem('token');
  setMockUser(null);
}
