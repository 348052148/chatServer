
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
    //to
    getTo(){
        return this.to;
    }
    // 内容
    getContent(){
        return this.content;
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
        f(this.connectPool,this.conn);
    }

}

class SendMessage extends BaseAction{

    constructor(messageParse,connectPool,conn){
        super(messageParse,connectPool,conn);
    }
  
}

class QueryInfo extends BaseAction{

    constructor(messageParse,connectPool,conn){
        super(messageParse,connectPool,conn);
    }

    getAllConnector(connectPool,conn){
        console.log(connectPool);

        let idLst = connectPool.idList();
        
        conn.send({content:idLst});
    }

    test(){
        console.log('TESTTTTTT.');
    }
}



module.exports={Router,SendMessage,QueryInfo};