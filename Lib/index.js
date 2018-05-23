const Rx = require('rxjs/Rx');
const WebSocketServer = require('ws').Server;
const Connector = require('./Connector.js').Connector;
const ConnectPool = require('./ConnectPool.js').ConnectPool;
const Components = require('./Components.js').Components;

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
                        //id
                        if(message.data.id){
                            conn.id = message.data.id;
                        }

                        let ids = this.connectPool.idList();

                       for(let i=0;i<ids.length;i++){
                           ids[i].msgLst = [];
                       }

                        conn.send({action:message.action,data:{
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
                        toConn.send({action:'message.recv.count',data:{
                            content:message.data.content
                        }});
                        
                    }
                    //查找用户
                    if(message.action == 'user.find.list'){
                        console.log(message);
                        let lst = this.connectPool.findByName(message.data.keyword);
                        console.log(lst);
                        conn.send({action:message.action,data:{
                            list:lst
                        }});
                    }

                    //获取app menu
                    if(message.action == 'system.app.menu'){
                        console.log(message);
                        let lst = [
                            
                            {appid:'3',icon:'ios-chatbubble',name:'消息',path:'/msg'},
                            
                        ];
                        Components.findAll((f)=>{
                            console.log( f);
                            f.forEach(element => {
                                lst.push({
                                    appid:element.appid,
                                    icon:element.icon,
                                    name:element.name,
                                    path:element.path,
                                    components:Components.resouceURL+element.components,
                                    ismenu:element.ismenu
                                });

                            });
                            lst.push({appid:'5',icon:'person',name:'个人中心',path:'/person'});
                            conn.send({action:message.action,data:{
                                list:lst
                            }});
                        });
                    }
                    //获取app list
                    if(message.action == 'system.app.list'){
                        let lst = [
                        ];
                        
                        Components.findAll((f)=>{
                            f.forEach(element => {
                                lst.push({
                                    appid:element.appid,
                                    icon:element.icon,
                                    name:element.name,
                                    path:element.path,
                                    components:Components.resouceURL+element.components,
                                    ismenu:element.ismenu
                                });

                            });
                            conn.send({action:message.action,data:{
                                list:lst
                            }});
                        });

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


module.exports = {MessageServer};