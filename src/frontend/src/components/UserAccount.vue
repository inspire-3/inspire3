<template>
    <button v-if="!isSignedIn" class="btn btn-slim btn-primary text-white !h-[36px]">
        Sign In
    </button>

    <div v-if="isSignedIn"
        class="dropdown dropdown-end pr-2" :class="[componentName]">
        <div tabindex="0" role="button" class="flex avatar pl-4 pr-0">
            <div class="w-6 lg:w-10 rounded-full">
                <img src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
            </div>
        </div>
        <ul tabindex="0" class="dropdown-content z-[1] menu mt-2 p-2 shadow bg-base-100 rounded-box w-52">
            <li><a>Item 1</a></li>
            <li><a>Item 2</a></li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export const componentName = 'UserAccount'
export default defineComponent({
    name: componentName,
})
</script>

<script lang="ts" setup>
import { ref } from 'vue'
const isSignedIn = ref(false)
// code

</script>
