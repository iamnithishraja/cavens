export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isPhoneVerified: boolean;
}

export interface Club {
  id: string;
  name: string;
  status: 'approved' | 'pending';
}

export interface ProfileData {
  user: User;
  club: Club | null;
  clubStatus: 'approved' | 'pending' | null;
}

export interface ProfileHeaderProps {
  user: User;
}

export interface ClubStatusCardProps {
  club: Club;
  clubStatus: 'approved' | 'pending' | null;
}

export interface AccountActionsProps {
  onPrivacyPolicy: () => void;
  onDeleteAccount: () => void;
  onLogout: () => void;
}

export interface SwitchToClubButtonProps {
  onSwitchToClub: () => void;
  isSwitching: boolean;
}

export interface LoadingStateProps {
  message?: string;
}

export interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}
