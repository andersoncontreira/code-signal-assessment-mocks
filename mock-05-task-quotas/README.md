# Mock 5: Task Manager with Users and Quotas (4 levels, 90 min)

Start a 90-minute timer and implement a `TaskManager` class. Do not use external libraries. Each level extends the previous one, so do not rewrite code from earlier levels.

> Every operation below is a **method of `TaskManager`**, called on an instance (`manager.add_task(...)`). The examples are written without the `manager.` prefix only to keep them short. Each scenario starts with a **fresh instance**.
>
> There are no timestamps in this mock. Task ids and user ids are strings. Priorities are integers (higher = more urgent).

## Starter skeleton

```js
class TaskManager {
  constructor() { /* ... */ }
  add_task(taskId, priority) { /* ... */ }
  get_task(taskId) { /* ... */ }
  delete_task(taskId) { /* ... */ }
}
```

(Python / TypeScript / Java: same methods, your naming convention. Return `None`/`null` where the statement says "nothing".)

## Level 1: Basic task operations

- `add_task(task_id, priority) -> bool`: Adds a task with status `"pending"`. Returns `True` if added, `False` if a task with that id already exists.
- `get_task(task_id) -> str | None`: Returns `"<task_id>(<priority>)"`, or `None` if the task does not exist.
- `delete_task(task_id) -> bool`: Deletes the task. Returns `True` if it existed, `False` otherwise.

```
add_task("t1", 5)        -> True
add_task("t1", 9)        -> False
get_task("t1")           -> "t1(5)"
get_task("zz")           -> None
delete_task("t1")        -> True
delete_task("t1")        -> False
get_task("t1")           -> None
```

## Level 2: Status and ordering

- `get_status(task_id) -> str | None`: Returns `"pending"` or `"done"`, or `None` if the task does not exist.
- `complete_task(task_id) -> bool`: Changes a **pending** task to `"done"` and returns `True`. Returns `False` if the task does not exist or is already done.
- `list_pending(n) -> list[str]`: Returns up to `n` pending tasks formatted as `"<task_id>(<priority>)"`. Sort by priority **descending**; ties are broken by `task_id` **ascending** (lexicographic).

```
add_task("b", 5)         -> True
add_task("a", 5)         -> True
add_task("c", 9)         -> True
add_task("d", 1)         -> True
list_pending(3)          -> ["c(9)", "a(5)", "b(5)"]
get_status("c")          -> "pending"
complete_task("c")       -> True
get_status("c")          -> "done"
complete_task("c")       -> False
complete_task("zz")      -> False
list_pending(10)         -> ["a(5)", "b(5)", "d(1)"]
delete_task("a")         -> True
list_pending(10)         -> ["b(5)", "d(1)"]
get_status("a")          -> None
```

## Level 3: Users and quotas

Tasks can be assigned to users. Each user has a **quota**: the maximum number of **active** tasks they can hold at the same time. A task is active when it is assigned to the user **and** pending. A task belongs to at most one user at a time.

- `add_user(user_id, quota) -> bool`: Creates a user. Returns `False` if the user already exists or if `quota` is not a positive integer (zero and negative quotas are not allowed).
- `assign_task(user_id, task_id) -> bool`: Assigns an existing, pending, **unassigned** task to the user. Returns `False` if the user or task does not exist, the task is not pending, the task is already assigned to someone, or the user already holds `quota` active tasks.
- `get_user_tasks(user_id) -> list[str] | None`: Returns the user's active tasks as `"<task_id>(<priority>)"`, sorted like `list_pending` (priority descending, then id ascending). Returns `None` if the user does not exist.
- `update_quota(user_id, new_quota) -> bool`: Sets a new quota. Returns `False` if the user does not exist, `new_quota` is not positive, or `new_quota` is **lower than the number of active tasks** the user holds. Otherwise returns `True`.

Changes to earlier methods:

- `complete_task` and `delete_task` **free the user's slot**: the task stops counting against the quota and is no longer part of the user's active tasks. A completed task stays `"done"` and is unassigned.

```
add_task("t1", 5)                -> True
add_task("t2", 9)                -> True
add_task("t3", 1)                -> True
add_task("t4", 7)                -> True
add_user("u1", 2)                -> True
add_user("u1", 3)                -> False
add_user("u0", 0)                -> False
add_user("u-1", -1)              -> False
assign_task("u1", "t1")          -> True
assign_task("u1", "t2")          -> True
assign_task("u1", "t3")          -> False      # quota reached
assign_task("ghost", "t3")       -> False
assign_task("u1", "nope")        -> False
get_user_tasks("u1")             -> ["t2(9)", "t1(5)"]
complete_task("t2")              -> True
assign_task("u1", "t3")          -> True
get_user_tasks("u1")             -> ["t1(5)", "t3(1)"]
delete_task("t1")                -> True
assign_task("u1", "t4")          -> True
get_user_tasks("u1")             -> ["t4(7)", "t3(1)"]
update_quota("u1", 1)            -> False      # 2 active tasks
update_quota("u1", 0)            -> False
update_quota("u1", 5)            -> True
add_user("u2", 1)                -> True
assign_task("u2", "t4")          -> False      # already assigned to u1
get_user_tasks("zz")             -> None
```

## Level 4: Transfers and rankings

- `transfer_task(from_user, to_user, task_id) -> bool`: Moves an active task from one user to another. Returns `False` if either user does not exist, both users are the same, the task is not an active task of `from_user`, or `to_user` already holds `quota` active tasks.
- `remove_user(user_id) -> int | None`: Removes the user. Their active tasks become **unassigned** but stay pending. Returns the number of tasks released, or `None` if the user does not exist. The user id can be created again later as a new user.
- `busiest_users(n) -> list[str]`: Returns up to `n` users formatted as `"<user_id>(<active_count>)"`, sorted by active task count **descending**; ties are broken by `user_id` **ascending**. Users with 0 active tasks are included.

```
add_task("a", 3)                         -> True
add_task("b", 8)                         -> True
add_task("c", 5)                         -> True
add_task("d", 5)                         -> True
add_user("x", 2)                         -> True
add_user("y", 1)                         -> True
assign_task("x", "a")                    -> True
assign_task("x", "b")                    -> True
assign_task("y", "c")                    -> True
transfer_task("x", "y", "b")             -> False      # y is at quota
transfer_task("x", "y", "a")             -> False      # y is at quota
complete_task("c")                       -> True       # frees y's slot
transfer_task("x", "y", "a")             -> True
transfer_task("x", "x", "b")             -> False
transfer_task("x", "y", "a")             -> False      # "a" now belongs to y
busiest_users(5)                         -> ["x(1)", "y(1)"]
remove_user("x")                         -> 1          # "b" is released
list_pending(10)                         -> ["b(8)", "d(5)", "a(3)"]
assign_task("y", "b")                    -> False      # y is at quota
remove_user("x")                         -> None
busiest_users(5)                         -> ["y(1)"]
add_user("x", 3)                         -> True
assign_task("x", "b")                    -> True
busiest_users(5)                         -> ["x(1)", "y(1)"]
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

- What does a task store? (priority, status, owner.)
- Where does the "active count" of a user live, and who updates it? A task can leave a user in several ways: completed, deleted, transferred, or its owner removed.
- Which method is the single source of truth for "can this user take one more task?"

## Submission notes (fill in after the attempt)

- Levels reached:
- Time spent per level:
- Where I got stuck:
- Edge cases I missed:
