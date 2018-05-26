const express = require('express')
const app = express()

app.get('/', (req, res) => res.send('COSSbot Localhost Server'))

app.listen(4000, () => console.log('COSSbot Server running on port 4000!'))