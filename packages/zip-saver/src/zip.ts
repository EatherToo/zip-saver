import CentraDirectoryFileHeader from './tools/CentralDirectoryFileHeader'
import ZipSubFileHelper from './tools/ZipSubFileHelper'

export interface FileLike extends Blob {
  name: string
  lastModified: number
}

export interface BlobEntry {
  name: string
  lastModified: number
  blob: Blob
}

export type CreateZipOption = FileLike | BlobEntry

const isBlobEntry = (file: CreateZipOption): file is BlobEntry => {
  return (file as BlobEntry).blob !== undefined
}

export async function createZip(fileList: CreateZipOption[]) {
  const zipSubFileList = await Promise.all(
    fileList.map((file) => {
      return new ZipSubFileHelper({
        name: file.name,
        originBlob: isBlobEntry(file) ? file.blob : file,
        lastModified: file.lastModified,
      }).factory()
    })
  )
  const centralDirectoryFileHeader =
    CentraDirectoryFileHeader.generateHeader(zipSubFileList)

  const bufferList = zipSubFileList.map((zipSubFile) => {
    return zipSubFile.getUint8()
  })

  // uint8Array to blob
  const zipBlob = new Blob([...bufferList, centralDirectoryFileHeader], {
    type: 'application/zip',
  })

  return zipBlob
}

export type CreateFileOption = {
  filename: string
  lastModified: number
}
export type ZIPStreamController = {
  readableStream: ReadableStream
  controller: ReadableStreamDefaultController
  createFile(file: CreateFileOption): void
  enqueue(data: Uint8Array): void
  closeFile(): void
  closeZip(): void
}

export function createZipStream() {
  let activeFile: ZipSubFileHelper | undefined = undefined
  const fileStack: ZipSubFileHelper[] = []
  let controller: ReadableStreamDefaultController | undefined = undefined

  function createFile(file: CreateFileOption) {
    if (activeFile) {
      throw new Error('a file is in progress')
    }

    const zipSubFile = new ZipSubFileHelper({
      name: file.filename,
      lastModified: file.lastModified,
    })
    activeFile = zipSubFile
    if (!controller) {
      throw new Error('ReadableStream initialization failed')
    }

    controller.enqueue(zipSubFile.localFileHeader.getUint8())
  }

  function enqueue(data: Uint8Array) {
    if (!activeFile) {
      throw new Error('no file is in progress')
    }

    activeFile.append(data)
    if (!controller) {
      throw new Error('ReadableStream initialization failed')
    }
    controller.enqueue(data)
  }

  function closeFile() {
    if (!activeFile) {
      throw new Error('no file is in progress')
    }
    const dataDescriptor = activeFile.closeStream()

    if (!controller) {
      throw new Error('ReadableStream initialization failed')
    }
    controller.enqueue(dataDescriptor.getUint8())
    fileStack.push(activeFile)
    activeFile = undefined
  }

  function closeZip() {
    if (activeFile) {
      throw new Error('a file is in progress')
    }

    const centralDirectoryFileHeader =
      CentraDirectoryFileHeader.generateHeader(fileStack)
    if (!controller) {
      throw new Error('ReadableStream initialization failed')
    }
    controller.enqueue(centralDirectoryFileHeader)
    controller.close()
  }

  const readableStream = new ReadableStream({
    start(_controller) {
      controller = _controller
    },
  })
  return {
    readableStream,
    controller,
    createFile,
    enqueue,
    closeFile,
    closeZip,
  }
}
