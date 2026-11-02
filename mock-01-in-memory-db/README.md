# Mock 1: In-Memory Database (90 min)

Start a 90-minute timer and implement an `InMemoryDB` class. Do not use external libraries. Each level extends the previous one, so do not rewrite code from earlier levels.

## Level 1: Basic operations

Records are identified by a `key`. Each record holds multiple `field → value` pairs (all strings).

- `set(key, field, value) -> None`: Sets `field` of the record `key` to `value`. If the record or field does not exist, create it. If it exists, overwrite it.
- `get(key, field) -> str | None`: Returns the value of `field` in the record `key`, or `None` if the record or field does not exist.
- `delete(key, field) -> bool`: Removes `field` from the record `key`. Returns `True` if the field existed and was removed, `False` otherwise.

```
set("A", "B", "E")      -> None
set("A", "C", "F")      -> None
get("A", "B")           -> "E"
get("A", "D")           -> None
delete("A", "B")        -> True
delete("A", "B")        -> False
get("A", "B")           -> None
```

## Level 2: Scanning

- `scan(key) -> list[str]`: Returns all fields of record `key` as strings `"<field>(<value>)"`, sorted **lexicographically by field name**. Returns an empty list if the record does not exist or has no fields.
- `scan_by_prefix(key, prefix) -> list[str]`: Same as `scan`, but only includes fields whose name starts with `prefix`. Same ordering rules.

```
set("A", "BC", "E")
set("A", "BD", "F")
set("A", "C", "G")
scan("A")                    -> ["BC(E)", "BD(F)", "C(G)"]
scan_by_prefix("A", "B")     -> ["BC(E)", "BD(F)"]
scan_by_prefix("A", "Z")     -> []
scan("X")                    -> []
```

## Level 3: Timestamps and TTL

Add timestamped versions of all previous operations. `timestamp` is an integer, and calls are guaranteed to have non-decreasing timestamps.

- `set_at(key, field, value, timestamp) -> None`
- `set_at_with_ttl(key, field, value, timestamp, ttl) -> None`: The field is available during the interval `[timestamp, timestamp + ttl)` and is treated as non-existent outside it.
- `delete_at(key, field, timestamp) -> bool`
- `get_at(key, field, timestamp) -> str | None`
- `scan_at(key, timestamp) -> list[str]`
- `scan_by_prefix_at(key, prefix, timestamp) -> list[str]`

Rules:

- A field set without TTL never expires.
- Setting a field again replaces both its value **and its TTL** (a plain `set_at` removes any previous TTL).
- Expired fields behave as if they were deleted: `delete_at` returns `False` for them, and they do not appear in scans.

```
set_at_with_ttl("A", "B", "C", 1, 10)
get_at("A", "B", 10)         -> "C"
get_at("A", "B", 11)         -> None
set_at("A", "D", "X", 5)
set_at_with_ttl("A", "D", "Y", 6, 2)
scan_at("A", 7)              -> ["B(C)", "D(Y)"]
scan_at("A", 8)              -> ["B(C)"]
```

## Level 4: Backup and restore

- `backup(timestamp) -> int`: Saves a snapshot of the database at `timestamp`. Returns the number of **non-empty records** (records with at least one non-expired field) in the snapshot. For each field, the snapshot stores its value and **remaining** TTL.
- `restore(timestamp, timestamp_to_restore) -> None`: Restores the database to the state of the **latest backup made at or before `timestamp_to_restore`**. Expiry times are recalculated: each restored field with remaining TTL `r` expires at `timestamp + r`, where `timestamp` is the time of the restore call. Fields without TTL remain permanent. Anything set after that backup is discarded. Assume a valid backup always exists.

```
set_at_with_ttl("A", "B", "C", 1, 10)    # expires at 11
set_at("A", "D", "E", 2)
backup(5)                                # -> 1  (remaining TTL of B is 6)
set_at("A", "D", "Z", 6)
delete_at("A", "B", 7)                   # -> True
restore(20, 5)                           # state of backup(5); B expires at 20 + 6 = 26
get_at("A", "B", 25)                     -> "C"
get_at("A", "B", 26)                     -> None
get_at("A", "D", 26)                     -> "E"
```

## Submission notes (fill in after the attempt)

- Levels reached:
- Time spent per level:
- Where I got stuck:
- Edge cases I missed:
