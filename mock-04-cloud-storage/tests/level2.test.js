const { CloudStorage } = require('./load')

describe('Level 2: searching and copying', () => {
  let storage
  beforeEach(() => { storage = new CloudStorage() })

  test('README example', () => {
    expect(storage.add_file('/a/x.log', 30)).toBe(true)
    expect(storage.add_file('/a/y.log', 50)).toBe(true)
    expect(storage.add_file('/a/z.log', 50)).toBe(true)
    expect(storage.add_file('/b/q.log', 99)).toBe(true)
    expect(storage.get_n_largest('/a/', 2)).toEqual(['/a/y.log(50)', '/a/z.log(50)'])
    expect(storage.get_n_largest('/', 10)).toEqual([
      '/b/q.log(99)', '/a/y.log(50)', '/a/z.log(50)', '/a/x.log(30)',
    ])
    expect(storage.get_n_largest('/c/', 3)).toEqual([])
    expect(storage.copy_file('/a/x.log', '/b/x.log')).toBe(true)
    expect(storage.copy_file('/a/x.log', '/b/x.log')).toBe(false)
    expect(storage.copy_file('/nope', '/b/n')).toBe(false)
    expect(storage.get_n_largest('/b/', 5)).toEqual(['/b/q.log(99)', '/b/x.log(30)'])
  })

  describe('get_n_largest', () => {
    test('ties on size are broken by name ascending', () => {
      storage.add_file('/b', 10)
      storage.add_file('/c', 10)
      storage.add_file('/a', 10)
      expect(storage.get_n_largest('/', 3)).toEqual(['/a(10)', '/b(10)', '/c(10)'])
    })

    test('size wins over name', () => {
      storage.add_file('/a', 5)
      storage.add_file('/z', 50)
      expect(storage.get_n_largest('/', 2)).toEqual(['/z(50)', '/a(5)'])
    })

    test('uses startsWith, not includes', () => {
      storage.add_file('/x/b', 1)
      storage.add_file('/b/x', 2)
      expect(storage.get_n_largest('/b', 5)).toEqual(['/b/x(2)'])
    })

    test('returns fewer items when there are fewer matches than n', () => {
      storage.add_file('/a', 1)
      expect(storage.get_n_largest('/', 100)).toEqual(['/a(1)'])
    })

    test('numeric sizes are compared as numbers, not as text', () => {
      storage.add_file('/a', 9)
      storage.add_file('/b', 10)
      storage.add_file('/c', 100)
      expect(storage.get_n_largest('/', 3)).toEqual(['/c(100)', '/b(10)', '/a(9)'])
    })

    test('deleted files are not returned', () => {
      storage.add_file('/a', 1)
      storage.add_file('/b', 2)
      storage.delete_file('/b')
      expect(storage.get_n_largest('/', 5)).toEqual(['/a(1)'])
    })

    test('an empty storage returns an empty list', () => {
      expect(storage.get_n_largest('/', 5)).toEqual([])
    })
  })

  describe('copy_file', () => {
    test('the copy has the same size and the source stays', () => {
      storage.add_file('/a', 42)
      expect(storage.copy_file('/a', '/b')).toBe(true)
      expect(storage.get_file_size('/a')).toBe(42)
      expect(storage.get_file_size('/b')).toBe(42)
    })

    test('does not overwrite an existing destination', () => {
      storage.add_file('/a', 1)
      storage.add_file('/b', 2)
      expect(storage.copy_file('/a', '/b')).toBe(false)
      expect(storage.get_file_size('/b')).toBe(2)
    })

    test('copy and source are independent after copying', () => {
      storage.add_file('/a', 7)
      storage.copy_file('/a', '/b')
      storage.delete_file('/a')
      expect(storage.get_file_size('/b')).toBe(7)
    })

    test('a file can be copied into a name that was deleted before', () => {
      storage.add_file('/a', 7)
      storage.add_file('/b', 1)
      storage.delete_file('/b')
      expect(storage.copy_file('/a', '/b')).toBe(true)
      expect(storage.get_file_size('/b')).toBe(7)
    })
  })
})
