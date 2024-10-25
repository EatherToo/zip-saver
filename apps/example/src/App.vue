<script setup lang="ts">
import { createZip, createZipStream } from 'zip-stream'
const handleFileChange = async (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (!files) return

  const fileList = Array.from(files)

  const zipBlob = await createZip(fileList)

  const a = document.createElement('a')
  a.href = URL.createObjectURL(zipBlob)
  a.download = 'example.zip'
  a.click()
}

const fetchTwoFileToZip = async () => {
  const {
    readableStream: zipStream,
    createFile,
    enqueue,
    closeFile,
    closeZip,
  } = createZipStream()

  const fileList = [
    { name: 'vite.svg', url: '/vite.svg' },
    { name: 'README.md', url: '/README.md' },
  ]

  for (const { name, url } of fileList) {
    const response = await fetch(url)
    const respStream = response.body
    if (!respStream) continue
    createFile({
      filename: name,
      lastModified: new Date().getTime(),
    })
    const reader = respStream.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        closeFile()
        break
      }
      enqueue(value)
    }
  }
  closeZip()
  // zip stream to blob
  const zipBlob = await new Response(zipStream).blob()
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
    <input multiple type="file" @change="handleFileChange" />
    <button @click="fetchTwoFileToZip">Fetch two files and zip</button>
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
