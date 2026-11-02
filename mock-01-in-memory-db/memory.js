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


console.log(set("A", "B", "E") == null)
console.log(set("A", "C", "F") == null)
console.log(get("A", "B") == "E")
console.log(get("A", "D") == null)
console.log(del("A", "B") == true)
console.log(del("A", "B") == false)
console.log(get("A", "B") == null)


console.log(_memory);