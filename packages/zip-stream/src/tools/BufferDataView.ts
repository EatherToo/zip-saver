export default class BufferDataView {
  private bufferArray: Uint8Array
  private dataView: DataView

  constructor(length: number) {
    this.bufferArray = new Uint8Array(length)
    this.dataView = new DataView(this.bufferArray.buffer)
  }

  getBuffer() {
    return this.bufferArray.buffer
  }

  getUint8() {
    return this.bufferArray
  }

  setUint16(offset: number, value: number) {
    this.dataView.setUint16(offset, value, true)
  }

  setUint32(offset: number, value: number) {
    this.dataView.setUint32(offset, value, true)
  }

  setUint8(offset: number, value: number) {
    this.dataView.setUint8(offset, value)
  }

  setBuffer(offset: number, buffer: Uint8Array) {
    this.bufferArray.set(buffer, offset)
  }
}
