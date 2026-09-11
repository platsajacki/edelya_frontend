<template>
  <div class="phone-shot" :class="{ 'phone-shot--small': small }">
    <div class="phone-shot__screen" role="img" :aria-label="screen.caption">
      <img
        v-if="screen.src"
        :src="screen.src"
        :alt="screen.caption"
        loading="lazy"
        class="phone-shot__image"
      />
      <span v-else class="phone-shot__file">{{ screen.file }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { LandingScreen } from "./screens"

withDefaults(
  defineProps<{
    screen: LandingScreen
    small?: boolean
  }>(),
  {
    small: false,
  }
)
</script>

<style lang="scss" scoped>
.phone-shot {
  width: 100%;
  max-width: 280px;
  margin-inline: auto;
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: 36px;
  background: var(--color-surface);
  box-shadow: 0 14px 32px rgba(37, 37, 32, 0.1);

  &--small {
    max-width: 220px;
  }

  &__screen {
    display: flex;
    aspect-ratio: 9 / 19;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 16px;
    border-radius: 28px;
    background: #000;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__file {
    color: rgba(255, 255, 255, 0.45);
    font-size: var(--font-xs);
    text-align: center;
    word-break: break-word;
  }
}
</style>
