<template>
  <nav class="week-nav">
    <button class="week-nav__btn" :disabled="disabled" @click="$emit('prev')">
      <IconChevronLeft />
    </button>
    <Transition name="pop">
      <button
        v-if="!isCurrentWeek"
        type="button"
        class="week-nav__btn week-nav__btn--today"
        aria-label="Перейти к текущей неделе"
        title="Сегодня"
        @click="$emit('today')"
      >
        <IconCalendar :width="20" :height="20" />
      </button>
    </Transition>
    <div class="week-nav__center">
      <span class="week-nav__spacer" aria-hidden="true"></span>
      <span class="week-nav__label">{{ label }}</span>
      <button
        type="button"
        class="week-nav__shopping-btn"
        title="Список покупок на неделю"
        @click="$emit('create-shopping-week')"
      >
        <IconBasket :width="20" :height="20" />
      </button>
    </div>
    <button class="week-nav__btn" :disabled="disabled" @click="$emit('next')">
      <IconChevronRight />
    </button>
  </nav>
</template>

<script lang="ts" setup>
import IconChevronLeft from "./icons/IconChevronLeft.vue"
import IconChevronRight from "./icons/IconChevronRight.vue"
import IconBasket from "./icons/IconBasket.vue"
import IconCalendar from "./icons/IconCalendar.vue"

withDefaults(
  defineProps<{
    label: string
    disabled?: boolean
    isCurrentWeek?: boolean
  }>(),
  {
    disabled: false,
    isCurrentWeek: true,
  }
)

defineEmits<{
  (e: "prev"): void
  (e: "next"): void
  (e: "today"): void
  (e: "create-shopping-week"): void
}>()
</script>

<style lang="scss" scoped>
.week-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 52px;
  position: sticky;
  top: var(--page-padding-top);
  z-index: 2;

  @media (min-width: 600px) {
    top: var(--page-padding-top-lg);
  }

  &__btn {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    box-shadow: var(--shadow-card);
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      background var(--transition-fast),
      border-color var(--transition-fast),
      transform var(--transition-fast);

    &:active {
      background: var(--color-empty);
      transform: scale(var(--press-scale-md));
    }
    &:disabled {
      opacity: 0.5;
      cursor: default;
      pointer-events: none;
    }
  }

  &__btn--today {
    color: var(--color-text-secondary);

    &:active {
      background: var(--color-mint-alpha-10);
    }
  }

  &__center {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-width: 0;
    height: 44px;
    padding: 0 16px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-card);
  }

  &__label {
    flex: 1;
    min-width: 0;
    font-size: clamp(var(--font-sm), 4.5vw, var(--font-lg));
    font-weight: 700;
    letter-spacing: -0.01em;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__spacer {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  &__shopping-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    background: none;
    border-radius: var(--radius-xs);
    color: var(--color-text-secondary);
    cursor: pointer;
    flex-shrink: 0;
    transition:
      color var(--transition-fast),
      background var(--transition-fast);
    -webkit-tap-highlight-color: transparent;

    &:hover {
      color: var(--color-mint);
      background: color-mix(in srgb, var(--color-mint) 10%, transparent);
    }

    &:active {
      background: var(--color-empty);
    }
  }
}
</style>
