<template>
  <div class="legal-page">
    <header class="legal-page__header">
      <h1 class="legal-page__title">Условия использования сервиса «Еделя»</h1>
    </header>
    <div class="legal-page__body">
      <div v-if="loading" class="legal-page__loading"><div class="spinner" /></div>
      <div v-else v-purify="html" class="legal-page__prose" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { vPurify } from "@/directives/purify"
import { ref, onMounted } from "vue"
import { marked } from "marked"
import { fetchTermsLatest } from "../services/legalService"

const loading = ref(true)
const html = ref("")

onMounted(async () => {
  try {
    const data = await fetchTermsLatest()
    html.value = await marked.parse(data.content ?? "")
  } catch {
    // 404 or network error — loading screen stays (won't happen in practice)
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.legal-page {
  max-width: 540px;
  margin: 0 auto;
  padding: 24px 16px 40px;

  &__header {
    margin-bottom: 24px;
  }

  &__title {
    font-size: var(--font-lg);
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
  }

  &__body {
    font-size: var(--font-body);
    color: var(--color-text);
    line-height: 1.7;
  }

  &__loading {
    display: flex;
    justify-content: center;
    padding: 40px 0;
  }

  &__prose {
    :deep(h1),
    :deep(h2),
    :deep(h3) {
      font-weight: 700;
      color: var(--color-text);
      margin: 1.4em 0 0.4em;
      line-height: 1.3;
    }

    :deep(h1) {
      font-size: var(--font-lg);
    }
    :deep(h2) {
      font-size: 1.05rem;
    }
    :deep(h3) {
      font-size: 1rem;
    }

    :deep(p) {
      margin: 0 0 0.8em;
    }

    :deep(ul),
    :deep(ol) {
      padding-left: 1.4em;
      margin: 0 0 0.8em;
    }

    :deep(li) {
      margin-bottom: 0.3em;
    }

    :deep(strong) {
      font-weight: 600;
      color: var(--color-text);
    }

    :deep(a) {
      color: var(--color-mint);
      text-decoration: underline;
    }

    :deep(hr) {
      border: none;
      border-top: 1px solid var(--color-border);
      margin: 1.5em 0;
    }
  }
}
</style>
