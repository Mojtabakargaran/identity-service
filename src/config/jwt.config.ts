import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || '2b1e6f7c-8a4d-4e2b-9c3f-7d5a1b2c3e4f-!@#Samanin2025$%^&*()_+|~=',
  expiresIn: process.env.JWT_EXPIRES_IN || '3600',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '604800',
}));
