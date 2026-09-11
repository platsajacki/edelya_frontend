<template>
  <LegalDocumentPage
    title="Политика обработки персональных данных сервиса «Еделя»"
    :load-document="fetchPrivacyLatest"
  />
</template>

<script lang="ts" setup>
import LegalDocumentPage from "@/components/legal/LegalDocumentPage.vue"
import { fetchPrivacyLatest } from "../services/legalService"
</script>
