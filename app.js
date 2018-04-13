const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

const  lib = require('./Lib');

const action = require('./Action');

if (cluster.isMaster) {
  console.log(`主进程 ${process.pid} 正在运行`);

  // 衍生工作进程。
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`工作进程 ${worker.process.pid} 已退出`);
  });
 } else {
  // 工作进程可以共享任何 TCP 连接。
  // 在本例子中，共享的是一个 HTTP 服务器。
  let messageServer = new lib.MessageServer();
  messageServer.run();

  console.log(`工作进程 ${process.pid} 已启动`);

}

