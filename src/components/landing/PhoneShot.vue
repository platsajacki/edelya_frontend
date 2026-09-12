<template>
  <div class="phone-shot" :class="{ 'phone-shot--small': small }">
    <div class="phone-shot__frame">
      <div
        class="phone-shot__screen"
        :class="{ 'phone-shot__screen--empty': !screen.src }"
        role="img"
        :aria-label="screen.caption"
      >
        <video
          v-if="screen.video"
          ref="videoEl"
          :src="screen.video"
          :poster="screen.src"
          muted
          loop
          playsinline
          preload="none"
          disablepictureinpicture
          disableremoteplayback
          class="phone-shot__media"
        />
        <img
          v-else-if="screen.src"
          :src="screen.src"
          :alt="screen.caption"
          loading="lazy"
          class="phone-shot__media"
        />
        <span v-else class="phone-shot__file">{{ screen.file }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue"
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

const videoEl = ref<HTMLVideoElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  const video = videoEl.value
  if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {})
      else video.pause()
    },
    { threshold: 0.3 }
  )
  observer.observe(video)
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style lang="scss" scoped>
.phone-shot {
  --bezel: 3cqw;
  --screen-radius: 14.5cqw;
  --rim: 1.5cqw;

  container-type: inline-size;
  width: 100%;
  max-width: 280px;
  margin-inline: auto;

  &--small {
    max-width: 220px;
  }

  &__frame {
    padding: var(--bezel);
    border: 1px solid var(--color-border);
    border-radius: calc(var(--screen-radius) + var(--bezel) + 1px);
    background: var(--color-surface);
    box-shadow: 0 14px 32px rgba(37, 37, 32, 0.1);
  }

  &__screen {
    position: relative;
    display: flex;
    aspect-ratio: 590 / 1280;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: var(--screen-radius);

    &::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      box-shadow: inset 0 0 0 var(--rim) var(--color-surface-muted);
      pointer-events: none;
    }

    &--empty {
      background: #000;

      &::after {
        content: none;
      }
    }
  }

  &__media {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: inherit;
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
