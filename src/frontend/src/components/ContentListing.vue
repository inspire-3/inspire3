<script setup lang="ts">
import { ref } from 'vue'
import InfiniteLoader from './InfiniteLoader.vue';
import InformationListingEntry from './InformationListingEntry.vue';

const data = ref([1, 2, 3, 4, 5, 6])

function wait(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

const fetchNewContent = async (done: () => void) => {
  await wait(5000)
  const newVal = Array.from(new Array(5)).map(() => Math.random())
  data.value.push(...newVal)
  done()
}
</script>

<template>
  <InfiniteLoader @bottom-reached="fetchNewContent" class="flex flex-col gap-2">
    <InformationListingEntry v-for="item in data" :key="item">
      {{ item }}
    </InformationListingEntry>
  </InfiniteLoader>
</template>