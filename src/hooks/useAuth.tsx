import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

// Default primary developer master admin record (matches live Supabase UUID)
const DEFAULT_REAL_ADMIN: ManagedUserRecord = {
  id: '0dd8be9d-0d8d-46d0-bd3a-46f393d1fd0b',
  name: 'Nitesh Gupta',
  email: 'niteshunofficial1234@gmail.com',
  phone: '+91 98123 45678',
  roles: ['admin', 'farmer', 'business', 'scientist'],
  activeRole: 'admin',
  isKycVerified: true,
  state: 'Haryana / Punjab',
  district: 'Karnal',
  lastActive: 'Active Developer & Primary Master Admin',
  isAdmin: true,
  isBanned: false
};

// Helper to detect any fake legacy test users
const isFakeMockUser = (u: { id?: string; name?: string; email?: string }): boolean => {
  const email = (u.email || '').toLowerCase();
  const name = (u.name || '').toLowerCase();
  const id = (u.id || '').toLowerCase();
  return (
    id.startsWith('usr_farmer') ||
    id.startsWith('usr_business') ||
    id.startsWith('usr_storage') ||
    id.startsWith('usr_scientist') ||
    id.startsWith('usr_rameshwar') ||
    id.startsWith('usr_baldev') ||
    id.startsWith('usr_shriram') ||
    id.startsWith('usr_narmada') ||
    email.includes('baldev') ||
    email.includes('shriram') ||
    email.includes('narmada') ||
    email.includes('virender') ||
    name.includes('baldev') ||
    name.includes('shriram') ||
    name.includes('narmada') ||
    name.includes('virender')
  );
};

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
  loginAsManagedUser: (userRecord: ManagedUserRecord) => void;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshManagedUsers?: () => Promise<void>;
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

  // Managed Users list (strictly real registered logins from Supabase)
  const [managedUsers, setManagedUsers] = useState<ManagedUserRecord[]>(() => {
    try {
      localStorage.removeItem('kheti_managed_users_list');
    } catch {}
    return [DEFAULT_REAL_ADMIN];
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

  // Fetch real registered profiles directly from Supabase
  const fetchRealProfilesFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data: dbProfiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (!error && dbProfiles && dbProfiles.length > 0) {
        // Exclude any fake mock accounts completely
        const validProfiles = dbProfiles.filter((p: any) => !isFakeMockUser(p));

        const realUsers: ManagedUserRecord[] = validProfiles.map((p: any) => {
          const isMaster = 
            (user?.email && user.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase() && p.id === user.id) ||
            (p.name && p.name.toLowerCase().includes('nitesh')) ||
            p.id === '0dd8be9d-0d8d-46d0-bd3a-46f393d1fd0b' ||
            adminEmails.some(e => e.toLowerCase() === (p.email || '').toLowerCase());

          let userEmail = p.email;
          if (!userEmail) {
            if (isMaster) {
              userEmail = MASTER_ADMIN_EMAIL;
            } else if (p.name) {
              userEmail = `${p.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@khetiai.in`;
            } else {
              userEmail = `user-${p.id.slice(0, 8)}@khetiai.in`;
            }
          }

          return {
            id: p.id,
            name: p.name || 'Registered Kisan',
            email: userEmail,
            phone: p.phone || '+91 98124 00000',
            roles: isMaster ? ['admin', 'farmer', 'business', 'scientist'] : (p.roles || [p.active_role || 'farmer']),
            activeRole: isMaster ? 'admin' : (p.active_role || 'farmer'),
            isKycVerified: p.kyc_status === 'verified',
            state: p.state || (p.district ? `${p.district}, Punjab` : 'Punjab / Haryana'),
            district: p.district || '',
            lastActive: p.updated_at ? `Active in Supabase (${new Date(p.updated_at).toLocaleDateString('en-IN')})` : 'Registered Supabase User',
            isAdmin: isMaster,
            isBanned: bannedEmails.some(e => e.toLowerCase() === userEmail.toLowerCase())
          };
        });

        // Ensure master admin Nitesh Gupta is listed if not in profiles
        if (!realUsers.some(u => u.isAdmin || u.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase())) {
          realUsers.unshift(DEFAULT_REAL_ADMIN);
        }

        setManagedUsers(realUsers);
      }
    } catch (err) {
      console.warn('Notice: Error fetching real profiles from Supabase:', err);
    }
  }, [user, adminEmails, bannedEmails]);

  // Load profiles on mount
  useEffect(() => {
    fetchRealProfilesFromSupabase();
  }, [fetchRealProfilesFromSupabase]);

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
      if (session?.user) {
        setUser(session.user);
        setIsPitchDemo(false);
        fetchProfile(session.user.id);
      } else {
        // Check if an authenticated managed user was saved
        try {
          const savedSession = localStorage.getItem('kheti_active_user_session');
          if (savedSession) {
            const { user: savedUser, profile: savedProf } = JSON.parse(savedSession);
            if (savedUser && savedProf) {
              setUser(savedUser);
              setProfile(savedProf);
              setIsPitchDemo(false);
            }
          }
        } catch {}
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        setIsPitchDemo(false);
        fetchProfile(session.user.id);
      } else {
        // Only clear if no local user session is stored
        try {
          const savedSession = localStorage.getItem('kheti_active_user_session');
          if (savedSession) {
            const { user: savedUser, profile: savedProf } = JSON.parse(savedSession);
            if (savedUser) {
              setUser(savedUser);
              setProfile(savedProf);
              setIsPitchDemo(false);
              return;
            }
          }
        } catch {}
        setUser(null);
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

  const loginAsManagedUser = (userRecord: ManagedUserRecord) => {
    const isMaster = userRecord.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
    const isUserAdmin = isMaster || adminEmails.some(e => e.toLowerCase() === userRecord.email.toLowerCase()) || userRecord.isAdmin;

    const synthesizedUser: any = {
      id: userRecord.id,
      email: userRecord.email,
      phone: userRecord.phone,
      user_metadata: {
        full_name: userRecord.name,
        name: userRecord.name,
        phone: userRecord.phone
      },
      confirmed_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString()
    };

    const newProfile: UserProfile = {
      id: userRecord.id,
      name: userRecord.name,
      phone: userRecord.phone,
      roles: (isUserAdmin ? ['admin', 'farmer', 'business', 'scientist'] : (userRecord.roles as any)) || ['farmer'],
      activeRole: (isUserAdmin ? 'admin' : (userRecord.activeRole as any)) || 'farmer',
      isKycVerified: true,
      state: userRecord.state || 'Punjab / Haryana',
      district: userRecord.district || 'Patiala',
      village: 'Field Office',
      farmSizeAcres: userRecord.activeRole === 'farmer' ? 14.5 : 0,
      primaryCrops: ['Wheat (गेहूं)', 'Basmati Paddy (धान)'],
      businessName: userRecord.activeRole === 'business' ? userRecord.name : undefined,
      businessType: userRecord.activeRole === 'business' ? 'trader' : undefined,
      gstNumber: userRecord.activeRole === 'business' ? '06AABCS1234F1Z9' : undefined,
      apmcLicense: userRecord.activeRole === 'business' ? 'HR-KRN-APMC-7712' : undefined
    };

    setUser(synthesizedUser);
    setProfile(newProfile);
    setIsPitchDemo(false);
    registerOrUpdateActiveUser(synthesizedUser, newProfile);

    try {
      localStorage.setItem('kheti_active_user_session', JSON.stringify({ user: synthesizedUser, profile: newProfile }));
    } catch (e) {
      console.warn('Error saving user session:', e);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    try {
      localStorage.removeItem('kheti_active_user_session');
    } catch {}
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

    try {
      await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', user.id);
    } catch {}

    setProfile((prev) => {
      const next = prev ? { ...prev, ...updates } : prev;
      if (next) {
        try {
          const saved = localStorage.getItem('kheti_active_user_session');
          if (saved) {
            const parsed = JSON.parse(saved);
            localStorage.setItem('kheti_active_user_session', JSON.stringify({ ...parsed, profile: next }));
          }
        } catch {}
      }
      return next;
    });
  };

  // Computed all managed users strictly from real logins with up to date admin and ban states
  const computedManagedUsers = managedUsers
    .filter(u => !isFakeMockUser(u))
    .map(u => ({
      ...u,
      isAdmin: u.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase() || u.name.toLowerCase().includes('nitesh') || adminEmails.some(e => e.toLowerCase() === u.email.toLowerCase()),
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
        loginAsManagedUser,
        signOut,
        updateProfile,
        refreshManagedUsers: fetchRealProfilesFromSupabase,
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
