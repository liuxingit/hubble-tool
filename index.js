import Vue from 'vue';

/*
* 提供2种方式进行埋点：函数调用、指令方式
* 埋点参数：name必传，page、extra选传，extra如有值，必须为合法json字符串
* opt {} 参数
* - online 当前环境区分 online 和 test即可
* - hubbleOpt: {} //hubble的初始化配置
* - AppKey: {online: 'MA-A3E0-CDDD10DB81DC', test: 'MA-87CE-89EE8C22EBFB'}
* - defaultEvent : 默认事件记录配置{
        id: hubble上创建的事件ID,
        page: () => {//获取page名称的代码，默认获取document.title
        }
    },
* - username: ''//拼接工号/姓名
*/
const func = {
    init: (opt = {}) => {
        let formatCONF = func.__validation(opt);
        if(formatCONF){
            const { username, _DATrackerKey, options, defaultEvent } = formatCONF;
            // 埋点
            let st = setInterval(() => {
                if(window.DATracker){
                    clearInterval(st);
                    const DATracker = window.DATracker || {};
                    // 初始化
                    DATracker.init(_DATrackerKey, options);
                    DATracker && DATracker.login(username || '未知账号');
                
                    window.btnClickTracker = (param, eventId) => {
                        console.log(param, eventId);
                        eventId = eventId || defaultEvent.id;
                        let attributes = {};
                        if (typeof param === 'string' || typeof param === 'number' || typeof param === 'boolean') {
                            attributes.name = param;
                        } else {
                            attributes = param;
                        }
                        // 埋点的name 为必须参数
                        if(!attributes.name){
                            console.error('hubble-tool: 埋点的name为必填字段，请检查！');
                            return false;
                        }
                        //埋点的extra 必须为合法JSON字符串
                        if(!attributes.extra){
                            try {
                                JSON.parse(attributes.extra);
                            } catch(e) {
                                console.error('hubble-tool: 埋点的extra 必须为合法JSON字符串，请检查！');
                                console.error(`extra: ${attributes.extra}`);
                                return false;
                            }
                        }
                        if(!attributes.page){
                            if(defaultEvent && defaultEvent.page && typeof defaultEvent.page === 'function'){
                                attributes.page = defaultEvent.page();
                            } else {
                                attributes.page = document.title;
                            }
                        }
                        if (Object.keys(attributes || {}).length && window.DATracker && window.DATracker.track) {
                            window.DATracker.track(eventId, attributes);
                        }
                    };
                    if(!opt.notVue) {
                        Vue.prototype.$btnClickTracker = window.btnClickTracker;
                        func.__initDirective();
                    }
                        
                }
                
            }, 100);
        };
        
        
    },
    __validation: (opt) => {
        const { online = false, hubbleOpt = {}, AppKey = {}, defaultEvent = {}, username = '' } = opt;
        if(!username) {
            console.warn('hubble-tool: 执行hubble的init时请确认是否上传了username');
        }
        if(!defaultEvent || !defaultEvent.id){
            console.error('hubble-tool: 请传入hubble上配置的事件ID');
            return false;
        };
        const _DATrackerKey = online ? AppKey.ONLINE : AppKey.TEST;
        if(!_DATrackerKey){
            console.error('hubble-tool: 请传入hubble分配的_DATrackerKey');
            return false;
        }
        /* eslint-disable */
        const options = Object.assign({
            is_single_page: true,
            single_page_config: {
                mode: 'history',
                track_replace_state: true
            },
            truncateLength: 255,
            persistence: 'localStorage',
            cross_subdomain_cookie: false
        }, hubbleOpt);
        if(options.debug){
            console.log('=================================================');
            console.log(`    _DATrackerKey: ${_DATrackerKey}`);
            console.log(`    hubble options: ${JSON.stringify(options, null, 4)}`);
            console.log('=================================================');
        }
        return  {
            options,
            _DATrackerKey,
            username,
            defaultEvent
        }
    },
    __initDirective: () => {
        //注册指令v-daTracker
        Vue.directive('daTracker', {
            inserted(el, binding) {
                el.addEventListener('mousedown', () => {
                    let value = binding.value || binding.expression;
                    if(value){
                        if(binding.arg){
                            window.btnClickTracker && window.btnClickTracker(value, binding.arg);
                        } else {
                            window.btnClickTracker && window.btnClickTracker(value);
                        }
                    } else {
                        console.warn('请注意：v-daTracker 指令必须绑定数据');
                    }
                });
            }
        });
    },
};
    
export default {
    init: func.init
}