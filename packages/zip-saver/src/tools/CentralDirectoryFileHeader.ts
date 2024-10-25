import BufferDataView from './BufferDataView'
import ZipSubFileHelper from './ZipSubFileHelper'

export default class CentraDirectoryFileHeader {
  static generateHeader(zipSubFileList: ZipSubFileHelper[]) {
    const textEncoder = new TextEncoder()
    const wholeLength = zipSubFileList.reduce((acc, zipSubFile) => {
      const nameBufferLength = textEncoder.encode(zipSubFile.name).length
      const commentBufferLength = textEncoder.encode(zipSubFile.comment).length
      // 46 is base centra directory file header length
      // TODO: extra fileds: now we don't support extra fileds
      return acc + 46 + nameBufferLength + commentBufferLength
    }, 0)

    const allFileDataLength = zipSubFileList.reduce((acc, zipSubFile) => {
      return acc + zipSubFile.getOffset()
    }, 0)

    // 22 is base end of central directory record length (EOCD)
    const bufferDataView = new BufferDataView(wholeLength + 22)
    for (
      let i = 0, offset = 0, entryOffset = 0;
      i < zipSubFileList.length;
      i++
    ) {
      const zipSubFile = zipSubFileList[i]
      // signature
      bufferDataView.setUint32(offset, 0x02014b50)
      // version made by
      bufferDataView.setUint16(offset + 4, 0x0014)
      // same with local file header
      bufferDataView.setBuffer(
        offset + 6,
        zipSubFile.localFileHeader.getUint8().slice(4, 30)
      )
      const commentBuffer = textEncoder.encode(zipSubFile.comment)
      // comment length
      bufferDataView.setUint16(offset + 32, commentBuffer.length)

      // local file header offset
      bufferDataView.setUint32(offset + 42, entryOffset)
      const filenameBuffer = textEncoder.encode(zipSubFile.name)
      // filename
      bufferDataView.setBuffer(offset + 46, filenameBuffer)
      // comment
      bufferDataView.setBuffer(
        offset + 46 + filenameBuffer.length,
        commentBuffer
      )

      offset += 46 + commentBuffer.length + filenameBuffer.length
      entryOffset += zipSubFile.getOffset()
    }

    // EOCD
    const eocdOffset = wholeLength
    // signature
    bufferDataView.setUint32(eocdOffset, 0x06054b50)
    // number of this disk
    bufferDataView.setUint16(eocdOffset + 4, 0)
    // number of the disk with the start of the central directory
    bufferDataView.setUint16(eocdOffset + 6, 0)
    // total number of entries in the central directory on this disk
    bufferDataView.setUint16(eocdOffset + 8, zipSubFileList.length)
    // total number of entries in the central directory
    bufferDataView.setUint16(eocdOffset + 10, zipSubFileList.length)
    // size of the central directory
    bufferDataView.setUint32(eocdOffset + 12, wholeLength)
    // offset of start of central directory with respect to the starting disk number
    bufferDataView.setUint32(eocdOffset + 16, allFileDataLength)
    //TODO: .ZIP file comment length

    return bufferDataView.getUint8()
  }
}
