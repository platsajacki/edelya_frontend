<template>
  <div class="legal-page" :class="{ 'legal-page--wide': !miniApp }">
    <header class="legal-page__header">
      <h1 class="legal-page__title">{{ title }}</h1>
    </header>
    <div class="legal-page__body">
      <div v-if="loading" class="legal-page__loading">
        <div class="spinner" role="status" aria-label="Загрузка" />
      </div>
      <p v-else-if="failed" class="legal-page__error">
        Не удалось загрузить документ. Обновите страницу или попробуйте позже.
      </p>
      <div v-else v-purify="html" class="legal-page__prose" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { marked } from "marked"
import { vPurify } from "@/directives/purify"
import { isMiniApp } from "@/dom/isMiniApp"

interface LegalDocument {
  content: string
}

const props = defineProps<{
  title: string
  loadDocument: () => Promise<LegalDocument>
}>()

const miniApp = isMiniApp()
const loading = ref(true)
const failed = ref(false)
const html = ref("")

onMounted(async () => {
  try {
    const data = await props.loadDocument()
    html.value = await marked.parse(data.content ?? "")
  } catch {
    failed.value = true
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

  &--wide {
    max-width: 760px;
    padding: 56px 20px 80px;
  }

  &__header {
    margin-bottom: 24px;
  }

  &__title {
    margin: 0;
    color: var(--color-text);
    font-size: var(--font-lg);
    font-weight: 700;
  }

  &__body {
    color: var(--color-text);
    font-size: var(--font-body);
    line-height: 1.7;
  }

  &__loading {
    display: flex;
    justify-content: center;
    padding: 40px 0;
  }

  &__error {
    padding: 24px 0;
    color: var(--color-text-secondary);
  }

  &__prose {
    :deep(h1),
    :deep(h2),
    :deep(h3) {
      margin: 1.4em 0 0.4em;
      color: var(--color-text);
      font-weight: 700;
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
      margin: 0 0 0.8em;
      padding-left: 1.4em;
    }

    :deep(li) {
      margin-bottom: 0.3em;
    }

    :deep(strong) {
      color: var(--color-text);
      font-weight: 600;
    }

    :deep(a) {
      color: var(--color-mint-dark);
      text-decoration: underline;
    }

    :deep(hr) {
      margin: 1.5em 0;
      border: none;
      border-top: 1px solid var(--color-border);
    }
  }
}
</style>
