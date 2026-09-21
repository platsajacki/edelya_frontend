<template>
  <DevState label="AIDishDraftForm" row>
    <DevButton v-for="state in states" :key="state.label" @click="open(state)">
      {{ state.label }}
    </DevButton>
  </DevState>
  <AIDishDraftForm
    :model-value="current !== null"
    :draft-to-open="current?.draft ?? null"
    @update:model-value="close"
  />
</template>

<script lang="ts" setup>
import { ref } from "vue"
import DevState from "../DevState.vue"
import DevButton from "../DevButton.vue"
import { aiDrafts, aiUsage } from "../fixtures"
import AIDishDraftForm from "@/components/forms/AIDishDraftForm.vue"
import { useSubscriptionStore } from "@/store/subscription"
import type { DTOAIDraft } from "@/types/dish"
import type { DTOAIRecipeUsage } from "@/types/subscription"

interface DraftState {
  label: string
  draft: DTOAIDraft | null
  usage: DTOAIRecipeUsage
}

const states: DraftState[] = [
  { label: "ввод", draft: null, usage: aiUsage.partial },
  { label: "лимит исчерпан", draft: null, usage: aiUsage.exhausted },
  { label: "processing", draft: aiDrafts.processing, usage: aiUsage.partial },
  { label: "parsed", draft: aiDrafts.parsed, usage: aiUsage.partial },
  { label: "failed: валидация", draft: aiDrafts.failedValidation, usage: aiUsage.partial },
  { label: "failed: prompt injection", draft: aiDrafts.failedInjection, usage: aiUsage.partial },
  { label: "failed: not processable", draft: aiDrafts.failedUnprocessable, usage: aiUsage.partial },
  { label: "dish_created", draft: aiDrafts.dishCreated, usage: aiUsage.partial },
]
const subscription = useSubscriptionStore()
const current = ref<DraftState | null>(null)

function open(state: DraftState) {
  subscription.aiRecipeUsage = state.usage
  current.value = state
}

function close(value: boolean) {
  if (!value) current.value = null
}
</script>
