<template>
  <ModalWrapper
    :model-value="modelValue"
    title="Список покупок"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <p class="confirm__message">{{ message }}</p>
    <template #footer>
      <div class="confirm__actions">
        <button
          type="button"
          class="confirm__btn confirm__btn--cancel"
          :disabled="loading"
          @click="$emit('update:modelValue', false)"
        >
          Отмена
        </button>
        <button
          type="button"
          class="confirm__btn confirm__btn--create"
          :disabled="loading"
          @click="$emit('confirm')"
        >
          <span v-if="loading" class="spinner spinner--sm" />
          <span v-else>Создать</span>
        </button>
      </div>
    </template>
  </ModalWrapper>
</template>

<script setup>
import ModalWrapper from "./forms/ModalWrapper.vue"

defineProps({
  modelValue: { type: Boolean, required: true },
  message:    { type: String,  default: '' },
  loading:    { type: Boolean, default: false },
})

defineEmits(['update:modelValue', 'confirm'])
</script>

<style scoped>
.confirm__message {
  margin: 0;
  font-size: var(--font-body);
  color: var(--color-text);
  line-height: 1.5;
}

.confirm__actions {
  display: flex;
  gap: 8px;
}

.confirm__btn {
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
}

.confirm__btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.confirm__btn--cancel {
  background: var(--color-empty);
  color: var(--color-text-secondary);
}

.confirm__btn--create {
  background: var(--color-mint);
  color: var(--on-primary);
}
</style>
