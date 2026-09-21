<template>
  <DevState label="ModalWrapper: с футером / без футера" row>
    <DevButton @click="opened = 'modal-footer'">С футером</DevButton>
    <DevButton @click="opened = 'modal-plain'">Без футера</DevButton>
  </DevState>
  <DevState label="ConfirmTariffSheet" row>
    <DevButton v-for="state in tariffStates" :key="state.key" @click="opened = state.key">
      {{ state.label }}
    </DevButton>
  </DevState>
  <DevState label="ShoppingConfirmSheet" row>
    <DevButton v-for="state in shoppingStates" :key="state.key" @click="opened = state.key">
      {{ state.label }}
    </DevButton>
  </DevState>
  <ModalWrapper
    :model-value="opened === 'modal-footer'"
    title="Заголовок модалки"
    @update:model-value="closeOn"
  >
    <p>{{ modalText }}</p>
    <template #footer>
      <DevButton @click="opened = null">Готово</DevButton>
    </template>
  </ModalWrapper>
  <ModalWrapper
    :model-value="opened === 'modal-plain'"
    title="Без футера"
    @update:model-value="closeOn"
  >
    <p>{{ modalText }}</p>
  </ModalWrapper>
  <ConfirmTariffSheet
    v-for="state in tariffStates"
    :key="state.key"
    :model-value="opened === state.key"
    :scenario="state.scenario"
    :loading="state.loading"
    @update:model-value="closeOn"
  />
  <ShoppingConfirmSheet
    v-for="state in shoppingStates"
    :key="state.key"
    :model-value="opened === state.key"
    :date-from="state.from"
    :date-to="state.to"
    :no-items="state.noItems"
    :loading="state.loading"
    @update:model-value="closeOn"
  />
</template>

<script lang="ts" setup>
import { ref } from "vue"
import DevState from "../DevState.vue"
import DevButton from "../DevButton.vue"
import { fixtures } from "../fixtures"
import ModalWrapper from "@/components/forms/ModalWrapper.vue"
import ConfirmTariffSheet from "@/components/ConfirmTariffSheet.vue"
import ShoppingConfirmSheet from "@/components/ShoppingConfirmSheet.vue"
import type { TariffScenario } from "@/utils/tariffScenario"

const modalText = "Содержимое модалки: текст, поля формы или список."
const upgrade: TariffScenario = {
  type: "upgrade",
  title: "Переход на «Семейный»",
  description: "Тариф активируется сразу. Разница за оставшиеся дни периода спишется с карты.",
  confirmLabel: "Перейти и оплатить",
  proration: 149,
}
const downgrade: TariffScenario = {
  type: "downgrade",
  title: "Переход на «Базовый»",
  description: "Тариф сменится 21 октября 2026 г., после окончания текущего периода.",
  confirmLabel: "Запланировать",
  proration: null,
}
const tariffStates = [
  { key: "tariff-upgrade", label: "upgrade", scenario: upgrade, loading: false },
  { key: "tariff-downgrade", label: "downgrade", scenario: downgrade, loading: false },
  { key: "tariff-loading", label: "loading", scenario: upgrade, loading: true },
]
const week = { from: fixtures.isoDate(), to: fixtures.isoDate(6), noItems: false, loading: false }
const shoppingStates = [
  { key: "shopping-week", label: "неделя", ...week },
  { key: "shopping-day", label: "один день", ...week, to: week.from },
  { key: "shopping-empty", label: "нет готовок", ...week, noItems: true },
  { key: "shopping-loading", label: "loading", ...week, loading: true },
]
const opened = ref<string | null>(null)

function closeOn(value: boolean) {
  if (!value) opened.value = null
}
</script>
