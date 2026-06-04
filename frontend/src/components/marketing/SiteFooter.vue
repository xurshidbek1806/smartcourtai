<template>
  <footer class="footer">
    <div class="container footer-grid">
      <div>
        <strong>SmartCourt AI</strong>
        <p>O‘zbekiston sud tizimi uchun AI ekotizimi.</p>
      </div>
      <div>
        <h3>Mahsulot</h3>
        <a href="/problems">Muammolar</a>
        <a href="/modules">Modullar</a>
        <a href="/security">Xavfsizlik</a>
        <a href="/architecture">Arxitektura</a>
      </div>
      <div>
        <h3>Kompaniya</h3>
        <a href="/about">Loyiha haqida</a>
        <a href="/case-studies">Case studies</a>
        <a href="/contact">Aloqa</a>
      </div>
      <div>
        <h3>Huquqiy</h3>
        <a href="/legal/terms">Terms</a>
        <a href="/legal/privacy">Privacy</a>
        <a href="/legal/accessibility-statement">Accessibility</a>
      </div>
    </div>
    <p class="copy">© 2026 SmartCourt AI. Made in Uzbekistan.</p>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--border-subtle);
  background: var(--gray-100);
  padding: 44px 0 22px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr repeat(3, 1fr);
  gap: 26px;
}

h3,
p {
  margin: 0 0 12px;
}

a {
  display: block;
  margin: 9px 0;
  color: var(--gray-500);
  font-size: 14px;
}

.copy {
  margin: 28px auto 0;
  width: min(1180px, calc(100% - 32px));
  color: var(--gray-500);
  font-size: 13px;
}

@media (max-width: 820px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 520px) {
  .footer-grid {
    grid-template-columns: 1fr;
  }
}
</style>
