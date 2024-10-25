<h1 align="center">
    Easy way to merge multiple files into one zip file in <code>javascript</code>
</h1>

[![NPM version]][npm-url]

[English] [Chinese](README_cn.md)

---

[online demo](https://codesandbox.io/p/devbox/2vxncf)
[example](https://github.com/EatherToo/zip-saver/blob/master/apps/example/src/App.vue)

#### install

```bash
npm install zip-saver
# or
yarn add zip-saver
# or
pnpm add zip-saver
```

#### usage

```javascript
  import { createZip, createZipStream } from 'zip-saver'


  // generate zip file directly
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

  // genetate zip file by stream
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
```

#### apis

1. `createZip(files: CreateZipOption[]): Promise<Blob>`

   - param: `CreateZipOption`
     `CreateZipOption` can be one of the following:
     - one is just a `File` object, you can pass the `File` object directly
     - the other is an object with the following properties:
       - `name`: `string` the name of the file
       - `lastModified`: `number` the last modified time of the file
       - `blob`: `Blob` the blob of the file;
   - return: `Promise<Blob>` the zip file blob

2. `createZipStream(): ZIPStreamController`
   - return: `ZIPStreamController`
     - `ZIPStreamController` is an object with the following properties:
       - `readableStream`: `ReadableStream<Uint8Array>` the readable stream of the zip file
       - `createFile(file: CreateFileOption): void`
         when you want to add a file to the zip, you must call this function first
         - param: `CreateFileOption`
           - `CreateFileOption` is an object with the following properties:
             - `filename`: `string` the name of the file
             - `lastModified`: `number` the last modified time of the file
       - `enqueue(chunk: Uint8Array): void`
         you must call this function to add the chunk of the file
         - param: `Uint8Array` the chunk of the file
       - `closeFile(): void`
         when you finish adding the file, you must call this function, otherwise a error will be thrown
       - `closeZip(): void`
         when you finish adding all the files, call this function to close the zip file

#### TODOs

- [ ] encrypt compress
- [ ] compression algorithm

[npm-url]: https://www.npmjs.com/package/zip-saver
[NPM version]: https://img.shields.io/npm/v/zip-saver?style=flat-square
[downloads-url]: https://www.npmjs.com/package/zip-saver
