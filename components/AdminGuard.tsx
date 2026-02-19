/**
 * ADMIN GUARD - Route Protection Component
 * Wraps components and ensures only admins (role === 'admin') can access them
 * Redirects unauthorized users to home
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabaseClient';
import { DatabaseUser } from '../types/database';

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children, fallback = null }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const {
        data: { user: authUser },
        error: authError
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        setIsAdmin(false);
        setLoading(false);
        // Redirect to home
        window.location.hash = '#/';
        return;
      }

      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .single();

      if (userError || !userProfile) {
        setIsAdmin(false);
        setLoading(false);
        window.location.hash = '#/';
        return;
      }

      if (userProfile.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        window.location.hash = '#/';
      }
    } catch (error) {
      console.error('Admin guard check failed:', error);
      setIsAdmin(false);
      window.location.hash = '#/';
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return fallback || <div>Verifying access...</div>;
  }

  if (!isAdmin) {
    return fallback || <div>Access denied</div>;
  }

  return <>{children}</>;
};

export default AdminGuard;
