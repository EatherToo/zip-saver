<h1 align="center">
    用<code>javascript</code>将多个文件合并为一个zip文件
</h1>

[![NPM version]][npm-url]
[![Downloads per month]][downloads-url]

---

[online demo](https://codesandbox.io/p/devbox/2vxncf)
[example](https://github.com/EatherToo/zip-saver/blob/master/apps/example/src/App.vue)

#### 安装

```bash
npm install zip-saver
# 或者
yarn add zip-saver
# 或者
pnpm add zip-saver
```

#### 使用

```javascript
import { createZip, createZipStream } from 'zip-saver'

// 直接生成 ZIP 文件
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

// 通过流生成 ZIP 文件
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
  // 将 ZIP 流转换为 Blob
  const zipBlob = await new Response(zipStream).blob()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(zipBlob)
  a.download = 'example.zip'
  a.click()
}
```

#### API

1. `createZip(files: CreateZipOption[]): Promise<Blob>`

   - 参数: `CreateZipOption`
     `CreateZipOption` 可以是以下之一：
     - `File` 对象，可以直接使用原生的文件类型
     - 另一个是具有以下属性的对象：
       - `name`: `string` 文件名
       - `lastModified`: `number` 文件的最后修改时间
       - `blob`: `Blob` 文件的 Blob
   - 返回: `Promise<Blob>` ZIP 文件的 Blob

2. `createZipStream(): ZIPStreamController`
   - 返回: `ZIPStreamController`
     - `ZIPStreamController` 是一个具有以下属性的对象：
       - `readableStream`: `ReadableStream<Uint8Array>` ZIP 文件的可读流
       - `createFile(file: CreateFileOption): void`
         当你想向 ZIP 文件中添加文件时，必须先调用此函数
         - 参数: `CreateFileOption`
           - `CreateFileOption` 是一个具有以下属性的对象：
             - `filename`: `string` 文件名
             - `lastModified`: `number` 文件的最后修改时间
       - `enqueue(chunk: Uint8Array): void`
         必须调用此函数来添加文件块
         - 参数: `Uint8Array` 文件块的二进制数据
       - `closeFile(): void`
         当你完成添加文件后，必须调用此函数，否则会抛出错误
       - `closeZip(): void`
         当你完成添加所有文件后，调用此函数来关闭 ZIP 文件

#### 待办事项

- [ ] 加密压缩
- [ ] 压缩算法

[npm-url]: https://www.npmjs.com/package/zip-saver
[NPM version]: https://img.shields.io/npm/v/zip-saver?style=flat-square
[downloads-url]: https://www.npmjs.com/package/zip-saver
