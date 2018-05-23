var api = {
    user:{

    },
    message:{

    },
    system:{

    }
};

api.user.login = 'login';
api.user.logout = 'user.logout';
api.user.friend = {};
api.user.friend.list = 'user.friend.list';
api.user.find = {};
api.user.find.list = 'user.find.list';

api.message.send = 'message.send';

api.message.recv = {};
api.message.recv = 'message.recv';
api.message.recv.count = 'message.recv.count';


module.exports = api;