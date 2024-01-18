var req=Object.assign(function(performAsync,requestMethod,requestURIs,requestHeaders,responseFormat,responseCode,onSuccess,onError) {
    /* requests: js-0.1.0-2024014+1: 2024, RUS, Yuriyi `niknils` Slinkin <slnknrr@noreply.codeberg.org>
     *   licensed under MIT license; repository: W"https://codeberg.org/slnknrr/js.requests"; home: W"https://slnknrr.codeberg.page/:Zoldpojx/js.requests"
     *
	 *   make sync and async http(s) request(s) in @support engines
	 *
     * @support:
     *   node: ['sync'],
     *   browser: ['sync'];
     *
     * @install:
     *   npm: ['@niknils/requests', 'nkrequests'];
     *
     * @return:
     *   class: {
     *               uri,urn,url,                                      //
	 *               code,                                             //
	 *               core,data,type,                                   //
     *               last                                              //
     *               then,else,next,fail,                              //
     *               thenAll,elseAll,nextAll,failAll,                  //
     *               thenSync,elseSync,nextSync,failSync,              //
	 *               thenAllSync,elseAllSync,nextAllSync,failAllSync,  //
     *          }
    */
    var args=Object.assign([performAsync,requestMethod,requestURIs,requestHeaders,responseFormat,responseCode,onSuccess,onError].concat(Array.from(arguments).slice(8,)).slice(0,arguments.length),
    {
        boolean:
        {
            count:0,     //set async|sync mode
            limit:1,
            parse:(a)=>{
                if (a.length!=1||typeof a[0]!='boolean') {
                    throw(`(ferr:req:boolean) empty or a lot of elements in array`);
                } else if (performAsync!=null) {
                    throw(`(ferr:req:boolean) async mode sets by functions <- throw`);
                } else {
                    performAsync=v[0];
                }
            }
        },
        number: //types: Integer[], String[]<-Integer[]
        {
            count:0,     //responseCode
            limit:1,     //
            parse:(a)=>{ //
                var arr=[];
                for (var v of a) {
                    if (Number.isNan(Number(v))||String(parseInt(v))!=String(v)) {
                        throw(`(ferr:req:number) ${v} isn't Number::Integer`);
                    } else {
                        if (arr.includes(Number(v))) {
                            dbg(`(wrn:req:number) ${v} exist in Array[]`);
                        } else {
                            arr.push(Number(v));
                        }
                    }
                }
                if (arr.length==0) {
                    throw(`(ferr:req:number) miss arguments`);
                } else {
                    responseCode=arr;
                }
            }
        },
        string:
        {
            count:0,     //requestMethod, requestHeaders, requestURIs
            limit:3,     //
            parse:(a)=>{ //
                var is='';
                for (var v of a) {
                //URIs
                    if (v.match(/\//)) {
                        if (is=='') {
                            is='address';
                        } else if (is!='address') {
                            throw(`(ferr:req:string) invalid address(es)`);
                        }
                    } else {
                        if (is=='address') throw(`(ferr:req:string) invalid address(es)`);
                    }
                //headers
                    if (v.match(/\:[^\/]/)) {
                        if (is=='') {
                            is='headers';
                        } else if (is!='headers') {
                            throw(`(ferr:req:string) invalid headers`);
                        }
                    } else {
                        if (is=='headers') throw(`(ferr:req:string) invalid headers`);
                    }
                //methods
                    if (v.match(/^[^\\\/\:\; ]{1,}$/)) {
                        if (is=='') {
                            is='method'
                        } else if (is!='method') {
                            throw(`(ferr:req:string) invalid method(`);
                        }
                    } else {
                        if (is=='method') throw(`(ferr:req:string) invalid method`);
                    }
                    if (is=='method') {
                        if (a.length!=1) {
                            throw(`(ferr:req:string) methods: a lot of methods <- isn't accepted <- spam requests`);
                        } else {
                            requestMethod=a[0];
                        }
                    } else if (is=='address') {
                        requestURIs=a;
                    } else if (is=='headers') {
                        requestHeaders={};
                        for (var v of a) {
                            eval(`requestHeaders=Object.assign(requestHeaders, { ${v.split(':')[0]}: ${v.split(':').slice(1,).join(':')} })`);
                        }
                    } else {
                        throw(`(ferr:req:string) string(s) isn't method, address(es) and header(s)`);
                    }
                }
            }
        },
        object: //understand assign: boolean, string
        {
            count:0,     //headers OR all params as object (when args.count==1)
            limit:2,     //
            parse:(o)=>{ //
                if (o.length!=1) {
                    throw(`(ferr:req:object) object can't in arrays`);
                } else { o=o[0];
                    if (Object.keys(o).includes('onsuccess')||Object.keys(o).includes('onerror')) {
                        if (Object.keys(o).length>2) {
                            throw(`(ferr:req:object)`);
                        } else {
                            if (Object.keys(o).length==2&&!(Object.keys(o).includes('onsuccess')&&Object.keys(o).includes('onerror'))) {
                                throw(`(ferr:req:object)`);
                            } else {
                                if (Object.keys(o).includes('onsuccess')&&typeof o.onsuccess!='function') {
                                    throw(`(ferr:req:object)`);
                                } else if (Object.keys(o).includes('onsuccess')) {
                                    onSuccess=o.onsuccess;
                                }
                                if (Object.keys(o).includes('onerror')&&typeof o.onsuccess!='function') {
                                    throw(`(ferr:req:object)`);
                                } else if (Object.keys(o).includes('onsuccess')) {
                                    onError=o.onerror;
                                }
                            }
                        }
                    } else {
                        if (requestHeaders!=null) {
                            throw(`(ferr:req:object)`);
                        } else {
                            requestHeaders=o;
                            for (var property of requestHeaders) {
                                if (typeof requestHeaders[property]!='string') throw(`(ferr:req:object) invalid properties in headers`);
                            }
                        }
                    }
                }
            }
        },
        function: //inreview; you can set functions with Object{} like {onsuccess:[functions], onerror:[functions] }
        {
            count:0,     //onSuccess, onError
            limit:2,     //
            parse:(a)=>{ //
                for (var i in a) { var v=a[i];
                    if (typeof v!='function') {
                        throw(`(ferr:req:args:${iterator+1}:function:${i+1}) isn't function, lol`);
                    } else {
                        if (v.toString().match(/^async/)) {
                            if (async==false) {
                                throw(`(ferr:req:args:${iterator+1}:function:${i+1}) async function isn't allowed in sync mode`);
                                //^ (async==true)return (async()=>{for await()...await f()}()) <- feature; use .then() for Promise without onsuccess function
                            } else {
                                async==true;
                            }
                        }
                    }
                }
            }
        },
    }),
    /*base64--*/
        encode=function(s) {
        var r="",i=0,len=s.length,c1,c2,c3,
            A="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        while (i < len) { c1 = s.charCodeAt(i++) & 0xff;
            if (i == len) {
                r += A.charAt(c1 >> 2); r += A.charAt((c1 & 0x3) << 4); r += "=="; break;
            }
            c2 = s.charCodeAt(i++);
            if (i == len) {
                r += A.charAt(c1 >> 2); r += A.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4)); r += A.charAt((c2 & 0xF) << 2); r += "="; break;
            }
            c3 = s.charCodeAt(i++); r += A.charAt(c1 >> 2); r += A.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4)); r += A.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6)); r += A.charAt(c3 & 0x3F);
        }
        return r;
    },  decode=function(s) {
        var e={},i,b=0,c,x,l=0,a,r='',w=String.fromCharCode,L=s.length,
            A="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        for(i=0;i<64;i++){e[A.charAt(i)]=i;}
        for(x=0;x<L;x++){
            c=e[s.charAt(x)];b=(b<<6)+c;l+=6;
            while(l>=8){((a=(b>>>(l-=8))&0xff)||(x<(L-2)))&&(r+=w(a));}
        }
        return r;
    },
    /*--base64*/
        mode=(()=>{
            try{if(Deno.version.deno.match(/^(0|[1-9][0-9]{0,})(\.(0|[1-9][0-9]{0,})){0,}$/)) {
                return 'deno';
            }else{throw('next')}}catch{};
            try{if(window.navigator.userAgent.match(/^[^\r\n]{1,}$/)){
                return 'browser';
            }else{throw('next')}}catch{};
            try{if(process.versions.node.match(/^(0|[1-9][0-9]{0,})(\.(0|[1-9][0-9]{0,})){0,}$/)) {
                return 'node';
            }else{throw('next')}}catch{};
            return 'unknown';
        })(),
        request=null,
        response=null,
        responses=[],
        /*about*/resolve = ()=>{}/* uses in thisdoc
         * resolve can be set with Object{} like {onerror:()=>{}, onsuccess:()=>{}, resolve:()=>{}}
        */;
    if (mode=='unknown') throw(`(ferr:req) unknown engine`);
    for (var nul of [
    //user
        'performAsync',   //boolean            - false   - 
        'requestMethod',  //string             - 'GET'   -
        'requestURIs',    //string[]           - Error   - 
        'requestHeaders', //object{}, string[] - {}      -
        'responseFormat', //string             - 'base'  - means base64 encoded
        'responseCode',   //number[], string[] - 0       - (0 = no CORS error, -0 = CORS error)
        'onSuccess',      //function[]         - ()=>{}  - (Error) if AsyncFunction[] when (performAsync==false); if responseCode[] contains response code
        'onError',        //function[]         - ()=>{}  - (Error) if AsyncFunction[] when (performAsync==false); if responseCode[] don't contains response code
    //auto
        'request',        //function           - method for perform request(s); you can see list of supported engines in docstring
        'response'        //class              - ['then','else'] + ['','Sync','All','AllSync']
    ]) {eval(`${nul}=null`)}
    //debug
    var dbg=function() {
        var dbgLog=false;
            try{if(process.env['DEBUG_REQ'].match(/^(true|1)$/i)){
                dbgLog=true;
            }}catch{}
            try{if(DEBUG_REQ.toString().match(/^(true|1)$/i)){
                dbgLog=true;
            }}catch{}
        if (!dbgLog) return false;
        var args=Object.assign(Array.from(arguments), {eval:[]});
        for (var arg in args) {
            if (parseInt(arg)==arg&&arg>-1) {
                args.eval.push(`args[${arg}]`);
            }
        }
        eval(`console.log(${args.eval.join(',')})`);
        return true;
    }
    //arguments
    for (var arg of args) {
        if (Array.isArray(arg)) {
            var unq=[]; //types
            for (var inarrv of arg) {
                if (!unq.includes(typeof inarrv)) unq.push(typeof inarrv);
            }
            if (unq.length!=1) {
                if (unq.length==2&&unq.includes('string')&&unq.includes('number')) {
                    if (typeof args.number?.parse!='function') {
                        throw(`(ferr:req)`);
                    } else {
                        args.number.parse(arg);
                    }
                } else {
                    throw(`(ferr:req)`);
                }
            } else if (typeof args[unq[0]]?.parse!='function') {
                throw(`(ferr:req)`)
            } else {
                args[unq[0]].count=args[unq[0]].count+1;
                if (args[unq[0]].count>args[unq[0]].limit) {
                    throw(`(ferr:req)`);
                } else {
                    args[unq[0]].parse(arg);
                }
            }
        } else {
            if (typeof args[typeof arg]?.parse!='function') {
                throw(`(ferr:req)`);
            } else {
                args[typeof arg].count=args[typeof arg].count+1;
                if (args[typeof arg].count>args[typeof arg].limit) {
                    throw(`(ferr:req)`);
                } else {
                    args[typeof arg].parse([arg]);
                }
            }
        }
    }
    //validate
    if (requestURIs        == null) requestURIs=[];
    if (requestURIs.length ==    0) throw(`(ferr:req:addresses)`);
    //defaults
    if (performAsync   == null) performAsync   = false  ;
    if (requestMethod  == null) requestMethod  = 'GET'  ;
    if (requestHeaders == null) requestHeaders = {}     ;
    if (responseFormat == null) responseFormat = 'base' ; //base64
    if (responseCode   == null) responseCode   = [0]    ; //0 - no CORS errors, -0 - CORS errors; -1: err. by HTTPS Everywhere job
    if (onSuccess      == null) onSuccess      = []     ;
    if (onError        == null) onError        = []     ;
    //debug
    for (var chk of [
        'performAsync',
        'requestMethod',
        'requestURIs', 
        'requestHeaders',
        'responseFormat',
        'responseCode',
        'onSuccess',
        'onError'
    ]) {eval(`dbg('${chk}', ${chk})`)}




    response=class
    {
        constructor(URI, code, data) //response_.URI,response_.data
        {
            this.code=code;             //HTTP code of response
            this.uri=URI;               //scheme: window.location.href
            this.urn=URI.split('/')[2]; //scheme: window.location.host
            this.url=URI.split('/')[3]; //scheme: window.location.path
            
            //data
            this.core=data;
            this.type='base';
            this.data=this;   //crutch for then-else-next
            this.last=null;   //null<->next, false<-catch->

            //post
            if(this.url==''||this.url==null)this.url='/';
        }
        base()
        {
            if (arguments.length>1) {
                throw(`(ferr:req:base) a lot of options`);
            } else if (arguments.length==1&&typeof arguments[0]!='function') {
                throw(`(ferr:req:base) invalid type of param <- != function`);
            }
            this.last=null;
            try {
                this.last=true;
                this.data=this.core;
            } catch {
                this.last=false;
            }
            if (arguments.length!=0) {
                ;(async()=>{
                    onsuccess(this.data, this);
                })();
            }
            return this;
        }
        blob(onsuccess)
        {
            if (arguments.length>1) {
                throw(`(ferr:req:blob) a lot of options`);
            } else if (arguments.length==1&&typeof arguments[0]!='function') {
                throw(`(ferr:req:blob) invalid type of param <- != function`);
            }
            this.last=false; /*#todo: in developing;*/
            if (arguments.length!=0) {
                ;(async()=>{
                    onsuccess(this.data, this);
                })();
            }
            return this;
        }
        json(onsuccess)
        {
            if (arguments.length>1) {
                throw(`(ferr:req:json) a lot of options`);
            } else if (arguments.length==1&&typeof arguments[0]!='function') {
                throw(`(ferr:req:json) invalid type of param <- != function`);
            }
            this.last=null;
            try {
                this.last=true;
                this.data=JSON.parse(decode(this.core));
            } catch {
                this.last=false;
            }
            if (arguments.length!=0) {
                ;(async()=>{
                    onsuccess(this.data, this);
                })();
            }
            return this;
        }
        text(onsuccess)
        {
            if (arguments.length>1) {
                throw(`(ferr:req:text) a lot of options`);
            } else if (arguments.length==1&&typeof arguments[0]!='function') {
                throw(`(ferr:req:text) invalid type of param <- != function`);
            }
            this.last=null;
            try {
                this.last=true;
                this.data=decode(this.core);
            } catch {
                this.last=false;
            }
            if (arguments.length!=0) {
                ;(async()=>{
                    onsuccess(this.data, this);
                })();
            }
            return this;
        }

    //crutch for Promise users
    //then((response.data,response)=>{}) //response.text() => response=data
    //then((_,responeClass)=>{}) and then((responseClassOrData)=>{})
        then(c,f)
        {
            if (arguments.length==0) {
                throw(`(ferr:req:then) miss options; see code:\n`, this.then.toString());
            } else if (arguments.length==2) {
                if (Array.isArray(c)) { var types=[];
                    for (var v of c) {
                        if (!types.includes(typeof v)) types.push(typeof v);
                    }
                    if (types.length!=1) {
                        throw(`(ferr:req:then) a lot of types in arguments`);
                    } else if (!['string', 'number'].includes(types[0])) {
                        throw(`(ferr:req:then) invalid type(s) in param(s)`);
                    }
                } else if (!['string', 'number'].includes(typeof c)) {
                    throw(`(ferr:req:then) invalid type(s) in param(s)`);
                } else {
                    c=[c];
                }
                if (Array.isArray(f)) { var types=[];
                    for (var v of f) {
                        if (!types.includes(typeof v)) types.push(typeof v);
                    }
                    if (types.length!=1) {
                        throw(`(ferr:req:then) a lot of types in arguments`);
                    } else if (!['function'].includes(types[0])) {
                        throw(`(ferr:req:then) invalid type(s) in param(s)`);
                    }
                } else if (!['function'].includes(typeof f)) {
                    throw(`(ferr:req:then) invalid type(s) in param(s)`);
                } else {
                    f=[f];
                }
            } else if (arguments.length==1) {
                if (Array.isArray(c)) { var types=[];
                    for (var v of c) {
                        if (!types.includes(typeof v)) types.push(typeof v);
                    }
                    if (types.length!=1) {
                        throw(`invalid usage`);
                    } else {
                        if (typeof types[0]=='function') {
                            f=[c];c=[0];
                        } else if (typeof types[0]=='number') {
                            f=[()=>{}]; //feature: then(['codes']).then()
                        } else if (typeof types[0]=='string') {
                            f=[()=>{}]; //see up
                        } else {
                            throw(`(ferr:req:then) invalid type(s) in param(s)`);
                        }
                    }
                } else {
                    if (typeof c=='function') {
                        f=[c];c=[0];
                    } else if (typeof c=='number') {
                        f=[()=>{}]; //feature: then(['codes']).then()
                    } else if (typeof c=='string') {
                        f=[()=>{}]; //see up
                    } else {
                        throw(`(ferr:req:then) invalid type(s) in param(s)`);
                    }
                }
            } else {
                throw(`(ferr:req:then) a lot of options: ${arguments.length} <- minimal: 1, maximal: 2`);
            }
			if (![true, null, 'then'].includes(this.last)) {
				return this; //don't rewrite
			} else { var job=false;
                if (typeof c[0]=='number') {
                    if (  c.includes(this.code) || c.includes(0)&&this.code!=-0  ) {
                        job=true;
                    }
                } else if (typeof c[0]=='string') {
                    if (c.includes(this.type)) job=true;
                }
                if (job) {
					this.last='then';
					try{(async()=>{
						for (var w of f) {
							 w(this.data);
						}
						this.last=true;
					})()}catch{
						this.last=false;
					}
					return this;
                } else {
					this.last='else';
					return this;
				}
            }
        }/*--async*/
        thenSync(c,f)
        {
            if (arguments.length==0) {
                throw(`(ferr:req:then) miss options; see code:\n`, this.then.toString());
            } else if (arguments.length==2) {
                if (Array.isArray(c)) { var types=[];
                    for (var v of c) {
                        if (!types.includes(typeof v)) types.push(typeof v);
                    }
                    if (types.length!=1) {
                        throw(`(ferr:req:then) a lot of types in arguments`);
                    } else if (!['string', 'number'].includes(types[0])) {
                        throw(`(ferr:req:then) invalid type(s) in param(s)`);
                    }
                } else if (!['string', 'number'].includes(typeof c)) {
                    throw(`(ferr:req:then) invalid type(s) in param(s)`);
                } else {
                    c=[c];
                }
                if (Array.isArray(f)) { var types=[];
                    for (var v of f) {
                        if (!types.includes(typeof v)) types.push(typeof v);
                    }
                    if (types.length!=1) {
                        throw(`(ferr:req:then) a lot of types in arguments`);
                    } else if (!['function'].includes(types[0])) {
                        throw(`(ferr:req:then) invalid type(s) in param(s)`);
                    }
                } else if (!['function'].includes(typeof f)) {
                    throw(`(ferr:req:then) invalid type(s) in param(s)`);
                } else {
                    f=[f];
                }
            } else if (arguments.length==1) {
                if (Array.isArray(c)) { var types=[];
                    for (var v of c) {
                        if (!types.includes(typeof v)) types.push(typeof v);
                    }
                    if (types.length!=1) {
                        throw(`invalid usage`);
                    } else {
                        if (typeof types[0]=='function') {
                            f=[c];c=[0];
                        } else if (typeof types[0]=='number') {
                            f=[()=>{}]; //feature: then(['codes']).then()
                        } else if (typeof types[0]=='string') {
                            f=[()=>{}]; //see up
                        } else {
                            throw(`(ferr:req:then) invalid type(s) in param(s)`);
                        }
                    }
                } else {
                    if (typeof c=='function') {
                        f=[c];c=[0];
                    } else if (typeof c=='number') {
                        f=[()=>{}]; //feature: then(['codes']).then()
                    } else if (typeof c=='string') {
                        f=[()=>{}]; //see up
                    } else {
                        throw(`(ferr:req:then) invalid type(s) in param(s)`);
                    }
                }
            } else {
                throw(`(ferr:req:then) a lot of options: ${arguments.length} <- minimal: 1, maximal: 2`);
            }
			if (![true, null, 'then'].includes(this.last)) {
				return this; //don't rewrite
			} else { var job=false;
                if (typeof c[0]=='number') {
                    if (  c.includes(this.code) || c.includes(0)&&this.code!=-0  ) {
                        job=true;
                    }
                } else if (typeof c[0]=='string') {
                    if (c.includes(this.type)) job=true;
                }
                if (job) {
					this.last='then';//feature for async thenSync
					try{(()=>{
						for (var w of f) {
							w(this.data);
						}
						this.last=true;
					})()}catch{
						this.last=false;
					}
					return this;
                } else {
					this.last='else';
					return this;
				}
            }
        }/*--sync*/
	/*wrappers for then and thenSync*/
        else()
		{ var args=[];for(var i in arguments){args.push(`arguments[${i}]`)}
			if (this.last=='else') {
				this.last='then';
				eval(`this.then(${args.join(',')})`);
			}
			return this;
		}
        elseSync()
		{ var args=[];for(var i in arguments){args.push(`arguments[${i}]`)}
			if (this.last=='else') {
				this.last='then';
				eval(`this.thenSync(${args.join(',')})`);
			}
			return this;
		}
        next()
		{ var args=[];for(var i in arguments){args.push(`arguments[${i}]`)}
			if (this.last!=false) {
				this.last='then';
				eval(`this.then(${args.join(',')})`);
			} else {
				this.last='else';
			}
			return this;
		}
        nextSync()
		{ var args=[];for(var i in arguments){args.push(`arguments[${i}]`)}
			if (this.last!=false) {
				this.last='then';
				eval(`this.thenSync(${args.join(',')})`);
			} else {
				this.last='else';
			}
			return this;
		}
        fail()
		{ var args=[];for(var i in arguments){args.push(`arguments[${i}]`)}
			if (this.last==false) {
				this.last='then';
				eval(`this.then(${args.join(',')})`);
			} else {
				this.last='else';
			}
			return this;
		}
        failSync()
		{ var args=[];for(var i in arguments){args.push(`arguments[${i}]`)}
			if (this.last==false) {
				this.last='then';
				eval(`this.thenSync(${args.join(',')})`);
			} else {
				this.last='else';
			}
			return this;
		}



    //addations
        nextAll()
		{ var args=[];for(var i in arguments){args.push(`arguments[${i}]`)}
			eval(`this.next(${args.join(',')})`);
			if (![false, 'else'].includes(this.last)) {
				for (var response in this) {
					if (parseInt(response)==response&&response>-1) {
						eval(`this[response].next(${args.join(',')})`);
					}
				}
			}
			return this;
		}
        nextAllSync()
		{ var args=[];for(var i in arguments){args.push(`arguments[${i}]`)}
			eval(`this.nextSync(${args.join(',')})`);
			if (![false, 'else'].includes(this.last)) {
				for (var response in this) {
					if (parseInt(response)==response&&response>-1) {
						eval(`this[response].nextSync(${args.join(',')})`);
					}
				}
			}
			return this;
		}
        thenAll()
		{ var args=[];for(var i in arguments){args.push(`arguments[${i}]`)}
			eval(`this.then(${args.join(',')})`);
			if (![false, 'else'].includes(this.last)) {
				for (var response in this) {
					if (parseInt(response)==response&&response>-1) {
						eval(`this[response].then(${args.join(',')})`);
					}
				}
			}
			return this;
		}
        thenAllSync()
		{ var args=[];for(var i in arguments){args.push(`arguments[${i}]`)}
			eval(`this.thenSync(${args.join(',')})`);
			if (![false, 'else'].includes(this.last)) {
				for (var response in this) {
					if (parseInt(response)==response&&response>-1) {
						eval(`this[response].thenSync(${args.join(',')})`);
					}
				}
			}
			return this;
		}
        elseAll()
		{ var args=[];for(var i in arguments){args.push(`arguments[${i}]`)}
			eval(`this.else(${args.join(',')})`);
			if (![false, 'else'].includes(this.last)) {
				for (var response in this) {
					if (parseInt(response)==response&&response>-1) {
						eval(`this[response].else(${args.join(',')})`);
					}
				}
			}
			return this;
		}
        elseAllSync()
		{ var args=[];for(var i in arguments){args.push(`arguments[${i}]`)}
			eval(`this.elseSync(${args.join(',')})`);
			if (![false, 'else'].includes(this.last)) {
				for (var response in this) {
					if (parseInt(response)==response&&response>-1) {
						eval(`this[response].elseSync(${args.join(',')})`);
					}
				}
			}
			return this;
		}
        failAll()
		{ var args=[];for(var i in arguments){args.push(`arguments[${i}]`)}
			eval(`this.fail(${args.join(',')})`);
			if (![false, 'else'].includes(this.last)) {
				for (var response in this) {
					if (parseInt(response)==response&&response>-1) {
						eval(`this[response].fail(${args.join(',')})`);
					}
				}
			}
			return this;
		}
        failAllSync()
		{ var args=[];for(var i in arguments){args.push(`arguments[${i}]`)}
			eval(`this.failSync(${args.join(',')})`);
			if (![false, 'else'].includes(this.last)) {
				for (var response in this) {
					if (parseInt(response)==response&&response>-1) {
						eval(`this[response].failSync(${args.join(',')})`);
					}
				}
			}
			return this;
		}
    }
    //perform
    if (performAsync) {
        throw(`(ferr:req:async) #indev: isn't supported;`);
    } else {
        if (mode=='browser') {
            for (var URI of requestURIs) {
                ;((r)=>{
                    responses.push(new response(r.toString(), r.status, r.data))
                })(((uri,method,xhr)=>{ /*#todo:headers and non-get method indev;*/
					xhr = new XMLHttpRequest();
					xhr.open(method, uri, false);
					xhr.overrideMimeType("text/plain; charset=x-user-defined");
					xhr.send(null);
					try {
						return Object.assign(xhr.status,
						{
							uri:uri,
							data:encode(xhr.responseText)
						});
					} catch { //CORS error
						var x=-0;
						x.uri=uri;
						x.data='';
					}
				})(URI,requestMethod));
			}
        } else if (mode=='node') {
            for (var URI of requestURIs) {
                ;((r)=>{
                    responses.push(new response(r.url, r.status, r.data))
                })(JSON.parse(require('node:child_process').spawnSync(process.argv[0],['-e',`
                ;(async()=>{
					try {
						await fetch("${URI}",
							Object.assign( {method:'${requestMethod.toUpperCase()}'}, ${JSON.stringify(requestHeaders)} ))
						.then(async(response)=>{
							console.log(JSON.stringify({
								url: response.url, //URI, you know?
								status: response.status,
								ok: response.ok,
								data: await Buffer.from(await response.arrayBuffer(), 'binary').toString('base64')
							}));
						})
					} catch {
						console.log(JSON.stringify({
							url: "${URI}",
							status: -1,
							ok: false,
							data: ''
						}))
					}
                })();
                `]).stdout.toString().replace(/(\n){0,}$/,'')));
            }
        } else {
            throw(`(ferr:req:mode) unsupported`);
        }
    }
    return Object.assign(responses[0], responses.slice(1,));
},{
	lib:((data)=>{ //uses for resolve() feature detect in thisdoc,requests
		data={
			ver: '0.1.0',
			src: null,
			licenses:
			{
				'MIT': ['@niknils/requests']
			},
			contribs:
			{
				'Yuriyi `niknils` Slinkin <slnknrr@codeberg.org>': '2024-01-14+1'
			}
		};
		try{data.src=__filename}catch{};
		try{data.src=window.document.currentScript.attributes.src.value}catch{}
		if (data.src==null) {
			return Object.assign('@niknils/requests'+';'+data.ver, data);
		} else {
			return Object.assign('@niknils/requests'+';'+data.ver+';'+data.src, data);
		}
	})()
});
/*export:nodejs*/try{module.exports.req=req}catch{}/*export:nodejs*/
/*export:browser*/try{if (typeof window.req=='undefined')window.req=req}catch{}/*export:browser*/