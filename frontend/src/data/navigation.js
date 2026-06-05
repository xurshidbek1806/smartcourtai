import {
  Activity,
  Archive,
  BarChart3,
  Bell,
  Bot,
  Briefcase,
  CalendarDays,
  Database,
  FileText,
  Folder,
  Gavel,
  Handshake,
  Home,
  Landmark,
  Library,
  Lock,
  MessageSquare,
  Network,
  ScanFace,
  ScanSearch,
  Settings,
  Shield,
  Sparkles,
  Upload,
  Users
} from 'lucide-vue-next';

export const marketingLinks = [
  { label: 'Muammolar', to: '/problems' },
  { label: 'Features', to: '/features' },
  { label: 'Modules', to: '/modules' },
  { label: 'Security', to: '/security' },
  { label: 'About', to: '/about' }
];

export const portalNav = [
  { label: 'Dashboard', to: '/portal/dashboard', icon: Home },
  { label: 'ClaimValidator', to: '/portal/claim-validator', icon: ScanSearch },
  { label: 'Arizalarim', to: '/portal/claims', icon: FileText, badge: '3' },
  { label: 'Yangi ariza', to: '/portal/claims/new', icon: Folder },
  { label: 'Mediatsiya', to: '/portal/mediation', icon: Handshake },
  { label: 'AI Maslahatchi', to: '/portal/ai-assistant', icon: Sparkles },
  { label: 'Xabarlar', to: '/portal/messages', icon: MessageSquare, badge: '8' },
  { label: 'Kutubxona', to: '/portal/library', icon: Library },
  { label: 'Profil', to: '/portal/profile', icon: Users },
  { label: 'Sozlamalar', to: '/settings/account', icon: Settings }
];

export const judgeNav = [
  { label: 'Dashboard', to: '/judge/dashboard', icon: Home },
  { label: 'Ishlar', to: '/judge/cases', icon: Briefcase, badge: '12' },
  { label: 'Jonli majlis', to: '/judge/hearing/live', icon: ScanFace },
  { label: 'SmartJudge', to: '/judge/ai-tools/smart-judge', icon: Bot },
  { label: 'Pretsedentlar', to: '/judge/precedents', icon: Library },
  { label: 'Kalendar', to: '/judge/schedule', icon: CalendarDays },
  { label: 'Statistika', to: '/judge/statistics', icon: BarChart3 },
  { label: 'Xabarlar', to: '/judge/messages', icon: MessageSquare },
  { label: 'Sozlamalar', to: '/judge/settings', icon: Settings }
];

export const adminNav = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: Home },
  { label: 'Foydalanuvchilar', to: '/admin/users', icon: Users },
  { label: 'Sudlar', to: '/admin/courts', icon: Landmark },
  { label: 'AI modellari', to: '/admin/ai-models', icon: Bot },
  { label: 'RAG korpusi', to: '/admin/corpus', icon: Upload },
  { label: 'Audit log', to: '/admin/security/audit-log', icon: Shield },
  { label: 'Integratsiyalar', to: '/admin/integrations', icon: Network },
  { label: 'Database', to: '/admin/database', icon: Database },
  { label: 'System health', to: '/admin/system/health', icon: Activity },
  { label: 'Sozlamalar', to: '/admin/settings', icon: Settings }
];

export const oversightNav = [
  { label: 'Dashboard', to: '/oversight/dashboard', icon: Home },
  { label: 'AutoExec', to: '/oversight/auto-exec', icon: Activity },
  { label: 'Qarorlar', to: '/oversight/decisions', icon: Gavel },
  { label: 'Ijro nazorati', to: '/oversight/execution', icon: Archive },
  { label: 'CorruptAlert', to: '/oversight/corruption/alerts', icon: Shield, badge: '5' },
  { label: 'Aloqalar grafi', to: '/oversight/corruption/graph', icon: Network },
  { label: 'AnonimusLaw', to: '/oversight/anonymization', icon: Lock },
  { label: 'Ochiq reestr', to: '/oversight/public-registry', icon: Library },
  { label: 'Hisobotlar', to: '/oversight/reports', icon: BarChart3 },
  { label: 'Bildirishnoma', to: '/oversight/notifications', icon: Bell }
];
