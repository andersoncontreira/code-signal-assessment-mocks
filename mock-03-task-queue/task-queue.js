const assert = require("node:assert")

class Task {
    constructor(taskId, priority, timestamp) {
        this.taskId = taskId
        this.priority = priority
        this.timestamp = timestamp
        this.status = 'pending'
        this.log = [];
     }
}
class TaskQueue {
  constructor() {
    this.tasks = new Map();
    this.taskOrder = [];
  }

  task_order_sort() {
    if (this.taskOrder.length > 1) {
        this.taskOrder.sort((a, b) => {
            let taskA = this.get_task(a)
            let taskB = this.get_task(b)
            let check = taskB.taskId > taskA.taskId ? -1 : taskB.taskId < taskA.taskId ? 1: 0
            // console.log('taskB.taskId <> taskA.taskId', taskB.taskId, taskA.taskId, check)
            // console.log('taskB.priority <> taskA.priority', taskB.priority, taskA.priority, taskB.priority - taskA.priority )
            return taskB.priority - taskA.priority  || check 
        })
    }
  }

  add_task(timestamp, taskId, priority) { 
    try {
        console.log('add_task', timestamp, taskId, priority)    
        
        this.check_tasks(timestamp)

        if (this.tasks.has(taskId)) {
            let task = this.get_task(taskId)
            if (task.status != 'cancelled') {
                throw new Error("Task already exists ...")   
            }   
        }

        let newTask = new Task(taskId, priority, timestamp);
        newTask.log.push({
            operation: 'created',
            taskId: taskId,
            priority: priority,
            timestamp: timestamp,
        })
        this.tasks.set(taskId, newTask)

        this.taskOrder.push(taskId)
        
        this.task_order_sort()
        
        
        
        return true
    } catch (err) {
        console.log(`Error: ${err.message}`)
        return false
    }
    
  }
  get_status(timestamp, taskId) { 
    console.log('get_status', timestamp, taskId)    

    this.check_tasks(timestamp)

    try {
        let task = this.get_task(taskId)
        if (task.status == 'cancelled') {
            throw new Error(`Task (${taskId}) cancelled`)
        }
        
        return task.status    
    } catch (err) {
        console.log(`Error: ${err.message}`)
        return null
    }
    
  }
  change_task_status(task, status, timestamp) {
        task.status = status
        
        task.log.push({
            operation: status,
            taskId: task.taskId,
            priority: task.priority,
            timestamp: timestamp,
        })

        return task
  }
  cancel_task(timestamp, taskId) { 
    try {
        console.log('cancel_task', timestamp, taskId)    

        this.check_tasks(timestamp)

        let task = this.get_task(taskId)
        
        if (task.status == 'pending') {
            let task_status = 'cancelled'
            this.change_task_status(task, task_status, timestamp)
            

            return true
        } else {
            throw new Error(`Task (${taskId}) status diff from pedding`)
        }
        

    } catch (err) {
        console.log(`Error: ${err.message}`)
        return false
    }

  }


  get_task(taskId) {
    if (this.tasks.has(taskId)) {
        return this.tasks.get(taskId)
    } else {
        throw new Error(`Task (${taskId}) not found`)
    }
  }

  check_tasks(timestamp) {
    this.tasks.forEach(task => {
        
        if (task.priority == timestamp && task.status === 'pending') {
            // console.log('check_tasks', task)
            // console.log('changing to running')
            this.change_task_status(task, 'running')
        }
    })
  }

  // `next_tasks(timestamp, n) -> list[str]`: Returns up to `n` pending tasks in that order, formatted as `"<task_id>(<priority>)"`. If there are fewer than `n` pending tasks, return all of them.
  next_tasks(timestamp, n) {
    try {
        console.log('next_tasks', timestamp, n)


       let tasks = this._get_next_tasks(timestamp, n) 

       return tasks.map(taskId => {
        let task = this.get_task(taskId)
        return `${task.taskId}(${task.priority})`
       })

    } catch (err) {
        console.log(`Error: ${err.message}`)
        return []
    }
  }

  _get_next_tasks(timestamp, n) {
        this.task_order_sort()

        // console.log('(this.taskOrder', this.taskOrder)

        //this.check_tasks(timestamp)

       let tasks = this.taskOrder.filter(taskId => {
            let task = this.get_task(taskId)
            return task.status == 'pending'
       }).slice(0, n)     
        //    console.log('tasks', tasks)

        return tasks
  }

  //  - `start_next(timestamp) -> str | None`: Takes the first pending task in that order, changes its status to `"running"` and returns its id. Returns `None` if there are no pending tasks.
  start_next(timestamp) {
    try {

        console.log('start_next', timestamp)

        this.check_tasks(timestamp)

        let taskIds = this._get_next_tasks(timestamp, 1)
        if (!taskIds) {
            throw new Error('No task available')
        }
        let taskId = taskIds[0]

        console.log('taskId', taskId)

        let task_status = 'running' 
        let task = this.get_task(taskId)
        this.change_task_status(task, task_status, timestamp)    
        return task.taskId
    } catch (err) {
        console.log(`Error: ${err.message}`)
        return null
    }
  }
  //  - `complete_task(timestamp, taskId) -> bool`: If the task is `"running"`, changes it to `"done"` and returns `True`. Returns `False` otherwise (missing, pending, already done, failed).
  complete_task(timestamp, taskId) {
    try {
        
        this.check_tasks(timestamp)

        let task = this.get_task(taskId)
        if (task.status == 'running') {
            this.change_task_status(task, 'done', timestamp)
            return true
        } else {
            throw new Error('task with diff status then running')
        }
    } catch (err) {
        console.log(`Error: ${err.message}`)
        return false
    }
  } 

}


const queue = new TaskQueue();

assert.equal(queue.add_task(1, "t1", 5),true)
assert.equal(queue.add_task(2, "t2", 9),true)
assert.equal(queue.add_task(3, "t1", 1),false)
assert.equal(queue.get_status(4, "t2") ,"pending")
assert.equal(queue.get_status(5, "zz") ,null)
assert.equal(queue.cancel_task(6, "t2"),true)
assert.equal(queue.cancel_task(7, "t2"),false)
assert.equal(queue.get_status(8, "t2") ,null)
assert.equal(queue.add_task(9, "t2", 2),true)

console.log('time 26m:52s')
console.log('queue', queue)

assert.equal(queue.add_task(1, "b", 5),true)
assert.equal(queue.add_task(2, "a", 5),true)
assert.equal(queue.add_task(3, "c", 9),true)
assert.equal(queue.add_task(4, "d", 1),true)
assert.deepStrictEqual(queue.next_tasks(5, 3)   ,["c(9)", "a(5)", "b(5)"])
assert.deepStrictEqual(queue.next_tasks(6, 10)  ,["c(9)", "a(5)", "b(5)", "d(1)"])
assert.equal(queue.start_next(7) ,"c")
assert.equal(queue.get_status(8, "c") ,"running")
assert.deepStrictEqual(queue.next_tasks(9, 2)   ,["a(5)", "b(5)"])
assert.equal(queue.complete_task(10, "a"), false)
assert.equal(queue.complete_task(11, "c"), true)
assert.equal(queue.get_status(12, "c"),"done")
assert.equal(queue.complete_task(13, "c"), false)
assert.equal(queue.start_next(14)     ,"a")
assert.equal(queue.start_next(15)     ,"b")
assert.equal(queue.start_next(16)     ,"d")
assert.equal(queue.start_next(17)     ,null)
console.log('queue', queue)
console.log('time 1h:18m')
