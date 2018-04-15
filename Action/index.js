
class MessageParse{

    constructor(message){
        this.message = message;
    }
    getModuld(){
        if(this.message.module){
            return this.message.module;
        }
        let c = this.message.action.split(".");
        if(c.length >1){
            return c[0];
        }
        return false;
    }
    // 获取action
    getAction(){
        let c = this.message.action.split(".");
        if(c.length == 2){
            return c[1];
        }
       return this.message.action;
    }
    //消息类别。 命令 还是转发
    getType(){
        return this.message.type;
    }
    getFrom(){
        return this.message.from;
    }
    //to
    getTo(){
        return this.message.to;
    }
    // 内容
    getContent(){
        return this.message.content;
    }
}

class Router{

    constructor(connectPool,conn){
        this.connectPool = connectPool;
        this.conn = conn;
    }

    actionDispatcher(message,action,func){

        let messageObj = new MessageParse(message);
       
        if(messageObj.getModuld() == action){
            
            if(typeof func == 'function'){
                console.log(messageObj.getModuld());
                func(messageObj,this.connectPool,this.conn);
            }
    
            if(typeof func =='object'){
                func.action();
            }
        }
        
    }
}

class BaseAction{
    constructor(messageParse,connectPool,conn){
        this.messageParse = messageParse;
        this.connectPool = connectPool;
        this.conn = conn;
    }

    action(){
        var f = eval("this."+this.messageParse.getAction());
        f(this.messageParse,this.connectPool,this.conn);
    }

}

class SendMessage extends BaseAction{

    constructor(messageParse,connectPool,conn){
        super(messageParse,connectPool,conn);
    }

    sendToMessage(messageParse,connectPool,conn){
        console.log(messageParse.getTo());
        let connTo = connectPool.findById(messageParse.getTo());
        connTo.send({action:'sendMessage.sendToMessage',from:messageParse.getFrom(),content:messageParse.getContent()});
    }

}

class ActionCmd extends BaseAction{

    constructor(messageParse,connectPool,conn){
        super(messageParse,connectPool,conn);
    }
    //设置用户的
    login(messageParse,connectPool,conn){
        let i = Math.floor(Math.random() * 5);
        let nicknames = [
            '小黄鸭','虎宝宝','火车侠','电灯泡','天老爷'
        ];
        conn.nickname = nicknames[i];
        conn.send({action:'actionCmd.login',content:{id:conn.id,nickname:conn.nickname}});
    }
}

class QueryInfo extends BaseAction{

    constructor(messageParse,connectPool,conn){
        super(messageParse,connectPool,conn);
    }

    // 获取列表
    getAllConnector(messageParse,connectPool,conn){
        console.log(connectPool);

        let idLst = connectPool.idList();
        
        //获取ids列表
        conn.send({action:'queryInfo.getAllConnector',content:idLst});
        //通知其他人，我加入了
        connectPool.broadcastMessageFilterId([conn.id],{action:'queryInfo.appendConnetor',content:{id:conn.id,nickname:conn.nickname}});
    }
    // 删除
    removeConnector(messageParse,connectPool,conn){
        console.log('close conne');

        connectPool.delete(messageParse.getContent());

        
        let idLst = connectPool.idList();

        connectPool.broadcastMessageFilterId([],{action:'queryInfo.getAllConnector',content:idLst});
    }

    test(){
        console.log('TESTTTTTT.');
    }
}



module.exports={Router,SendMessage,QueryInfo,ActionCmd};