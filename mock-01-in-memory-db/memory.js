let _memory = {
    data: {},
    set(key, field, value) {
        // console.log('this', this)
        // if (!this.data){
        //     this.data = {}
        // }

        if (this?.data[key]) {
            this.data[key][field] = value
        } else {
            this.data[key] = {
                [field]: value
            }
        }
    },
    get(key, field) {
        // console.log('this', this)
        return this.data[key] ? this.data[key][field] : null
    },
    delete (key, field)  {
        if (this.data[key] && this.data[key][field]) {
            delete this.data[key][field]
            return true
        } else {
            return false
        }
    },
    scan (key, prefix) {
        if (this.data[key]) {
            let sorted = Object.keys(this.data[key]).sort()
            console.log('scan sorted', sorted)
            let filtered = sorted.filter(field => {
                return !(prefix && !field.startsWith(prefix));
            })
            return filtered.map(field =>
            {
                if (this.data[key][field]) {
                    if (this.data[key][field]?.value) {
                        return `${field}(${this.data[key][field].value})`
                    } else {
                        return `${field}(${this.data[key][field]})`
                    }
                } else {
                    return `${field}`
                }
            })
        } else {
            return []
        }
    },
    //// Add timestamped versions of all previous operations. `timestamp` is an integer, and calls are guaranteed to have non-decreasing timestamps.
    // //
    // // - `set_at(key, field, value, timestamp) -> None`
    // // - `set_at_with_ttl(key, field, value, timestamp, ttl) -> None`: The field is available during the interval `[timestamp, timestamp + ttl)` and is treated as non-existent outside it.
    set_at(key, field, value, timestamp, ttl) {
        this.set(key, field, value)
        let itemValue = this.data[key][field]
        let newItem = {
            value: itemValue,
            timestamp: timestamp
        }
        if (ttl) {
            newItem["ttl"] = ttl
        }
        this.data[key][field] = newItem
        // console.log(`set_at`, key, field, newItem)
        // console.log(this.data)

    },
    set_at_with_ttl(key, field, value, timestamp, ttl) {
        this.set_at(key, field, value, timestamp, ttl)
    },
    delete_at(key, field, timestamp) {

    },
    // get_at(key, field, timestamp) -> str | None`
    get_at(key, field, timestamp) {
        let item = this.get(key, field)
        // console.log('get_at item', item)
        let itemDuration = item["timestamp"] + (item["ttl"] - 1)
        if (item["timestamp"] === timestamp || timestamp <= itemDuration) {
            return item[`value`]
        } else {
            return null
        }
    },
    scan_at(key, timestamp, prefix) {
        // console.log(`key & time`, key, timestamp)
        if (this.data[key]) {
            let sorted = Object.keys(this.data[key]).sort()
            // console.log('scan sorted', sorted)
            let filtered = sorted.filter(field => {
                return !(prefix && !field.startsWith(prefix));
            })
            // let filtered = sorted
            // console.log('scan_at filtered', filtered)
            let result = filtered.map(field =>
            {
                let itemDuration = this.data[key][field]?.timestamp + (this.data[key][field]?.ttl - 1)
                // console.log(`field`, field)
                // console.log('itemDuration', itemDuration)
                if (this.data[key][field] && this.data[key][field]?.timestamp && this.data[key][field]?.timestamp === timestamp || timestamp <= itemDuration) {
                    if (this.data[key][field]?.value) {
                        return `${field}(${this.data[key][field].value})`
                    } else {
                        return `${field}(${this.data[key][field]})`
                    }
                } else {
                    return null
                }
            })

            return result.filter(value => value !== null)
        } else {
            return []
        }
        // // scan_at("A", 7)              -> ["B(C)", "D(Y)"]
        // // scan_at("A", 8)              -> ["B(C)"]
    },
    scan_by_prefix_at(key, prefix, timestamp) {

    }
}

let set = (key, field, value) => {
    _memory.set(key, field, value)
}
let get = (key, field) => {
    return _memory.get(key, field)
}

let del = (key, field)  => {
    return _memory.delete(key, field)
}

let set_at = (key, field, value, timestamp) => {
    _memory.set_at(key, field, value, timestamp)
}
let set_at_with_ttl = (key, field, value, timestamp, ttl) => {
    _memory.set_at_with_ttl(key, field, value, timestamp, ttl)
}

let delete_at = (key, field, timestamp) => {
    _memory.delete_at(key, field, timestamp)
}
let get_at = (key, field, timestamp) => {
    return _memory.get_at(key, field, timestamp)
}
let scan_at = (key, timestamp) => {
    return _memory.scan_at(key, timestamp)
}
let scan_by_prefix_at = (key, prefix, timestamp) => {
    return _memory.scan_by_prefix_at(key, prefix, timestamp)
}



//
// ## Level 1: Basic operations
//
// Records are identified by a `key`. Each record holds multiple `field → value` pairs (all strings).
//
// - `set(key, field, value) -> None`: Sets `field` of the record `key` to `value`. If the record or field does not exist, create it. If it exists, overwrite it.
// - `get(key, field) -> str | None`: Returns the value of `field` in the record `key`, or `None` if the record or field does not exist.
// - `delete(key, field) -> bool`: Removes `field` from the record `key`. Returns `True` if the field existed and was removed, `False` otherwise.
//
//     ```
// set("A", "B", "E")      -> None
// set("A", "C", "F")      -> None
// get("A", "B")           -> "E"
// get("A", "D")           -> None
// delete("A", "B")        -> True
// delete("A", "B")        -> False
// get("A", "B")           -> None
// ```

console.log('level 1')
console.log(set("A", "B", "E") == null)
console.log(set("A", "C", "F") == null)
console.log(get("A", "B") == "E")
console.log(get("A", "D") == null)
console.log(del("A", "B") == true)
console.log(del("A", "B") == false)
console.log(get("A", "B") == null)


// console.log(_memory);
console.log('conclusao 30m')
console.log(''.padEnd(100, `-`))

//
// ## Level 2: Scanning
//
// - `scan(key) -> list[str]`: Returns all fields of record `key` as strings `"<field>(<value>)"`, sorted **lexicographically by field name**. Returns an empty list if the record does not exist or has no fields.
// - `scan_by_prefix(key, prefix) -> list[str]`: Same as `scan`, but only includes fields whose name starts with `prefix`. Same ordering rules.
//
//     ```
// set("A", "BC", "E")
// set("A", "BD", "F")
// set("A", "C", "G")
// scan("A")                    -> ["BC(E)", "BD(F)", "C(G)"]
// scan_by_prefix("A", "B")     -> ["BC(E)", "BD(F)"]
// scan_by_prefix("A", "Z")     -> []
// scan("X")                    -> []
// ```

let scan = (key) => {
    return _memory.scan(key)
}

let scan_by_prefix = (key, prefix) => {
    return _memory.scan(key, prefix)
}

console.log('level 2')
console.log(set("A", "BC", "E") == null)
console.log(set("A", "BD", "F") == null)
console.log(set("A", "C", "G") == null)
//console.log(scan("A"))
//console.log(["BC(E)", "BD(F)", "C(G)"])
// console.log(scan_by_prefix("A", "B"))
console.log(JSON.stringify(scan("A")) === JSON.stringify(['BC(E)', 'BD(F)', 'C(G)']))
console.log(JSON.stringify(scan_by_prefix("A", "B")) === JSON.stringify(['BC(E)', 'BD(F)']))
console.log(JSON.stringify(scan_by_prefix("A", "Z")) === JSON.stringify([]))
console.log(JSON.stringify(scan("X")) === JSON.stringify([]))
//scan_by_prefix("A", "B")     -> ["BC(E)", "BD(F)"]
// scan_by_prefix("A", "Z")     -> []
// scan("X")                    -> []

console.log('conclusao 1h')
console.log(''.padEnd(100, `-`))
//
// ## Level 3: Timestamps and TTL
//
// Add timestamped versions of all previous operations. `timestamp` is an integer, and calls are guaranteed to have non-decreasing timestamps.
//
// - `set_at(key, field, value, timestamp) -> None`
// - `set_at_with_ttl(key, field, value, timestamp, ttl) -> None`: The field is available during the interval `[timestamp, timestamp + ttl)` and is treated as non-existent outside it.
// - `delete_at(key, field, timestamp) -> bool`
// - `get_at(key, field, timestamp) -> str | None`
// - `scan_at(key, timestamp) -> list[str]`
// - `scan_by_prefix_at(key, prefix, timestamp) -> list[str]`
//
// Rules:
//
//     - A field set without TTL never expires.
// - Setting a field again replaces both its value **and its TTL** (a plain `set_at` removes any previous TTL).
// - Expired fields behave as if they were deleted: `delete_at` returns `False` for them, and they do not appear in scans.
//
//     ```
// set_at_with_ttl("A", "B", "C", 1, 10)
// get_at("A", "B", 10)         -> "C"
// get_at("A", "B", 11)         -> None
// set_at("A", "D", "X", 5)
// set_at_with_ttl("A", "D", "Y", 6, 2)
// scan_at("A", 7)              -> ["B(C)", "D(Y)"]
// scan_at("A", 8)              -> ["B(C)"]
// ```
console.log('level 3')
console.log(set_at_with_ttl("A", "B", "C", 1, 10) == null, `expected`, null)
console.log(get_at("A", "B", 10) === "C", `expected`, `C`)
console.log(get_at("A", "B", 11) == null, `expected`, null)
console.log(set_at("A", "D", "X", 5) == null,`expected`, null)
console.log(set_at_with_ttl("A", "D", "Y", 6, 2) == null,`expected`, null)
console.log(JSON.stringify(scan_at("A", 7))              === JSON.stringify(["B(C)", "D(Y)"]))
console.log(JSON.stringify(scan_at("A", 8))              === JSON.stringify(["B(C)"]))
//console.log(`====>`, scan_at("A", 8))

console.log('conclusao 1h45m')