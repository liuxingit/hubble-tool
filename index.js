/*
* 提供2种方式进行埋点：函数调用、指令方式
* 埋点参数：name必传，page、extra选传，extra如有值，必须为合法json字符串
* opt {} 参数
* - online: boolean //必须值, 当前环境区分 online 和 test即可
* - hubbleOpt: {} //可选参数，hubble的初始化配置
* - appKey: {online: 'MA-A3E0-CDDD10DB81DC', test: 'MA-87CE-89EE8C22EBFB'},//必须值
* - defaultEvent : { //默认事件记录配置
        id: hubble上创建的事件ID,
        page: () => {//获取page名称的代码，默认获取document.title
        }
    },
* - username //可选参数，如果不传，则自己调用login
* - isSupportType //只是为了兼容， 默认为false 
*/
const func = {
    init: (Vue, opt = {}) => {
        let formatCONF = func.__validation(opt);
        if(formatCONF){
            func._loadHubble();
            const { _DATrackerKey, options, defaultEvent } = formatCONF;
            const { username = '', isSupportType} = opt;
            window.DATracker.init(_DATrackerKey, options);
            username && window.DATracker.login(username);
        
            window.btnTracker = (param, eventId) => {
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
                if(attributes.extra){
                    try {
                        attributes.extra = JSON.stringify(attributes.extra);
                    } catch(e) {
                        console.error('hubble-tool: 埋点的extra 必须为合法JSON对象，请检查！ extra:', attributes.extra);
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
            if(Vue) {
                Vue.prototype.$btnTracker = window.btnTracker;
                func.__initDirective(Vue, isSupportType);
            }
        };
    },
    _loadHubble: () => {
        /* eslint-diable */
        (function(document, datracker, root) {
            function loadJsSDK() {
                var script, first_script;
                script = document.createElement("script");
                script.type = "text/javascript";
                script.async = true;
                script.src = "https://hubble-js-bucket.nosdn.127.net/DATracker.globals.1.6.11.js";
                first_script = document.getElementsByTagName("script")[0];
                first_script.parentNode.insertBefore(script, first_script)
            }
            if (!datracker["__SV"]) {
                var win = window;
                var gen_fn, functions, i, lib_name = "DATracker";
                window[lib_name] = datracker;
                datracker["_i"] = [];
                datracker["init"] = function(token, config, name) {
                    var target = datracker;
                    if (typeof(name) !== "undefined") {
                        target = datracker[name] = []
                    } else {
                        name = lib_name
                    }
                    target["people"] = target["people"] || [];
                    target["abtest"] = target["abtest"] || [];
                    target["toString"] = function(no_stub) {
                        var str = lib_name;
                        if (name !== lib_name) {
                            str += "." + name
                        }
                        if (!no_stub) {
                            str += " (stub)"
                        }
                        return str
                    };
                    target["people"]["toString"] = function() {
                        return target.toString(1) + ".people (stub)"
                    };
                    function _set_and_defer(target, fn) {
                        var split = fn.split(".");
                        if (split.length == 2) {
                            target = target[split[0]];
                            fn = split[1]
                        }
                        target[fn] = function() {
                            target.push([fn].concat(Array.prototype.slice.call(arguments, 0)))
                        }
                    }
                    functions = "get_user_id track_heatmap register_attributes register_attributes_once clear_attributes unregister_attributes current_attributes single_pageview disable time_event get_appStatus track set_userId track_pageview track_links track_forms register register_once alias unregister identify login logout signup name_tag set_config reset people.set people.set_once people.set_realname people.set_country people.set_province people.set_city people.set_age people.set_gender people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.set_populationWithAccount  people.set_location people.set_birthday people.set_region people.set_account abtest.get_variation abtest.async_get_variable".split(" ");
                    for (i = 0; i < functions.length; i++) {
                        _set_and_defer(target, functions[i])
                    }
                    datracker["_i"].push([token, config, name])
                };
                datracker["__SV"] = 1.6;
                loadJsSDK()
            }
        })(document, window["DATracker"] || [], window);
        /* eslint-diable */
    },
    __validation: (opt) => {
        const { online = false, hubbleOpt = {}, appKey = {} } = opt;
        let defaultEvent = opt.defaultEvent;
        // if(!username) {
        //     console.warn('hubble-tool: 执行hubble的init时请确认是否上传了username');
        // }
        if(defaultEvent && typeof defaultEvent === 'string'){
            defaultEvent = {
                id: defaultEvent
            };
        }
        if(!defaultEvent || !defaultEvent.id){
            console.error('hubble-tool: 请传入hubble上配置的事件ID');
            return false;
        };
        const _DATrackerKey = online ? appKey.online : appKey.test;
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
            defaultEvent
        }
    },
    __initDirective: (Vue, isSupportType) => {
        //注册指令v-btnTracker
        Vue.directive('btnTracker', {
            inserted(el, binding) {
                const additionalHandle = () => {
                    let value = binding.value || binding.expression;
                    if(value){
                        let eventId;
                        if(isSupportType && value.type){
                            eventId = value.type
                            delete value.type;
                        }
                        if(binding.arg || eventId){//注意type为关键字
                            window.btnTracker && window.btnTracker(value, binding.arg || eventId);
                        } else {
                            window.btnTracker && window.btnTracker(value);
                        }
                    } else {
                        console.warn('请注意：v-btnTracker 指令必须绑定数据');
                    }
                }
                el.addEventListener('click', additionalHandle);
                el._clickEvent = { additionalHandle };
            },
            unbind(el) {
                const {
                    additionalHandle
                } = el._clickEvent;
        
                el.removeEventListener('click', additionalHandle);
                delete el._clickEvent;
            }
        });
    }
};
export default {
    install: func.init
}