const assert = require('node:assert')

class Account {
    constructor(timestamp, account_id, value) {
        this.timestamp = timestamp
        this.account_id = account_id
        this.balance = value || 0
        this.operations = []
        this.payments = {}
        this.payment_counter = 0
    }
}

class BankingSystem {
    accounts = {}
    constructor() {
         
    }
    create_account(timestamp, account_id) {
        if (this.accounts[account_id]) {
            return false
        } 
        
        this.accounts[account_id] = new Account(timestamp, account_id)    
        return true
    }
    get_account(account_id) {
        if (this.accounts[account_id]) {
            return this.accounts[account_id];
        } else {
            throw new Error(`Account (${account_id}) not found`)
        }
    }

    deposit(timestamp, account_id, amount) {
        try {
            let account = this.get_account(account_id)   

            this.check_payments(timestamp, account_id)

            account.balance += amount
            account.operations.push({
                operation: "deposit",
                amount: amount, 
                timestamp: timestamp
            })  

            return account.balance
        } catch(err) {
            console.error(err.message)
            return null
        }
        
    }

    transfer (timestamp, source_id, target_id, amount) {
        try {
            if (source_id === target_id) {
                throw new Error("Invalid operation: Same account")
            }
            let source_account = this.get_account(source_id)   
            let target_account = this.get_account(target_id)   
            // console.log('source_account', source_account)
            // console.log('target_account', target_account)
            let opr = this.validate_operation(source_account, "transfer", amount)
            // console.log('opr', opr)
            if (opr) {
                source_account.balance -= amount
                source_account.operations.push({
                    operation: "transfer",
                    suboperation: "sent",
                    amount: amount, 
                    timestamp: timestamp,
                    source_account: source_id,
                    target_account: target_id
                })

                target_account.balance += amount
                source_account.operations.push({
                    operation: "transfer",
                    suboperation: "receive",
                    amount: amount, 
                    timestamp: timestamp,
                    source_account: source_id,
                    target_account: target_id
                })
                
            } else {
                throw new Error(`Transfer error: (${source_id}) has not enough balance`)
            }

            return source_account.balance
        } catch(err) {
            console.error(err.message)
            return null
        }
    }

    validate_operation(account, opr, amount) {
        let result = false;
        switch (opr) {
            case "transfer":
            case "process_payment":      
                result = account.balance >= amount;
            break;     
            default:
            break;

        }
        return result;
    }

    // `top_spenders(timestamp, n) -> list[str]`: Returns the top `n` accounts ranked by **total outgoing amount** (money that left the account through transfers; 
    // deposits and incoming transfers do not count). Format: `"<account_id>(<total_outgoing>)"`. Sort by total outgoing **descending**; ties are broken by `account_id` **ascending** (lexicographic). 
    // Accounts with 0 outgoing are included. If there are fewer than `n` accounts, return all of them.
    top_spenders(timestamp, n) {
        // console.log(this.accounts)
        let spenders = Object.values(this.accounts).map( account => {
            let transfers = account.operations.filter(opr => {
                let amount = 0;
                if (opr?.operation == 'transfer' &&  opr?.suboperation == "sent") {
                   amount += opr.amount
                }
                return amount > 0
            })
            let total_outgoing = 0
            
            transfers.forEach(opr => {
                total_outgoing += opr.amount
            });
            // console.log('transfers', transfers)
            // console.log('total_outgoing', total_outgoing)
            // if (transfers.length > 0) {
            //     return `${account.account_id}(${total_outgoing})`
            // } else {
            //     return null
            // }
            return `${account.account_id}(${total_outgoing})`
        })

        // console.log('spenders', spenders)
        let sorted = spenders.sort()
        // console.log('sorted', sorted)
        let filtered = sorted.filter(value => value != null)

        return filtered.slice(0, n)
    }

    // - `schedule_payment(timestamp, account_id, amount, delay) -> str | None`: 
    // Schedules a payment (a withdrawal) from the account, to be processed at time `timestamp + delay`. 
    // Returns a unique id: `"payment1"`, `"payment2"`, ... (a global counter, in creation order), or `None` if the account does not exist. Funds are **not** reserved when scheduling.
    schedule_payment(timestamp, account_id, amount, delay) {
        try {

         let account = this.get_account(account_id)
        
            let counter = account.payment_counter + 1
            let payment_id = `payment${counter}` 
            account.payments[payment_id] = {
                payment_id: payment_id,
                amount: amount,
                delay: delay,
                status: 'pending',
                timestamp: timestamp,
            }
            // update the counter
            account.payment_counter = counter

            account.operations.push({
                operation: "schedule_payment",
                payment_id: payment_id,
                amount: amount, 
                delay: delay,
                timestamp: timestamp
            }) 

            return payment_id
        } catch(err) {
            console.error(err.message)
            return null
        }
        
    }
    // - `cancel_payment(timestamp, account_id, payment_id) -> bool`: Cancels a pending payment. 
    // Returns `True` if the payment exists, belongs to that account, and is still pending (not processed, not cancelled). Returns `False` otherwise.
    cancel_payment(timestamp, account_id, payment_id) {
        try {
            let account = this.get_account(account_id)
            let payment = account.payments[payment_id]
            if (payment && payment.status == 'pending') {
                account.operations.push({
                    operation: "cancel_payment",
                    payment_id: payment_id,
                    amount: payment.amount, 
                    delay: payment.delay,
                    status: 'cancelled',
                    timestamp: timestamp
                })  
                
                delete account.payments[payment_id]
                return true;
            } else {
                return false;
            }
        //return 
        } catch(err) {
            console.error(err.message)
            return null
        }
    }

    check_payments(timestamp, account_id) {
        // # payment2 processed first: 500-400=100, then +100
        // Processing rules:

        // - Before executing **any** method (including the ones from earlier levels), the system first processes all pending payments whose due time is `<=` the current `timestamp`, ordered by due time, then by creation order.
        // - A payment is processed by withdrawing `amount` from the account if the balance is sufficient. If not, the payment is **skipped** (it fails silently and is not retried).
        // - Processed payments count as outgoing amount for `top_spenders`.
        // - A payment due at exactly the call's timestamp is processed **before** that call. So a cancel issued at the due time returns `False`.
        try {
            console.log('timestamp', timestamp)
            let account = this.get_account(account_id)
            let payments = Object.values(account.payments)
            let filtered = payments.filter(payment => {
                let limit = (payment.timestamp + payment.delay)
                console.log('payment.timestamp', payment.timestamp)
                console.log('limit', limit)

                return (timestamp >= payment.timestamp && timestamp < limit && payment.status == 'pending')
            })
            
            console.log('balance', account.balance)
            console.log('filtered', filtered)
            
            filtered.forEach(payment => {
                let payment_id = payment.payment_id
                let amount = payment.amount
                let opr = this.validate_operation(account, "process_payment", amount)
                // console.log('opr', opr)
                if (opr) {
                    
                    payment.status = `processed`
                    account.payments[payment_id] = payment
                    
                    account.balance -= amount
                    
                    account.operations.push({
                        operation: "processed_payment",
                        payment_id: payment_id,
                        amount: payment.amount, 
                        delay: payment.delay,
                        status: 'processed',
                        timestamp: timestamp
                    })  

                
                } else {
                    //throw new Error(`Payment skipped: (${account_id}) has not enough balance`)    
                    console.log(`Payment skipped: (${account_id}) has not enough balance`)    
                }
                              
            })
                       
         
        } catch(err) {
            console.error(err.message)
            return null
        }
    }

}

const bank = new BankingSystem();

// ## Level 1: Accounts, deposits and transfers

// - `create_account(timestamp, account_id) -> bool`: Creates a new account with balance 0. Returns `True` if created, `False` if an account with that id already exists.
// - `deposit(timestamp, account_id, amount) -> int | None`: Adds `amount` to the account. Returns the **new balance**, or `None` if the account does not exist.
// - `transfer(timestamp, source_id, target_id, amount) -> int | None`: Moves `amount` from source to target. Returns the **source balance after the transfer**. Returns `None` if either account does not exist, if both ids are the same, or if the source has insufficient funds.

// ```
// create_account(1, "acc1")            -> True
// create_account(2, "acc2")            -> True
// create_account(3, "acc1")            -> False
// deposit(4, "acc1", 1000)             -> 1000
// deposit(5, "acc3", 500)              -> None
// transfer(6, "acc1", "acc2", 300)     -> 700
// transfer(7, "acc1", "acc1", 100)     -> None
// transfer(8, "acc1", "acc2", 900)     -> None
// deposit(9, "acc2", 50)               -> 350
// ```

assert.equal(bank.create_account(1, "acc1"),true)
assert.equal(bank.create_account(2, "acc2"),true)
assert.equal(bank.create_account(3, "acc1"),false)
assert.equal(bank.deposit(4, "acc1", 1000), 1000)
assert.equal(bank.deposit(5, "acc3", 500), null)
assert.equal(bank.transfer(6, "acc1", "acc2" , 300), 700)
assert.equal(bank.transfer(7, "acc1", "acc1" , 100), null)
assert.equal(bank.transfer(8, "acc1", "acc2" , 900), null)
assert.equal(bank.deposit(9, "acc2", 50), 350)
// deposit(9, "acc2", 50)               -> 350

console.log("bank", bank)
console.log('exercicio 1 - 30 min')


// ## Level 2: Ranking

// - `top_spenders(timestamp, n) -> list[str]`: Returns the top `n` accounts ranked by **total outgoing amount** (money that left the account through transfers; deposits and incoming transfers do not count). Format: `"<account_id>(<total_outgoing>)"`. Sort by total outgoing **descending**; ties are broken by `account_id` **ascending** (lexicographic). Accounts with 0 outgoing are included. If there are fewer than `n` accounts, return all of them.

// ```
// (continuing the previous example)
//console.log(bank.top_spenders(10, 3))
//console.log(bank.top_spenders(11, 1))
assert.deepStrictEqual(bank.top_spenders(10, 3), ["acc1(300)", "acc2(0)"]) 
assert.deepStrictEqual(bank.top_spenders(11, 1), ["acc1(300)"]) 
assert.equal(bank.transfer(12, "acc2", "acc1" , 300), 50)
assert.deepStrictEqual(bank.top_spenders(13, 2), ["acc1(300)", "acc2(300)"]) 
// top_spenders(13, 2)                  -> ["acc1(300)", "acc2(300)"]
// ```
console.log('exercicio 2 - 22 min')

// ## Level 3: Scheduled payments

// - `schedule_payment(timestamp, account_id, amount, delay) -> str | None`: Schedules a payment (a withdrawal) from the account, to be processed at time `timestamp + delay`. Returns a unique id: `"payment1"`, `"payment2"`, ... (a global counter, in creation order), or `None` if the account does not exist. Funds are **not** reserved when scheduling.
// - `cancel_payment(timestamp, account_id, payment_id) -> bool`: Cancels a pending payment. Returns `True` if the payment exists, belongs to that account, and is still pending (not processed, not cancelled). Returns `False` otherwise.

// Processing rules:

// - Before executing **any** method (including the ones from earlier levels), the system first processes all pending payments whose due time is `<=` the current `timestamp`, ordered by due time, then by creation order.
// - A payment is processed by withdrawing `amount` from the account if the balance is sufficient. If not, the payment is **skipped** (it fails silently and is not retried).
// - Processed payments count as outgoing amount for `top_spenders`.
// - A payment due at exactly the call's timestamp is processed **before** that call. So a cancel issued at the due time returns `False`.

// ```
assert.equal(bank.create_account(1, "a"),true)
assert.equal(bank.deposit(2, "a", 500),500)
assert.equal(bank.schedule_payment(3, "a", 200, 10),"payment1") // # due 13
assert.equal(bank.schedule_payment(4, "a", 400, 5),"payment2") // # due 9
assert.equal(bank.schedule_payment(5, "a", 50, 20),"payment3") // # due 25
assert.equal(bank.cancel_payment(6, "a", "payment3"), true)
assert.equal(bank.cancel_payment(7, "a", "payment3"), false)
assert.equal(bank.deposit(10, "a", 100), 200) // # payment2 processed first: 500-400=100, then +100
assert.deepStrictEqual(bank.top_spenders(14, 1), ["a(600)"]) // # payment1 processed at 13: 200-200=0 
assert.equal(bank.schedule_payment(15, "a", 100, 1),"payment4") // # due 16
assert.equal(bank.deposit(16, "a", 50), 50) // # payment4 skipped (balance 0), then +50
assert.deepStrictEqual(bank.top_spenders(17, 1), ["a(600)"]) 
// ```