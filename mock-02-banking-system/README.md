# Mock 2: Banking System (90 min)

Start a 90-minute timer and implement a `BankingSystem` class. Do not use external libraries. Each level extends the previous one, so do not rewrite code from earlier levels.

> Every operation below is a **method of `BankingSystem`**, called on an instance (`bank.create_account(...)`). The examples are written without the `bank.` prefix only to keep them short. Each scenario starts with a fresh instance.
>
> Every method receives a `timestamp` as its first argument. Timestamps are integers and calls are guaranteed to have **non-decreasing** timestamps. All amounts are positive integers.

## Starter skeleton

```js
class BankingSystem {
  constructor() { /* ... */ }
  create_account(timestamp, accountId) { /* ... */ }
  deposit(timestamp, accountId, amount) { /* ... */ }
  transfer(timestamp, sourceId, targetId, amount) { /* ... */ }
}
```

(Python / TypeScript / Java: same methods, your naming convention. Return `None`/`null` where the statement says "nothing".)

## Level 1: Accounts, deposits and transfers

- `create_account(timestamp, account_id) -> bool`: Creates a new account with balance 0. Returns `True` if created, `False` if an account with that id already exists.
- `deposit(timestamp, account_id, amount) -> int | None`: Adds `amount` to the account. Returns the **new balance**, or `None` if the account does not exist.
- `transfer(timestamp, source_id, target_id, amount) -> int | None`: Moves `amount` from source to target. Returns the **source balance after the transfer**. Returns `None` if either account does not exist, if both ids are the same, or if the source has insufficient funds.

```
create_account(1, "acc1")            -> True
create_account(2, "acc2")            -> True
create_account(3, "acc1")            -> False
deposit(4, "acc1", 1000)             -> 1000
deposit(5, "acc3", 500)              -> None
transfer(6, "acc1", "acc2", 300)     -> 700
transfer(7, "acc1", "acc1", 100)     -> None
transfer(8, "acc1", "acc2", 900)     -> None
deposit(9, "acc2", 50)               -> 350
```

## Level 2: Ranking

- `top_spenders(timestamp, n) -> list[str]`: Returns the top `n` accounts ranked by **total outgoing amount** (money that left the account through transfers; deposits and incoming transfers do not count). Format: `"<account_id>(<total_outgoing>)"`. Sort by total outgoing **descending**; ties are broken by `account_id` **ascending** (lexicographic). Accounts with 0 outgoing are included. If there are fewer than `n` accounts, return all of them.

```
(continuing the previous example)
top_spenders(10, 3)                  -> ["acc1(300)", "acc2(0)"]
top_spenders(11, 1)                  -> ["acc1(300)"]
transfer(12, "acc2", "acc1", 300)    -> 50
top_spenders(13, 2)                  -> ["acc1(300)", "acc2(300)"]
```

## Level 3: Scheduled payments

- `schedule_payment(timestamp, account_id, amount, delay) -> str | None`: Schedules a payment (a withdrawal) from the account, to be processed at time `timestamp + delay`. Returns a unique id: `"payment1"`, `"payment2"`, ... (a global counter, in creation order), or `None` if the account does not exist. Funds are **not** reserved when scheduling.
- `cancel_payment(timestamp, account_id, payment_id) -> bool`: Cancels a pending payment. Returns `True` if the payment exists, belongs to that account, and is still pending (not processed, not cancelled). Returns `False` otherwise.

Processing rules:

- Before executing **any** method (including the ones from earlier levels), the system first processes all pending payments whose due time is `<=` the current `timestamp`, ordered by due time, then by creation order.
- A payment is processed by withdrawing `amount` from the account if the balance is sufficient. If not, the payment is **skipped** (it fails silently and is not retried).
- Processed payments count as outgoing amount for `top_spenders`.
- A payment due at exactly the call's timestamp is processed **before** that call. So a cancel issued at the due time returns `False`.

```
create_account(1, "a")                   -> True
deposit(2, "a", 500)                     -> 500
schedule_payment(3, "a", 200, 10)        -> "payment1"   # due 13
schedule_payment(4, "a", 400, 5)         -> "payment2"   # due 9
schedule_payment(5, "a", 50, 20)         -> "payment3"   # due 25
cancel_payment(6, "a", "payment3")       -> True
cancel_payment(7, "a", "payment3")       -> False
deposit(10, "a", 100)                    -> 200          # payment2 processed first: 500-400=100, then +100
top_spenders(14, 1)                      -> ["a(600)"]   # payment1 processed at 13: 200-200=0
schedule_payment(15, "a", 100, 1)        -> "payment4"   # due 16
deposit(16, "a", 50)                     -> 50           # payment4 skipped (balance 0), then +50
top_spenders(17, 1)                      -> ["a(600)"]
```

## Level 4: History and merging

- `get_balance(timestamp, account_id, time_at) -> int | None`: Returns the balance the account had at time `time_at` (`time_at <= timestamp`), reflecting all operations with timestamp `<= time_at`, including payments whose **due time** is `<= time_at`. Returns `None` if the account did not exist at `time_at`.
- `merge_accounts(timestamp, account_id_1, account_id_2) -> bool`: Merges `account_id_2` into `account_id_1`. Returns `False` if the ids are equal or either account does not exist. Otherwise:
  - The balance of account 2 is added to account 1.
  - The outgoing total of account 2 is added to the outgoing total of account 1.
  - Pending payments of account 2 now belong to account 1 (same payment ids).
  - Account 2 stops existing from `timestamp` onward (its id can be created again later as a new, empty account). Its **past** balances remain queryable with `get_balance`.

```
create_account(1, "x")               -> True
create_account(2, "y")               -> True
deposit(3, "x", 100)                 -> 100
deposit(4, "y", 50)                  -> 50
get_balance(5, "x", 3)               -> 100
get_balance(5, "x", 2)               -> 0
get_balance(5, "y", 3)               -> 0
get_balance(5, "z", 3)               -> None
merge_accounts(6, "x", "y")          -> True
get_balance(7, "x", 5)               -> 100
get_balance(7, "x", 6)               -> 150
get_balance(7, "y", 5)               -> 50
get_balance(7, "y", 6)               -> None
merge_accounts(8, "x", "y")          -> False
```

## Submission notes (fill in after the attempt)

- Levels reached:
- Time spent per level:
- Where I got stuck:
- Edge cases I missed:
