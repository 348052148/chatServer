const Rx = require('rxjs/Rx');
const WebSocketServer = require('ws').Server;
const action = require('../Action');
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

    close(){
        let closeStream = Rx.Observable.bindCallback(this.websocket.on);

        return closeStream;
    }

}

class ConnectPool{

    constructor(){
        this._connectLst = [];
    }

    // 添加 connetor 
    add(connector){
        this._connectLst.push(connector);
    }

    // 删除 connetor
    delete(id){
        for(var i=0;i<this._connectLst.length;i++){
            if(this._connectLst[i].id == id){
                this._connectLst.splice(i,1);
                console.log(this._connectLst);
                return this._connectLst;
            }
        }
        return this._connectLst;
    }

    // 判断是否存在connetor
    isExists(id) {
        for(var i=0;i<this._connectLst.length;i++){
            if(this._connectLst[i].id == id){
                return true;
            }
        }
        return false;
     }

     findById(id) {
        for(var i=0;i<this._connectLst.length;i++){
            if(this._connectLst[i].id == id){
                return this._connectLst[i];
            }
        }
        return false;
    }

    //广播消息filter ID
    broadcastMessageFilterId(ids,messageInfo) {
        for(var i=0;i<this._connectLst.length;i++){
            this._connectLst[i].send(messageInfo);
        }
    }

    idList(){
        let ids = [];
        this._connectLst.forEach((v)=>{
            ids.push(v.id);
        });

        return ids;
    }

}

class MessageServer{

    constructor(){
        // websocket
        this.wss = new WebSocketServer({port: 3000});

        this.connectPool = new ConnectPool();
    }

    run(){
        this.wss.on('connection', (ws)=> {

            var conn = new Connector(ws);

            this.connectPool.add(conn);

            conn.send({id:conn.id});
            
            //加载路由器
            let router = new action.Router(this.connectPool,conn);

            /**
             * message {action,from,to,group,content}
             */
            conn.recv((message)=>{
                
                try{
                    //服务器转发消息
                    
                    router.actionDispatcher(message,'sendMessage',(messageParse,connectPool,connect)=>{
                        
                        console.log(connectPool);
                        let sendMessage = new action.SendMessage(messageParse,connectPool,connect);

                        sendMessage.action();

                    });
        
                    router.actionDispatcher(message,'queryInfo',(messageParse,connectPool,connect)=>{
                        
                        let queryInfo = new action.QueryInfo(messageParse,connectPool,connect);

                        queryInfo.action();

                    });


                }catch(e){
                    conn.send('异常');
                }
            });

        });
    }

}


module.exports = {MessageServer,Connector,ConnectPool};