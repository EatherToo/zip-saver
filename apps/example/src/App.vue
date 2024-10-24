<script setup lang="ts">
import { createZip } from 'zip-stream'
const handleFileChange = async (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (!files) return
  const zipBlob = await createZip([files[0]])

  const a = document.createElement('a')
  a.href = URL.createObjectURL(zipBlob)
  a.download = 'example.zip'
  a.click()
}
</script>

<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
    <input type="file" @change="handleFileChange" />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
