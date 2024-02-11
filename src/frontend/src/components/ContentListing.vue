<script setup lang="ts">
import { ref } from 'vue'
import { useDebounceFn, useIntersectionObserver } from '@vueuse/core'

const el = ref<HTMLElement | null>(null)
const intersectionEl = ref<HTMLElement | null>(null)
const data = ref([1, 2, 3, 4, 5, 6])

const isFetching = ref(false)

function wait(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

const fetchNewContent = useDebounceFn(async () => {
  console.log('Touches bottom')
  isFetching.value = true
  await wait(5000)
  const newVal = Array.from(new Array(5)).map(() => Math.random())
  data.value.push(...newVal)
  isFetching.value = false
}, 500)

const { isActive, pause, resume } = useIntersectionObserver(intersectionEl, ([{ isIntersecting, boundingClientRect, rootBounds, intersectionRatio }]) => {
  if (isIntersecting && !isFetching.value) {
    fetchNewContent()
    console.log('Element on view', boundingClientRect, rootBounds, intersectionRatio)
  }
}, {
  immediate: false,
})
</script>

<template>
  <div ref="el" class="flex flex-col gap-2 p-4 w-300px h-300px m-auto overflow-y-scroll bg-gray-500/5 rounded">
    <div v-for="item in data" :key="item" class="h-15 bg-gray-500/5 rounded p-3">
      {{ item }}
    </div>
  </div>
  <span v-if="isFetching">Loading...</span>
  <div ref="intersectionEl"></div>
  <button v-if="isActive" @click="pause" class="px-4 py-2 bg-slate-800 text-yellow-200 rounded-md">Stop</button>
  <button v-else @click="resume" class="px-4 py-2 bg-slate-800 text-yellow-200 rounded-md">Load more</button>
</template>