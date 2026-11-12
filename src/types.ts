export interface TargetAccount {
  id: string;
  name: string;
  type: 'Profile' | 'Page' | 'Instagram';
  platform: 'facebook' | 'instagram';
  accountId: string;
  cookieStr: string;
  c_user?: string;
  status: 'active' | 'ready' | 'needs_verification' | 'expired';
  profileNickname: string;
  adspowerPort: string;
  connectedPort?: boolean;
  pagesCount?: number;
  lastVerifiedAt?: string;
}

export interface ScheduledTargetItem {
  id: string;
  profile: string;
  type: 'Profile' | 'Page' | 'IG Reel' | 'IG Feed';
  platform: 'facebook' | 'instagram';
  video: string;
  videoUrl?: string;
  videoDuration?: string;
  videoSize?: string;
  caption: string;
  date: string;
  time: string;
  status: 'queued' | 'scheduled' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  postId?: string;
}

export interface HistoryRecord {
  id: string;
  profile: string;
  type: string;
  video: string;
  caption: string;
  completedAt: string;
  postId: string;
  platform: 'facebook' | 'instagram';
}

export type LogLevel = 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'RPA';

export interface TerminalLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  details?: string;
}

export interface GraphApiConfig {
  appId: string;
  appSecret: string;
  accessToken: string | null;
  isValid: boolean;
  tokenType?: string;
  expiresAt?: string;
  scopes?: string[];
}
