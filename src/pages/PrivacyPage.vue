<template>
  <div class="legal-page">
    <header class="legal-page__header">
      <h1 class="legal-page__title">Политика конфиденциальности</h1>
    </header>
    <div class="legal-page__body">
      <p class="legal-page__placeholder">Текст политики конфиденциальности появится здесь.</p>
    </div>
  </div>
</template>

<style scoped>
.legal-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 16px 40px;
}

.legal-page__header {
  margin-bottom: 24px;
}

.legal-page__title {
  font-size: var(--font-title);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.legal-page__body {
  font-size: var(--font-body);
  color: var(--color-text);
  line-height: 1.7;
}

.legal-page__placeholder {
  color: var(--color-text-secondary);
}
</style>
