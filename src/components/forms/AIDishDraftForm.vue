<template>
  <ModalWrapper v-model="open" :title="modalTitle" :z-index="zIndex">
    <form id="ai-dish-form" class="form" @submit.prevent="submit">
      <template v-if="step === 'input'">
        <div class="ai-draft__intro">
          <p class="ai-draft__title">Введите рецепт, продукты или идею блюда</p>
          <p class="ai-draft__text">
            ИИ подготовит блюдо с названием, рецептом и ингредиентами. Перед сохранением вы сможете
            всё проверить и поправить.
          </p>
          <ul class="ai-draft__capabilities">
            <li>Готовый рецепт — вставьте ингредиенты и шаги приготовления.</li>
            <li>Продукты — напишите, что есть под рукой.</li>
            <li>Идея блюда — опишите желаемое блюдо, стиль или ограничения.</li>
          </ul>
        </div>

        <AIRecipeUsageBadge
          :usage="subscription.aiRecipeUsage"
          :limit="subscription.aiRecipeLimit"
        />

        <label class="form__field">
          <span class="form__label">Что приготовить <span class="form__required">*</span></span>
          <textarea
            ref="sourceTextRef"
            v-model="sourceText"
            v-autofocus
            class="form__textarea ai-draft__source"
            rows="8"
            :maxlength="MAX_SOURCE_LENGTH"
            placeholder="Готовый рецепт: Борщ. Ингредиенты: свёкла 300 г, капуста 200 г... Приготовление: нарезать овощи, сварить бульон...

Продукты: есть картофель, яйца, сыр и сметана. Что приготовить?

Идея блюда: лёгкий ужин с курицей без майонеза."
          />
        </label>
        <div class="ai-draft__counter">{{ sourceTextLength }}/{{ MAX_SOURCE_LENGTH }}</div>
      </template>

      <div v-else-if="step === 'processing'" class="ai-draft__progress">
        <ul class="ai-draft__steps">
          <li
            v-for="(label, idx) in FAKE_STEPS"
            :key="idx"
            class="ai-draft__step"
            :class="`ai-draft__step--${fakeStepStates[idx]}`"
          >
            <span class="ai-draft__step-icon">
              <span v-if="fakeStepStates[idx] === 'done'" class="ai-draft__step-check">
                <IconCheck :width="10" :height="10" />
              </span>
              <span v-else-if="fakeStepStates[idx] === 'loading'" class="spinner spinner--sm" />
              <span v-else class="ai-draft__step-dot" />
            </span>
            <span class="ai-draft__step-label">{{ label }}</span>
          </li>
        </ul>
        <p class="ai-draft__text">Черновик сохраняется в AI-рецептах — можно закрыть окно.</p>
      </div>

      <div v-else-if="step === 'failed'" class="ai-draft__notice ai-draft__notice--error">
        <p class="ai-draft__title">Не удалось разобрать рецепт</p>
        <p class="ai-draft__text">{{ failureMessage }}</p>
        <div v-if="draftSourceText" class="ai-draft__source-preview">{{ draftSourceText }}</div>
        <button type="button" class="ai-draft__secondary-btn" @click="resetToInput">
          Изменить описание
        </button>
      </div>

      <div v-else-if="step === 'dish_created'" class="ai-draft__readonly">
        <div class="ai-draft__notice">
          <p class="ai-draft__title">Блюдо создано</p>
          <p class="ai-draft__text">
            Созданное блюдо уже сохранено. Здесь можно посмотреть данные AI-черновика.
          </p>
        </div>

        <div class="detail__section">
          <div class="detail__dish-header">
            <h4 class="detail__dish-name">{{ readonlyPayload.name || "Без названия" }}</h4>
          </div>
          <p v-if="readonlyCategoryName" class="detail__meta">{{ readonlyCategoryName }}</p>
          <p v-if="readonlyPayload.recipe" class="detail__recipe">{{ readonlyPayload.recipe }}</p>
        </div>

        <div v-if="readonlyPayload.ingredients?.length" class="detail__section">
          <span class="detail__label">Состав</span>
          <ul class="detail__ingredients">
            <li
              v-for="(ingredient, idx) in readonlyPayload.ingredients"
              :key="idx"
              class="detail__ingredient"
            >
              <span class="detail__ingredient-name">{{ ingredientLabel(ingredient) }}</span>
              <span class="detail__ingredient-right">
                <span v-if="ingredient.is_optional" class="detail__ingredient-optional">опц.</span>
                <span class="detail__ingredient-amount">
                  {{ formatShoppingAmount(ingredient.amount, ingredient.base_unit).display }}
                </span>
              </span>
            </li>
          </ul>
        </div>

        <div v-if="draftSourceText" class="detail__section">
          <button
            type="button"
            class="ai-draft__source-toggle"
            @click="sourceExpanded = !sourceExpanded"
          >
            {{ sourceToggleLabel }}
          </button>
          <div v-if="sourceExpanded" class="ai-draft__source-preview">{{ draftSourceText }}</div>
        </div>
      </div>

      <template v-else-if="step === 'parsed'">
        <div class="ai-draft__intro">
          <p class="ai-draft__title">Проверьте блюдо</p>
          <p class="ai-draft__text">
            Можно поправить название, рецепт, категорию, количество и обязательность ингредиентов.
          </p>
        </div>

        <div v-if="draftSourceText" class="ai-draft__source-block">
          <button
            type="button"
            class="ai-draft__source-toggle"
            @click="sourceExpanded = !sourceExpanded"
          >
            {{ sourceToggleLabel }}
          </button>
          <div v-if="sourceExpanded" class="ai-draft__source-preview">{{ draftSourceText }}</div>
        </div>

        <label class="form__field">
          <span class="form__label">Название <span class="form__required">*</span></span>
          <input v-model="payload.name" type="text" class="form__input" required />
        </label>

        <label class="form__field">
          <span class="form__label">Категория <span class="form__required">*</span></span>
          <select v-model="payload.category" class="form__select" required>
            <option value="" disabled>Выберите категорию</option>
            <option v-for="cat in dishCategories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </label>

        <label class="form__field">
          <span class="form__label">Рецепт <span class="form__required">*</span></span>
          <textarea
            v-model="payload.recipe"
            class="form__textarea ai-draft__recipe"
            rows="5"
            required
          />
        </label>

        <div class="form__section">
          <span class="form__label">Ингредиенты <span class="form__required">*</span></span>

          <template v-for="(ingredient, idx) in payload.ingredients" :key="ingredient.localId">
            <div v-if="editingIngredientIndex === idx" class="ingredient-amount">
              <div class="ingredient-amount__header">
                <span
                  class="ingredient-amount__mode-badge"
                  :class="
                    ingredient.new
                      ? 'ingredient-amount__mode-badge--new'
                      : ingredient.ingredient
                        ? 'ingredient-amount__mode-badge--found'
                        : null
                  "
                >
                  {{
                    !ingredient.new && !ingredient.ingredient
                      ? "Нужна привязка"
                      : ingredient.new
                        ? "Новый"
                        : "Найден"
                  }}
                </span>
                <span
                  v-if="!ingredient.new && ingredient.ingredient"
                  class="ingredient-amount__name"
                  >{{ ingredientLabel(ingredient) }}</span
                >
              </div>

              <template v-if="ingredient.new || (!ingredient.new && !ingredient.ingredient)">
                <label v-if="ingredient.new" class="form__field">
                  <span class="form__label">Название</span>
                  <input v-model="ingredient.name" type="text" class="form__input" />
                </label>

                <button
                  v-if="!inlineReplaceVisible"
                  type="button"
                  class="ingredient-amount__link-btn"
                  @click="openInlineReplace(ingredient)"
                >
                  Привязать к существующему
                </button>

                <div v-else class="ingredient-amount__inline-replace">
                  <div class="ai-draft__search-head">
                    <span class="ingredient-amount__replace-label">Найти и привязать</span>
                    <button
                      type="button"
                      class="ingredient-amount__cancel-link"
                      @click="closeInlineReplace"
                    >
                      Отмена
                    </button>
                  </div>
                  <div class="search-field">
                    <input
                      v-model="inlineReplaceQuery"
                      v-autofocus.select
                      type="search"
                      class="form__input"
                      placeholder="Поиск ингредиента..."
                      @input="searchInlineReplace"
                    />
                    <button
                      v-if="inlineReplaceQuery"
                      type="button"
                      class="search-field__clear"
                      aria-label="Очистить"
                      @click="
                        () => {
                          inlineReplaceQuery = ''
                          inlineReplaceResults = []
                        }
                      "
                    >
                      &times;
                    </button>
                  </div>
                  <div v-if="inlineReplaceLoading" class="ingredient-search__status">
                    <div class="spinner spinner--sm" />
                  </div>
                  <ul v-else-if="inlineReplaceResults.length" class="ingredient-search__list">
                    <li
                      v-for="result in inlineReplaceResults"
                      :key="result.id"
                      class="ingredient-search__item"
                      @click="selectInlineReplaceIngredient(idx, result)"
                    >
                      {{ result.name }}
                      <span class="ingredient-search__unit">{{
                        UNIT_LABELS[result.base_unit] || result.base_unit
                      }}</span>
                    </li>
                  </ul>
                  <div v-else-if="inlineReplaceQuery.trim()" class="ingredient-search__status">
                    Ничего не найдено
                  </div>
                </div>
              </template>

              <div v-if="ingredient.base_unit !== 'to_taste'" class="ingredient-amount__row">
                <input
                  ref="amountInputRef"
                  v-model="ingredient.amount"
                  v-autofocus.select
                  type="text"
                  inputmode="decimal"
                  autocomplete="off"
                  class="form__input ingredient-amount__input"
                  placeholder="Например: 200"
                  @keydown.enter.prevent="finishIngredientEdit"
                />
                <select
                  v-if="ingredient.new"
                  v-model="ingredient.base_unit"
                  class="form__select ingredient-amount__select"
                >
                  <option v-for="unit in unitOptions" :key="unit.value" :value="unit.value">
                    {{ unit.label }}
                  </option>
                </select>
                <span v-else class="ingredient-amount__unit">{{
                  UNIT_LABELS[ingredient.base_unit] || ingredient.base_unit
                }}</span>
              </div>
              <p v-else class="ingredient-amount__taste-hint">
                Количество не указывается — добавится как «по вкусу»
              </p>

              <label v-if="ingredient.new" class="form__field">
                <span class="form__label">Категория ингредиента</span>
                <select v-model="ingredient.category" class="form__select">
                  <option value="" disabled>Выберите категорию</option>
                  <option v-for="cat in ingredientCategories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </label>

              <label class="ingredient-amount__optional">
                <input v-model="ingredient.is_optional" type="checkbox" />
                Опционально
              </label>

              <div class="ingredient-amount__actions">
                <button type="button" class="btn btn--sm" @click="finishIngredientEdit">
                  Сохранить
                </button>
                <button type="button" class="btn btn--sm btn--ghost" @click="cancelIngredientEdit">
                  Отмена
                </button>
              </div>
            </div>

            <template v-else>
              <div
                class="ingredient-row"
                :class="{
                  'ingredient-row--broken': !ingredient.new && !ingredient.ingredient,
                }"
              >
                <span class="ingredient-row__name">{{ ingredientLabel(ingredient) }}</span>
                <span
                  class="ai-ingredient__badge"
                  :class="{
                    'ai-ingredient__badge--new': ingredient.new,
                    'ai-ingredient__badge--broken': !ingredient.new && !ingredient.ingredient,
                  }"
                >
                  {{ ingredient.new ? "создать" : !ingredient.ingredient ? "привязать" : "найден" }}
                </span>
                <span v-if="ingredient.is_optional" class="ingredient-row__opt-label">опц.</span>
                <span class="ingredient-row__amount">{{
                  formatShoppingAmount(ingredient.amount, ingredient.base_unit).display
                }}</span>
                <button
                  type="button"
                  class="ingredient-row__edit"
                  title="Редактировать"
                  @click="startIngredientEdit(idx)"
                >
                  <IconPencil :width="14" :height="14" />
                </button>
                <button
                  type="button"
                  class="ingredient-row__remove"
                  title="Удалить"
                  @click="removeIngredient(idx)"
                >
                  <IconClose />
                </button>
              </div>
              <div
                v-if="ingredient.new && suggestionsMap[ingredient.localId]?.length"
                class="ingredient-row__suggestions"
              >
                <span class="ingredient-row__suggestions-label">Похоже на:</span>
                <button
                  v-for="s in suggestionsMap[ingredient.localId]"
                  :key="s.id"
                  type="button"
                  class="ingredient-row__suggestion-chip"
                  @click="applySuggestion(idx, s)"
                >
                  {{ s.name }}
                </button>
              </div>
            </template>
          </template>

          <button
            type="button"
            class="ingredient-add__toggle"
            @click="addIngredientExpanded = !addIngredientExpanded"
          >
            {{ addIngredientExpanded ? "− Свернуть" : "+ Добавить ингредиент" }}
          </button>

          <div v-if="addIngredientExpanded" class="ingredient-search">
            <div class="search-field">
              <input
                v-model="ingredientSearchQuery"
                v-autofocus
                type="search"
                class="form__input"
                placeholder="Поиск ингредиента..."
                @input="searchIngredients"
              />
              <button
                v-if="ingredientSearchQuery"
                type="button"
                class="search-field__clear"
                aria-label="Очистить"
                @click="clearIngredientSearch"
              >
                &times;
              </button>
            </div>
            <div v-if="ingredientSearchLoading" class="ingredient-search__status">
              <div class="spinner spinner--sm" />
            </div>
            <ul v-else-if="ingredientSearchResults.length" class="ingredient-search__list">
              <li
                v-for="result in ingredientSearchResults"
                :key="result.id"
                class="ingredient-search__item"
                @click="selectExistingIngredient(result)"
              >
                {{ result.name }}
                <span class="ingredient-search__unit">{{
                  UNIT_LABELS[result.base_unit] || result.base_unit
                }}</span>
              </li>
            </ul>
            <div v-else-if="ingredientSearchQuery.trim()" class="ingredient-search__status">
              Ничего не найдено
            </div>
            <button type="button" class="dish-search__create" @click="openIngredientForm">
              + Создать ингредиент
            </button>
          </div>
        </div>
      </template>

      <div v-if="error" class="form__error">{{ error }}</div>
    </form>

    <IngredientForm
      v-model="showIngredientForm"
      :z-index="zIndex + 10"
      :initial-name="ingredientFormInitialName"
      @created="onIngredientCreated"
    />

    <template #footer>
      <div v-if="step === 'dish_created'" class="detail__actions">
        <button
          type="button"
          class="detail__btn detail__btn--edit"
          :disabled="!createdDishId || openingCreatedDish"
          @click="openCreatedDish"
        >
          {{ openingCreatedDish ? "Открываю..." : "Открыть блюдо" }}
        </button>
        <button type="button" class="detail__btn detail__btn--cancel" @click="open = false">
          Закрыть
        </button>
      </div>
      <button
        v-else-if="canSubmit"
        type="submit"
        form="ai-dish-form"
        class="form__submit"
        :disabled="submitDisabled"
      >
        {{ submitLabel }}
      </button>
    </template>
  </ModalWrapper>
</template>

<script lang="ts" setup>
import { AutoFocusDirective as vAutofocus } from "@/directives/autofocus"
import { computed, nextTick, onUnmounted, ref, watch } from "vue"
import ModalWrapper from "./ModalWrapper.vue"
import IngredientForm from "./IngredientForm.vue"
import AIRecipeUsageBadge from "../AIRecipeUsageBadge.vue"
import IconPencil from "../icons/IconPencil.vue"
import IconClose from "../icons/IconClose.vue"
import { useSubscriptionStore } from "@/store/subscription.ts"
import { createAIDraft, createDishFromAIDraft, fetchAIDraft } from "@/services/aiDraftService.ts"
import { fetchDish, fetchDishCategories } from "@/services/dishService.ts"
import {
  fetchIngredientById,
  fetchIngredientCategories,
  fetchIngredients,
} from "@/services/ingredientService.ts"
import { formatShoppingAmount } from "@/utils/formatShoppingAmount.ts"
import { UNIT_LABELS } from "@/utils/unitLabels.ts"
import type { DTOAIDraft, DTOBaseUnit, DTODish, DTODishCategory } from "@/types/dish"
import type { DTOIngredient, DTOIngredientCategory } from "@/types/shopping"
import IconCheck from "@/components/icons/IconCheck.vue"

interface AIDraftPayloadIngredient {
  localId: string
  ingredient: string | null
  name: string
  category: string | number | null
  base_unit: DTOBaseUnit
  amount: string | number
  is_optional: boolean
  new: boolean
  suggested_ids: string[]
}

interface AIDraftPayload {
  name: string
  recipe: string
  category: string | number
  ingredients: AIDraftPayloadIngredient[]
}

type FakeStepState = "pending" | "loading" | "done"

const MIN_SOURCE_LENGTH = 10
const MAX_SOURCE_LENGTH = 10_000
const POLL_INTERVAL_MS = 7_000
const PROMPT_INJECTION_MESSAGE =
  "Обнаружены подозрительные данные, похожие на попытку обойти систему. Пожалуйста, измените формулировку и попробуйте снова."
const NOT_PROCESSABLE_MESSAGE =
  "Рецепт не может быть обработан. Пожалуйста, проверьте формат и содержание текста."
const DEFAULT_PARSE_FAILURE_MESSAGE =
  "Попробуйте добавить больше деталей: ингредиенты, количество и шаги приготовления."
const FAKE_STEPS = [
  "Читаю ваш запрос",
  "Определяю блюдо и категорию",
  "Подбираю ингредиенты",
  "Рассчитываю пропорции",
  "Формирую рецепт",
]
const FAKE_STEP_MIN_DURATION_MS = 8_000
const FAKE_STEP_MAX_DURATION_MS = 12_000
const FAKE_STEP_FF_MS = 300

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    zIndex?: number
    draftToOpen?: DTOAIDraft | null
  }>(),
  { zIndex: 1010, draftToOpen: null }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "created", dish: DTODish): void
  (e: "draft-created", draft: DTOAIDraft): void
  (e: "draft-updated", draft: DTOAIDraft): void
  (e: "open-dish", dish: DTODish): void
}>()

const subscription = useSubscriptionStore()
const open = ref(props.modelValue)
const sourceText = ref("")
const sourceTextRef = ref<HTMLTextAreaElement | null>(null)
const draft = ref<DTOAIDraft | null>(null)
const createdDish = ref<DTODish | null>(null)
const openingCreatedDish = ref(false)
const payload = ref<AIDraftPayload>(createEmptyPayload())
const dishCategories = ref<DTODishCategory[]>([])
const ingredientCategories = ref<DTOIngredientCategory[]>([])
const error = ref("")
const saving = ref(false)
const polling = ref(false)
const sourceExpanded = ref(false)
const editingIngredientIndex = ref<number | null>(null)
const addIngredientExpanded = ref(false)
const ingredientSearchQuery = ref("")
const ingredientSearchResults = ref<DTOIngredient[]>([])
const ingredientSearchLoading = ref(false)
const showIngredientForm = ref(false)
const ingredientFormInitialName = ref("")
const amountInputRef = ref<HTMLInputElement[]>([])
const suggestionsMap = ref<Record<string, DTOIngredient[]>>({})

const inlineReplaceVisible = ref(false)
const inlineReplaceQuery = ref("")
const inlineReplaceResults = ref<DTOIngredient[]>([])
const inlineReplaceLoading = ref(false)
let inlineReplaceTimer: ReturnType<typeof setTimeout> | null = null

let pollTimer: ReturnType<typeof setTimeout> | null = null
let ingredientSearchTimer: ReturnType<typeof setTimeout> | null = null
const fakeStepStates = ref<FakeStepState[]>(FAKE_STEPS.map(() => "pending"))
const fakeCurrentStep = ref(-1)
let fakeTimer: ReturnType<typeof setTimeout> | null = null

const unitOptions = computed(() =>
  Object.entries(UNIT_LABELS).map(([value, label]) => ({ value, label }))
)

const sourceTextLength = computed(() => sourceText.value.trim().length)
const modalTitle = computed(() => (draft.value ? "AI-рецепт" : "Создать с ИИ"))
const draftSourceText = computed(() => draft.value?.source_text || sourceText.value.trim())
const step = computed(() => {
  if (!draft.value) return "input"
  if (draft.value.status === "parsed") return "parsed"
  if (draft.value.status === "failed") return "failed"
  if (draft.value.status === "dish_created") return "dish_created"
  return "processing"
})
const failureMessage = computed(() => formatValidationErrors(draft.value?.validation_errors))
const submitDisabled = computed(
  () =>
    saving.value ||
    polling.value ||
    step.value === "processing" ||
    (step.value === "input" && subscription.isAIRecipeLimitExceeded)
)
const canSubmit = computed(() => !["failed", "dish_created"].includes(step.value))
const readonlyPayload = computed(() => normalizePayload(draft.value?.payload))
const readonlyCategoryName = computed(() => getCategoryName(readonlyPayload.value.category))
const createdDishId = computed(() =>
  getCreatedDishId(createdDish.value || draft.value?.created_dish)
)
const sourceToggleLabel = computed(() =>
  sourceExpanded.value ? "Скрыть исходный текст" : "Показать исходный текст"
)
const submitLabel = computed(() => {
  if (step.value === "input" && subscription.isAIRecipeLimitExceeded) return "Лимит исчерпан"
  if (saving.value && step.value === "parsed") return "Создание..."
  if (saving.value) return "Отправка..."
  if (polling.value || step.value === "processing") return "Подготовка блюда..."
  if (step.value === "parsed") return "Создать блюдо"
  return "Подготовить блюдо"
})

watch(
  () => props.modelValue,
  (value) => {
    open.value = value
    if (value) {
      resetState({ keepDraft: Boolean(props.draftToOpen) })
      loadReferences()
      if (props.draftToOpen) {
        applyDraft(props.draftToOpen)
        return
      }
    } else {
      stopPolling()
    }
  }
)

watch(
  () => props.draftToOpen,
  (value) => {
    if (open.value && value) applyDraft(value)
  }
)

watch(open, (value) => {
  emit("update:modelValue", value)
  if (!value) {
    stopPolling()
    clearFakeTimer()
  }
})

watch(
  () => payload.value?.ingredients,
  (ingredients) => {
    ingredients?.forEach((ingredient) => {
      if (ingredient.base_unit === "to_taste") {
        ingredient.amount = 1
      }
    })
  },
  { deep: true }
)

async function loadReferences() {
  try {
    const [dishData, ingredientData] = await Promise.all([
      fetchDishCategories(),
      fetchIngredientCategories(),
    ])
    dishCategories.value = dishData.results ?? []
    ingredientCategories.value = ingredientData.results ?? []
  } catch {
    dishCategories.value = []
    ingredientCategories.value = []
  }
}

function createEmptyPayload(): AIDraftPayload {
  return {
    name: "",
    recipe: "",
    category: "",
    ingredients: [],
  }
}

function resetState({ keepDraft = false } = {}) {
  if (!keepDraft) {
    sourceText.value = ""
    draft.value = null
  }
  createdDish.value = null
  openingCreatedDish.value = false
  payload.value = createEmptyPayload()
  error.value = ""
  saving.value = false
  polling.value = false
  sourceExpanded.value = false
  suggestionsMap.value = {}
  addIngredientExpanded.value = false
  resetIngredientSearch()
  stopPolling()
  clearFakeTimer()
  fakeStepStates.value = FAKE_STEPS.map(() => "pending")
  fakeCurrentStep.value = -1
}

function resetToInput() {
  draft.value = null
  payload.value = createEmptyPayload()
  error.value = ""
  nextTick(() => sourceTextRef.value?.focus())
}

function applyDraft(nextDraft: DTOAIDraft) {
  draft.value = nextDraft
  sourceText.value = nextDraft?.source_text || sourceText.value
  sourceExpanded.value = false
  resetIngredientSearch()
  if (nextDraft?.payload) setPayload(nextDraft.payload)
  if (nextDraft?.status === "processing") {
    startFakeProgress()
    schedulePoll(nextDraft.id)
  }
}

function stopPolling() {
  if (pollTimer) {
    clearTimeout(pollTimer)
    pollTimer = null
  }
  polling.value = false
}

function clearFakeTimer() {
  if (fakeTimer) {
    clearTimeout(fakeTimer)
    fakeTimer = null
  }
}

function startFakeProgress() {
  clearFakeTimer()
  fakeStepStates.value = FAKE_STEPS.map(() => "pending")
  fakeCurrentStep.value = -1
  advanceFakeStep()
}

function advanceFakeStep() {
  const next = fakeCurrentStep.value + 1
  if (next >= FAKE_STEPS.length) return
  if (fakeCurrentStep.value >= 0) fakeStepStates.value[fakeCurrentStep.value] = "done"
  fakeCurrentStep.value = next
  fakeStepStates.value[next] = "loading"
  if (next < FAKE_STEPS.length - 1) {
    const randomDuration =
      Math.random() * (FAKE_STEP_MAX_DURATION_MS - FAKE_STEP_MIN_DURATION_MS) +
      FAKE_STEP_MIN_DURATION_MS

    fakeTimer = setTimeout(advanceFakeStep, randomDuration)
  }
}

async function finishFakeAndApply(finalDraft: DTOAIDraft) {
  clearFakeTimer()
  let idx = fakeCurrentStep.value < 0 ? 0 : fakeCurrentStep.value
  if (fakeCurrentStep.value < 0) {
    fakeCurrentStep.value = 0
    fakeStepStates.value[0] = "loading"
  }
  while (idx < FAKE_STEPS.length - 1) {
    if (!open.value) return
    fakeStepStates.value[idx] = "done"
    idx++
    fakeCurrentStep.value = idx
    fakeStepStates.value[idx] = "loading"
    await new Promise<void>((resolve) => setTimeout(resolve, FAKE_STEP_FF_MS))
  }
  if (!open.value) return
  fakeStepStates.value[FAKE_STEPS.length - 1] = "done"
  await new Promise<void>((resolve) => setTimeout(resolve, FAKE_STEP_FF_MS))
  if (!open.value) return
  draft.value = finalDraft
  if (finalDraft.status === "parsed" && finalDraft.payload) {
    setPayload(finalDraft.payload)
  }
}

function schedulePoll(id: string) {
  if (!open.value) return
  stopPolling()
  polling.value = true
  pollTimer = setTimeout(() => pollDraft(id), POLL_INTERVAL_MS)
}

async function pollDraft(id: string) {
  try {
    const data = await fetchAIDraft(id)
    if (!open.value) return
    emit("draft-updated", data)
    if (data.status === "parsed" || data.status === "failed") {
      stopPolling()
      await finishFakeAndApply(data)
      return
    }
    draft.value = data
    schedulePoll(id)
  } catch (err) {
    if (!open.value) return
    stopPolling()
    error.value =
      (err instanceof Error ? err.message : "") || "Не удалось получить результат разбора."
  }
}

function setPayload(data: Record<string, unknown> | null) {
  const nextPayload = normalizePayload(data)
  nextPayload.ingredients = (nextPayload.ingredients || []).map((ingredient, index) => ({
    ...ingredient,
    localId: `${ingredient.ingredient || ingredient.name || "ingredient"}-${index}`,
    amount: ingredient.amount ?? 1,
    suggested_ids: ingredient.suggested_ids ?? [],
  }))
  payload.value = nextPayload
  loadSuggestions(nextPayload.ingredients)
}

async function loadSuggestions(ingredients: AIDraftPayloadIngredient[]) {
  const map: Record<string, DTOIngredient[]> = {}
  const toLoad = ingredients.filter((ing) => ing.new && ing.suggested_ids?.length)
  await Promise.allSettled(
    toLoad.map(async (ing) => {
      const results = await Promise.allSettled(
        ing.suggested_ids.map((id) => fetchIngredientById(id))
      )
      map[ing.localId] = results
        .filter((r): r is PromiseFulfilledResult<DTOIngredient> => r.status === "fulfilled")
        .map((r) => r.value)
    })
  )
  suggestionsMap.value = map
}

function normalizePayload(data: Record<string, unknown> | null): AIDraftPayload {
  return JSON.parse(JSON.stringify(data ?? createEmptyPayload())) as AIDraftPayload
}

function getCategoryName(categoryId: string | number): string {
  const id = getCategoryId(categoryId)
  return dishCategories.value.find((category) => category.id === id)?.name || ""
}

function ingredientLabel(ingredient: { name?: string }): string {
  return ingredient.name?.trim() || "Без названия"
}

function removeIngredient(index: number) {
  payload.value.ingredients.splice(index, 1)
  if (editingIngredientIndex.value === index) {
    editingIngredientIndex.value = null
    closeInlineReplace()
  } else if (editingIngredientIndex.value !== null && editingIngredientIndex.value > index) {
    editingIngredientIndex.value--
  }
}

function startIngredientEdit(index: number) {
  closeInlineReplace()
  editingIngredientIndex.value = index
  const ingredient = payload.value.ingredients[index]
  if (ingredient && !ingredient.new && !ingredient.ingredient) {
    nextTick(() => openInlineReplace(ingredient))
  } else {
    nextTick(() => amountInputRef.value[0]?.focus())
  }
}

function finishIngredientEdit() {
  editingIngredientIndex.value = null
  closeInlineReplace()
}

function cancelIngredientEdit() {
  editingIngredientIndex.value = null
  closeInlineReplace()
}

function resetIngredientSearch() {
  clearTimeout(ingredientSearchTimer ?? undefined)
  clearTimeout(inlineReplaceTimer ?? undefined)
  editingIngredientIndex.value = null
  addIngredientExpanded.value = false
  ingredientSearchQuery.value = ""
  ingredientSearchResults.value = []
  ingredientSearchLoading.value = false
  closeInlineReplace()
}

function clearIngredientSearch() {
  ingredientSearchQuery.value = ""
  ingredientSearchResults.value = []
}

function searchIngredients() {
  clearTimeout(ingredientSearchTimer ?? undefined)
  const query = ingredientSearchQuery.value.trim()
  if (!query) {
    ingredientSearchResults.value = []
    ingredientSearchLoading.value = false
    return
  }
  ingredientSearchTimer = setTimeout(async () => {
    ingredientSearchLoading.value = true
    try {
      const data = await fetchIngredients({ search: query })
      ingredientSearchResults.value = data.results ?? []
    } catch {
      ingredientSearchResults.value = []
    } finally {
      ingredientSearchLoading.value = false
    }
  }, 300)
}

function selectExistingIngredient(ingredient: DTOIngredient) {
  addExistingIngredient(ingredient)
}

function openIngredientForm() {
  ingredientFormInitialName.value = ingredientSearchQuery.value.trim()
  showIngredientForm.value = true
}

function onIngredientCreated(ingredient: DTOIngredient) {
  addExistingIngredient(ingredient)
}

function addExistingIngredient(ingredient: DTOIngredient) {
  const alreadyUsed = payload.value.ingredients.some((item) => item.ingredient === ingredient.id)
  if (alreadyUsed) {
    error.value = "Ингредиент уже добавлен."
    return
  }
  payload.value.ingredients.push({
    localId: `ingredient-${ingredient.id}-${Date.now()}`,
    ingredient: ingredient.id,
    name: ingredient.name,
    category: getCategoryId(ingredient.category),
    base_unit: ingredient.base_unit,
    amount: ingredient.base_unit === "to_taste" ? 1 : "",
    is_optional: false,
    new: false,
    suggested_ids: [],
  })
  addIngredientExpanded.value = false
  clearIngredientSearch()
  error.value = ""
  editingIngredientIndex.value = payload.value.ingredients.length - 1
  nextTick(() => amountInputRef.value[0]?.focus())
}

function setExistingIngredient(index: number, ingredient: DTOIngredient) {
  const current = payload.value.ingredients[index]
  if (!current) return
  const alreadyUsed = payload.value.ingredients.some(
    (item, itemIndex) => itemIndex !== index && item.ingredient === ingredient.id
  )
  if (alreadyUsed) {
    error.value = "Ингредиент уже добавлен."
    return
  }
  payload.value.ingredients[index] = {
    ...current,
    ingredient: ingredient.id,
    name: ingredient.name,
    category: getCategoryId(ingredient.category),
    base_unit: ingredient.base_unit,
    amount: ingredient.base_unit === "to_taste" ? 1 : current.amount,
    new: false,
    suggested_ids: [],
  }
  error.value = ""
}

function getCategoryId(
  category: DTOIngredientCategory | string | number | null | undefined
): string | number | null | undefined {
  return typeof category === "object" ? category?.id : category
}

function getCreatedDishId(value: DTODish | string | null | undefined): string | null {
  if (!value) return null
  return typeof value === "object" ? value.id : value
}

function formatValidationErrors(errors: unknown): string {
  if (!errors || (Array.isArray(errors) && !errors.length)) {
    return DEFAULT_PARSE_FAILURE_MESSAGE
  }
  const text = formatErrorItem(errors)
  return text || DEFAULT_PARSE_FAILURE_MESSAGE
}

function formatErrorItem(item: unknown): string {
  if (!item) return ""
  if (item === "prompt_injection") return PROMPT_INJECTION_MESSAGE
  if (item === "not_processable") return NOT_PROCESSABLE_MESSAGE
  if (typeof item === "string") return ""
  if (Array.isArray(item)) return item.map(formatErrorItem).filter(Boolean).join("\n")
  if (typeof item !== "object") return ""
  const obj = item as Record<string, unknown>
  if (obj.error_code === "prompt_injection") return PROMPT_INJECTION_MESSAGE
  if (obj.code === "prompt_injection") return PROMPT_INJECTION_MESSAGE
  if (obj.error_code === "not_processable") return NOT_PROCESSABLE_MESSAGE
  if (obj.code === "not_processable") return NOT_PROCESSABLE_MESSAGE
  if (obj.error_message) return formatErrorItem(obj.error_message)
  if (obj.message) return formatErrorItem(obj.message)
  if (obj.detail) return formatErrorItem(obj.detail)
  return Object.entries(obj)
    .filter(([key]) => key !== "error_code")
    .map(([, value]) => formatErrorItem(value))
    .filter(Boolean)
    .join("\n")
}

function validateSourceText(): string | null {
  const text = sourceText.value.trim()
  if (text.length < MIN_SOURCE_LENGTH) return "Вставьте рецепт длиной не менее 10 символов."
  if (text.length > MAX_SOURCE_LENGTH)
    return `Текст не должен быть длиннее ${MAX_SOURCE_LENGTH} символов.`
  return null
}

function validatePayload(): string | null {
  if (!payload.value.name?.trim()) return "Укажите название блюда."
  if (!payload.value.recipe?.trim()) return "Добавьте текст рецепта."
  if (!payload.value.category) return "Выберите категорию блюда."
  if (!payload.value.ingredients.length) return "Оставьте хотя бы один ингредиент."
  if (payload.value.ingredients.every((ingredient) => ingredient.is_optional)) {
    return "Хотя бы один ингредиент должен быть обязательным."
  }
  for (const ingredient of payload.value.ingredients) {
    if (!ingredient.name?.trim()) return "Укажите название каждого ингредиента."
    if (!ingredient.new && !ingredient.ingredient) return "Выберите существующий ингредиент."
    if (!ingredient.category) return "Выберите категорию для каждого ингредиента."
    if (!ingredient.base_unit) return "Выберите единицу измерения для каждого ингредиента."
    const amount = Number(String(ingredient.amount).replace(",", "."))
    if (!Number.isFinite(amount) || amount <= 0)
      return "Количество ингредиентов должно быть больше 0."
  }
  return null
}

function buildPayload(): Record<string, unknown> {
  return {
    name: payload.value.name.trim(),
    recipe: payload.value.recipe.trim(),
    category: payload.value.category,
    ingredients: payload.value.ingredients.map((ingredient) => ({
      ingredient: ingredient.new ? null : ingredient.ingredient,
      name: ingredient.name.trim(),
      category: ingredient.category,
      base_unit: ingredient.base_unit,
      amount: Number(String(ingredient.amount).replace(",", ".")),
      is_optional: Boolean(ingredient.is_optional),
      new: Boolean(ingredient.new),
      suggested_ids: ingredient.suggested_ids ?? [],
    })),
  }
}

async function submit() {
  error.value = ""
  if (step.value === "input") {
    if (subscription.isAIRecipeLimitExceeded) {
      error.value = "Лимит AI-рецептов на текущий период исчерпан."
      return
    }
    error.value = validateSourceText() ?? ""
    if (error.value) return
    saving.value = true
    try {
      const data = await createAIDraft({ source_text: sourceText.value.trim() })
      draft.value = data
      emit("draft-created", data)
      startFakeProgress()
      schedulePoll(data.id)
    } catch (err) {
      error.value =
        (err instanceof Error ? err.message : "") || "Не удалось отправить рецепт на разбор."
    } finally {
      saving.value = false
    }
    return
  }

  if (step.value !== "parsed") return
  error.value = validatePayload() ?? ""
  if (error.value) return
  saving.value = true
  try {
    const confirmedPayload = buildPayload()
    const dish = await createDishFromAIDraft(draft.value!.id, confirmedPayload)
    createdDish.value = dish
    const updatedDraft: DTOAIDraft = {
      ...draft.value!,
      status: "dish_created",
      payload: confirmedPayload,
      created_dish: getCreatedDishId(dish),
    }
    draft.value = updatedDraft
    emit("draft-updated", updatedDraft)
    emit("created", dish)
  } catch (err) {
    error.value = (err instanceof Error ? err.message : "") || "Не удалось создать блюдо."
  } finally {
    saving.value = false
  }
}

function openInlineReplace(ingredient: AIDraftPayloadIngredient) {
  inlineReplaceQuery.value = ingredient.name?.trim() || ""
  inlineReplaceResults.value = []
  inlineReplaceVisible.value = true
  if (inlineReplaceQuery.value) searchInlineReplace()
}

function closeInlineReplace() {
  clearTimeout(inlineReplaceTimer ?? undefined)
  inlineReplaceVisible.value = false
  inlineReplaceQuery.value = ""
  inlineReplaceResults.value = []
  inlineReplaceLoading.value = false
}

function searchInlineReplace() {
  clearTimeout(inlineReplaceTimer ?? undefined)
  const query = inlineReplaceQuery.value.trim()
  if (!query) {
    inlineReplaceResults.value = []
    inlineReplaceLoading.value = false
    return
  }
  inlineReplaceTimer = setTimeout(async () => {
    inlineReplaceLoading.value = true
    try {
      const data = await fetchIngredients({ search: query })
      inlineReplaceResults.value = data.results ?? []
    } catch {
      inlineReplaceResults.value = []
    } finally {
      inlineReplaceLoading.value = false
    }
  }, 300)
}

function selectInlineReplaceIngredient(index: number, ingredient: DTOIngredient) {
  setExistingIngredient(index, ingredient)
  closeInlineReplace()
}

function applySuggestion(index: number, ingredient: DTOIngredient) {
  setExistingIngredient(index, ingredient)
  const localId = payload.value.ingredients[index]?.localId
  if (localId) {
    const updated = { ...suggestionsMap.value }
    delete updated[localId]
    suggestionsMap.value = updated
  }
}

async function openCreatedDish() {
  const id = createdDishId.value
  if (!id) return
  openingCreatedDish.value = true
  error.value = ""
  try {
    const dish =
      createdDish.value !== null && createdDish.value.id === id
        ? createdDish.value
        : await fetchDish(id)
    emit("open-dish", dish)
    open.value = false
  } catch (err) {
    error.value = (err instanceof Error ? err.message : "") || "Не удалось открыть блюдо."
  } finally {
    openingCreatedDish.value = false
  }
}

onUnmounted(() => {
  stopPolling()
  clearFakeTimer()
  clearTimeout(ingredientSearchTimer ?? undefined)
  clearTimeout(inlineReplaceTimer ?? undefined)
})
</script>

<style>
@import "../../styles/detail-sheet.scss";
</style>

<style lang="scss" scoped>
.ai-draft {
  &__intro,
  &__notice {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-empty);
  }

  &__notice {
    &-head {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    &--error {
      border-color: var(--color-danger-soft);
      background: var(--color-danger-pale);
    }
  }

  &__title {
    margin: 0;
    color: var(--color-text);
    font-size: var(--font-md);
    font-weight: 700;
  }

  &__text {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--font-sm);
    line-height: 1.45;
    white-space: pre-line;
  }

  &__capabilities {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 4px 0 0;
    padding-left: 18px;
    color: var(--color-text-secondary);
    font-size: var(--font-sm);
    line-height: 1.4;
  }

  &__source {
    min-height: 180px;
    resize: vertical;
  }

  &__source-preview {
    max-height: 180px;
    overflow-y: auto;
    padding: 10px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xs);
    background: var(--color-surface);
    color: var(--color-text-secondary);
    font-size: var(--font-sm);
    line-height: 1.45;
    white-space: pre-wrap;
  }

  &__source-block {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__source-toggle {
    align-self: flex-start;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--color-mint);
    font-size: var(--font-sm);
    font-weight: 600;

    &:hover {
      color: var(--color-mint-hover);
    }
  }

  &__readonly {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__recipe {
    min-height: 120px;
    resize: vertical;
  }

  &__counter {
    align-self: flex-end;
    margin-top: -10px;
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
  }

  &__secondary-btn {
    align-self: flex-start;
    margin-top: 8px;
    padding: 9px 14px;
    border: 1px solid var(--color-danger-soft);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    color: var(--color-danger-dark);
    font-size: var(--font-sm);
    font-weight: 600;
  }

  &__search-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__progress {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 14px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-empty);
  }

  &__steps {
    display: flex;
    flex-direction: column;
    gap: 10px;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__step {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: var(--font-sm);
    transition:
      opacity var(--transition-fast),
      color var(--transition-fast);

    &--pending {
      opacity: 0.35;
      color: var(--color-text-secondary);
    }

    &--loading {
      opacity: 1;
      color: var(--color-text);
      font-weight: 600;
    }

    &--done {
      opacity: 0.55;
      color: var(--color-text-secondary);
    }

    &-icon {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &-dot {
      display: block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-border);
    }

    &-check {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--color-mint);
      color: var(--on-primary);
    }

    &-label {
      flex: 1;
    }
  }
}

.form {
  &__section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-top: 1px solid var(--color-border);
    padding-top: 16px;
  }
}

.ai-ingredient {
  &__badge {
    flex-shrink: 0;
    padding: 2px 6px;
    border-radius: var(--radius-xs);
    background: var(--color-info-bg);
    color: var(--color-info);
    font-size: var(--font-xs);
    font-weight: 600;

    &--new {
      background: var(--color-mint-alpha-10);
      color: var(--color-mint);
    }

    &--broken {
      background: var(--color-warning-bg);
      color: var(--color-warning);
      border: 1px solid var(--color-warning-border);
    }
  }
}

.ingredient-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-sm);

  &:last-of-type {
    border-bottom: none;
  }

  &--broken {
    background: var(--color-warning-bg);
    border-radius: var(--radius-xs);
    padding-left: 6px;
    padding-right: 6px;
    margin: 0 -6px;
  }

  &__name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    color: var(--color-text);
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__amount {
    flex-shrink: 0;
    color: var(--color-text-secondary);
    font-size: var(--font-sm);
    white-space: nowrap;
  }

  &__opt-label {
    flex-shrink: 0;
    padding: 1px 5px;
    border-radius: var(--radius-xs);
    background: var(--color-mint-alpha-12);
    color: var(--color-mint);
    font-size: var(--font-xs);
    font-weight: 500;
    white-space: nowrap;
  }

  &__edit,
  &__remove {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    border: none;
    border-radius: var(--radius-xs);
    background: none;
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.4;
    padding: 0;
    transition:
      opacity var(--transition-fast),
      color var(--transition-fast),
      background var(--transition-fast);
  }

  &__edit {
    &:hover {
      opacity: 1;
      color: var(--color-mint);
      background: var(--color-mint-alpha-10);
    }
  }

  &:hover &__edit {
    opacity: 1;
    color: var(--color-mint);
    background: var(--color-mint-alpha-10);
  }

  &__remove {
    &:hover {
      opacity: 1;
      background: var(--color-danger-pale);
      color: var(--color-danger);
    }
  }

  &__suggestions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    padding: 4px 0 8px;
    margin-top: -4px;

    &-label {
      font-size: var(--font-xs);
      color: var(--color-text-secondary);
      white-space: nowrap;
    }
  }

  &__suggestion-chip {
    padding: 2px 8px;
    border: 1px solid var(--color-mint-alpha-25);
    border-radius: var(--radius-xs);
    background: var(--color-mint-alpha-10);
    color: var(--color-mint);
    font-size: var(--font-xs);
    font-weight: 600;
    cursor: pointer;
    transition: background var(--transition-fast);

    &:hover {
      background: var(--color-mint-alpha-25);
    }
  }
}

.ingredient-amount {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-xs);
  background: var(--color-empty);

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__mode-badge {
    flex-shrink: 0;
    padding: 2px 8px;
    border-radius: var(--radius-xs);
    font-size: var(--font-xs);
    font-weight: 600;

    &--new {
      background: var(--color-mint-alpha-10);
      color: var(--color-mint);
    }
    &--found {
      background: var(--color-info-bg);
      color: var(--color-info);
    }
  }

  &__name {
    font-size: var(--font-sm);
    font-weight: 600;
    color: var(--color-text);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__link-btn {
    align-self: flex-start;
    padding: 6px 12px;
    border: 1.5px solid var(--color-mint-alpha-25);
    border-radius: var(--radius-xs);
    background: var(--color-mint-alpha-10);
    color: var(--color-mint);
    font-size: var(--font-xs);
    font-weight: 600;
    cursor: pointer;
    transition:
      background var(--transition-fast),
      border-color var(--transition-fast);

    &:hover {
      background: var(--color-mint-alpha-25);
      border-color: var(--color-mint);
    }
  }

  &__cancel-link {
    border: none;
    background: transparent;
    color: var(--color-text-secondary);
    font-size: var(--font-xs);
    font-weight: 600;
    cursor: pointer;
    padding: 2px 0;

    &:hover {
      color: var(--color-text);
    }
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__input {
    width: 120px;
  }
  &__select {
    width: min(160px, 100%);
  }

  &__unit {
    color: var(--color-text-secondary);
    font-size: var(--font-sm);
    white-space: nowrap;
  }

  &__taste-hint {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--font-sm);
    font-style: italic;
  }

  &__optional {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--color-text-secondary);
    font-size: var(--font-sm);
  }

  &__actions {
    display: flex;
    gap: 8px;
  }

  &__inline-replace {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xs);
    background: var(--color-surface);
  }

  &__replace-label {
    font-size: var(--font-xs);
    font-weight: 600;
    color: var(--color-text-secondary);
  }
}

.ingredient-search {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 4px;

  &__list {
    max-height: 160px;
    overflow-y: auto;
    list-style: none;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 9px 10px;
    font-size: var(--font-sm);
    cursor: pointer;

    & + & {
      border-top: 1px solid var(--color-border);
    }
    &:hover {
      background: var(--color-empty);
    }
  }

  &__unit,
  &__status {
    color: var(--color-text-secondary);
    font-size: var(--font-xs);
  }

  &__status {
    padding: 4px 0;
  }
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-xs);
  font-size: var(--font-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast);

  &--sm {
    background: var(--color-mint);
    color: var(--on-primary);

    &:hover {
      background: var(--color-mint-hover);
    }
  }

  &--ghost {
    background: transparent;
    color: var(--color-text-secondary);

    &:hover {
      background: var(--color-empty);
    }
  }
}

.dish-search {
  &__create {
    align-self: flex-start;
    padding: 8px 16px;
    border: 1.5px dashed var(--color-border);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-mint-hover);
    font-size: var(--font-sm);
    font-weight: 500;
    transition:
      background var(--transition-fast),
      border-color var(--transition-fast);

    &:hover {
      background: var(--color-empty);
      border-color: var(--color-mint);
    }
  }
}

.ingredient-add {
  &__toggle {
    align-self: flex-start;
    padding: 8px 16px;
    border: 1.5px dashed var(--color-border);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-text-secondary);
    font-size: var(--font-sm);
    font-weight: 500;
    cursor: pointer;
    transition:
      background var(--transition-fast),
      border-color var(--transition-fast),
      color var(--transition-fast);

    &:hover {
      background: var(--color-empty);
      border-color: var(--color-mint);
      color: var(--color-mint);
    }
  }
}

.detail {
  &__btn {
    &:disabled {
      opacity: 0.6;
      cursor: default;
    }
  }
}
</style>
