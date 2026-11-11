const { CloudStorage } = require('./load')

describe('Level 1: basic file operations', () => {
  let storage
  beforeEach(() => { storage = new CloudStorage() })

  test('README example', () => {
    expect(storage.add_file('/docs/a.txt', 100)).toBe(true)
    expect(storage.add_file('/docs/a.txt', 50)).toBe(false)
    expect(storage.get_file_size('/docs/a.txt')).toBe(100)
    expect(storage.get_file_size('/docs/z.txt')).toBeNull()
    expect(storage.delete_file('/docs/a.txt')).toBe(100)
    expect(storage.delete_file('/docs/a.txt')).toBeNull()
    expect(storage.get_file_size('/docs/a.txt')).toBeNull()
  })

  test('a rejected add_file does not change the existing size', () => {
    storage.add_file('/a', 10)
    storage.add_file('/a', 99)
    expect(storage.get_file_size('/a')).toBe(10)
  })

  test('a deleted name can be added again with a new size', () => {
    storage.add_file('/a', 10)
    storage.delete_file('/a')
    expect(storage.add_file('/a', 25)).toBe(true)
    expect(storage.get_file_size('/a')).toBe(25)
  })

  test('files are independent of each other', () => {
    storage.add_file('/a', 1)
    storage.add_file('/b', 2)
    storage.delete_file('/a')
    expect(storage.get_file_size('/b')).toBe(2)
  })

  test('operations on a missing file do not throw', () => {
    expect(storage.get_file_size('/nope')).toBeNull()
    expect(storage.delete_file('/nope')).toBeNull()
  })
})
