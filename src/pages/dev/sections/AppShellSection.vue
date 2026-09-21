<template>
  <DevState label="BottomNav">
    <BottomNav />
  </DevState>
  <DevState label="ConsentScreen">
    <ConsentScreen />
  </DevState>
  <DevState v-for="state in legalStates" :key="state.label" :label="state.label">
    <LegalDocumentPage title="Условия использования" :load-document="state.load" />
  </DevState>
</template>

<script lang="ts" setup>
import DevState from "../DevState.vue"
import { legalMarkdown } from "../fixtures"
import BottomNav from "@/components/BottomNav.vue"
import ConsentScreen from "@/components/ConsentScreen.vue"
import LegalDocumentPage from "@/components/legal/LegalDocumentPage.vue"

const legalStates = [
  { label: "LegalDocumentPage: загружен", load: () => Promise.resolve({ content: legalMarkdown }) },
  { label: "LegalDocumentPage: загрузка", load: () => new Promise<never>(() => {}) },
  { label: "LegalDocumentPage: ошибка", load: () => Promise.reject(new Error("dev")) },
]
</script>
