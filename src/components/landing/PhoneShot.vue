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
          @play="isPlaying = true"
          @pause="isPlaying = false"
        />
        <img
          v-else-if="screen.src"
          :src="screen.src"
          :alt="screen.caption"
          :loading="priority ? 'eager' : 'lazy'"
          :fetchpriority="priority ? 'high' : undefined"
          class="phone-shot__media"
        />
        <span v-else class="phone-shot__file">{{ screen.file }}</span>
      </div>
      <button
        v-if="screen.video"
        type="button"
        class="phone-shot__toggle"
        :aria-label="isPlaying ? 'Поставить видео на паузу' : 'Воспроизвести видео'"
        @click="togglePlayback"
      >
        <IconPause v-if="isPlaying" :width="16" :height="16" />
        <IconPlay v-else :width="16" :height="16" />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue"
import IconPause from "@/components/icons/IconPause.vue"
import IconPlay from "@/components/icons/IconPlay.vue"
import { prefersReducedMotion } from "@/dom/prefersReducedMotion"
import { analytics } from "@/services/analytics"
import { AnalyticsEvent } from "@/constants/analyticsEvents"
import type { LandingScreen } from "./screens"

const props = withDefaults(
  defineProps<{
    screen: LandingScreen
    small?: boolean
    priority?: boolean
  }>(),
  {
    small: false,
    priority: false,
  }
)

const videoEl = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
let pausedByUser = false
let observer: IntersectionObserver | null = null

function togglePlayback() {
  const video = videoEl.value
  if (!video) return

  if (video.paused) {
    pausedByUser = false
    video.play().catch(() => {})
    analytics.track(AnalyticsEvent.LANDING_VIDEO_PLAY, { screen: props.screen.file })
  } else {
    pausedByUser = true
    video.pause()
  }
}

onMounted(() => {
  const video = videoEl.value
  if (!video) return

  pausedByUser = prefersReducedMotion()

  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) video.pause()
      else if (!pausedByUser) video.play().catch(() => {})
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
    position: relative;
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

  &__toggle {
    position: absolute;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-pill);
    background: var(--color-surface-glass);
    color: var(--color-text);
    box-shadow: var(--shadow-card);
    transition: background var(--transition-fast);

    @media (hover: hover) {
      &:hover {
        background: var(--color-surface);
      }
    }
  }

  &__file {
    color: rgba(255, 255, 255, 0.45);
    font-size: var(--font-xs);
    text-align: center;
    word-break: break-word;
  }
}
</style>
