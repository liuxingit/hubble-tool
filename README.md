### 用法

#### 第一步
index.html  引入hubble的 sdk

#### 第二步
//APP.vue 获取完用户信息后
import hubbleTool from 'hubble-tool';
hubbleTool.init({
    online: true/false, //默认false
    AppKey: {
        ONLINE: hubble 线上环境appkey,
        TEST: hubble 测试环境appkey
    },
    username: 工号/姓名,
    defaultEvent: {
        id: 'hubble创建的事件ID',
        page: () => {}
    }
});