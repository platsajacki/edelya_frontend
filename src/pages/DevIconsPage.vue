<template>
  <div class="page-layout dev-icons">
    <input v-model="search" placeholder="Поиск иконки..." class="dev-icons__search" />
    <div class="dev-icons__grid">
      <button
        v-for="icon in filtered"
        :key="icon.name"
        class="dev-icons__icon"
        :title="`Кликни, чтобы скопировать <${icon.name} />`"
        @click="copyTag(icon.name)"
      >
        <component :is="icon.component" :width="50" :height="50" />
        <span class="dev-icons__icon-name">{{ icon.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"

const modules = import.meta.glob("@/components/icons/*.vue", { eager: true })

const icons = computed(() =>
  Object.entries(modules).map(([path, mod]: [string, any]) => ({
    name: path.split("/").pop()!.replace(".vue", ""),
    component: mod.default,
  }))
)

const search = ref("")
const filtered = computed(() =>
  icons.value.filter((i) => i.name.toLowerCase().includes(search.value.toLowerCase()))
)

function copyTag(name: string) {
  navigator.clipboard.writeText(`<${name} />`)
}
</script>

<style lang="scss" scoped>
.dev-icons {
  padding: 12px 0;

  &__search {
    width: 100%;
    margin-bottom: 16px;
    padding: 10px 12px;
    border: 1.5px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: var(--font-md);
    font-family: inherit;
    background: var(--color-surface);
    color: var(--color-text);
    outline: none;
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);

    &:focus {
      border-color: var(--color-mint-alpha-25);
      box-shadow: 0 0 0 3px var(--color-mint-alpha-10);
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
  }

  &__icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    color: var(--color-text);
    transition: background var(--transition-fast);

    &:hover {
      background: var(--color-empty);
    }
  }

  &__icon-name {
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
    word-break: break-all;
    text-align: center;
  }
}
</style>
