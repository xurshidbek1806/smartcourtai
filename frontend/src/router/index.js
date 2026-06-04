import { createRouter, createWebHistory } from 'vue-router';

import LandingPage from '@/pages/marketing/LandingPage.vue';
import MarketingPage from '@/pages/marketing/MarketingPage.vue';
import AuthPage from '@/pages/system/AuthPage.vue';
import SystemPage from '@/pages/system/SystemPage.vue';
import PortalDashboard from '@/pages/portal/PortalDashboard.vue';
import ClaimWizard from '@/pages/portal/ClaimWizard.vue';
import ClaimDetail from '@/pages/portal/ClaimDetail.vue';
import AiAssistant from '@/pages/portal/AiAssistant.vue';
import PortalGeneric from '@/pages/portal/PortalGeneric.vue';
import JudgeDashboard from '@/pages/judge/JudgeDashboard.vue';
import LiveHearing from '@/pages/judge/LiveHearing.vue';
import SmartJudge from '@/pages/judge/SmartJudge.vue';
import JudgeGeneric from '@/pages/judge/JudgeGeneric.vue';
import AdminDashboard from '@/pages/admin/AdminDashboard.vue';
import AiModels from '@/pages/admin/AiModels.vue';
import AuditLog from '@/pages/admin/AuditLog.vue';
import AdminGeneric from '@/pages/admin/AdminGeneric.vue';
import OversightDashboard from '@/pages/oversight/OversightDashboard.vue';
import CorruptionGraph from '@/pages/oversight/CorruptionGraph.vue';
import OversightGeneric from '@/pages/oversight/OversightGeneric.vue';

const marketingPages = [
  'features',
  'modules',
  'architecture',
  'security',
  'pricing',
  'case-studies',
  'blog',
  'about',
  'contact',
  'changelog',
  'roadmap',
  'press-kit',
  'careers'
].map((name) => ({ path: `/${name}`, name, component: MarketingPage }));

const marketingDetailPages = [
  '/blog/:slug',
  '/case-studies/:slug'
].map((path) => ({ path, component: MarketingPage }));

const authRoutes = [
  '/login',
  '/register',
  '/portal/login',
  '/portal/register',
  '/portal/verify',
  '/portal/forgot-password',
  '/judge/login',
  '/judge/2fa',
  '/admin/login',
  '/oversight/login',
  '/welcome',
  '/tour',
  '/setup-2fa'
].map((path) => ({ path, component: AuthPage }));

const portalGeneric = [
  '/portal/profile',
  '/portal/profile/edit',
  '/portal/profile/security',
  '/portal/profile/notifications',
  '/portal/claims',
  '/portal/claims/:id/track',
  '/portal/claims/:id/documents',
  '/portal/claims/:id/timeline',
  '/portal/claims/:id/chat',
  '/portal/claims/:id/payment',
  '/portal/mediation',
  '/portal/mediation/:id',
  '/portal/mediation/:id/agreement',
  '/portal/lawyers',
  '/portal/lawyers/:id',
  '/portal/lawyers/book',
  '/portal/library',
  '/portal/library/laws',
  '/portal/library/precedents',
  '/portal/library/templates',
  '/portal/notifications',
  '/portal/messages',
  '/portal/help',
  '/portal/help/faq'
].map((path) => ({ path, component: PortalGeneric }));

const judgeGeneric = [
  '/judge/cases',
  '/judge/cases/active',
  '/judge/cases/pending',
  '/judge/cases/closed',
  '/judge/cases/:id',
  '/judge/cases/:id/parties',
  '/judge/cases/:id/evidence',
  '/judge/cases/:id/hearings',
  '/judge/cases/:id/decision',
  '/judge/cases/:id/protocol',
  '/judge/hearing/:id/recording',
  '/judge/hearing/:id/transcript',
  '/judge/ai-tools',
  '/judge/ai-tools/lex-predictor',
  '/judge/ai-tools/evidence-analyzer',
  '/judge/ai-tools/sentencai',
  '/judge/ai-tools/anonimus-law',
  '/judge/precedents',
  '/judge/laws',
  '/judge/templates',
  '/judge/schedule',
  '/judge/schedule/calendar',
  '/judge/schedule/week',
  '/judge/schedule/day',
  '/judge/statistics',
  '/judge/colleagues',
  '/judge/messages',
  '/judge/notifications',
  '/judge/profile',
  '/judge/settings'
].map((path) => ({ path, component: JudgeGeneric }));

const adminGeneric = [
  '/admin/users',
  '/admin/users/citizens',
  '/admin/users/judges',
  '/admin/users/lawyers',
  '/admin/users/admins',
  '/admin/users/:id',
  '/admin/users/:id/permissions',
  '/admin/users/:id/activity',
  '/admin/cases',
  '/admin/cases/analytics',
  '/admin/courts',
  '/admin/courts/:id',
  '/admin/courts/:id/judges',
  '/admin/courts/:id/statistics',
  '/admin/ai-models/llama-3',
  '/admin/ai-models/whisper',
  '/admin/ai-models/training',
  '/admin/ai-models/logs',
  '/admin/security',
  '/admin/security/access-control',
  '/admin/security/encryption',
  '/admin/security/incidents',
  '/admin/integrations',
  '/admin/integrations/oneid',
  '/admin/integrations/banks',
  '/admin/integrations/mib',
  '/admin/integrations/fhdyo',
  '/admin/database',
  '/admin/database/postgresql',
  '/admin/database/qdrant',
  '/admin/database/neo4j',
  '/admin/database/backups',
  '/admin/system',
  '/admin/system/health',
  '/admin/system/performance',
  '/admin/system/logs',
  '/admin/billing',
  '/admin/notifications/broadcast',
  '/admin/settings'
].map((path) => ({ path, component: AdminGeneric }));

const oversightGeneric = [
  '/oversight/decisions',
  '/oversight/decisions/:id',
  '/oversight/decisions/:id/execute',
  '/oversight/execution',
  '/oversight/execution/queue',
  '/oversight/execution/active',
  '/oversight/execution/completed',
  '/oversight/corruption',
  '/oversight/corruption/alerts',
  '/oversight/corruption/reports',
  '/oversight/anonymization',
  '/oversight/anonymization/queue',
  '/oversight/anonymization/published',
  '/oversight/public-registry',
  '/oversight/integrations',
  '/oversight/reports',
  '/oversight/reports/generate',
  '/oversight/notifications'
].map((path) => ({ path, component: OversightGeneric }));

const settingsRoutes = [
  '/settings/account',
  '/settings/security',
  '/settings/notifications',
  '/settings/privacy',
  '/settings/language',
  '/settings/appearance',
  '/settings/accessibility',
  '/settings/api-keys',
  '/settings/billing',
  '/settings/delete-account',
  '/legal/terms',
  '/legal/privacy',
  '/legal/cookies',
  '/legal/gdpr',
  '/legal/accessibility-statement'
].map((path) => ({ path, component: PortalGeneric }));

const routes = [
  { path: '/', name: 'home', component: LandingPage },
  ...marketingPages,
  ...marketingDetailPages,
  ...authRoutes,
  { path: '/portal/dashboard', component: PortalDashboard },
  { path: '/portal/claims/new', component: ClaimWizard },
  { path: '/portal/claims/:id', component: ClaimDetail },
  { path: '/portal/ai-assistant', component: AiAssistant },
  ...portalGeneric,
  { path: '/judge/dashboard', component: JudgeDashboard },
  { path: '/judge/hearing/live', component: LiveHearing },
  { path: '/judge/ai-tools/smart-judge', component: SmartJudge },
  ...judgeGeneric,
  { path: '/admin/dashboard', component: AdminDashboard },
  { path: '/admin/ai-models', component: AiModels },
  { path: '/admin/security/audit-log', component: AuditLog },
  ...adminGeneric,
  { path: '/oversight/dashboard', component: OversightDashboard },
  { path: '/oversight/corruption/graph', component: CorruptionGraph },
  ...oversightGeneric,
  ...settingsRoutes,
  { path: '/403', component: SystemPage },
  { path: '/500', component: SystemPage },
  { path: '/maintenance', component: SystemPage },
  { path: '/offline', component: SystemPage },
  { path: '/404', component: SystemPage },
  { path: '/:pathMatch(.*)*', component: SystemPage }
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});
