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

    close(call){
        this.websocket.on('close',()=>{
            call(this);
        });
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

    setNicknameById(id,nickname){
        for(var i=0;i<this._connectLst.length;i++){
            if(this._connectLst[i].id == id){
                this._connectLst[i].nickname= nickname;
                return this._connectLst[i];
            }
        }
        return false;
    }

    //广播消息filter ID
    broadcastMessageFilterId(ids,messageInfo) {
        for(var i=0;i<this._connectLst.length;i++){
            let f = true;
            ids.forEach((v)=>{
                if(v ==  this._connectLst[i].id){
                    f = false;
                }
            })
            if(f)
                this._connectLst[i].send(messageInfo);
        }
    }

    idList(){
        let ids = [];
        this._connectLst.forEach((v)=>{
            ids.push({id:v.id,nickname:v.nickname});
        });

        return ids;
    }

    filterList(id){
        let ids = [];
        this._connectLst.forEach((v)=>{

            if(v.id != id){
                ids.push({id:v.id,nickname:v.nickname});
            }
                
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

            //加载路由器
            let router = new action.Router(this.connectPool,conn);

            /**
             * message {action,from,to,group,content}
             */
            conn.recv((message)=>{
                
                try{
                    //登录操作
                    if(message.action == 'login'){
                        console.log(message);

                        conn.username = message.data.username;
                        conn.nickname = message.data.username;

                        let ids = this.connectPool.idList();

                        conn.send({action:'login',data:{
                                username:conn.username,
                                nickname:conn.nickname,
                                id:conn.id,
                                accessToken:'123',
                                friendLst:ids
                            }
                        });
                                                
                        this.connectPool.broadcastMessageFilterId([conn.id],{action:'user.friend.list',data:{
                            list:ids
                        }});
                    }

                    //获取用户的朋友列表
                    if(message.action == 'user.friend.list'){
                        let ids = this.connectPool.idList();
                        console.log(message);
                        conn.send({action:message.action,data:{
                            list:ids
                        }});
                    }

                    //用户退出登录
                    if(message.action == 'user.logout'){

                        console.log(message);

                        this.connectPool.delete(message.data.uid);

                        //通知其他用户
                        let ids = this.connectPool.idList();
                        this.connectPool.broadcastMessageFilterId([],{action:'user.friend.list',data:{
                            list:ids
                        }});
                    }

                    //用户消息投递
                    if(message.action == 'message.send'){
                        console.log(message);
                        let toConn = this.connectPool.findById(message.data.to);

                        toConn.send({action:'message.recv',data:{
                            from:message.data.from,
                            content:message.data.content
                        }});
                    }

                }catch(e){
                    conn.send({action:'exception',data:'服务器异常'});
                }
            });

            conn.close((connect)=>{
                //通知其他用户
                console.log('异常关闭连接');
                this.connectPool.delete(connect.id);
                let ids = this.connectPool.idList();
                this.connectPool.broadcastMessageFilterId([],{action:'user.friend.list',data:{
                    list:ids
                }});
            })

        });
    }

}


module.exports = {MessageServer,Connector,ConnectPool};