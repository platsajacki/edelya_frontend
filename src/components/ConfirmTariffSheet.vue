<template>
  <ModalWrapper :model-value="modelValue" :title="scenario.title" @update:model-value="onClose">
    <div class="tariff-confirm">
      <p class="tariff-confirm__description">{{ scenario.description }}</p>

      <div
        v-if="scenario.type === 'upgrade' && scenario.proration > 0"
        class="tariff-confirm__proration"
      >
        <IconWarning class="tariff-confirm__proration-icon" />
        <span
          >Будет списано <strong>{{ scenario.proration }} ₽</strong></span
        >
      </div>
    </div>

    <template #footer>
      <p class="tariff-confirm__recurring-notice">
        Подписка продлевается автоматически каждый месяц. Автопродление можно отключить в любой
        момент.
      </p>
      <div class="tariff-confirm__actions">
        <button
          type="button"
          class="tariff-confirm__btn tariff-confirm__btn--cancel"
          :disabled="loading"
          @click="onClose"
        >
          Отмена
        </button>
        <button
          type="button"
          class="tariff-confirm__btn tariff-confirm__btn--confirm"
          :disabled="loading"
          @click="$emit('confirm')"
        >
          <span v-if="loading" class="spinner spinner--sm" />
          <span v-else>{{ scenario.confirmLabel }}</span>
        </button>
      </div>
    </template>
  </ModalWrapper>
</template>

<script lang="ts" setup>
import ModalWrapper from "./forms/ModalWrapper.vue"
import IconWarning from "./icons/IconWarning.vue"
import type { TariffScenario } from "@/utils/tariffScenario"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    scenario: TariffScenario
    loading?: boolean
  }>(),
  { loading: false }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "confirm"): void
}>()

function onClose() {
  if (!props.loading) {
    emit("update:modelValue", false)
  }
}
</script>

<style lang="scss" scoped>
.tariff-confirm {
  &__description {
    margin: 0;
    font-size: var(--font-body);
    color: var(--color-text);
    line-height: 1.6;
  }

  &__proration {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    padding: 10px 12px;
    background: var(--color-warning-bg);
    border: 1px solid var(--color-warning-border);
    border-radius: var(--radius-sm);
    font-size: var(--font-sm);
    color: var(--color-warning);

    &-icon {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      color: var(--color-warning-icon);
    }
  }

  &__recurring-notice {
    margin: 0 0 12px;
    font-size: var(--font-xs, 12px);
    color: var(--color-text-secondary);
    line-height: 1.5;
  }

  &__actions {
    display: flex;
    gap: 8px;
  }

  &__btn {
    flex: 1;
    padding: var(--btn-padding-md);
    border: none;
    border-radius: var(--radius-sm);
    font-size: var(--font-sm);
    font-weight: 600;
    cursor: pointer;
    transition: opacity var(--transition-fast);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &--cancel {
      background: var(--color-empty);
      color: var(--color-text-secondary);

      &:hover:not(:disabled) {
        opacity: 0.75;
      }
    }

    &--confirm {
      background: var(--color-mint);
      color: var(--on-primary);

      &:hover:not(:disabled) {
        background: var(--color-mint-hover);
      }
    }
  }
}
</style>
