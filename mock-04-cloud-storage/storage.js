
class StorageFile {
    constructor(name, size, timestamp) {
        this.name = name;
        this.size = size;
        this.timestamp = timestamp;
    }
}
class CloudStorage {
  constructor() { 
    this.storage = new Map()
  }
  add_file(name, size) { 

    if (this.storage.has(name)) {
        return false;
    } else {
        let timestamp = (new Date()).getTime();
        //console.log('timestamp', timestamp);

        let file = new StorageFile(name, size, timestamp)
        this.storage.set(name, file)
        return true;
    }
  }
  get_file_size(name) { 

    if (this.storage.has(name)) {
        let file = this.storage.get(name);
        return file.size;
    } else {
        return null;
    }
}
  delete_file(name) { 

    if (this.storage.has(name)) {
        let file = this.storage.get(name);
        this.storage.delete(name);
        return file.size;

    } else {
        return null;
    }
   }

   get_n_largest(prefix, n) {
        //let list = [];

        let list = [...this.storage.values()].filter(file => {
            //console.log('file', file)
            return file.name.startsWith(prefix)
        })
        .sort((a,b) => {
            //console.log('a x b', a , b)
            let naming = a.name < b.name ? -1 : a.name > b.name ? 1 : 0
            //console.log('naming', naming)
            let sizing = b.size - a.size
            //console.log('sizing', sizing)
            return sizing || naming
        })
        .slice(0, n)
        .map(file => `${file.name}(${file.size})`)
        
        // console.log(`list`, list)    
        return list;
   }

   copy_file(name_from, name_to) {
    
    if (this.storage.has(name_from) && !this.storage.has(name_to))  {
        let from = this.storage.get(name_from) 
        
        this.storage.set(name_to, new StorageFile(name_to, from.size, from.timestamp)) 
        return true;  
    }   
    
    return false;
   }
}

module.exports = { CloudStorage }
