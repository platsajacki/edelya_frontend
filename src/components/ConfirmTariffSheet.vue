<template>
  <ModalWrapper
    :model-value="modelValue"
    :title="scenario.title"
    @update:model-value="onClose"
  >
    <div class="tariff-confirm">
      <p class="tariff-confirm__description">{{ scenario.description }}</p>

      <div v-if="scenario.type === 'upgrade' && scenario.proration > 0" class="tariff-confirm__proration">
        <IconWarning class="tariff-confirm__proration-icon" />
        <span>Будет списано <strong>{{ scenario.proration }} ₽</strong></span>
      </div>
    </div>

    <template #footer>
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

<script setup>
import ModalWrapper from "./forms/ModalWrapper.vue"
import IconWarning from "./icons/IconWarning.vue"

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  scenario:   { type: Object,  required: true },
  loading:    { type: Boolean, default: false },
})

const emit = defineEmits(["update:modelValue", "confirm"])

function onClose() {
  if (!props.loading) {
    emit("update:modelValue", false)
  }
}
</script>

<style scoped>
.tariff-confirm__description {
  margin: 0;
  font-size: var(--font-body);
  color: var(--color-text);
  line-height: 1.6;
  white-space: pre-line;
}

.tariff-confirm__proration {
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
}

.tariff-confirm__proration-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  color: var(--color-warning-icon);
}

.tariff-confirm__actions {
  display: flex;
  gap: 8px;
}

.tariff-confirm__btn {
  flex: 1;
  padding: 12px 16px;
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
}

.tariff-confirm__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tariff-confirm__btn--cancel {
  background: var(--color-empty);
  color: var(--color-text-secondary);
}

.tariff-confirm__btn--cancel:hover:not(:disabled) {
  opacity: 0.75;
}

.tariff-confirm__btn--confirm {
  background: var(--color-mint);
  color: var(--on-primary);
}

.tariff-confirm__btn--confirm:hover:not(:disabled) {
  background: var(--color-mint-hover);
}
</style>
