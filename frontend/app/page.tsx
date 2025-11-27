'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import { LoadingPage } from '@/components/ui/Loading';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'customer') {
        router.push('/customer-portal');
      } else {
        router.push('/dashboard');
      }
    } else {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, router]);

  return <LoadingPage />;
}
