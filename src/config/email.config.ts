import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'samaninsystems@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'blnt qxje mtfa dbjj',
  },
  from: process.env.EMAIL_FROM || 'samaninsystems@gmail.com',
}));
