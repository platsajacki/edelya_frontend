<template>
  <DevState label="SortButton" row>
    <SortButton label="По названию" />
  </DevState>
  <DevState label="FabButton" row>
    <span class="dev-controls__fab">
      <FabButton aria-label="Создать"><IconPlus /></FabButton>
    </span>
  </DevState>
  <DevState label="CategoryChips: «Все» / категория выбрана">
    <CategoryChips v-model="allCategory" :categories="categories" />
    <CategoryChips v-model="pickedCategory" :categories="categories" />
  </DevState>
  <DevState label="MultiDayPicker: выбраны дни">
    <MultiDayPicker v-model="days" :start-date="fixtures.isoDate()" />
  </DevState>
  <DevState label="DateInput: заполнен">
    <DateInput v-model="date" />
  </DevState>
  <DevState label="Toast" row>
    <DevButton @click="toast = 'Список покупок создан'">Показать</DevButton>
    <Toast :message="toast" @dismiss="toast = ''" />
  </DevState>
</template>

<script lang="ts" setup>
import { ref } from "vue"
import DevState from "../DevState.vue"
import DevButton from "../DevButton.vue"
import { fixtures } from "../fixtures"
import SortButton from "@/components/SortButton.vue"
import FabButton from "@/components/FabButton.vue"
import IconPlus from "@/components/icons/IconPlus.vue"
import CategoryChips from "@/components/CategoryChips.vue"
import MultiDayPicker from "@/components/forms/MultiDayPicker.vue"
import DateInput from "@/components/forms/DateInput.vue"
import Toast from "@/components/Toast.vue"

const categories = [
  { id: 1, name: "Супы" },
  { id: 2, name: "Завтраки" },
  { id: 3, name: "Салаты" },
  { id: 4, name: "Десерты" },
]
const allCategory = ref<number | null>(null)
const pickedCategory = ref<number | null>(2)
const days = ref([fixtures.isoDate(1), fixtures.isoDate(3)])
const date = ref(fixtures.isoDate())
const toast = ref("")
</script>

<style lang="scss" scoped>
.dev-controls__fab :deep(.fab) {
  position: static;
}
</style>
