<template>
  <div class="dish-search">
    <input
      ref="inputEl"
      v-model="query"
      type="text"
      class="dish-search__input"
      placeholder="Поиск блюда..."
      @input="onInput"
    />

    <div v-if="loading" class="dish-search__status">Загрузка...</div>

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
        <span
          class="dish-search__badge"
          :class="isDishOwn(dish) ? 'dish-search__badge--own' : 'dish-search__badge--shared'"
        >
          {{ isDishOwn(dish) ? '👤 Личное' : '🌐 Общее' }}
        </span>
      </li>
    </ul>

    <div v-else-if="searched && !loading" class="dish-search__status">Ничего не найдено</div>

    <button class="dish-search__create" @click="$emit('create')">
      + Создать новое блюдо
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { fetchDishes } from "../../services/dishService"
import { isDishOwn } from "../../utils/dishOwnership"

defineEmits(["select", "create"])

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
      const data = await fetchDishes({ name__icontains: q })
      results.value = data.results ?? []
    } catch {
      results.value = []
    } finally {
      loading.value = false
      searched.value = true
    }
  }, 300)
}

onMounted(() => {
  inputEl.value?.focus()
})
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
  font-size: 15px;
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
  transition: border-color 0.15s;
}

.dish-search__input:focus {
  border-color: var(--color-mint);
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
  transition: background 0.1s;
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

.dish-search__badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
  flex-shrink: 0;
}

.dish-search__badge--own {
  background: rgba(138, 99, 181, 0.12);
  color: var(--color-mint);
}

.dish-search__badge--shared {
  background: var(--color-shared-bg);
  color: var(--color-shared);
}

.dish-search__item + .dish-search__item {
  border-top: 1px solid var(--color-border);
}

.dish-search__name {
  font-size: 13px;
  font-weight: 500;
}

.dish-search__category {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.dish-search__status {
  font-size: 13px;
  color: var(--color-text-secondary);
  padding: 8px 0;
}

.dish-search__create {
  align-self: flex-start;
  padding: 8px 16px;
  border: 1.5px dashed var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-mint-hover);
  transition: background 0.15s, border-color 0.15s;
}

.dish-search__create:hover {
  background: var(--color-empty);
  border-color: var(--color-mint);
}
</style>
