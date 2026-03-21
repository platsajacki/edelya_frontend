<template>
  <div class="page">
    <h1 class="page__title">Покупки</h1>
    <div class="page__placeholder">
      <svg class="page__placeholder-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      <p class="page__placeholder-text">Раздел покупок скоро появится</p>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 480px;
  margin: 0 auto;
  padding: 12px 16px 80px;
  min-height: 100dvh;
}

.page__title {
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 16px;
}

.page__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px 24px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  text-align: center;
}

.page__placeholder-icon {
  color: var(--color-border);
}

.page__placeholder-text {
  font-size: var(--font-md);
  color: var(--color-text-secondary);
  margin: 0;
}

@media (min-width: 600px) {
  .page {
    max-width: 540px;
    padding: 16px 24px 88px;
  }
}
</style>
