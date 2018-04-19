const fs = require('fs');
class Components{
    constructor(){

    }
}

//Components.componentsPath="/usr/local/mserver/components";
Components.componentsPath="./components";

//Components.resouceURL ="https://api.ismbao.com.cn/";

Components.resouceURL ="http://localhost:8080/";

Components.parseComponents=(path)=>{
    let exists = fs.existsSync(path)

    if(exists){
        if(!fs.existsSync(path+"/index.js")) return false;
        let data = fs.readFileSync(path+"/index.js");
        return JSON.parse(data.toString());
    }

    if(!exists){
        return false;
    }
}

//更新一个组件
Components.updateComponents=(components)=>{
    components.resouceHost = Components.resouceURL;
    fs.writeFileSync(components.root+'/index.js',JSON.stringify(components),()=>{
        if (err) throw err;
        console.log('数据更新成功');
    });
}

//根据appid获取组件信息
Components.findByAppid = (id,func)=>{
    this.findAll((coms)=>{
        let Com = null;
        coms.forEach(com => {
            if(com.appid == id)
                Com = com;
        });
        func(Com);
    });
}

Components.find =()=>{
    
};

//查找所有组件
Components.findAll=(func)=>{
    fs.exists(Components.componentsPath,(exists)=>{
        if(exists){
            fs.readdir(Components.componentsPath,(err, files)=>{
                console.log(files);
                files = files.map((v)=>{
                    let com = Components.parseComponents(Components.componentsPath+'/'+v);
                    return Components.parseComponents(Components.componentsPath+'/'+v);
                }).filter((v)=>{
                    if(v != false) return v;
                });

                files = Components.sort(files);

                func(files);

            });
        }
        if(!exists){
            func([],'文件不存在');
        }
    })
    
}

Components.sort=(obj)=>{
    var by = function(name){
        return function(o, p){
          var a, b;
          if (typeof o === "object" && typeof p === "object" && o && p) {
            a = o[name];
            b = p[name];
            if (a === b) {
              return 0;
            }
            if (typeof a === typeof b) {
              return a < b ? -1 : 1;
            }
            return typeof a < typeof b ? -1 : 1;
          }
          else {
            throw ("error");
          }
        }
    }
    return obj.sort(by("sort"));
}


module.exports = {Components};

