# plaziverse-db

## Usage 

```js
const setupDatabase = require('plaziverse-db');
setupDatabase(config).then( db => {
    const { Agent, Metric } = db

}).catch( err => console.err(err))
```