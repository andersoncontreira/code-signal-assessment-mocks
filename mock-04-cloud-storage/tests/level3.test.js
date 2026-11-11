const { CloudStorage } = require('./load')

describe('Level 3: users and capacity', () => {
  let storage
  beforeEach(() => { storage = new CloudStorage() })

  test('README example', () => {
    expect(storage.add_user('u1', 100)).toBe(true)
    expect(storage.add_user('u1', 50)).toBe(false)
    expect(storage.add_user('admin', 10)).toBe(false)
    expect(storage.add_file_by('u1', '/u1/a', 40)).toBe(60)
    expect(storage.add_file_by('u1', '/u1/b', 70)).toBeNull()
    expect(storage.add_file_by('ghost', '/g/a', 1)).toBeNull()
    expect(storage.add_file_by('u1', '/u1/a', 1)).toBeNull()
    expect(storage.add_file_by('u1', '/u1/c', 60)).toBe(0)
    expect(storage.copy_file('/u1/a', '/u1/a2')).toBe(false)
    expect(storage.delete_file('/u1/c')).toBe(60)
    expect(storage.copy_file('/u1/a', '/u1/a2')).toBe(true)
    expect(storage.add_file_by('u1', '/u1/d', 20)).toBe(0)
    expect(storage.update_capacity('u1', 50)).toBe(2)
    expect(storage.update_capacity('ghost', 5)).toBeNull()
    expect(storage.get_file_size('/u1/a')).toBeNull()
    expect(storage.get_file_size('/u1/d')).toBe(20)
    expect(storage.add_file('/admin/big', 10000)).toBe(true)
    expect(storage.copy_file('/admin/big', '/admin/big2')).toBe(true)
  })

  describe('add_user / add_file_by', () => {
    test('a file that exactly fills the remaining capacity is accepted', () => {
      storage.add_user('u', 10)
      expect(storage.add_file_by('u', '/a', 10)).toBe(0)
    })

    test('a rejected add_file_by changes nothing', () => {
      storage.add_user('u', 10)
      expect(storage.add_file_by('u', '/a', 11)).toBeNull()
      expect(storage.get_file_size('/a')).toBeNull()
      expect(storage.add_file_by('u', '/b', 10)).toBe(0)
    })

    test('a name used by admin cannot be reused by a user', () => {
      storage.add_file('/a', 5)
      storage.add_user('u', 100)
      expect(storage.add_file_by('u', '/a', 1)).toBeNull()
    })

    test('"admin" is not a regular user for add_file_by', () => {
      expect(storage.add_file_by('admin', '/a', 1)).toBeNull()
    })

    test('capacity is tracked per user', () => {
      storage.add_user('u1', 10)
      storage.add_user('u2', 10)
      expect(storage.add_file_by('u1', '/a', 10)).toBe(0)
      expect(storage.add_file_by('u2', '/b', 4)).toBe(6)
    })
  })

  describe('delete_file and copy_file with owners', () => {
    test('deleting a file frees the owner capacity', () => {
      storage.add_user('u', 10)
      storage.add_file_by('u', '/a', 7)
      expect(storage.delete_file('/a')).toBe(7)
      expect(storage.add_file_by('u', '/b', 10)).toBe(0)
    })

    test('a copy is owned by the owner of the source and uses capacity', () => {
      storage.add_user('u', 10)
      storage.add_file_by('u', '/a', 4)
      expect(storage.copy_file('/a', '/b')).toBe(true)
      expect(storage.add_file_by('u', '/c', 2)).toBe(0)
      expect(storage.add_file_by('u', '/d', 1)).toBeNull()
    })

    test('a failed copy does not create the file or consume capacity', () => {
      storage.add_user('u', 10)
      storage.add_file_by('u', '/a', 6)
      expect(storage.copy_file('/a', '/b')).toBe(false)
      expect(storage.get_file_size('/b')).toBeNull()
      expect(storage.add_file_by('u', '/c', 4)).toBe(0)
    })

    test('deleting a copy frees the capacity again', () => {
      storage.add_user('u', 10)
      storage.add_file_by('u', '/a', 5)
      storage.copy_file('/a', '/b')
      storage.delete_file('/b')
      expect(storage.add_file_by('u', '/c', 5)).toBe(0)
    })

    test('copying a user file does not need free space from admin', () => {
      storage.add_file('/a', 1000)
      expect(storage.copy_file('/a', '/b')).toBe(true)
    })
  })

  describe('update_capacity', () => {
    test('removes the largest files first', () => {
      storage.add_user('u', 100)
      storage.add_file_by('u', '/small', 10)
      storage.add_file_by('u', '/big', 60)
      storage.add_file_by('u', '/mid', 30)
      expect(storage.update_capacity('u', 50)).toBe(1)
      expect(storage.get_file_size('/big')).toBeNull()
      expect(storage.get_file_size('/mid')).toBe(30)
      expect(storage.get_file_size('/small')).toBe(10)
    })

    test('ties on size are removed by name ascending', () => {
      storage.add_user('u', 100)
      storage.add_file_by('u', '/b', 40)
      storage.add_file_by('u', '/a', 40)
      expect(storage.update_capacity('u', 50)).toBe(1)
      expect(storage.get_file_size('/a')).toBeNull()
      expect(storage.get_file_size('/b')).toBe(40)
    })

    test('removes nothing when the usage already fits', () => {
      storage.add_user('u', 100)
      storage.add_file_by('u', '/a', 40)
      expect(storage.update_capacity('u', 40)).toBe(0)
      expect(storage.get_file_size('/a')).toBe(40)
    })

    test('a larger capacity gives more room', () => {
      storage.add_user('u', 10)
      storage.add_file_by('u', '/a', 10)
      expect(storage.update_capacity('u', 30)).toBe(0)
      expect(storage.add_file_by('u', '/b', 20)).toBe(0)
    })

    test('only removes files of that user', () => {
      storage.add_user('u1', 100)
      storage.add_user('u2', 100)
      storage.add_file_by('u1', '/a', 60)
      storage.add_file_by('u2', '/b', 90)
      storage.add_file('/admin', 500)
      storage.update_capacity('u1', 10)
      expect(storage.get_file_size('/a')).toBeNull()
      expect(storage.get_file_size('/b')).toBe(90)
      expect(storage.get_file_size('/admin')).toBe(500)
    })

    test('capacity accounting is correct after a removal', () => {
      storage.add_user('u', 100)
      storage.add_file_by('u', '/a', 70)
      storage.add_file_by('u', '/b', 20)
      storage.update_capacity('u', 50)
      expect(storage.add_file_by('u', '/c', 30)).toBe(0)
    })
  })
})
