<template>
  <ModalWrapper
    :model-value="modelValue"
    title="Список покупок"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="confirm__dates">
      <div class="confirm__date-field">
        <label class="confirm__label">С</label>
        <DateInput :model-value="dateFrom" @update:model-value="$emit('update:dateFrom', $event)" />
      </div>
      <div class="confirm__date-field">
        <label class="confirm__label">По</label>
        <DateInput :model-value="dateTo" @update:model-value="$emit('update:dateTo', $event)" />
      </div>
    </div>

    <div v-if="noItems" class="confirm__empty">
      <IconWarning class="confirm__empty-icon" />
      <p class="confirm__message">
        Сначала добавь рецепт в готовку на эти дни — список покупок строится на их основе.
      </p>
    </div>
    <div v-else class="confirm__name">
      <label class="confirm__name-label" for="shopping-name">Название</label>
      <input
        id="shopping-name"
        v-model="editableName"
        type="text"
        class="confirm__name-input"
        placeholder="Название списка"
      />
    </div>

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
            :disabled="loading || !dateFrom || !dateTo || !editableName.trim()"
            @click="$emit('confirm', editableName.trim())"
          >
            <span v-if="loading" class="spinner spinner--sm" />
            <span v-else>Создать</span>
          </button>
        </template>
      </div>
    </template>
  </ModalWrapper>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue"
import ModalWrapper from "./forms/ModalWrapper.vue"
import DateInput from "./forms/DateInput.vue"
import IconWarning from "./icons/IconWarning.vue"
import { formatDateRuShort } from "../utils/formatDate"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    dateFrom?: string
    dateTo?: string
    loading?: boolean
    noItems?: boolean
  }>(),
  {
    dateFrom: "",
    dateTo: "",
    loading: false,
    noItems: false,
  }
)

defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "update:dateFrom", value: string): void
  (e: "update:dateTo", value: string): void
  (e: "confirm", name: string): void
}>()

const listName = computed(() => {
  const from = props.dateFrom
  const to = props.dateTo
  if (!from) return ""
  if (!to || from === to) return `Продукты на ${formatDateRuShort(from)}`
  return `Продукты на неделю ${formatDateRuShort(from)}–${formatDateRuShort(to)}`
})

const editableName = ref(listName.value)
watch(listName, (val) => {
  editableName.value = val
})
</script>

<style scoped>
.confirm__dates {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.confirm__date-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.confirm__label {
  font-size: var(--font-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.confirm__name {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.confirm__name-label {
  font-size: var(--font-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.confirm__name-input {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-md);
  font-family: inherit;
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
  box-sizing: border-box;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.confirm__name-input:focus {
  border-color: var(--color-mint-alpha-25);
  box-shadow: 0 0 0 3px var(--color-mint-alpha-10);
}

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
