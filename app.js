const Http = require('http');

const server=Http.createServer((req,res)=>{
    console.log(req);
})

server.listen(3000)