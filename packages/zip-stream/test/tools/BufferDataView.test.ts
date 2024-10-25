import BufferDataView from '../../src/tools/BufferDataView'

describe('BufferDataView', () => {
  let bufferDataView: BufferDataView

  beforeEach(() => {
    bufferDataView = new BufferDataView(10) // 初始化一个长度为10的缓冲区
  })

  test('should create an instance with correct length', () => {
    expect(bufferDataView.getBuffer().byteLength).toBe(10)
  })

  test('should set and get uint8 correctly', () => {
    const value = 123
    const offset = 2
    bufferDataView.setUint8(offset, value)
    expect(new Uint8Array(bufferDataView.getBuffer())[offset]).toBe(value)
  })

  test('should set and get uint16 correctly', () => {
    const value = 32767 // 最大无符号16位整数
    const offset = 2
    bufferDataView.setUint16(offset, value)
    const view = new DataView(bufferDataView.getBuffer())
    expect(view.getUint16(offset, true)).toBe(value)
  })

  test('should set and get uint32 correctly', () => {
    const value = 4294967295 // 最大无符号32位整数
    const offset = 2
    bufferDataView.setUint32(offset, value)
    const view = new DataView(bufferDataView.getBuffer())
    expect(view.getUint32(offset, true)).toBe(value)
  })

  test('should set buffer correctly', () => {
    const buffer = new Uint8Array([1, 2, 3, 4])
    const offset = 2
    bufferDataView.setBuffer(offset, buffer)
    const resultBuffer = new Uint8Array(bufferDataView.getBuffer())
    expect(resultBuffer.slice(offset, offset + buffer.length)).toEqual(buffer)
  })
})
