# Mock 4: Cloud Storage (4 levels, 90 min)

Start a 90-minute timer and implement a `CloudStorage` class. Do not use external libraries. Each level extends the previous one, so do not rewrite code from earlier levels.

> Every operation below is a **method of `CloudStorage`**, called on an instance (`storage.add_file(...)`). The examples are written without the `storage.` prefix only to keep them short. Each scenario starts with a **fresh instance**.
>
> There are no timestamps in this mock. File names are full paths (strings such as `"/docs/a.txt"`). Sizes and capacities are positive integers.

## Starter skeleton

```js
class CloudStorage {
  constructor() { /* ... */ }
  add_file(name, size) { /* ... */ }
  get_file_size(name) { /* ... */ }
  delete_file(name) { /* ... */ }
}
```

(Python / TypeScript / Java: same methods, your naming convention. Return `None`/`null` where the statement says "nothing".)

## Level 1: Basic file operations

- `add_file(name, size) -> bool`: Adds a file. Returns `True` if added, `False` if a file with that name already exists.
- `get_file_size(name) -> int | None`: Returns the size of the file, or `None` if it does not exist.
- `delete_file(name) -> int | None`: Deletes the file and returns **its size**. Returns `None` if it does not exist.

```
add_file("/docs/a.txt", 100)     -> True
add_file("/docs/a.txt", 50)      -> False
get_file_size("/docs/a.txt")     -> 100
get_file_size("/docs/z.txt")     -> None
delete_file("/docs/a.txt")       -> 100
delete_file("/docs/a.txt")       -> None
get_file_size("/docs/a.txt")     -> None
```

## Level 2: Searching and copying

- `get_n_largest(prefix, n) -> list[str]`: Returns up to `n` files whose name **starts with** `prefix`, formatted as `"<name>(<size>)"`. Sort by size **descending**; ties are broken by name **ascending** (lexicographic). Returns an empty list if no file matches.
- `copy_file(name_from, name_to) -> bool`: Copies a file (same size) to a new name. Returns `False` if `name_from` does not exist or `name_to` already exists (no overwrite). Returns `True` otherwise.

```
add_file("/a/x.log", 30)                 -> True
add_file("/a/y.log", 50)                 -> True
add_file("/a/z.log", 50)                 -> True
add_file("/b/q.log", 99)                 -> True
get_n_largest("/a/", 2)                  -> ["/a/y.log(50)", "/a/z.log(50)"]
get_n_largest("/", 10)                   -> ["/b/q.log(99)", "/a/y.log(50)", "/a/z.log(50)", "/a/x.log(30)"]
get_n_largest("/c/", 3)                  -> []
copy_file("/a/x.log", "/b/x.log")        -> True
copy_file("/a/x.log", "/b/x.log")        -> False
copy_file("/nope", "/b/n")               -> False
get_n_largest("/b/", 5)                  -> ["/b/q.log(99)", "/b/x.log(30)"]
```

## Level 3: Users and capacity

Files added with `add_file` belong to the built-in user `"admin"`, which has **unlimited** capacity. Other users are created explicitly and have a capacity (the total size of the files they own).

- `add_user(user_id, capacity) -> bool`: Creates a user. Returns `False` if the user already exists. `"admin"` always exists, so creating it returns `False`.
- `add_file_by(user_id, name, size) -> int | None`: Adds a file owned by `user_id`. Returns the user's **remaining capacity** after adding. Returns `None` if the user does not exist (`"admin"` does not count as a regular user here), if the file name already exists, or if `size` is larger than the remaining capacity.
- `update_capacity(user_id, capacity) -> int | None`: Sets the user's new capacity. If the user's total size now exceeds it, delete the user's files, **largest first** (ties by name ascending), until the total fits. Returns the **number of files removed**. Returns `None` if the user does not exist.

Changes to earlier methods:

- `delete_file` frees capacity for the file's owner.
- `copy_file`: the copy has the **same owner** as the source and counts against that owner's capacity. If the owner does not have enough remaining capacity, return `False` and do nothing. `admin` is unlimited.

```
add_user("u1", 100)                      -> True
add_user("u1", 50)                       -> False
add_user("admin", 10)                    -> False
add_file_by("u1", "/u1/a", 40)           -> 60
add_file_by("u1", "/u1/b", 70)           -> None
add_file_by("ghost", "/g/a", 1)          -> None
add_file_by("u1", "/u1/a", 1)            -> None
add_file_by("u1", "/u1/c", 60)           -> 0
copy_file("/u1/a", "/u1/a2")             -> False
delete_file("/u1/c")                     -> 60
copy_file("/u1/a", "/u1/a2")             -> True
add_file_by("u1", "/u1/d", 20)           -> 0
update_capacity("u1", 50)                -> 2          # removes /u1/a (40), then /u1/a2 (40)
update_capacity("ghost", 5)              -> None
get_file_size("/u1/a")                   -> None
get_file_size("/u1/d")                   -> 20
add_file("/admin/big", 10000)            -> True
copy_file("/admin/big", "/admin/big2")   -> True
```

## Level 4: Compression

- `compress_file(user_id, name) -> int | None`: Compresses a file owned by `user_id`. The file is replaced by a file named `name + ".COMPRESSED"` with size `floor(size / 2)`, owned by the same user. Returns the user's **remaining capacity** after compressing. Returns `None` if the user does not exist, the file does not exist, the file is not owned by that user, the name already ends with `".COMPRESSED"`, or `name + ".COMPRESSED"` already exists.
- `decompress_file(user_id, name) -> int | None`: Reverses compression. `name` must end with `".COMPRESSED"`. The file is replaced by the file with the original name and its **original size** (not the halved one). Returns the user's remaining capacity after decompressing. Returns `None` if the user does not exist, the file does not exist, the file is not owned by that user, the name does not end with `".COMPRESSED"`, the original name already exists, or the user would exceed their capacity.

Additional rule: compressed files **cannot be copied** (`copy_file` returns `False`). Every other method treats compressed files like regular files (they show up in `get_n_largest`, can be deleted, and can be removed by `update_capacity` using their compressed size).

```
add_user("u", 100)                                 -> True
add_file_by("u", "/f/a.txt", 60)                   -> 40
compress_file("u", "/f/a.txt")                     -> 70        # size 30
get_file_size("/f/a.txt")                          -> None
get_file_size("/f/a.txt.COMPRESSED")               -> 30
compress_file("u", "/f/a.txt.COMPRESSED")          -> None
copy_file("/f/a.txt.COMPRESSED", "/f/c")           -> False
add_file_by("u", "/f/b.txt", 65)                   -> 5
decompress_file("u", "/f/a.txt.COMPRESSED")        -> None      # would need 95 - 30 + 60 = 125 > 100
delete_file("/f/b.txt")                            -> 65
decompress_file("u", "/f/a.txt.COMPRESSED")        -> 40
get_file_size("/f/a.txt")                          -> 60
compress_file("other", "/f/a.txt")                 -> None
add_user("v", 100)                                 -> True
compress_file("v", "/f/a.txt")                     -> None      # owned by "u"
add_file_by("u", "/f/odd", 5)                      -> 35
compress_file("u", "/f/odd")                       -> 38
get_file_size("/f/odd.COMPRESSED")                 -> 2         # floor(5 / 2)
```

## Time budget

| Level | Target |
|---|---|
| Level 1 | ~8 min |
| Level 2 | ~15 min |
| Level 3 | ~30 min |
| Level 4 | ~25 min |
| Buffer | ~10 min |

## Things to decide before coding

- What does one file store? (size, owner, and, by Level 4, the original size before compression.)
- Where does each user's `used` capacity live? Update it in **one** place when a file is added, deleted, copied, compressed or removed.
- Which method is the single source of truth for "free capacity"?

## Submission notes (fill in after the attempt)

- Levels reached:
- Time spent per level:
- Where I got stuck:
- Edge cases I missed:
