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

    findByName(search){
        let searchLst = [];
        this._connectLst.forEach((v)=>{
           if( search !='' && ( (v.username.search(search) >= 0) || (v.nickname.search(search) >= 0)  ) ){
                searchLst.push({id:v.id,nickname:v.nickname});
            }
        });
        return searchLst;
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
module.exports = {ConnectPool};