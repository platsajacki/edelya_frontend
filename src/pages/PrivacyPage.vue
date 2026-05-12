<template>
  <div class="legal-page">
    <header class="legal-page__header">
      <h1 class="legal-page__title">Политика обработки персональных данных сервиса «Еделя»</h1>
    </header>
    <div class="legal-page__body">
      <p v-if="loading" class="legal-page__placeholder">Загрузка…</p>
      <div v-else class="legal-page__prose" v-html="html" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { marked } from "marked"
import { fetchPrivacyLatest } from "../services/legalService"

const loading = ref(true)
const html = ref("")

onMounted(async () => {
  try {
    const data = await fetchPrivacyLatest()
    html.value = marked.parse(data.content ?? "")
  } catch {
    // 404 or network error — loading screen stays (won't happen in practice)
  } finally {
    loading.value = false
  }
})
</script>

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
  font-size: var(--font-lg);
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

.legal-page__prose :deep(h1),
.legal-page__prose :deep(h2),
.legal-page__prose :deep(h3) {
  font-weight: 700;
  color: var(--color-text);
  margin: 1.4em 0 0.4em;
  line-height: 1.3;
}

.legal-page__prose :deep(h1) { font-size: var(--font-lg); }
.legal-page__prose :deep(h2) { font-size: 1.05rem; }
.legal-page__prose :deep(h3) { font-size: 1rem; }

.legal-page__prose :deep(p) {
  margin: 0 0 0.8em;
}

.legal-page__prose :deep(ul),
.legal-page__prose :deep(ol) {
  padding-left: 1.4em;
  margin: 0 0 0.8em;
}

.legal-page__prose :deep(li) {
  margin-bottom: 0.3em;
}

.legal-page__prose :deep(strong) {
  font-weight: 600;
  color: var(--color-text);
}

.legal-page__prose :deep(a) {
  color: var(--color-mint);
  text-decoration: underline;
}

.legal-page__prose :deep(hr) {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 1.5em 0;
}
</style>
