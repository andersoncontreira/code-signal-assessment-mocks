assert = require('node:assert')


class Record {
    constructor() {

    }
}

class InMemoryDB {
  constructor() { 
    this.data = new Map() 
  }

  tick() {

  }

  set(key, field, value) { 
    
    this.tick()

    let record = null;

    if (this.data.has(key)) {
        record = this.data.get(key)
        record[field] = value

    } else {
        record = {
            [field]: value
        }
    } 
    this.data.set(key, record)
    
  }

  get(key, field) { 
    console.log('get', key, field)
    if (this.data.has(key)) {
        let item = this.data.get(key)
        console.log('item',item)
        if (!item[field]) {
            return null;
        }
        return item[field]
    }
    return null;

  }
  
  delete(key, field) { 

    this.tick()


    let fieldValue = this.get(key, field)

    if (fieldValue) {
        let record = this.data.get(key)
        delete record[field]
        this.data.set(key, record)

        return true
    }

    return false
   }

//    `scan(key) -> list[str]`: Returns all fields of record `key` as strings `"<field>(<value>)"`, sorted **lexicographically by field name**. Returns an empty list if the record does not exist or has no fields.
   scan(key) {

    this.tick()

    if (this.data.has(key)) {
        let record = this.data.get(key)
       
        return this._scan_values(record)
    } else {
        return []
    }

   }

   _scan_values(record, prefix) {
        let values = Object.keys(record).filter(field => {
            return (prefix) ? new String(field).startsWith(prefix): true
        }).map(field => {
            return `${field}(${record[field]})`
        })

        console.log('values', values)
        return values
   }
//    `scan_by_prefix(key, prefix) -> list[str]`: Same as `scan`, but only includes fields whose name starts with `prefix`. Same ordering rules.
   scan_by_prefix(key, prefix) {
    
    this.tick()

    if (this.data.has(key)) {
        let record = this.data.get(key)

        return this._scan_values(record, prefix)
    } else {
        return []
    }
   }

}


// ## Level 1: Basic operations

// Records are identified by a `key`. Each record holds multiple `field → value` pairs (all strings).

// - `set(key, field, value) -> None`: Sets `field` of the record `key` to `value`. If the record or field does not exist, create it. If it exists, overwrite it.
// - `get(key, field) -> str | None`: Returns the value of `field` in the record `key`, or `None` if the record or field does not exist.
// - `delete(key, field) -> bool`: Removes `field` from the record `key`. Returns `True` if the field existed and was removed, `False` otherwise.

// ```
// set("A", "B", "E")      -> None
// set("A", "C", "F")      -> None
// get("A", "B")           -> "E"
// get("A", "D")           -> None
// delete("A", "B")        -> True
// delete("A", "B")        -> False
// get("A", "B")           -> None
// ```

//const memory1 = new InMemoryDB();
const scenario = (name, fn) => { fn(new InMemoryDB()); console.log('ok', name) }

scenario(`level 1`, db => {
    assert.equal(db.set("A", "B", "E"), null)
    assert.equal(db.set("A", "C", "F"), null)
    assert.equal(db.get("A", "B"), "E")
    assert.equal(db.get("A", "D"), null)
    assert.equal(db.delete("A", "B"), true)
    assert.equal(db.delete("A", "B"), false)
    assert.equal(db.get("A", "B"), null)

    // 15 min
})

/**
 * ## Level 2: Scanning

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
 */
scenario(`level 2`, db => {
    assert.equal(db.set("A", "BC", "E"), null)
    assert.equal(db.set("A", "BD", "F"), null)
    assert.equal(db.set("A", "C", "G"), null)
    assert.deepStrictEqual(db.scan("A"), ["BC(E)", "BD(F)", "C(G)"])
    assert.deepStrictEqual(db.scan_by_prefix("A", "B"), ["BC(E)", "BD(F)"])
    assert.deepStrictEqual(db.scan_by_prefix("A", "Z"), [])
    assert.deepStrictEqual(db.scan("X"), [])  

    // 29:48 min
})

