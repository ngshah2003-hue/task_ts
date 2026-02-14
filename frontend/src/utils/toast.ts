import { toast } from 'react-toastify';

export const success = (message: string) =>
  toast.success(message, { position: 'top-right', theme: 'colored' });
export const error = (message: string) =>
  toast.error(message, { position: 'top-right', theme: 'colored' });

export const Auth = {
  login: 'Logged in successfully!',
  invalidCredentials: 'Invalid credentials!',
};
