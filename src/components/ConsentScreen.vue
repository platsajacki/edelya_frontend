<template>
  <div class="consent">
    <div class="consent__card">
      <h1 class="consent__title">Добро пожаловать в Edelya</h1>

      <div class="consent__checkboxes">
        <label class="consent__label">
          <input
            v-model="termsAccepted"
            type="checkbox"
            class="consent__checkbox"
          />
          <span class="consent__text">
            Я принимаю
            <a href="/terms" target="_blank" class="consent__link">Условия использования</a>
            и
            <a href="/privacy" target="_blank" class="consent__link">Политику конфиденциальности</a>
          </span>
        </label>

        <label class="consent__label">
          <input
            v-model="marketingAccepted"
            type="checkbox"
            class="consent__checkbox"
          />
          <span class="consent__text">
            Хочу получать новости и специальные предложения
          </span>
        </label>
      </div>

      <p v-if="error" class="consent__error">{{ error }}</p>

      <button
        class="consent__btn"
        :disabled="!termsAccepted || loading"
        @click="submit"
      >
        <span v-if="loading" class="spinner spinner--sm" />
        <span v-else>Продолжить</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useAuthStore } from "../store/auth"
import { useSubscriptionStore } from "../store/subscription"

const auth = useAuthStore()
const sub = useSubscriptionStore()

const termsAccepted = ref(false)
const marketingAccepted = ref(false)
const loading = ref(false)
const error = ref(null)

async function submit() {
  if (!termsAccepted.value || loading.value) return
  loading.value = true
  error.value = null
  try {
    await auth.submitConsent(termsAccepted.value, marketingAccepted.value)
    await sub.loadMySubscription().catch(() => {})
  } catch (err) {
    error.value = err.message ?? "Произошла ошибка. Попробуйте снова."
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.consent {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding: 24px 16px;
  background: var(--color-bg);
}

.consent__card {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.consent__title {
  font-size: var(--font-title);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  text-align: center;
}

.consent__checkboxes {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.consent__label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
}

.consent__checkbox {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.consent__text {
  font-size: var(--font-body);
  color: var(--color-text);
  line-height: 1.5;
}

.consent__link {
  color: var(--color-primary);
  text-decoration: underline;
}

.consent__link:hover {
  opacity: 0.8;
}

.consent__error {
  margin: 0;
  font-size: var(--font-sm);
  color: var(--color-error, #e53e3e);
}

.consent__btn {
  width: 100%;
  padding: 14px 16px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: var(--color-primary-text, #fff);
  font-size: var(--font-body);
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.consent__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.consent__btn:not(:disabled):hover {
  opacity: 0.85;
}
</style>
