<template>
  <section class="l-section l-section--surface">
    <div class="l-container l-container--narrow">
      <h2 class="l-title">Частые вопросы</h2>
      <div class="landing-faq">
        <details v-for="item in items" :key="item.question" class="landing-faq__item">
          <summary class="landing-faq__question">
            <span class="l-icon-text">{{ item.question }}</span>
            <IconChevronDown :width="20" :height="20" class="landing-faq__chevron" />
          </summary>
          <p class="l-small landing-faq__answer">{{ item.answer }}</p>
        </details>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import IconChevronDown from "@/components/icons/IconChevronDown.vue"

const items = [
  {
    question: "Нужна ли регистрация?",
    answer:
      "Нет. Приложение открывается внутри Telegram, вход — по вашему Telegram-аккаунту. Ни почты, ни паролей.",
  },
  {
    question: "Что происходит с моими данными?",
    answer:
      "Рецепты, планы и списки покупок хранятся в вашем личном пространстве и доступны только вам. Мы не передаём их третьим лицам.",
  },
  {
    question: "Сколько длится пробный период?",
    answer:
      "Пробный период даётся сразу после первого входа на 14 дней — его срок и остаток видны в разделе «Кабинет».",
  },
  {
    question: "Как оплатить?",
    answer: "Картой прямо в приложении. Подписка продлевается автоматически.",
  },
  {
    question: "Как отменить подписку?",
    answer:
      "В разделе «Кабинет» можно отключить автопродление или отвязать карту. Доступ сохраняется до конца оплаченного периода.",
  },
]
</script>

<style lang="scss" scoped>
.landing-faq {
  margin-top: 32px;
  border-block: 1px solid var(--color-border);

  &__item {
    padding-block: 16px;

    & + & {
      border-top: 1px solid var(--color-border);
    }

    &[open] .landing-faq__chevron {
      transform: rotate(180deg);
    }
  }

  &__question {
    display: flex;
    cursor: pointer;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    font-size: var(--font-md);
    font-weight: 600;
    list-style: none;

    &::-webkit-details-marker {
      display: none;
    }
  }

  &__chevron {
    flex: 0 0 auto;
    color: var(--color-text-secondary);
    transition: transform var(--transition-normal);
  }

  &__answer {
    margin-top: 12px;
  }
}
</style>
