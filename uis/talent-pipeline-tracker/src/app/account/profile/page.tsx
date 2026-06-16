"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout, type AuthUser } from '../../../services/auth';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import Button from '../../../components/ui/Button';
import PageHeader from '../../../components/ui/PageHeader';

export default function ProfilePage() {
  const router = useRouter();
  const { checkingAuth } = useRequireAuth();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (checkingAuth) return;

    getCurrentUser()
      .then(setUser)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load profile'));
  }, [checkingAuth]);

  if (checkingAuth) return <main className="p-6">Checking session...</main>;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <PageHeader title="Account Profile">
        <div className="flex gap-2">
          <Button onClick={() => router.push('/account/change-password')}>Change Password</Button>
          <Button onClick={logout}>Logout</Button>
        </div>
      </PageHeader>

      {error && <p className="text-red-600">{error}</p>}

      {user && (
        <div className="bg-white rounded shadow p-6 max-w-xl space-y-3">
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Status:</strong> {user.is_active === false ? 'Inactive' : 'Active'}</p>
        </div>
      )}
    </main>
  );
}