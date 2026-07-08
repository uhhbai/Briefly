import { Redirect, usePathname } from 'expo-router';

import { useAuth } from '@/store/AuthContext';

export function RoleRedirect() {
  const pathname = usePathname();
  const { loading, profile } = useAuth();

  if (loading || !profile) return null;

  if (profile.role === 'vendor' && pathname !== '/vendor-dashboard') {
    return <Redirect href="/vendor-dashboard" />;
  }

  if (profile.role !== 'vendor' && pathname === '/vendor-dashboard') {
    return <Redirect href="/" />;
  }

  return null;
}
