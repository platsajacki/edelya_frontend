<template>
  <section class="l-section l-section--surface">
    <div class="l-container l-split">
      <PhoneShot :screen="screens.week" />
      <div>
        <p class="l-eyebrow">Основная идея</p>
        <h2 class="l-title landing-planner__title">Две колонки: «Готовлю» и «Ем»</h2>
        <p class="l-body landing-planner__lead">
          Обычные приложения показывают только список рецептов. Еделя показывает связь: в какой день
          вы встаёте к плите и сколько дней потом едите.
        </p>
        <div class="landing-planner__cards">
          <article class="landing-planner__card landing-planner__card--cook">
            <div class="landing-planner__card-title">
              <IconPot :width="20" :height="20" />
              <span class="l-icon-text">Готовлю</span>
            </div>
            <p class="l-small landing-planner__card-text">
              День у плиты. Здесь видно, сколько блюд приходится на один вечер.
            </p>
          </article>
          <article class="landing-planner__card landing-planner__card--eat">
            <div class="landing-planner__card-title">
              <IconFork :width="20" :height="20" />
              <span class="l-icon-text">Ем</span>
            </div>
            <p class="l-small landing-planner__card-text">
              Дни подачи. Перенесли готовку — связанные дни еды сдвинулись сами.
            </p>
          </article>
        </div>
        <div class="landing-planner__note">
          <IconCalendar :width="20" :height="20" class="landing-planner__note-icon" />
          <p class="l-small">Навигация по неделям, перенос блюда на другой день перетаскиванием.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import PhoneShot from "./PhoneShot.vue"
import { screens } from "./screens"
import IconPot from "@/components/icons/IconPot.vue"
import IconFork from "@/components/icons/IconFork.vue"
import IconCalendar from "@/components/icons/IconCalendar.vue"
</script>

<style lang="scss" scoped>
.landing-planner {
  &__title {
    margin-top: 4px;
  }

  &__lead {
    margin-top: 20px;
  }

  &__cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-top: 32px;
  }

  &__card {
    padding: 20px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);

    &--cook {
      background: var(--color-cook-bg);

      .landing-planner__card-title {
        color: var(--color-cook);
      }
    }

    &--eat {
      background: var(--color-eat-bg);

      .landing-planner__card-title {
        color: var(--color-eat);
      }
    }
  }

  &__card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--font-sm);
    font-weight: 600;
    letter-spacing: 0.025em;
    text-transform: uppercase;
  }

  &__card-text {
    margin-top: 12px;
    color: var(--color-text);
  }

  &__note {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-top: 24px;
    font-size: var(--font-body);
    line-height: 1.5;
  }

  &__note-icon {
    height: 1lh;
    color: var(--color-mint);
  }
}

@media (max-width: 639px) {
  .landing-planner__cards {
    grid-template-columns: 1fr;
  }
}
</style>
