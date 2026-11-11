// Loads CloudStorage from ../storage.js, whichever export style you use:
//   module.exports = { CloudStorage }   or   module.exports = CloudStorage
const mod = require('../storage')
const CloudStorage = mod.CloudStorage || mod.default || mod

if (typeof CloudStorage !== 'function') {
  throw new Error(
    'storage.js must export the CloudStorage class, e.g. `module.exports = { CloudStorage }` (CommonJS).'
  )
}

module.exports = { CloudStorage }
