<template>
  <div class="dish-search">
    <div class="search-field">
      <input
        ref="inputEl"
        v-model="query"
        type="search"
        class="dish-search__input"
        placeholder="Поиск рецепта..."
        @input="onInput"
      />
      <button
        v-if="query"
        type="button"
        class="search-field__clear"
        aria-label="Очистить"
        @click="clearQuery"
      >
        &times;
      </button>
    </div>

    <div v-if="loading" class="dish-search__status"><div class="spinner spinner--sm" /></div>

    <ul v-if="results.length" class="dish-search__list">
      <li
        v-for="dish in results"
        :key="dish.id"
        class="dish-search__item"
        @click="$emit('select', dish)"
      >
        <div class="dish-search__info">
          <span class="dish-search__name">{{ dish.name }}</span>
          <span class="dish-search__category">{{ dish.category?.name }}</span>
        </div>
        <OwnershipBadge :is-own="isDishOwn(dish)" short />
      </li>
    </ul>

    <div v-else-if="searched && !loading" class="dish-search__status">Ничего не найдено</div>

    <div class="dish-search__actions">
      <button type="button" class="dish-search__pick" @click="showPicker = true">
        Выбрать из рецептов
      </button>
      <button type="button" class="dish-search__create" @click="$emit('create', query.trim())">
        + Создать новое блюдо
      </button>
      <button v-if="canCreateAi" type="button" class="dish-search__ai" @click="$emit('create-ai')">
        Создать с ИИ
      </button>
    </div>

    <DishPickerSheet v-model="showPicker" @select="onPickerSelect" />
  </div>
</template>

<script setup>
import { ref } from "vue"
import { fetchDishes } from "../../services/dishService"
import { isDishOwn } from "../../utils/dishOwnership"
import OwnershipBadge from "../OwnershipBadge.vue"
import DishPickerSheet from "../DishPickerSheet.vue"

defineProps({
  canCreateAi: { type: Boolean, default: false },
})

const emit = defineEmits(["select", "create", "create-ai"])

const showPicker = ref(false)

function onPickerSelect(dish) {
  emit("select", dish)
}

const query = ref("")
const results = ref([])
const loading = ref(false)
const searched = ref(false)
const inputEl = ref(null)

let debounceTimer = null

function onInput() {
  clearTimeout(debounceTimer)
  const q = query.value.trim()

  if (!q) {
    results.value = []
    searched.value = false
    return
  }

  debounceTimer = setTimeout(async () => {
    loading.value = true
    try {
      const data = await fetchDishes({ search: q })
      results.value = data.results ?? []
    } catch {
      results.value = []
    } finally {
      loading.value = false
      searched.value = true
    }
  }, 300)
}

function clearQuery() {
  query.value = ""
  results.value = []
  searched.value = false
  inputEl.value?.focus()
}
</script>

<style scoped>
.dish-search {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dish-search__input {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-md);
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.dish-search__input:focus {
  border-color: var(--color-mint-alpha-25);
  box-shadow: 0 0 0 3px var(--color-mint-alpha-10);
}

.dish-search__list {
  list-style: none;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.dish-search__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.dish-search__item:hover {
  background: var(--color-empty);
}

.dish-search__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.dish-search__item + .dish-search__item {
  border-top: 1px solid var(--color-border);
}

.dish-search__name {
  font-size: var(--font-sm);
  font-weight: 500;
}

.dish-search__category {
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
}

.dish-search__status {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  padding: 8px 0;
}

.dish-search__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.dish-search__pick {
  flex: 1;
  padding: 9px 16px;
  border: 1.5px solid var(--color-mint-alpha-25);
  border-radius: var(--radius-sm);
  background: var(--color-mint-alpha-10);
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--color-mint);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast);
  white-space: nowrap;
}

.dish-search__pick:hover {
  background: var(--color-mint-alpha-25);
  border-color: var(--color-mint);
}

.dish-search__create,
.dish-search__ai {
  flex: 1;
  padding: 9px 16px;
  border: 1.5px dashed var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: var(--font-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast);
  white-space: nowrap;
}

.dish-search__create:hover {
  background: var(--color-empty);
  border-color: var(--color-mint);
  color: var(--color-mint);
}

.dish-search__ai {
  border-style: solid;
  border-color: var(--color-mint-alpha-25);
  background: var(--color-mint-alpha-10);
  color: var(--color-mint);
  font-weight: 600;
}

.dish-search__ai:hover {
  background: var(--color-mint-alpha-25);
  border-color: var(--color-mint);
}
</style>
