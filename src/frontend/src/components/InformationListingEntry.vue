<template>
    <div class="flex rounded-md shadow-lg px-4 py-3 items-center gap-2">
        <input type="checkbox" class="checkbox checkbox-md" />
        <div class="flex flex-col gap-2">
            <h2 class="truncate max-w-4xl">Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero recusandae, id
                officiis debitis accusantium ab asperiores? Fugit eum aut maxime.</h2>
            <div class="flex justify-between items-center">
                <div class="flex gap-2">
                    <span v-for="(_, index) in 5" :key="index" class="badge badge-outline py-2">Keyword</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="px-5 py-1 border border-black">Collection</span>
                    <span>20/12/2024</span>
                </div>
            </div>
        </div>
        <div class="grow"></div>
        <div class="flex items-start">
            <figure><img class="h-40 w-36 object-cover"
                    src="https://daisyui.com/images/stock/photo-1635805737707-575885ab0820.jpg" alt="Movie" /></figure>
            <button>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
            </button>
        </div>
    </div>
</template>