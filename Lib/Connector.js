/**
 * 连接单元 我创建了一个流。关心我的就可以去进行订阅
 */
class Connector {

    constructor(ws){
        this.websocket = ws;
        this.id = parseInt(Math.random()*10000);
    }

    send(message){
        this.websocket.send(JSON.stringify(message));
    }

    recv(call){
        this.websocket.on('message',function(message){
            call(JSON.parse(message));
        });
    }

    close(call){
        this.websocket.on('close',()=>{
            call(this);
        });
    }

}
module.exports = {Connector};