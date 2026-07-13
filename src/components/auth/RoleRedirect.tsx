import { Redirect, usePathname } from 'expo-router';

import { useAuth } from '@/store/AuthContext';

export function RoleRedirect() {
  const pathname = usePathname();
  const { loading, profile } = useAuth();

  if (loading || !profile) return null;

  const isVendorAllowed = pathname === '/vendor-dashboard' || pathname === '/account/settings';
  if (profile.role === 'vendor' && !isVendorAllowed) {
    return <Redirect href="/vendor-dashboard" />;
  }

  if (profile.role !== 'vendor' && (pathname === '/vendor-dashboard' || pathname === '/account/vendor')) {
    return <Redirect href="/" />;
  }

  return null;
}
