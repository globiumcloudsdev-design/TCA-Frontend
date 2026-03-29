// Is file mein 'use client' NAHI hona chahiye
import AuthLayoutClient from './AuthLayoutClient';

export const metadata = {
  title: {
    template: '%s | The Clouds Academy',
    default: 'Authentication',
  },
  description: 'Login to your institute dashboard',
};

export default function AuthLayout({ children }) {
  return <AuthLayoutClient>{children}</AuthLayoutClient>;
}