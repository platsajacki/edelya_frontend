<template>
  <Teleport to="body">
    <Transition name="filter-panel">
      <div v-if="modelValue" class="filter-overlay" @mousedown.self="close">
        <div class="filter-panel">
          <div class="filter-panel__header">
            <h3 class="filter-panel__title">Фильтры</h3>
            <button class="filter-panel__close" @click="close" aria-label="Закрыть">&times;</button>
          </div>

          <div class="filter-panel__body">
            <!-- Categories -->
            <div class="filter-section">
              <span class="filter-section__label">Категория</span>
              <div class="filter-section__options">
                <label
                  class="filter-radio"
                  :class="{ 'filter-radio--active': categoryId === null }"
                >
                  <input
                    v-model="categoryId"
                    type="radio"
                    name="category"
                    :value="null"
                    class="filter-radio__input"
                  />
                  <span class="filter-radio__label">Все категории</span>
                </label>
                <label
                  v-for="cat in categories"
                  :key="cat.id"
                  class="filter-radio"
                  :class="{ 'filter-radio--active': categoryId === cat.id }"
                >
                  <input
                    v-model="categoryId"
                    type="radio"
                    name="category"
                    :value="cat.id"
                    class="filter-radio__input"
                  />
                  <span class="filter-radio__label">{{ cat.name }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="filter-panel__footer">
            <button class="filter-panel__clear" :disabled="!hasChanges" @click="clearAll">
              Очистить
            </button>
            <button class="filter-panel__apply" @click="apply">
              Применить
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from "vue"

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  categories: { type: Array, default: () => [] },
  currentCategoryId: { type: String, default: null },
})

const emit = defineEmits(["update:modelValue", "apply"])

const categoryId = ref(props.currentCategoryId)

watch(() => props.modelValue, (v) => {
  if (v) {
    categoryId.value = props.currentCategoryId
  }
})

const hasChanges = computed(() => categoryId.value !== null)

function clearAll() {
  categoryId.value = null
}

function apply() {
  emit("apply", { categoryId: categoryId.value })
  close()
}

function close() {
  emit("update:modelValue", false)
}
</script>

<style scoped>
.filter-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-bg);
  z-index: var(--z-filter);
  display: flex;
  justify-content: flex-end;
}

.filter-panel {
  width: 300px;
  max-width: 85vw;
  height: 100%;
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.10);
}

.filter-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.filter-panel__title {
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.filter-panel__close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  font-size: 22px;
  color: var(--color-text-secondary);
  border-radius: var(--radius-xs);
  transition: background 0.15s;
}

.filter-panel__close:hover {
  background: var(--color-empty);
}

.filter-panel__body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filter-section__label {
  display: block;
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.filter-section__options {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-radio {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-xs);
  transition: background 0.12s;
}

.filter-radio:hover {
  background: var(--color-empty);
}

.filter-radio--active {
  background: var(--color-mint-alpha-08);
}

.filter-radio__input {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-border);
  border-radius: 50%;
  flex-shrink: 0;
  position: relative;
  transition: border-color 0.15s;
}

.filter-radio__input:checked {
  border-color: var(--color-mint);
}

.filter-radio__input:checked::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-mint);
}

.filter-radio__label {
  font-size: var(--font-md);
  color: var(--color-text);
  font-weight: 500;
}

.filter-panel__footer {
  display: flex;
  gap: 8px;
  padding: 12px 20px calc(12px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.filter-panel__clear {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-empty);
  color: var(--color-text-secondary);
  font-size: var(--font-md);
  font-weight: 600;
  transition: background 0.15s;
}

.filter-panel__clear:hover:not(:disabled) {
  background: var(--color-border);
}

.filter-panel__clear:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.filter-panel__apply {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-mint);
  color: var(--on-primary);
  font-size: var(--font-md);
  font-weight: 600;
  transition: background 0.15s;
}

.filter-panel__apply:hover {
  background: var(--color-mint-hover);
}

/* Slide-in transition */
.filter-panel-enter-active,
.filter-panel-leave-active {
  transition: opacity 0.25s ease;
}

.filter-panel-enter-active .filter-panel,
.filter-panel-leave-active .filter-panel {
  transition: transform 0.25s ease;
}

.filter-panel-enter-from,
.filter-panel-leave-to {
  opacity: 0;
}

.filter-panel-enter-from .filter-panel {
  transform: translateX(100%);
}

.filter-panel-leave-to .filter-panel {
  transform: translateX(100%);
}
</style>
