import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';
import { CURRENT_USER } from '../data/mockData';
import type { Session, User } from '@supabase/supabase-js';

export interface ManagedUserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: string[];
  activeRole: string;
  isKycVerified: boolean;
  state: string;
  district: string;
  lastActive: string;
  isAdmin: boolean;
  isBanned: boolean;
}

const MASTER_ADMIN_EMAIL = 'niteshunofficial1234@gmail.com';

const INITIAL_MANAGED_USERS: ManagedUserRecord[] = [
  {
    id: 'usr_admin_nitesh',
    name: 'Nitesh Gupta',
    email: 'niteshunofficial1234@gmail.com',
    phone: '+91 98123 45678',
    roles: ['admin', 'farmer', 'business', 'scientist'],
    activeRole: 'admin',
    isKycVerified: true,
    state: 'Punjab / Haryana',
    district: 'Patiala',
    lastActive: 'Just now (Active Developer & System Admin)',
    isAdmin: true,
    isBanned: false
  },
  {
    id: 'kyc_1',
    name: 'Baldev Singh (Kisan)',
    email: 'baldev.kisan@gmail.com',
    phone: '+91 98765 11223',
    roles: ['farmer'],
    activeRole: 'farmer',
    isKycVerified: true,
    state: 'Punjab',
    district: 'Patiala',
    lastActive: '16 Oct 2026',
    isAdmin: false,
    isBanned: false
  },
  {
    id: 'kyc_2',
    name: 'Shri Ram Agro Traders & Mill',
    email: 'shriram.agro@gmail.com',
    phone: '+91 98124 99887',
    roles: ['business'],
    activeRole: 'business',
    isKycVerified: true,
    state: 'Haryana',
    district: 'Karnal',
    lastActive: '15 Oct 2026',
    isAdmin: false,
    isBanned: false
  },
  {
    id: 'kyc_3',
    name: 'Narmada Valley Cold Storage Ltd',
    email: 'narmada.cold@gmail.com',
    phone: '+91 97555 44321',
    roles: ['business'],
    activeRole: 'business',
    isKycVerified: false,
    state: 'Madhya Pradesh',
    district: 'Hoshangabad',
    lastActive: '14 Oct 2026',
    isAdmin: false,
    isBanned: false
  },
  {
    id: 'prof_virender',
    name: 'Dr. Virender Kumar',
    email: 'prof.virender.pau@gmail.com',
    phone: '+91 98111 22334',
    roles: ['scientist'],
    activeRole: 'scientist',
    isKycVerified: true,
    state: 'Punjab',
    district: 'Ludhiana',
    lastActive: '23 Oct 2026',
    isAdmin: false,
    isBanned: false
  }
];

// ─── Context Type ────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isDemo: boolean;
  isPitchDemo: boolean;
  togglePitchDemo: () => void;
  loading: boolean;
  isAdmin: boolean;
  isBanned: boolean;
  allManagedUsers: ManagedUserRecord[];
  grantAdminAccess: (email: string) => void;
  revokeAdminAccess: (email: string) => void;
  banUser: (email: string) => void;
  unbanUser: (email: string) => void;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  setSessionFromUrlOrTokens: (tokenOrUrl: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Admin emails list
  const [adminEmails, setAdminEmails] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kheti_admin_emails');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [MASTER_ADMIN_EMAIL];
  });

  // Banned emails list
  const [bannedEmails, setBannedEmails] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kheti_banned_emails');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Managed Users list
  const [managedUsers, setManagedUsers] = useState<ManagedUserRecord[]>(() => {
    try {
      const saved = localStorage.getItem('kheti_managed_users_list');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MANAGED_USERS;
  });

  // Save admin & banned lists to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kheti_admin_emails', JSON.stringify(adminEmails));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [adminEmails]);

  useEffect(() => {
    try {
      localStorage.setItem('kheti_banned_emails', JSON.stringify(bannedEmails));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [bannedEmails]);

  useEffect(() => {
    try {
      localStorage.setItem('kheti_managed_users_list', JSON.stringify(managedUsers));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [managedUsers]);

  // Pitch demo toggle: defaults to false so authenticated users are immediately in isolated live account mode
  const [isPitchDemo, setIsPitchDemo] = useState<boolean>(false);
  const isDemo = !Boolean(user) || isPitchDemo;

  const togglePitchDemo = () => {
    setIsPitchDemo(prev => !prev);
  };

  // Determine if active user is an Admin
  const activeEmail = (user?.email || profile?.phone || '').toLowerCase();
  const isAdmin = 
    activeEmail === MASTER_ADMIN_EMAIL.toLowerCase() || 
    adminEmails.some(e => e.toLowerCase() === activeEmail) ||
    Boolean(profile?.roles?.includes('admin'));

  // Determine if active user is Banned
  const isBanned = activeEmail !== '' && bannedEmails.some(e => e.toLowerCase() === activeEmail);

  // Helper to grant admin access
  const grantAdminAccess = (emailToGrant: string) => {
    const cleanEmail = emailToGrant.trim().toLowerCase();
    if (!cleanEmail) return;

    if (!adminEmails.some(e => e.toLowerCase() === cleanEmail)) {
      setAdminEmails(prev => [...prev, cleanEmail]);
    }

    setManagedUsers(prev => prev.map(u => {
      if (u.email.toLowerCase() === cleanEmail) {
        return {
          ...u,
          isAdmin: true,
          roles: Array.from(new Set([...u.roles, 'admin']))
        };
      }
      return u;
    }));
  };

  // Helper to revoke admin access
  const revokeAdminAccess = (emailToRevoke: string) => {
    const cleanEmail = emailToRevoke.trim().toLowerCase();
    if (cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase()) {
      console.warn('Master admin email cannot be revoked.');
      return;
    }

    setAdminEmails(prev => prev.filter(e => e.toLowerCase() !== cleanEmail));

    setManagedUsers(prev => prev.map(u => {
      if (u.email.toLowerCase() === cleanEmail) {
        return {
          ...u,
          isAdmin: false,
          roles: u.roles.filter(r => r !== 'admin')
        };
      }
      return u;
    }));
  };

  // Helper to ban user
  const banUser = (emailToBan: string) => {
    const cleanEmail = emailToBan.trim().toLowerCase();
    if (cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase()) {
      console.warn('Master admin email cannot be banned.');
      return;
    }

    if (!bannedEmails.some(e => e.toLowerCase() === cleanEmail)) {
      setBannedEmails(prev => [...prev, cleanEmail]);
    }

    setManagedUsers(prev => prev.map(u => {
      if (u.email.toLowerCase() === cleanEmail) {
        return { ...u, isBanned: true };
      }
      return u;
    }));
  };

  // Helper to unban user
  const unbanUser = (emailToUnban: string) => {
    const cleanEmail = emailToUnban.trim().toLowerCase();
    setBannedEmails(prev => prev.filter(e => e.toLowerCase() !== cleanEmail));

    setManagedUsers(prev => prev.map(u => {
      if (u.email.toLowerCase() === cleanEmail) {
        return { ...u, isBanned: false };
      }
      return u;
    }));
  };

  // Helper to synthesize a genuine profile for an authenticated user
  const createSynthesizedProfile = (currentUser: User): UserProfile => {
    const rawName = 
      currentUser.user_metadata?.full_name || 
      currentUser.user_metadata?.name || 
      currentUser.email?.split('@')[0] || 
      'Kisan User';
    
    // Capitalize first letters of name cleanly
    const formattedName = rawName
      .replace(/[._]/g, ' ')
      .replace(/\b\w/g, (char: string) => char.toUpperCase());

    const isUserMasterAdmin = (currentUser.email || '').toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();

    return {
      id: currentUser.id,
      name: formattedName,
      phone: currentUser.phone || currentUser.user_metadata?.phone || '',
      roles: isUserMasterAdmin ? ['admin', 'farmer', 'business', 'scientist'] : ['farmer', 'business', 'scientist'],
      activeRole: isUserMasterAdmin ? 'admin' : 'farmer',
      isKycVerified: Boolean(currentUser.email_confirmed_at || currentUser.confirmed_at),
      state: 'Punjab / Haryana',
      district: '',
      village: '',
      farmSizeAcres: 0,
      primaryCrops: []
    };
  };

  // Sync active logged-in user into managedUsers list
  const registerOrUpdateActiveUser = (currentUser: User, userProf?: UserProfile) => {
    const email = (currentUser.email || '').toLowerCase();
    if (!email) return;

    setManagedUsers(prev => {
      const existingIdx = prev.findIndex(u => u.email.toLowerCase() === email);
      const isMaster = email === MASTER_ADMIN_EMAIL.toLowerCase();
      const isUserAdmin = isMaster || adminEmails.some(e => e.toLowerCase() === email);
      const isUserBanned = bannedEmails.some(e => e.toLowerCase() === email);

      const updatedRecord: ManagedUserRecord = {
        id: currentUser.id,
        name: userProf?.name || currentUser.user_metadata?.full_name || email.split('@')[0],
        email,
        phone: userProf?.phone || currentUser.phone || '',
        roles: isUserAdmin ? ['admin', 'farmer', 'business', 'scientist'] : (userProf?.roles || ['farmer']),
        activeRole: userProf?.activeRole || 'farmer',
        isKycVerified: Boolean(currentUser.email_confirmed_at || currentUser.confirmed_at),
        state: userProf?.state || 'Punjab / Haryana',
        district: userProf?.district || '',
        lastActive: 'Today (Online via Session)',
        isAdmin: isUserAdmin,
        isBanned: isUserBanned
      };

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = updatedRecord;
        return copy;
      } else {
        return [updatedRecord, ...prev];
      }
    });
  };

  // ── Profile fetcher ──────────────────────────────────────────────────────────
  const fetchProfile = async (userId: string, currentUser?: User | null) => {
    const activeUser = currentUser || user;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        if (activeUser) {
          const synthesized = createSynthesizedProfile(activeUser);
          setProfile(synthesized);
          registerOrUpdateActiveUser(activeUser, synthesized);

          void supabase.from('profiles').upsert({
            id: userId,
            name: synthesized.name,
            phone: synthesized.phone,
            active_role: synthesized.activeRole,
            state: synthesized.state,
          }).then(({ error: upsertErr }) => {
            if (upsertErr) {
              console.warn('Could not auto-insert profile into Supabase:', upsertErr.message);
            }
          });
        }
        return;
      }

      if (data) {
        const mapped: UserProfile = {
          id: data.id,
          name: data.name || (activeUser ? createSynthesizedProfile(activeUser).name : 'Farmer'),
          phone: data.phone ?? '',
          roles: data.roles ?? [data.active_role ?? 'farmer'],
          activeRole: data.active_role ?? 'farmer',
          isKycVerified: data.kyc_status === 'verified',
          state: data.state ?? '',
          district: data.district ?? '',
          village: data.village ?? '',
          farmSizeAcres: data.land_acres ?? 0,
          primaryCrops: data.primary_crops ?? [],
          businessType: data.business_type ?? undefined,
          businessName: data.business_name ?? undefined,
          gstNumber: data.gst_number ?? undefined,
          apmcLicense: data.apmc_license ?? undefined,
          universityName: data.university_name ?? undefined,
          academicTitle: data.academic_title ?? undefined,
          researchDepartment: data.research_department ?? undefined,
        };
        setProfile(mapped);
        if (activeUser) {
          registerOrUpdateActiveUser(activeUser, mapped);
        }
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      if (activeUser) {
        const synthesized = createSynthesizedProfile(activeUser);
        setProfile(synthesized);
        registerOrUpdateActiveUser(activeUser, synthesized);
      }
    }
  };

  // ── Bootstrap auth state ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setProfile(CURRENT_USER as UserProfile);
      setLoading(false);
      return;
    }

    if (typeof window !== 'undefined' && window.location.hash && window.location.hash.includes('access_token')) {
      try {
        const fragment = window.location.hash.substring(1);
        const params = new URLSearchParams(fragment);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken) {
          supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          }).then(({ data, error }) => {
            if (!error && data.session) {
              setSession(data.session);
              setUser(data.session.user);
              if (data.session.user) {
                fetchProfile(data.session.user.id);
              }
            }
            window.history.replaceState(null, '', window.location.pathname);
          });
        }
      } catch (err) {
        console.warn('Could not parse hash tokens automatically:', err);
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsPitchDemo(false);
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsPitchDemo(false);
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Auth methods ─────────────────────────────────────────────────────────────

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const redirectUrl = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) throw error;
  };

  const setSessionFromUrlOrTokens = async (rawInput: string) => {
    let accessToken = '';
    let refreshToken = '';

    const cleaned = rawInput.trim();
    if (cleaned.includes('#') || cleaned.includes('?')) {
      const fragment = cleaned.includes('#') ? cleaned.split('#')[1] : cleaned.split('?')[1];
      const params = new URLSearchParams(fragment);
      accessToken = params.get('access_token') || '';
      refreshToken = params.get('refresh_token') || '';
    } else if (cleaned.startsWith('ey')) {
      accessToken = cleaned;
    }

    if (!accessToken) {
      throw new Error('No access_token found. Please paste the full URL containing #access_token=... or the JWT token directly.');
    }

    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || '',
    });

    if (error) throw error;
    if (data.session) {
      setSession(data.session);
      setUser(data.session.user);
      if (data.session.user) {
        await fetchProfile(data.session.user.id);
      }
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('Not authenticated');

    const dbUpdates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.village !== undefined) dbUpdates.village = updates.village;
    if (updates.district !== undefined) dbUpdates.district = updates.district;
    if (updates.state !== undefined) dbUpdates.state = updates.state;
    if (updates.activeRole !== undefined) dbUpdates.active_role = updates.activeRole;
    if (updates.farmSizeAcres !== undefined) dbUpdates.land_acres = updates.farmSizeAcres;
    if (updates.primaryCrops !== undefined) dbUpdates.primary_crops = updates.primaryCrops;

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', user.id);

    if (error) throw error;

    setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  // Computed all managed users with up to date admin and ban states
  const computedManagedUsers = managedUsers.map(u => ({
    ...u,
    isAdmin: u.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase() || adminEmails.some(e => e.toLowerCase() === u.email.toLowerCase()),
    isBanned: bannedEmails.some(e => e.toLowerCase() === u.email.toLowerCase())
  }));

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAuthenticated: Boolean(user),
        isDemo,
        isPitchDemo,
        togglePitchDemo,
        loading,
        isAdmin,
        isBanned,
        allManagedUsers: computedManagedUsers,
        grantAdminAccess,
        revokeAdminAccess,
        banUser,
        unbanUser,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        setSessionFromUrlOrTokens,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ──────────────────────────────────────────────────────────────────────

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an <AuthProvider>');
  return context;
};
