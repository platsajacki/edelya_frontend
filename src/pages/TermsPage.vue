<template>
  <LegalDocumentPage
    title="Условия использования сервиса «Еделя»"
    :load-document="fetchTermsLatest"
  />
</template>

<script lang="ts" setup>
import LegalDocumentPage from "@/components/legal/LegalDocumentPage.vue"
import { fetchTermsLatest } from "../services/legalService"
</script>
