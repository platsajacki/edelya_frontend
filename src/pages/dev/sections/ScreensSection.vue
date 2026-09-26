<template>
  <DevState label="Main: главный экран планировщика">
    <Main :user="user" />
  </DevState>
  <DevState label="WeekGrid: текущая неделя">
    <WeekGrid :week-data="weeks[0]" />
  </DevState>
  <DevState label="WeekGrid: прошедшие дни (неделя сдвинута, сегодня — 4-й день)">
    <WeekGrid :week-data="midWeek" />
  </DevState>
  <DevState label="IngredientsView: личные / общие, поиск, категории">
    <IngredientsView />
  </DevState>
</template>

<script lang="ts" setup>
import DevState from "../DevState.vue"
import { midWeek, weeks } from "../fixtures"
import Main from "@/components/Main.vue"
import WeekGrid from "@/components/WeekGrid.vue"
import IngredientsView from "@/components/ingredients/IngredientsView.vue"

const user = { id: 1, first_name: "Dev", username: "dev" }
</script>
