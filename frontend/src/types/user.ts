export interface User {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  address: string | null;
  avatarUrl?: string | null;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  googleId: string | null;
  oauthProvider: 'EMAIL' | 'GOOGLE' | 'GITHUB';
  createdAt: string;
}
