<script setup lang="ts">
import { onMounted, ref } from 'vue';
import aboutHtml from '../../about.md';

const appVersion = __APP_VERSION__;
const content = ref(aboutHtml);
const mainTitle = ref('Product Showcase');

onMounted(async () => {
    try {
        let setupResponse = await fetch(`${import.meta.env.BASE_URL}setup.local.json`);
        const isJson = (response: Response) => response.headers.get('content-type')?.includes('application/json');

        if (!setupResponse.ok || !isJson(setupResponse)) {
            setupResponse = await fetch(`${import.meta.env.BASE_URL}setup.json`);
        }

        if (setupResponse.ok) {
            const setupConfig = await setupResponse.json();
            mainTitle.value = setupConfig.title || 'Product Showcase';
        }
    } catch (e) {
        console.error(e);
    }
});
</script>

<template>
  <div class="p-4 max-w-4xl mx-auto">
    <header class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold"><a :href="'/'">{{ mainTitle }}</a></h1>
      <a :href="'/about.html'">About</a>
    </header>

    <article class="prose lg:prose-xl" v-html="content"></article>

    <footer class="mt-8 pt-8 border-t text-center text-gray-500">
      <p>
        <strong>Facet Filter Page</strong>. Source code on <a href="https://github.com/Kugeleis/facet-filter-page" class="text-primary underline">GitHub</a>.
        Version {{ appVersion }}
      </p>
    </footer>
  </div>
</template>
