<template>
  <div class="day-badge" :class="{ 'day-badge--active': active }">
    <span class="day-badge__day">{{ day }}</span>
    <span class="day-badge__date">{{ date }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    day: string
    date: string
    active?: boolean
  }>(),
  {
    active: false,
  }
)
</script>

<style scoped lang="scss">
.day-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  background: var(--color-mint-alpha-10);
  line-height: 1.1;
  transition: background var(--transition-normal);

  &--active {
    background: var(--color-mint);
  }

  &__day {
    font-weight: 700;
    font-size: var(--font-xs);
    color: var(--color-mint);
    text-transform: uppercase;
    letter-spacing: 0.06em;

    .day-badge--active & {
      color: var(--on-primary);
    }
  }

  &__date {
    font-weight: 700;
    font-size: var(--font-md);
    color: var(--color-mint);

    .day-badge--active & {
      color: var(--on-primary);
    }
  }
}
</style>
