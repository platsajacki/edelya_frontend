<template>
  <DevState label="DishSearch: с ИИ">
    <DishSearch can-create-ai />
  </DevState>
  <DevState label="DishSearch: без ИИ">
    <DishSearch />
  </DevState>
  <DevState label="DishPickerSheet" row>
    <DevButton @click="opened = 'picker'">Открыть</DevButton>
  </DevState>
  <DishPickerSheet :model-value="opened === 'picker'" @update:model-value="closeOn" />
</template>

<script lang="ts" setup>
import DevState from "../DevState.vue"
import DevButton from "../DevButton.vue"
import { useDevOpened } from "../useDevOpened"
import DishSearch from "@/components/forms/DishSearch.vue"
import DishPickerSheet from "@/components/DishPickerSheet.vue"

const { opened, closeOn } = useDevOpened()
</script>
