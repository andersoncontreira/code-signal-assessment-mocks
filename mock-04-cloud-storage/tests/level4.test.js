const { CloudStorage } = require('./load')

describe('Level 4: compression', () => {
  let storage
  beforeEach(() => { storage = new CloudStorage() })

  test('README example', () => {
    expect(storage.add_user('u', 100)).toBe(true)
    expect(storage.add_file_by('u', '/f/a.txt', 60)).toBe(40)
    expect(storage.compress_file('u', '/f/a.txt')).toBe(70)
    expect(storage.get_file_size('/f/a.txt')).toBeNull()
    expect(storage.get_file_size('/f/a.txt.COMPRESSED')).toBe(30)
    expect(storage.compress_file('u', '/f/a.txt.COMPRESSED')).toBeNull()
    expect(storage.copy_file('/f/a.txt.COMPRESSED', '/f/c')).toBe(false)
    expect(storage.add_file_by('u', '/f/b.txt', 65)).toBe(5)
    expect(storage.decompress_file('u', '/f/a.txt.COMPRESSED')).toBeNull()
    expect(storage.delete_file('/f/b.txt')).toBe(65)
    expect(storage.decompress_file('u', '/f/a.txt.COMPRESSED')).toBe(40)
    expect(storage.get_file_size('/f/a.txt')).toBe(60)
    expect(storage.compress_file('other', '/f/a.txt')).toBeNull()
    expect(storage.add_user('v', 100)).toBe(true)
    expect(storage.compress_file('v', '/f/a.txt')).toBeNull()
    expect(storage.add_file_by('u', '/f/odd', 5)).toBe(35)
    expect(storage.compress_file('u', '/f/odd')).toBe(38)
    expect(storage.get_file_size('/f/odd.COMPRESSED')).toBe(2)
  })

  describe('compress_file', () => {
    test('size is floor(size / 2)', () => {
      storage.add_user('u', 100)
      storage.add_file_by('u', '/a', 7)
      storage.compress_file('u', '/a')
      expect(storage.get_file_size('/a.COMPRESSED')).toBe(3)
    })

    test('fails for a missing file', () => {
      storage.add_user('u', 100)
      expect(storage.compress_file('u', '/nope')).toBeNull()
    })

    test('fails when the compressed name already exists', () => {
      storage.add_user('u', 100)
      storage.add_file_by('u', '/a', 10)
      storage.add_file_by('u', '/a.COMPRESSED', 4)
      expect(storage.compress_file('u', '/a')).toBeNull()
      expect(storage.get_file_size('/a')).toBe(10)
    })

    test('admin is not a regular user', () => {
      storage.add_file('/x', 10)
      expect(storage.compress_file('admin', '/x')).toBeNull()
      expect(storage.get_file_size('/x')).toBe(10)
    })

    test('a failed compress changes nothing', () => {
      storage.add_user('u', 100)
      storage.add_user('v', 100)
      storage.add_file_by('u', '/a', 10)
      storage.compress_file('v', '/a')
      expect(storage.get_file_size('/a')).toBe(10)
      expect(storage.get_file_size('/a.COMPRESSED')).toBeNull()
    })

    test('frees capacity by the amount saved', () => {
      storage.add_user('u', 100)
      storage.add_file_by('u', '/a', 80)
      storage.compress_file('u', '/a')
      expect(storage.add_file_by('u', '/b', 60)).toBe(0)
    })
  })

  describe('decompress_file', () => {
    test('restores the ORIGINAL size, not double the compressed size', () => {
      storage.add_user('u', 100)
      storage.add_file_by('u', '/a', 7)
      storage.compress_file('u', '/a')
      storage.decompress_file('u', '/a.COMPRESSED')
      expect(storage.get_file_size('/a')).toBe(7)
      expect(storage.get_file_size('/a.COMPRESSED')).toBeNull()
    })

    test('fails when the name does not end with .COMPRESSED', () => {
      storage.add_user('u', 100)
      storage.add_file_by('u', '/a', 10)
      expect(storage.decompress_file('u', '/a')).toBeNull()
    })

    test('fails when the original name already exists', () => {
      storage.add_user('u', 100)
      storage.add_file_by('u', '/a', 10)
      storage.compress_file('u', '/a')
      storage.add_file_by('u', '/a', 3)
      expect(storage.decompress_file('u', '/a.COMPRESSED')).toBeNull()
      expect(storage.get_file_size('/a.COMPRESSED')).toBe(5)
    })

    test('fails when the file belongs to another user', () => {
      storage.add_user('u', 100)
      storage.add_user('v', 100)
      storage.add_file_by('u', '/a', 10)
      storage.compress_file('u', '/a')
      expect(storage.decompress_file('v', '/a.COMPRESSED')).toBeNull()
    })

    test('succeeds when the restored file exactly fills the capacity', () => {
      storage.add_user('u', 60)
      storage.add_file_by('u', '/a', 60)
      storage.compress_file('u', '/a')
      expect(storage.decompress_file('u', '/a.COMPRESSED')).toBe(0)
    })

    test('a missing file or user returns null', () => {
      storage.add_user('u', 100)
      expect(storage.decompress_file('u', '/nope.COMPRESSED')).toBeNull()
      expect(storage.decompress_file('ghost', '/nope.COMPRESSED')).toBeNull()
    })
  })

  describe('interaction with the previous levels', () => {
    test('compressed files cannot be copied', () => {
      storage.add_user('u', 100)
      storage.add_file_by('u', '/a', 10)
      storage.compress_file('u', '/a')
      expect(storage.copy_file('/a.COMPRESSED', '/b')).toBe(false)
    })

    test('deleting a compressed file returns its compressed size and frees capacity', () => {
      storage.add_user('u', 100)
      storage.add_file_by('u', '/a', 60)
      storage.compress_file('u', '/a')
      expect(storage.delete_file('/a.COMPRESSED')).toBe(30)
      expect(storage.add_file_by('u', '/z', 100)).toBe(0)
    })

    test('compressed files show up in get_n_largest with the compressed size', () => {
      storage.add_user('u', 100)
      storage.add_file_by('u', '/a', 60)
      storage.add_file_by('u', '/b', 40)
      storage.compress_file('u', '/a')
      expect(storage.get_n_largest('/', 5)).toEqual(['/b(40)', '/a.COMPRESSED(30)'])
    })

    test('update_capacity can remove compressed files using their compressed size', () => {
      storage.add_user('u', 100)
      storage.add_file_by('u', '/a', 60)
      storage.compress_file('u', '/a')
      storage.add_file_by('u', '/b', 50)
      expect(storage.update_capacity('u', 40)).toBe(1)
      expect(storage.get_file_size('/b')).toBeNull()
      expect(storage.get_file_size('/a.COMPRESSED')).toBe(30)
    })
  })
})
