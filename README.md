### 用法

#### 第一步
//入口index.js
```javascript
    import hubble from '@kaola/hubble-tool';
    
    Vue.use(hubble, {
        online: true/false, //默认false
        appKey: {
            online: hubble 线上环境appkey,
            test: hubble 测试环境appkey
        },
        hubbleOpt: {},//可选参数，hubble初始化的配置
        defaultEvent: {
            id: 'hubble创建的事件ID',
            page: () => {} //不传默认获取document.title
        },// 也可写为 defaultEvent: 'hubble创建的事件ID',
        username: 'XXX', //可选参数，如果传了，则第二步不用主动调用login
    });
```

#### 第二步
// 获取完用户信息后
```javascript
    DATracker && DATracker.login(username || '未知账号');`
```


#### 第三步：业务使用
- 分为两种方式：函数式、指令式 (参数支持字符串、对象)
- 参数：name为必传参数，page、extra为选传参数，extra不为空时必须为合法字符串

##### 指令式

```javascript
<span v-btnTracker='测试埋点'>测试埋点1</span>

<span v-btnTracker='{name:"测试埋点对象数据", extra: "{"aa":1}"}'>测试埋点2</span>

<span v-btnTracker:anthorEventId='{name:"其他类型的事件"}'>测试埋点3</span>
```

##### 函数式

```javascript
组件中：
this.$btnTracker({name:'AA'})
this.$btnTracker({name:'AA', extra: '{"aa":1}'})
this.$btnTracker({name:'AA', page: '编辑页面', extra: '{"aa":1}'})

非组件中：
window.btnTracker({name:'AA'}, 'anthorEventId')
window.btnTracker({name:'AA', extra: '{"aa":1}'}}, 'anthorEventId')
window.btnTracker({name:'AA', page: '编辑页面', extra: '{"aa":1}'}}, 'anthorEventId')
```

#### 文档
[hubble 文档](https://hubble.netease.com/help/_book/kai-fa-wen-dang/js-sdk-new.html "hubble 文档")




**********
### 更新说明
#### v0.0.1 功能实现
- 引入hubble sdk
- 绑定埋点方法到window对象(btnTracker)、vue实例($btnTracker)
- 支持vue指令埋点(v-btnTracker)