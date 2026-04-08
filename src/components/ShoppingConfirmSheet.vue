<template>
  <ModalWrapper
    :model-value="modelValue"
    title="Список покупок"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div v-if="noItems" class="confirm__empty">
      <IconWarning class="confirm__empty-icon" />
      <p class="confirm__message">Сначала добавь блюда в готовку на эти дни — список покупок строится на их основе.</p>
    </div>
    <p v-else class="confirm__message">{{ message }}</p>
    <template #footer>
      <div class="confirm__actions">
        <button
          v-if="noItems"
          type="button"
          class="confirm__btn confirm__btn--create"
          @click="$emit('update:modelValue', false)"
        >
          Понятно
        </button>
        <template v-else>
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
        </template>
      </div>
    </template>
  </ModalWrapper>
</template>

<script setup>
import ModalWrapper from "./forms/ModalWrapper.vue"
import IconWarning from "./icons/IconWarning.vue"

defineProps({
  modelValue: { type: Boolean, required: true },
  message:    { type: String,  default: '' },
  loading:    { type: Boolean, default: false },
  noItems:    { type: Boolean, default: false },
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

.confirm__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  padding: 8px 0;
}

.confirm__empty-icon {
  color: var(--color-text-secondary);
  opacity: 0.5;
  width: 32px;
  height: 32px;
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
