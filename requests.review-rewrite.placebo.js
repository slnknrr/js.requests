;((req,app,env)=>{/*module:@niknils/requests:2024.01.19,src:Wrepo"https://github.com/slnknrr/js.requests"*/
/*deps--*/var engine=null;
	try{if(process.versions.node.match(/^(0|[1-9][0-9]{0,})(\.(0|[1-9][0-9]{0,})){0,}$/)) {
		engine='node'
	}else{throw('next')}}catch{};
	try{if(window.navigator.userAgent.match(/^[^\r\n]{1,}$/)){
		engine='brow'
	}else{throw('next')}}catch{};
	try{if(Deno.version.deno.match(/^(0|[1-9][0-9]{0,})(\.(0|[1-9][0-9]{0,})){0,}$/)) {
		engine='deno'
	}else{throw('next')}}catch{};
    var encode=function(s) { //from internet, unlicense/public domain (no attrs)
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
	}
    var decode=function(s) { //from internet, unlicense/public domain (no attrs)
        var e={},i,b=0,c,x,l=0,a,r='',w=String.fromCharCode,L=s.length,
            A="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        for(i=0;i<64;i++){e[A.charAt(i)]=i;}
        for(x=0;x<L;x++){
            c=e[s.charAt(x)];b=(b<<6)+c;l+=6;
            while(l>=8){((a=(b>>>(l-=8))&0xff)||(x<(L-2)))&&(r+=w(a));}
        }
        return r;
    }

/*--deps*/

	var browAsync=function() { throw(`isn't work; in developing`) }
	var browSync=function() {
		
	}
	var nodeAsync=function() {}
	var nodeSync=function(URI, method='get', headers={}) { //my method, npm i @niknils/fetchSync; MIT
		var out=null;
		try {
			out=JSON.parse(require('node:child_process').spawnSync(process.argv[0],['-e',`
				;(async()=>{
					try {
						await fetch("${URI}",
							Object.assign( {method:'${method.toUpperCase()}'}, ${JSON.stringify(headers)} ))
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
			`]).stdout.toString().replace(/(\n){0,}$/,''));
		} catch {
			out={
				url: URI,
				status: -3,
				ok: false,
				data: ''
			}
		}
		return out;
	}
/*app--*/
app=Object.assign(function(async,method,URIs,headers,mime,code,onsuccess,onerror) {
    /*arguments.snippet--*/var args=app.toString().match(/\([^\)]{1,}\)/)[0].replace(/(^\(|\)$| {1,})/g,'').split(',');
    if (arguments.length>args.length) {
        throw(`(ferr:req) a lot of options`);
    } else { args.eval=args.join(',');/**/args=Object.assign(eval(`[${args.join(',')}]`).slice(0,arguments.length),{
        //types
        boolean  : Object.assign(1,{parse(arr){ //async
            async=arr[0]; //if not set & if arr.length==1
        }}),
        number   : Object.assign(1,{parse(arr){ //code
            code=arr; //if code not defined & if integers & unique
        }}),
        string   : Object.assign(4,{parse(arr){ //method, URIs, headers, mime
            URIs=arr; //regexp check
        }}),
        object   : Object.assign(2,{parse(arr){ //all{}; headers
            console.log(`check`)
        }}),
        function : Object.assign(2,{parse(arr){ //onsuccess, onerror
            console.log(`check`)
        }}),
        //limit
        limit    : function(fix) {
            if ((Number(args[fix])-1)<0) {
                throw(`(ferr:req) exceeded the limit for the type`);
            } else {
                args[fix]=Object.assign(Number(args[fix])-1, {parse:args[fix].parse});
            }
        }
    },{eval:args.eval})};/*null*/for(var arg of args.eval.split(',')){eval(`${arg}=null`)}; 
    for (var arg of args) {
        if (Array.isArray(arg)) { var types=[];
            for (var subarg of arg) {
                if (!types.includes(typeof arg)) types.push(typeof arg);
            }
            if (types.length!=1) {
                throw(`(ferr:req) mixed types isn't supported in array`);
            } else if (typeof args[typeof arg]?.parse!='function') {
                throw(`(ferr:req) unknown param`);
            } else { args.limit(typeof arg);
                args[typeof arg].parse(arg);
            }
        } else {
            if (typeof args[typeof arg]?.parse!='function') {
                throw(`(ferr:req) unknown param`);
            } else { args.limit(typeof arg);
                args[typeof arg].parse([arg]);
            }
        }
    }/*--arguments.snippet*/
	if (URIs      == null) throw(`(ferr:req) can't perform requests without URIs`);
	if (async     == null) async     = false;
	if (method    == null) method    = 'GET';
	if (headers   == null) headers   = {};
	if (mime      == null) mime      = 'base';
	if (code      == null) code      = 0;
	if (onsuccess == null) onsuccess = [];
	if (onerror   == null) onerror   = [];
	console.log(app.sync)
	//--app;
},{
	response:class{
		constructor(code, URI, data)
		{
			this.URI       = null;
			this.URN       = null;
			this.URL       = null;
			this.method    = null;
			this.headers   = null;
			this.MIME      = null; //null or string
			this.code      = code;
			this.data      = data;
			this.state     = this;
			this.stateType = 'response';
			//ext
			this.ok        = null;
			this.time      = null;
			this.date      = null;
			this.sig       = Object.assign('sha256hashhashhash', {md5:null,sha256:null})
			//logic
			this.last      = null;
			this.share     = undefined; //then((this.state,this,this.share)=>{})
		}
		static base(data, encode, mime)
		{
			
		}
		static json(data, encode)
		{
			
		}
		static hash(data, algorithm) {
			
		}
		clone() {
			
		}
		copy() {
			
		}
		text()
		{
			
		}
		okay() {
			
		}
		blob()
		{
			
		}
		mime() {
			
		}
		html() {
			
		}
		save(howto) { //howto: null|miss=localStorage,false=sessionStorage,true=dialog
			
		}
		//logic; in methods funcs <- (responseState, responseClass, responseShare)=>{}
		then(ok, code, mime, headers, funcs){}
		else(ok, code, mime, headers, funcs){}
		//extension
		next(ok, code, mime, headers, funcs){}
		fail(ok, code, mime, headers, funcs){}
		//thenSync, thenAll, thenAllSync, etc
	}
},{
	async : eval(`${engine}Async`),
	sync  : eval(`${engine}Sync`)
});
/*--app*/

/*wrapper--*///req.toString() for more {:
req=Object.assign(function() { //(npm i @niknils/requests) v2024.01.19; 2024, RUS, Yuriyi `niknils` Slinkin <slnknrr@noreply.codeberg.org>, licensed under MIT license;
    /** req
     *
	 * @params:
	 *
	 * @return:
	 *     obj: { cls:req.response
	 *            --- DAT - 
	 *            str:data: base64 encoded (default) or empty if error
	 *            str:core: base64 encoded (default) or empty if error (protected)
	 *            int:code: HTTP response code or error codes
	 *                  -0: CORS error
	 *                    ? for browsers only but it's alias like 'all HTTP codes that >=0' -> 0 != -0
	 *                    ^ and anti-tease '-0' equal to CORS and -1,-2
	 *                  -1: no HTTP response (for example: no access to resource)
	 *                    ? in review
	 *                  -2: network error (less bytes)
	 *                    ? reserved
	 *                  -3: method code error
	 *                    ? for example: external kill Node.js child task or invalid stdout of this task
	 *                  -4: marasmus of engine<-browsers developers (if try-catch compatible or global throw {:)
	 *                    ? reserved for possible try-catch HTTPS Everywhere parody when code isn't shutdown
	 *            --- FMT - 
	 *            fun:json: 
	 *            fun:base: 
	 *            --- USE - 
	 *            fun:then: 
	 *            fun:else: 
	 *            fun:next: 
	 *            fun:fail: 
	 *            --+ EXT - for example 'thenAllSync'
	 *            All:      
	 *            Sync:     
	 *            AllSync:  
	 *          }
    */
    var job=[]; for (var argument in arguments) { job.push('arguments['+argument+']') }
        job=eval(`app(${job.join(',')})`); //throw protect
    return job;
},{
	response:app.response,
	async:function() {
		var job=[]; for (var argument in arguments) { job.push('arguments['+argument+']') }
			job=eval(`req(true,${job.join(',')})`);
		return job;
	},
	sync:function() {
		var job=[]; for (var argument in arguments) { job.push('arguments['+argument+']') }
			job=eval(`req(false,${job.join(',')})`);
		return job;
	}
},req);
/*--wrapper*/

if (engine=='node') {
	eval(`module.exports={
		req         : req,
		reqAsync    : req.async,
		reqSync     : req.sync,
		asyncMethod : app.async,
		syncMethod  : app.sync,
		response    : req.response
	}`);
} else if (engine=='brow') {
	eval(`window['exports:@niknils/requests']={ //script tag marasmus less
		req         : req,
		reqAsync    : req.async,
		reqSync     : req.sync,
		asyncMethod : app.async,
		syncMethod  : app.sync,
		response    : req.response
	}`);
} else {
	throw(`unsupported platform`);
}

/*module:@niknils/requests:2024.01.19*/})({lib:(()=>{
	return {
		ver:Object.assign('0.0.1', //req version
		{
			license: Object.assign('MIT', //req license
			{
				'encode' : 'public domain',
				'decode' : 'public domain',
			}),
			encode: '1.0.0-STATIC',
			decode: '1.0.0-STATIC'
		})
	}
})()});