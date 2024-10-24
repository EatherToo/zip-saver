import CentraDirectoryFileHeader from './tools/CentralDirectoryFileHeader'
import ZipSubFileHelper from './tools/ZipSubFileHelper'

export interface FileLike extends Blob {
  name: string
  lastModified: number
}

export async function createZip(fileList: FileLike[]) {
  const zipSubFileList = await Promise.all(
    fileList.map((file) => {
      return new ZipSubFileHelper({
        name: file.name,
        originBlob: file,
        lastModified: file.lastModified,
      }).factory()
    })
  )
  const centralDirectoryFileHeader =
    CentraDirectoryFileHeader.generateHeader(zipSubFileList)

  const zipFileSize =
    zipSubFileList.reduce((acc, zipSubFile) => {
      return acc + zipSubFile.getOffset()
    }, 0) + centralDirectoryFileHeader.byteLength

  const bufferList = zipSubFileList.map((zipSubFile) => {
    return zipSubFile.getUint8()
  })

  // uint8Array to blob
  const zipBlob = new Blob([...bufferList, centralDirectoryFileHeader], {
    type: 'application/zip',
  })

  return zipBlob
}
