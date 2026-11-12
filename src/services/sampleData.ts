import { TargetAccount, ScheduledTargetItem, GraphApiConfig } from '../types';

export const DEFAULT_COOKIE_STRING = `datr=z2Niau_VrYxapXvkjmDInemI; sb=z2NianZvQAhzQHGIE8qDKfpJ; c_user=61561547737841; xs=6%3AgKqgsWap84Fqfw%3A2%3A1784833381%3A-1%3A-1%3A%3AAcx92WMHlhPDATmFIp-VnWc3J6zQDfFhQharTGz0FA;`;

export const INITIAL_API_CONFIG: GraphApiConfig = {
  appId: '1094829038491823',
  appSecret: '8a9c2e4f01b3d75899ea21049bc8d6fe',
  accessToken: 'EAAQ2gZBW...EAAPRo_valid_token_app_client_creds',
  isValid: true,
  tokenType: 'App Access Token (v21.0)',
  expiresAt: '2026-12-31 23:59:59',
  scopes: ['pages_manage_posts', 'pages_read_engagement', 'instagram_basic', 'publish_video']
};

export const INITIAL_ACCOUNTS: TargetAccount[] = [
  {
    id: 'acc-1',
    name: 'FB User (61561547737841)',
    type: 'Profile',
    platform: 'facebook',
    accountId: '61561547737841',
    cookieStr: DEFAULT_COOKIE_STRING,
    c_user: '61561547737841',
    status: 'active',
    profileNickname: 'Account_1',
    adspowerPort: '9222',
    connectedPort: true,
    pagesCount: 4,
    lastVerifiedAt: 'Just now'
  },
  {
    id: 'acc-2',
    name: 'Viral Reels Global',
    type: 'Page',
    platform: 'facebook',
    accountId: 'page_109284910283',
    cookieStr: DEFAULT_COOKIE_STRING,
    c_user: '61561547737841',
    status: 'ready',
    profileNickname: 'ViralMedia_Hub',
    adspowerPort: '9223',
    connectedPort: true,
    pagesCount: 1,
    lastVerifiedAt: '5 mins ago'
  },
  {
    id: 'acc-3',
    name: 'Tech & Gadgets Daily',
    type: 'Page',
    platform: 'facebook',
    accountId: 'page_982173928192',
    cookieStr: DEFAULT_COOKIE_STRING,
    c_user: '61561547737841',
    status: 'ready',
    profileNickname: 'TechStudio_Pro',
    adspowerPort: '9224',
    connectedPort: false,
    pagesCount: 1,
    lastVerifiedAt: '12 mins ago'
  },
  {
    id: 'acc-4',
    name: '@fitness.nexus.official',
    type: 'Instagram',
    platform: 'instagram',
    accountId: 'ig_178414002938192',
    cookieStr: DEFAULT_COOKIE_STRING,
    status: 'ready',
    profileNickname: 'Insta_Fitness',
    adspowerPort: '9222',
    connectedPort: true,
    lastVerifiedAt: '1 hour ago'
  }
];

export interface LibraryVideo {
  id: string;
  name: string;
  path: string;
  size: string;
  duration: string;
  resolution: string;
  thumbnailColor: string;
  tag: string;
}

export const SAMPLE_VIDEOS: LibraryVideo[] = [
  {
    id: 'vid-1',
    name: 'Viral_AI_Tech_Highlights_01.mp4',
    path: 'C:/Content/Reels/Viral_AI_Tech_Highlights_01.mp4',
    size: '18.4 MB',
    duration: '00:42',
    resolution: '1080x1920 (9:16 Vertical)',
    thumbnailColor: 'from-blue-600 to-indigo-800',
    tag: 'Tech / AI'
  },
  {
    id: 'vid-2',
    name: 'Fitness_Workout_Motivation_Reel.mp4',
    path: 'C:/Content/Reels/Fitness_Workout_Motivation_Reel.mp4',
    size: '24.1 MB',
    duration: '00:35',
    resolution: '1080x1920 (9:16 Vertical)',
    thumbnailColor: 'from-amber-600 to-red-800',
    tag: 'Fitness'
  },
  {
    id: 'vid-3',
    name: 'Product_Showcase_Broll_4K.mp4',
    path: 'C:/Content/Reels/Product_Showcase_Broll_4K.mp4',
    size: '38.2 MB',
    duration: '00:58',
    resolution: '1080x1920 (9:16 Vertical)',
    thumbnailColor: 'from-emerald-600 to-teal-800',
    tag: 'Commerce'
  },
  {
    id: 'vid-4',
    name: 'Satisfying_Oddly_Loops_Trending.mp4',
    path: 'C:/Content/Reels/Satisfying_Oddly_Loops_Trending.mp4',
    size: '14.9 MB',
    duration: '00:28',
    resolution: '1080x1920 (9:16 Vertical)',
    thumbnailColor: 'from-purple-600 to-pink-800',
    tag: 'Viral / Trends'
  }
];

export const getInitialScheduleTargets = (): ScheduledTargetItem[] => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  // Time in next hour or 12:00
  const hours = String((today.getHours() + 1) % 24).padStart(2, '0');

  return [
    {
      id: 'target-1',
      profile: 'Viral Reels Global',
      type: 'Page',
      platform: 'facebook',
      video: 'C:/Content/Reels/Viral_AI_Tech_Highlights_01.mp4',
      videoDuration: '00:42',
      videoSize: '18.4 MB',
      caption: '🚀 The future of AI workflow automation is here! Drop a comment below if you want the link. #trending #viral #automation #meta2026',
      date: dateStr,
      time: `${hours}:00`,
      status: 'scheduled'
    },
    {
      id: 'target-2',
      profile: 'Tech & Gadgets Daily',
      type: 'Page',
      platform: 'facebook',
      video: 'C:/Content/Reels/Product_Showcase_Broll_4K.mp4',
      videoDuration: '00:58',
      videoSize: '38.2 MB',
      caption: '🔥 5 mind-blowing tools you should know this week! Save this for later 💾 #technology #meta #gadgets #reelsviral',
      date: dateStr,
      time: `${hours}:15`,
      status: 'scheduled'
    },
    {
      id: 'target-3',
      profile: '@fitness.nexus.official',
      type: 'IG Reel',
      platform: 'instagram',
      video: 'C:/Content/Reels/Fitness_Workout_Motivation_Reel.mp4',
      videoDuration: '00:35',
      videoSize: '24.1 MB',
      caption: 'Consistency beats talent every single time. Keep showing up! 🏋️ #motivation #instafit #fitnessreels #dailygrind',
      date: dateStr,
      time: `${hours}:30`,
      status: 'scheduled'
    },
    {
      id: 'target-4',
      profile: 'FB User (61561547737841)',
      type: 'Profile',
      platform: 'facebook',
      video: 'C:/Content/Reels/Satisfying_Oddly_Loops_Trending.mp4',
      videoDuration: '00:28',
      videoSize: '14.9 MB',
      caption: 'Wait till the end... 🤯 Share with a friend who needs to see this! #fbreels #viralreels #fyp',
      date: dateStr,
      time: `${hours}:45`,
      status: 'queued'
    }
  ];
};
