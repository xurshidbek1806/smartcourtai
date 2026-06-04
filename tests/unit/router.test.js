import { describe, expect, it } from 'vitest';

import { router } from '@/router';

describe('router', () => {
  it('registers core SmartCourt routes', () => {
    const paths = router.getRoutes().map((route) => route.path);

    expect(paths).toContain('/portal/claims/new');
    expect(paths).toContain('/judge/hearing/live');
    expect(paths).toContain('/admin/security/audit-log');
    expect(paths).toContain('/oversight/corruption/graph');
  });
});
