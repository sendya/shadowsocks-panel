/*!
 * jmpress.js v0.4.0
 * http://shama.github.com/jmpress.js
 *
 * A jQuery plugin to build a website on the infinite canvas.
 *
 * Copyright 2012 Kyle Robinson Young @shama & Tobias Koppers @sokra
 * Licensed MIT
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Based on the foundation laid by Bartek Szopka @bartaz
 */
(function(a,b,c,d){function f(a){if(!a)return;var b=1+a.substr(1).search(/[A-Z]/),c=a.substr(0,b).toLowerCase(),d=a.substr(b).toLowerCase();return"-"+c+"-"+d}function g(a){return a?a+",":""}function k(e){function v(b,c){var d=o(b),e={oldStyle:a(b).attr("style")||""},f={data:d,stepData:e};z.call(this,"beforeInitStep",a(b),f),e.delegate=d.delegate,z.call(this,"initStep",a(b),f),a(b).data("stepData",e),a(b).attr("id")||a(b).attr("id","step-"+(c+1)),z.call(this,"applyStep",a(b),f)}function w(b){var c=a(b).data("stepData");a(b).attr("style",c.oldStyle),z.call(this,"unapplyStep",a(b),{stepData:c})}function x(b){z.call(this,"unapplyStep",a(b),{stepData:b.data("stepData")}),z.call(this,"applyStep",a(b),{stepData:b.data("stepData")})}function y(){s&&z.call(this,"setInactive",s,{stepData:a(s).data("stepData"),reason:"deinit"}),r.jmpressClass&&a(k).removeClass(r.jmpressClass),z.call(this,"beforeDeinit",a(this),{}),a(j.stepSelector,k).each(function(a){w.call(k,this)}),l.attr("style",p.container),j.fullscreen&&a("html").attr("style",""),m.attr("style",p.area),a(q).children().each(function(){k.append(a(this))}),j.fullscreen?q.remove():(q.remove(),m.remove()),z.call(this,"afterDeinit",a(this),{}),a(k).data("jmpressmethods",!1)}function z(b,c,d){d.settings=j,d.current=r,d.container=l,d.parents=c?B(c):null,d.current=r,d.jmpress=this;var e={};return a.each(j[b],function(a,b){e.value=b.call(k,c,d)||e.value}),e.value}function A(){if(!s)return;var b=a(s).near(j.stepSelector).add(a(s).near(j.stepSelector,!0)).add(z.call(this,"selectPrev",s,{stepData:a(s).data("stepData")})).add(z.call(this,"selectNext",s,{stepData:a(s).data("stepData")}));b.each(function(){var b=this;if(a(b).hasClass(j.loadedClass))return;setTimeout(function(){if(a(b).hasClass(j.loadedClass))return;z.call(k,"loadStep",b,{stepData:a(b).data("stepData")}),a(b).addClass(j.loadedClass)},j.transitionDuration-100)});if(a(s).hasClass(j.loadedClass))return;z.call(k,"loadStep",s,{stepData:a(s).data("stepData")}),a(s).addClass(j.loadedClass)}function B(b){var c=[],d=b;while(a(d).parent().length&&a(d).parent().is(j.stepSelector))d=a(d).parent(),c.push(d[0]);return c}function C(a){return D({step:s,substep:t},a)}function D(b,c){var e;a.isPlainObject(b)&&(e=b.substep,b=b.step),typeof b=="string"&&(b=k.find(b).first());if(!b||!a(b).data("stepData"))return!1;E.call(this);var f=a(b).data("stepData"),g=!1;z.call(this,"beforeChange",b,{stepData:f,reason:c,cancel:function(){g=!0}});if(g)return d;var h={},i=b;a(b).data("stepData").delegate&&(i=a(b).parentsUntil(k).filter(j.stepSelector).filter(f.delegate)||a(b).near(f.delegate)||a(b).near(f.delegate,!0)||a(f.delegate,k),f=i.data("stepData")),u&&z.call(this,"setInactive",u,{stepData:a(u).data("stepData"),delegatedFrom:s,reason:c,target:h,nextStep:i,nextSubstep:e,nextStepData:f});var l={stepData:f,delegatedFrom:b,reason:c,target:h,substep:e,prevStep:u,prevSubstep:t,prevStepData:u&&a(u).data("stepData")};return z.call(this,"beforeActive",i,l),z.call(this,"setActive",i,l),r.jmpressClass&&a(k).removeClass(r.jmpressClass),a(k).addClass(r.jmpressClass="step-"+a(i).attr("id")),r.jmpressDelegatedClass&&a(k).removeClass(r.jmpressDelegatedClass),a(k).addClass(r.jmpressDelegatedClass="delegating-step-"+a(b).attr("id")),z.call(this,"applyTarget",s,a.extend({canvas:q,area:m},l)),s=b,t=l.substep,u=i,A.call(this),i}function E(){function b(){function d(){(a(l).scrollTop()!==0||a(l).scrollLeft()!==0)&&b()}a(l)[0].tagName==="BODY"&&c.scrollTo(0,0),a(l).scrollTop(0),a(l).scrollLeft(0),setTimeout(d,1),setTimeout(d,10),setTimeout(d,100),setTimeout(d,200),setTimeout(d,400)}b()}function F(a){return D.call(this,a,"jump")}function G(){return D.call(this,z.call(this,"selectNext",s,{stepData:a(s).data("stepData"),substep:t}),"next")}function H(){return D.call(this,z.call(this,"selectPrev",s,{stepData:a(s).data("stepData"),substep:t}),"prev")}function I(){return D.call(this,z.call(this,"selectHome",s,{stepData:a(s).data("stepData")}),"home")}function J(){return D.call(this,z.call(this,"selectEnd",s,{stepData:a(s).data("stepData")}),"end")}function K(b){return n(q,b||{}),a(q)}function L(){return u&&a(u)}function M(b,c,d){i[b]?z.call(this,b,c,d):a.error("callback "+b+" is not registered.")}function N(){var a=navigator.userAgent.toLowerCase(),b=a.search(/(iphone)|(ipod)|(android)/)===-1;return b}e=a.extend(!0,{},e||{});var f={},g=null;for(g in i)f[g]=a.isFunction(e[g])?[e[g]]:e[g],e[g]=[];var j=a.extend(!0,{},h,e);for(g in i)f[g]&&Array.prototype.push.apply(j[g],f[g]);var k=a(this),l=null,m=null,p={container:"",area:""},q=null,r=null,s=!1,t=null,u=!1;k.data("jmpressmethods",{select:D,reselect:C,scrollFix:E,goTo:F,next:G,prev:H,home:I,end:J,canvas:K,container:function(){return l},settings:function(){return j},active:L,current:function(){return r},fire:M,deinit:y,reapply:x});if(N()===!1){j.notSupportedClass&&k.addClass(j.notSupportedClass);return}j.notSupportedClass&&k.removeClass(j.notSupportedClass);var O=a(j.stepSelector,k);l=k,m=a("<div />"),q=a("<div />"),a(k).children().filter(O).each(function(){q.append(a(this))}),j.fullscreen&&(l=a("body"),a("html").css({overflow:"hidden"}),m=k),p.area=m.attr("style")||"",p.container=l.attr("style")||"",j.fullscreen?(l.css({height:"100%"}),k.append(q)):(l.css({position:"relative"}),m.append(q),k.append(m)),a(l).addClass(j.containerClass),a(m).addClass(j.areaClass),a(q).addClass(j.canvasClass),b.documentElement.style.height="100%",l.css({overflow:"hidden"});var P={position:"absolute",transitionDuration:"0s"};P=a.extend({},j.animation,P),n(m,P),n(m,{top:"50%",left:"50%",perspective:"1000px"}),n(q,P),r={},z.call(this,"beforeInit",null,{}),O.each(function(a){v.call(k,this,a)}),z.call(this,"afterInit",null,{}),D.call(this,z.call(this,"selectInitialStep","init",{})),j.initClass&&a(O).removeClass(j.initClass)}function l(){return h}function m(b,c){a.isFunction(c)?q[b]?a.error("function "+b+" is already registered."):q[b]=c:i[b]?a.error("callback "+b+" is already registered."):(i[b]=1,h[b]=[])}function n(b,c){var d,f,g={};for(d in c)c.hasOwnProperty(d)&&(f=e(d),f!==null&&(g[f]=c[d]));return a(b).css(g),b}function o(b){function c(a){a=a.split("-");for(var b=1;b<a.length;b++)a[b]=a[b].substr(0,1).toUpperCase()+a[b].substr(1);return a.join("")}if(a(b)[0].dataset)return a.extend({},a(b)[0].dataset);var d={},e=a(b)[0].attributes;return a.each(e,function(a,b){b.nodeName.substr(0,5)==="data-"&&(d[c(b.nodeName.substr(5))]=b.nodeValue)}),d}function p(){return!!a(this).data("jmpressmethods")}"use strict";var e=function(){var a=b.createElement("dummy").style,c="Webkit Moz O ms Khtml".split(" "),e={};return function(b){if(typeof e[b]=="undefined"){var f=b.charAt(0).toUpperCase()+b.substr(1),g=(b+" "+c.join(f+" ")+f).split(" ");e[b]=null;for(var h in g)if(a[g[h]]!==d){e[b]=g[h];break}}return e[b]}}(),h={stepSelector:".step",containerClass:"",canvasClass:"",areaClass:"",notSupportedClass:"not-supported",loadedClass:"loaded",fullscreen:!0,animation:{transformOrigin:"top left",transitionProperty:g(f(e("transform")))+g(f(e("perspective")))+"opacity",transitionDuration:"1s",transitionDelay:"500ms",transitionTimingFunction:"ease-in-out",transformStyle:"preserve-3d"},transitionDuration:1500,test:!1},i={beforeChange:1,beforeInitStep:1,initStep:1,beforeInit:1,afterInit:1,beforeDeinit:1,afterDeinit:1,applyStep:1,unapplyStep:1,setInactive:1,beforeActive:1,setActive:1,selectInitialStep:1,selectPrev:1,selectNext:1,selectHome:1,selectEnd:1,loadStep:1,applyTarget:1};for(var j in i)h[j]=[];var q={init:k,initialized:p,deinit:function(){},css:n,pfx:e,defaults:l,register:m,dataset:o};a.fn.jmpress=function(b){function c(){var c=a(this).data("jmpressmethods");if(c&&c[b])if(b.substr(0,1)==="_"&&c.settings().test===!1)a.error("Method "+b+" is protected and should only be used internally.");else return c[b].apply(this,Array.prototype.slice.call(arguments,1));else if(q[b])if(b.substr(0,1)==="_"&&h.test===!1)a.error("Method "+b+" is protected and should only be used internally.");else return q[b].apply(this,Array.prototype.slice.call(arguments,1));else if(i[b]&&c){var d=c.settings(),e=Array.prototype.slice.call(arguments,1)[0];a.isFunction(e)&&(d[b]=d[b]||[],d[b].push(e))}else{if(typeof b=="object"||!b)return k.apply(this,arguments);a.error("Method "+b+" does not exist on jQuery.jmpress")}return this}var d=arguments,e;return a(this).each(function(a,b){e=c.apply(b,d)}),e},a.extend({jmpress:function(b){if(q[b])if(b.substr(0,1)==="_"&&h.test===!1)a.error("Method "+b+" is protected and should only be used internally.");else return q[b].apply(this,Array.prototype.slice.call(arguments,1));else if(i[b]){var c=Array.prototype.slice.call(arguments,1)[0];a.isFunction(c)?h[b].push(c):a.error("Second parameter should be a function: $.jmpress( callbackName, callbackFunction )")}else a.error("Method "+b+" does not exist on jQuery.jmpress")}})})(jQuery,document,window),function(a,b,c,d){function e(b,c,d,e){var f;return b.each(function(b,g){if(e){f=c(g,d,e);if(f)return!1}if(a(g).is(d))return f=g,!1;if(!e){f=c(g,d,e);if(f)return!1}}),f}function f(b,c,d){var g=a(b).children();return d&&(g=a(g.get().reverse())),e(g,f,c,d)}function g(b,c,d){return e(a(b)[d?"prevAll":"nextAll"](),f,c,d)}function h(b,c,d){var e,f=a(b).parents();return f=a(f.get()),a.each(f.get(),function(b,f){if(d&&a(f).is(c))return e=f,!1;e=g(f,c,d);if(e)return!1}),e}"use strict",a.fn.near=function(b,c){var d=[];return a(this).each(function(a,e){var i=(c?!1:f(e,b,c))||g(e,b,c)||h(e,b,c);i&&d.push(i)}),a(d)}}(jQuery,document,window),function(a,b,c,d){function e(){return""+Math.round(Math.random()*1e5,0)}function f(a){return Math.round(1e4*a)/1e4+""}"use strict";var g={3:{transform:function(b,c){var d="translate(-50%,-50%)";a.each(c,function(a,b){var c=["X","Y","Z"],e;if(b[0]==="translate")d+=" translate3d("+f(b[1]||0)+"px,"+f(b[2]||0)+"px,"+f(b[3]||0)+"px)";else if(b[0]==="rotate"){var g=b[4]?[1,2,3]:[3,2,1];for(e=0;e<3;e++)d+=" rotate"+c[g[e]-1]+"("+f(b[g[e]]||0)+"deg)"}else if(b[0]==="scale")for(e=0;e<3;e++)d+=" scale"+c[e]+"("+f(b[e+1]||1)+")"}),a.jmpress("css",b,a.extend({},{transform:d}))}},2:{transform:function(b,c){var d="translate(-50%,-50%)";a.each(c,function(a,b){var c=["X","Y"];if(b[0]==="translate")d+=" translate("+f(b[1]||0)+"px,"+f(b[2]||0)+"px)";else if(b[0]==="rotate")d+=" rotate("+f(b[3]||0)+"deg)";else if(b[0]==="scale")for(var e=0;e<2;e++)d+=" scale"+c[e]+"("+f(b[e+1]||1)+")"}),a.jmpress("css",b,a.extend({},{transform:d}))}},1:{transform:function(b,c){var d={top:0,left:0};a.each(c,function(a,b){var c=["X","Y"];b[0]==="translate"&&(d.left=Math.round(b[1]||0)+"px",d.top=Math.round(b[2]||0)+"px")}),b.animate(d,1e3)}}},h=function(){return a.jmpress("pfx","perspective")?g[3]:a.jmpress("pfx","transform")?g[2]:g[1]}();a.jmpress("defaults").reasonableAnimation={},a.jmpress("initStep",function(b,c){var d=c.data,e=c.stepData,f=parseFloat;a.extend(e,{x:f(d.x)||0,y:f(d.y)||0,z:f(d.z)||0,r:f(d.r)||0,phi:f(d.phi)||0,rotate:f(d.rotate)||0,rotateX:f(d.rotateX)||0,rotateY:f(d.rotateY)||0,rotateZ:f(d.rotateZ)||0,revertRotate:!1,scale:f(d.scale)||1,scaleX:f(d.scaleX)||!1,scaleY:f(d.scaleY)||!1,scaleZ:f(d.scaleZ)||1})}),a.jmpress("afterInit",function(b,c){var d=c.settings.stepSelector,e=c.current;e.perspectiveScale=1,e.maxNestedDepth=0;var f=a(c.jmpress).find(d).children(d);while(f.length)e.maxNestedDepth++,f=f.children(d)}),a.jmpress("applyStep",function(b,c){a.jmpress("css",a(b),{position:"absolute",transformStyle:"preserve-3d"}),c.parents.length>0&&a.jmpress("css",a(b),{top:"50%",left:"50%"});var d=c.stepData,e=[["translate",d.x||d.r*Math.sin(d.phi*Math.PI/180),d.y||-d.r*Math.cos(d.phi*Math.PI/180),d.z],["rotate",d.rotateX,d.rotateY,d.rotateZ||d.rotate,!0],["scale",d.scaleX||d.scale,d.scaleY||d.scale,d.scaleZ||d.scale]];h.transform(b,e)}),a.jmpress("setActive",function(b,c){var e=c.target,f=c.stepData,g=e.transform=[];e.perspectiveScale=1;for(var h=c.current.maxNestedDepth;h>(c.parents.length||0);h--)g.push(["scale"],["rotate"],["translate"]);g.push(["scale",1/(f.scaleX||f.scale),1/(f.scaleY||f.scale),1/f.scaleZ]),g.push(["rotate",-f.rotateX,-f.rotateY,-(f.rotateZ||f.rotate)]),g.push(["translate",-(f.x||f.r*Math.sin(f.phi*Math.PI/180)),-(f.y||-f.r*Math.cos(f.phi*Math.PI/180)),-f.z]),e.perspectiveScale*=f.scaleX||f.scale,a.each(c.parents,function(b,c){var d=a(c).data("stepData");g.push(["scale",1/(d.scaleX||d.scale),1/(d.scaleY||d.scale),1/d.scaleZ]),g.push(["rotate",-d.rotateX,-d.rotateY,-(d.rotateZ||d.rotate)]),g.push(["translate",-(d.x||d.r*Math.sin(d.phi*Math.PI/180)),-(d.y||-d.r*Math.cos(d.phi*Math.PI/180)),-d.z]),e.perspectiveScale*=d.scaleX||d.scale}),a.each(g,function(a,b){function e(e){c.current["rotate"+e+"-"+a]===d&&(c.current["rotate"+e+"-"+a]=b[e]||0);var f=c.current["rotate"+e+"-"+a],g=b[e]||0,h=f%360,i=g%360;h<0&&(h+=360),i<0&&(i+=360);var j=i-h;j<-180?j+=360:j>180&&(j-=360),c.current["rotate"+e+"-"+a]=b[e]=f+j}if(b[0]!=="rotate")return;e(1),e(2),e(3)})}),a.jmpress("applyTarget",function(b,c){var d=c.target,e,f=c.stepData,g=c.settings,i=d.perspectiveScale*1.3<c.current.perspectiveScale,j=d.perspectiveScale>c.current.perspectiveScale*1.3,k=-1;a.each(d.transform,function(a,b){if(b.length<=1)return;if(b[0]==="rotate"&&b[1]%360===0&&b[2]%360===0&&b[3]%360===0)return;if(b[0]==="scale")k=a;else return!1}),k!==c.current.oldLastScale&&(i=j=!1,c.current.oldLastScale=k);var l=[];if(k!==-1)while(k>=0)d.transform[k][0]==="scale"&&(l.push(d.transform[k]),d.transform[k]=["scale"]),k--;var m=g.animation;g.reasonableAnimation[c.reason]&&(m=a.extend({},m,g.reasonableAnimation[c.reason])),e={perspective:Math.round(d.perspectiveScale*1e3)+"px"},e=a.extend({},m,e),i||(e.transitionDelay="0s"),b||(e.transitionDuration="0s",e.transitionDelay="0s"),a.jmpress("css",c.area,e),h.transform(c.area,l),e=a.extend({},m),j||(e.transitionDelay="0s"),b||(e.transitionDuration="0s",e.transitionDelay="0s"),c.current.perspectiveScale=d.perspectiveScale,a.jmpress("css",c.canvas,e),h.transform(c.canvas,d.transform)})}(jQuery,document,window),function(a,b,c,d){"use strict";var e=a.jmpress,f="activeClass",g="nestedActiveClass",h=e("defaults");h[g]="nested-active",h[f]="active",e("setInactive",function(b,c){var d=c.settings,e=d[f],h=d[g];e&&a(b).removeClass(e),h&&a.each(c.parents,function(b,c){a(c).removeClass(h)})}),e("setActive",function(b,c){var d=c.settings,e=d[f],h=d[g];e&&a(b).addClass(e),h&&a.each(c.parents,function(b,c){a(c).addClass(h)})})}(jQuery,document,window),function(a,b,c,d){function f(b,c){return a(this).find(c.settings.stepSelector).first()}function g(b,c,d,e){if(!c)return!1;var f=d.settings.stepSelector;c=a(c);do{var g=c.near(f,e);if(g.length===0||g.closest(b).length===0)g=a(b).find(f)[e?"last":"first"]();if(!g.length)return!1;c=g}while(c.data("stepData").exclude);return c}"use strict";var e=a.jmpress;e("initStep",function(a,b){b.stepData.exclude=b.data.exclude&&["false","no"].indexOf(b.data.exclude)===-1}),e("selectInitialStep",f),e("selectHome",f),e("selectEnd",function(b,c){return a(this).find(c.settings.stepSelector).last()}),e("selectPrev",function(a,b){return g(this,a,b,!0)}),e("selectNext",function(a,b){return g(this,a,b)})}(jQuery,document,window),function(a,b,c,d){"use strict",a.jmpress("selectInitialStep",function(a,b){return b.settings.start})}(jQuery,document,window),function(a,b,c,d){function f(){return""+Math.round(Math.random()*1e5,0)}function g(b,c,d){for(var e=0;e<c.length-1;e++){var f=c[e],g=c[e+1];a(f,b).attr("data-"+d,g)}}function h(b,c,d,e){var f=c.stepData;if(f[d]){var g=a(b).near(f[d],e);if(g&&g.length)return g;g=a(f[d],this)[e?"last":"first"]();if(g&&g.length)return g}}"use strict";var e=a.jmpress;e("register","route",function(a,b,c){typeof a=="string"&&(a=[a,a]),g(this,a,c?"prev":"next"),b||g(this,a.reverse(),c?"next":"prev")}),e("initStep",function(a,b){for(var c in{next:1,prev:1})b.stepData[c]=b.data[c]}),e("selectNext",function(a,b){return h(a,b,"next")}),e("selectPrev",function(a,b){return h(a,b,"prev",!0)})}(jQuery,document,window),function(a,b,c,d){function g(){return""+Math.round(Math.random()*1e5,0)}"use strict";var e=a.jmpress,f="afterStepLoaded";e("register",f),e("initStep",function(b,c){c.stepData.src=a(b).attr("href")||c.data.src||!1}),e("loadStep",function(b,c){var d=c.stepData,e=d&&d.src;e&&a(b).load(e,function(d,e,g){a(c.jmpress).jmpress("fire",f,b,a.extend({},c,{response:d,status:e,xhr:g}))})})}(jQuery,document,window),function(a,b,c,d){function g(){return""+Math.round(Math.random()*1e5,0)}function h(b){try{var e=a("#"+c.location.hash.replace(/^#\/?/,""));return e.length>0&&e.is(b.stepSelector)?e:d}catch(f){}}"use strict";var e=a.jmpress,f="a[href^=#]";e("defaults").hash={use:!0,update:!0,bindChange:!0},e("selectInitialStep",function(b,d){var e=d.settings,i=e.hash,j=d.current,k=a(this);d.current.hashNamespace=".jmpress-"+g();if(i.use)return i.bindChange&&(a(c).bind("hashchange"+j.hashNamespace,function(){var a=h(e);k.jmpress("initialized")&&k.jmpress("scrollFix");if(a&&a.length){a.attr("id")!==k.jmpress("active").attr("id")&&k.jmpress("select",a);var b="#/"+a.attr("id");c.location.hash!==b&&(c.location.hash=b)}}),a(f).on("click"+j.hashNamespace,function(b){var c=a(this).attr("href");try{a(c).is(e.stepSelector)&&(k.jmpress("select",c),b.preventDefault(),b.stopPropagation())}catch(d){}})),h(e)}),e("afterDeinit",function(b,d){a(f).off(d.current.hashNamespace),a(c).unbind(d.current.hashNamespace)}),e("setActive",function(b,d){var e=d.settings,f=d.current;e.hash.use&&e.hash.update&&(clearTimeout(f.hashtimeout),f.hashtimeout=setTimeout(function(){c.location.hash="#/"+a(d.delegatedFrom).attr("id")},e.transitionDuration+200))})}(jQuery,document,window),function(a,b,c,d){function h(){return""+Math.round(Math.random()*1e5,0)}function i(a){a.preventDefault(),a.stopPropagation()}"use strict";var e=a.jmpress,f="next",g="prev";e("defaults").keyboard={use:!0,keys:{33:g,37:g,38:g,9:f+":"+g,32:f,34:f,39:f,40:f,36:"home",35:"end"},ignore:{INPUT:[32,37,38,39,40],TEXTAREA:[32,37,38,39,40],SELECT:[38,40]},tabSelector:"a[href]:visible, :input:visible"},e("afterInit",function(c,e){var f=e.settings,g=f.keyboard,j=g.ignore,k=e.current,l=a(this);f.fullscreen||l.attr("tabindex",0),k.keyboardNamespace=".jmpress-"+h(),a(f.fullscreen?b:l).bind("keypress"+k.keyboardNamespace,function(a){for(var b in j)if(a.target.nodeName===b&&j[b].indexOf(a.which)!==-1)return;(a.which>=37&&a.which<=40||a.which===32)&&i(a)}),a(f.fullscreen?b:l).bind("keydown"+k.keyboardNamespace,function(b){var c=a(b.target);if(!f.fullscreen&&!c.closest(l).length||!g.use)return;for(var e in j)if(c[0].nodeName===e&&j[e].indexOf(b.which)!==-1)return;var h=!1,k;if(b.which===9){c.closest(l.jmpress("active")).length?(k=c.near(g.tabSelector,b.shiftKey),a(k).closest(f.stepSelector).is(l.jmpress("active"))||(k=d)):b.shiftKey?h=!0:k=l.jmpress("active").find("a[href], :input").filter(":visible").first();if(k&&k.length>0){k.focus(),l.jmpress("scrollFix"),i(b);return}b.shiftKey&&(h=!0)}var m=g.keys[b.which];typeof m=="string"?(m.indexOf(":")!==-1&&(m=m.split(":"),m=b.shiftKey?m[1]:m[0]),l.jmpress(m),i(b)):a.isFunction(m)?m.call(l,b):m&&(l.jmpress.apply(l,m),i(b)),h&&(k=l.jmpress("active").find("a[href], :input").filter(":visible").last(),k.focus(),l.jmpress("scrollFix"))})}),e("afterDeinit",function(c,d){a(b).unbind(d.current.keyboardNamespace)})}(jQuery,document,window),function(a,b,c,d){function e(){return""+Math.round(Math.random()*1e5,0)}function h(a,b){return Math.max(Math.min(a,b),-b)}function i(b,c,d){var e=a(this).jmpress("current"),f=a(this).jmpress("settings"),g=a(this).jmpress("active").data("stepData"),i=a(this).jmpress("container");if(e.userZoom===0&&d<0)return;var j=g.viewPortZoomable||f.viewPort.zoomable;if(e.userZoom===j&&d>0)return;e.userZoom+=d;var k=a(i).innerWidth()/2,l=a(i).innerHeight()/2;b=b?b-k:b,c=c?c-l:c,e.userTranslateX=h(e.userTranslateX-d*b/e.zoomOriginWindowScale/j,k*e.userZoom*e.userZoom/j),e.userTranslateY=h(e.userTranslateY-d*c/e.zoomOriginWindowScale/j,l*e.userZoom*e.userZoom/j),a(this).jmpress("reselect","zoom")}"use strict";var f=a.jmpress("defaults");f.viewPort={width:!1,height:!1,maxScale:0,minScale:0,zoomable:0,zoomBindMove:!0,zoomBindWheel:!0};var g=f.keyboard.keys;g[a.browser.mozilla?107:187]="zoomIn",g[a.browser.mozilla?109:189]="zoomOut",f.reasonableAnimation.resize={transitionDuration:"0s",transitionDelay:"0ms"},f.reasonableAnimation.zoom={transitionDuration:"0s",transitionDelay:"0ms"},a.jmpress("initStep",function(a,b){for(var c in{viewPortHeight:1,viewPortWidth:1,viewPortMinScale:1,viewPortMaxScale:1,viewPortZoomable:1})b.stepData[c]=b.data[c]&&parseFloat(b.data[c])}),a.jmpress("afterInit",function(f,g){var h=this;g.current.viewPortNamespace=".jmpress-"+e(),a(c).bind("resize"+g.current.viewPortNamespace,function(b){a(h).jmpress("reselect","resize")}),g.current.userZoom=0,g.current.userTranslateX=0,g.current.userTranslateY=0,g.settings.viewPort.zoomBindWheel&&a(g.settings.fullscreen?b:this).bind("mousewheel"+g.current.viewPortNamespace,function(b,c){c=c||b.originalEvent.wheelDelta;var d=c/Math.abs(c);d<0?a(g.jmpress).jmpress("zoomOut",b.originalEvent.x,b.originalEvent.y):d>0&&a(g.jmpress).jmpress("zoomIn",b.originalEvent.x,b.originalEvent.y)}),g.settings.viewPort.zoomBindMove&&a(g.settings.fullscreen?b:this).bind("mousedown"+g.current.viewPortNamespace,function(a){g.current.userZoom&&(g.current.userTranslating={x:a.clientX,y:a.clientY},a.preventDefault(),a.stopImmediatePropagation())}).bind("mousemove"+g.current.viewPortNamespace,function(b){var c=g.current.userTranslating;c&&(a(h).jmpress("zoomTranslate",b.clientX-c.x,b.clientY-c.y),c.x=b.clientX,c.y=b.clientY,b.preventDefault(),b.stopImmediatePropagation())}).bind("mouseup"+g.current.viewPortNamespace,function(a){g.current.userTranslating&&(g.current.userTranslating=d,a.preventDefault(),a.stopImmediatePropagation())})}),a.jmpress("register","zoomIn",function(a,b){i.call(this,a||0,b||0,1)}),a.jmpress("register","zoomOut",function(a,b){i.call(this,a||0,b||0,-1)}),a.jmpress("register","zoomTranslate",function(b,c){var d=a(this).jmpress("current"),e=a(this).jmpress("settings"),f=a(this).jmpress("active").data("stepData"),g=a(this).jmpress("container"),i=f.viewPortZoomable||e.viewPort.zoomable,j=a(g).innerWidth(),k=a(g).innerHeight();d.userTranslateX=h(d.userTranslateX+b/d.zoomOriginWindowScale,j*d.userZoom*d.userZoom/i),d.userTranslateY=h(d.userTranslateY+c/d.zoomOriginWindowScale,k*d.userZoom*d.userZoom/i),a(this).jmpress("reselect","zoom")}),a.jmpress("afterDeinit",function(b,d){a(c).unbind(d.current.viewPortNamespace)}),a.jmpress("setActive",function(b,c){var d=c.settings.viewPort,e=c.stepData.viewPortHeight||d.height,f=c.stepData.viewPortWidth||d.width,g=c.stepData.viewPortMaxScale||d.maxScale,h=c.stepData.viewPortMinScale||d.minScale,i=e&&a(c.container).innerHeight()/e,j=f&&a(c.container).innerWidth()/f,k=(j||i)&&Math.min(j||i,i||j);if(k){k=k||1,g&&(k=Math.min(k,g)),h&&(k=Math.max(k,h));var l=c.stepData.viewPortZoomable||c.settings.viewPort.zoomable;if(l){var m=1/k-1/g;m/=l,k=1/(1/k-m*c.current.userZoom)}c.target.transform.reverse(),c.current.userTranslateX&&c.current.userTranslateY?c.target.transform.push(["translate",c.current.userTranslateX,c.current.userTranslateY,0]):c.target.transform.push(["translate"]),c.target.transform.push(["scale",k,k,1]),c.target.transform.reverse()}c.current.zoomOriginWindowScale=k}),a.jmpress("setInactive",function(b,c){if(!c.nextStep||!b||a(c.nextStep).attr("id")!==a(b).attr("id"))c.current.userZoom=0,c.current.userTranslateX=0,c.current.userTranslateY=0})}(jQuery,document,window),function(a,b,c,d){function f(){return""+Math.round(Math.random()*1e5,0)}"use strict";var e=a.jmpress;e("defaults").mouse={clickSelects:!0},e("afterInit",function(b,c){var d=c.settings,e=d.stepSelector,g=c.current,h=a(this);g.clickableStepsNamespace=".jmpress-"+f(),h.bind("click"+g.clickableStepsNamespace,function(b){if(!d.mouse.clickSelects||g.userZoom)return;var c=a(b.target).closest(e);if(c.is(h.jmpress("active")))return;c.length&&(h.jmpress("select",c[0],"click"),b.preventDefault(),b.stopPropagation())})}),e("afterDeinit",function(b,c){a(this).unbind(c.current.clickableStepsNamespace)})}(jQuery,document,window),function(a,b,c,d){function f(){return""+Math.round(Math.random()*1e5,0)}"use strict";var e=a.jmpress;e("afterInit",function(c,d){var e=d.settings,g=d.current,h=d.jmpress;g.mobileNamespace=".jmpress-"+f();var i,j=[0,0];a(e.fullscreen?b:h).bind("touchstart"+g.mobileNamespace,function(a){i=a.originalEvent.touches[0],j=[i.pageX,i.pageY]}).bind("touchmove"+g.mobileNamespace,function(a){return i=a.originalEvent.touches[0],a.preventDefault(),!1}).bind("touchend"+g.mobileNamespace,function(b){var c=[i.pageX,i.pageY],d=[c[0]-j[0],c[1]-j[1]];if(Math.max(Math.abs(d[0]),Math.abs(d[1]))>50)return d=Math.abs(d[0])>Math.abs(d[1])?d[0]:d[1],a(h).jmpress(d>0?"prev":"next"),b.preventDefault(),!1})}),e("afterDeinit",function(c,d){var e=d.settings,f=d.current,g=d.jmpress;a(e.fullscreen?b:g).unbind(f.mobileNamespace)})}(jQuery,document,window),function(a,b,c,d){function i(){return""+Math.round(Math.random()*1e5,0)}function j(b,c,e){for(var f in c){var g=f;e&&(g=e+g.substr(0,1).toUpperCase()+g.substr(1)),a.isPlainObject(c[f])?j(b,c[f],g):b[g]===d&&(b[g]=c[f])}}function k(b,c){a.isArray(c)?c.length<b.length?a.error("more nested steps than children in template"):b.each(function(b,d){d=a(d);var e=d.data(f)||{};j(e,c[b]),d.data(f,e)}):a.isFunction(c)&&b.each(function(d,e){e=a(e);var g=e.data(f)||{};j(g,c(d,e,b)),e.data(f,g)})}function l(a,b,c,d){if(c.children){var e=b.children(d.settings.stepSelector);k(e,c.children)}m(a,c)}function m(a,b){j(a,b)}"use strict";var e=a.jmpress,f="_template_",g="_applied_template_",h={};e("beforeInitStep",function(b,c){b=a(b);var d=c.data,e=d.template,i=b.data(g),j=b.data(f);e&&a.each(e.split(" "),function(a,e){var f=h[e];l(d,b,f,c)}),i&&l(d,b,i,c),j&&(l(d,b,j,c),b.data(f,null),j.template&&a.each(j.template.split(" "),function(a,e){var f=h[e];l(d,b,f,c)}))}),e("beforeInit",function(b,c){var d=e("dataset",this),f=d.template,g=c.settings.stepSelector;if(f){var i=h[f];k(a(this).find(g).filter(function(){return!a(this).parent().is(g)}),i.children)}}),e("register","template",function(b,c){h[b]?h[b]=a.extend(!0,{},h[b],c):h[b]=a.extend(!0,{},c)}),e("register","apply",function(b,c){if(!c){var d=a(this).jmpress("settings").stepSelector;k(a(this).find(d).filter(function(){return!a(this).parent().is(d)}),b)}else if(a.isArray(c))k(a(b),c);else{var e;typeof c=="string"?e=h[c]:e=a.extend(!0,{},c),a(b).each(function(b,c){c=a(c);var d=c.data(g)||{};j(d,e),c.data(g,d)})}})}(jQuery,document,window),function(a,b,c,d){function e(){return""+Math.round(Math.random()*1e5,0)}"use strict",a.jmpress("setActive",function(b,c){c.prevStep!==b&&a(b).triggerHandler("enterStep")}),a.jmpress("setInactive",function(b,c){c.nextStep!==b&&a(b).triggerHandler("leaveStep")})}(jQuery,document,window),function(a,b,c,d){function e(){return""+Math.round(Math.random()*1e5,0)}function f(b){var c=b.split(" "),d=c[0],e={willClass:"will-"+d,doClass:"do-"+d,hasClass:"has-"+d},f="";for(var g=1;g<c.length;g++){var h=c[g];switch(f){case"":h==="after"?f="after":a.warn("unknown keyword in '"+b+"'. '"+h+"' unknown.");break;case"after":if(h.match(/^[1-9][0-9]*m?s?/)){var i=parseFloat(h);h.indexOf("ms")!==-1?i*=1:h.indexOf("s")!==-1?i*=1e3:h.indexOf("m")!==-1&&(i*=6e4),e.delay=i}else e.after=Array.prototype.slice.call(c,g).join(" ")}}return e}function g(b,c,d,e){e=e||b.length-1,d=d||0;for(var f=d;f<e+1;f++)if(a(b[f].element).is(c))return f}function h(b,c,d){a.each(c._on,function(a,c){b.push({substep:c.substep,delay:c.delay+d}),h(b,c.substep,c.delay+d)})}"use strict",a.jmpress("defaults").customAnimationDataAttribute="jmpress",a.jmpress("afterInit",function(a,b){b.current.animationTimeouts=[],b.current.animationCleanupWaiting=[]}),a.jmpress("applyStep",function(b,c){function m(a,b){if(b.substep._after)return j=b.substep._after,!1}var e={},i=[];a(b).find("[data-"+c.settings.customAnimationDataAttribute+"]").each(function(d,e){a(e).closest(c.settings.stepSelector).is(b)&&i.push({element:e})});if(i.length===0)return;a.each(i,function(b,d){d.info=f(a(d.element).data(c.settings.customAnimationDataAttribute)),a(d.element).addClass(d.info.willClass),d._on=[],d._after=null});var j={_after:d,_on:[],info:{}};a.each(i,function(a,b){var c=b.info.after;if(c)if(c==="step")c=j;else if(c==="prev")c=i[a-1];else{var d=g(i,c,0,a-1);d===-1&&(d=g(i,c)),c=d===-1||d===a?i[a-1]:i[d]}else c=i[a-1];if(c){if(!b.info.delay){if(!c._after){c._after=b;return}c=c._after}c._on.push({substep:b,delay:b.info.delay||0})}});if(j._after===d&&j._on.length===0){var k=g(i,c.stepData.startSubstep)||0;j._after=i[k]}var l=[];do{var n=[{substep:j,delay:0}];h(n,j,0),l.push(n),j=null,a.each(n,m)}while(j);e.list=l,a(b).data("substepsData",e)}),a.jmpress("unapplyStep",function(b,c){var d=a(b).data("substepsData");d&&a.each(d.list,function(b,c){a.each(c,function(b,c){c.substep.info.willClass&&a(c.substep.element).removeClass(c.substep.info.willClass),c.substep.info.hasClass&&a(c.substep.element).removeClass(c.substep.info.hasClass),c.substep.info.doClass&&a(c.substep.element).removeClass(c.substep.info.doClass)})})}),a.jmpress("setActive",function(b,c){var e=a(b).data("substepsData");if(!e)return;c.substep===d&&(c.substep=c.reason==="prev"?e.list.length-1:0);var f=c.substep;a.each(c.current.animationTimeouts,function(a,b){clearTimeout(b)}),c.current.animationTimeouts=[],a.each(e.list,function(b,d){var e=b<f,g=b<=f;a.each(d,function(b,d){function f(){a(d.substep.element).addClass(d.substep.info.doClass)}d.substep.info.hasClass&&a(d.substep.element)[(e?"add":"remove")+"Class"](d.substep.info.hasClass),g&&!e&&d.delay&&c.reason!=="prev"?d.substep.info.doClass&&(a(d.substep.element).removeClass(d.substep.info.doClass),c.current.animationTimeouts.push(setTimeout(f,d.delay))):d.substep.info.doClass&&a(d.substep.element)[(g?"add":"remove")+"Class"](d.substep.info.doClass)})})}),a.jmpress("setInactive",function(b,c){function d(b){a.each(b.list,function(b,c){a.each(c,function(b,c){c.substep.info.hasClass&&a(c.substep.element).removeClass(c.substep.info.hasClass),c.substep.info.doClass&&a(c.substep.element).removeClass(c.substep.info.doClass)})})}if(c.nextStep===b)return;a.each(c.current.animationCleanupWaiting,function(a,b){d(b)}),c.current.animationCleanupWaiting=[];var e=a(b).data("substepsData");e&&c.current.animationCleanupWaiting.push(e)}),a.jmpress("selectNext",function(b,c){if(c.substep===d)return;var e=a(b).data("substepsData");if(!e)return;if(c.substep<e.list.length-1)return{step:b,substep:c.substep+1}}),a.jmpress("selectPrev",function(b,c){if(c.substep===d)return;var e=a(b).data("substepsData");if(!e)return;if(c.substep>0)return{step:b,substep:c.substep-1}})}(jQuery,document,window);

(function( $, undefined ) {
		
	/*
	 * JMSlideshow object
	 */
	$.JMSlideshow 				= function( options, element ) {
		
		// the jms-slideshow
		this.$el	= $( element );
		
		this._init( options );
		
	};
	
	$.JMSlideshow.defaults 		= {
		// options for the jmpress plugin.
		// you can add much more options here. Check http://shama.github.com/jmpress.js/
		jmpressOpts	: {
			// set the viewport
			viewPort 		: {
				height	: 400,
				width	: 1000,
				maxScale: 1
			},
			fullscreen		: false,
			hash			: { use : false },
			mouse			: { clickSelects : false },
			keyboard		: { use : false },
			animation		: { transitionDuration : '1s' }
		},
		// for this specific plugin we will have the following options:
		// shows/hides navigation arrows
		arrows		: true,
		// shows/hides navigation dots/pages
		dots		: true,
		// each step's bgcolor transition speed
		bgColorSpeed: '1s',
		// slideshow on / off
		autoplay	: false,
		// time between transitions for the slideshow
		interval	: 6500
    };
	
	$.JMSlideshow.prototype 	= {
		_init 				: function( options ) {
			
			this.options 		= $.extend( true, {}, $.JMSlideshow.defaults, options );
			
			// each one of the slides
			this.$slides		= $('#jms-slideshow').children('div');
			// total number of slides
			this.slidesCount	= this.$slides.length;
			// step's bgcolor
			this.colors			= $.map( this.$slides, function( el, i ) { return $( el ).data( 'color' ); } ).join( ' ' );
			// build the necessary structure to run jmpress
			this._layout();
			// initialize the jmpress plugin
			this._initImpress();
			// if support (function implemented in jmpress plugin)
			if( this.support ) {
			
				// load some events
				this._loadEvents();
				// if autoplay is true start the slideshow
				if( this.options.autoplay ) {
				
					this._startSlideshow();
				
				}
				
			}
			
		},
		// wraps all the slides in the jms-wrapper div;
		// adds the navigation options ( arrows and dots ) if set to true
		_layout				: function() {
			
			// adds a specific class to each one of the steps
			this.$slides.each( function( i ) {
			
				$(this).addClass( 'jmstep' + ( i + 1 ) );
			
			} );
			
			// wrap the slides. This wrapper will be the element on which we will call the jmpress plugin
			this.$jmsWrapper	= this.$slides.wrapAll( '<div class="jms-wrapper"/>' ).parent();
			
			// transition speed for the wrapper bgcolor 
			this.$jmsWrapper.css( {
				'-webkit-transition-duration' 	: this.options.bgColorSpeed,
				'-moz-transition-duration' 		: this.options.bgColorSpeed,
				'-ms-transition-duration' 		: this.options.bgColorSpeed,
				'-o-transition-duration' 		: this.options.bgColorSpeed,
				'transition-duration' 			: this.options.bgColorSpeed
			} );
			
			// add navigation arrows
			if( this.options.arrows ) {
			
				this.$arrows	= $( '<nav class="jms-arrows"></nav>' );
				
				if( this.slidesCount > 1 ) {
				
					this.$arrowPrev	= $( '<span class="jms-arrows-prev"/>' ).appendTo( this.$arrows );
					this.$arrowNext	= $( '<span class="jms-arrows-next"/>' ).appendTo( this.$arrows );
					
				}

				this.$el.append( this.$arrows )
			
			}
			
			// add navigation dots
			if( this.options.dots ) {
			
				this.$dots		= $( '<nav class="jms-dots"></nav>' );
				
				for( var i = this.slidesCount + 1; --i; ) {
				
					this.$dots.append( ( i === this.slidesCount ) ? '<span class="jms-dots-current"/>' : '<span/>' );
				
				}
				
				if( this.options.jmpressOpts.start ) {
					
					this.$start		= this.$jmsWrapper.find( this.options.jmpressOpts.start ), idxSelected = 0;
					
					( this.$start.length ) ? idxSelected = this.$start.index() : this.options.jmpressOpts.start = null;
					
					this.$dots.children().removeClass( 'jms-dots-current' ).eq( idxSelected ).addClass( 'jms-dots-current' );
				
				}
				
				this.$el.append( this.$dots )
			
			}
			
		},
		// initialize the jmpress plugin
		_initImpress		: function() {
			
			var _self = this;
			
			this.$jmsWrapper.jmpress( this.options.jmpressOpts );
			// check if supported (function from jmpress.js):
			// it adds the class not-suported to the wrapper
			this.support	= !this.$jmsWrapper.hasClass( 'not-supported' );
			
			// if not supported remove unnecessary elements
			if( !this.support ) {
			
				if( this.$arrows ) {
				
					this.$arrows.remove();
				
				}
				
				if( this.$dots ) {
				
					this.$dots.remove();
				
				}
				
				return false;
			
			}
			
			// redefine the jmpress setActive method
			this.$jmsWrapper.jmpress( 'setActive', function( slide, eventData ) {
				
				// change the pagination dot active class			
				if( _self.options.dots ) {
					
					// adds the current class to the current dot/page
					_self.$dots
						 .children()
						 .removeClass( 'jms-dots-current' )
						 .eq( slide.index() )
						 .addClass( 'jms-dots-current' );
				
				}
				
				// delete all current bg colors
				this.removeClass( _self.colors );
				// add bg color class
				this.addClass( slide.data( 'color' ) );
				
			} );
			
			// add step's bg color to the wrapper
			this.$jmsWrapper.addClass( this.$jmsWrapper.jmpress('active').data( 'color' ) );
			
		},
		// start slideshow if autoplay is true
		_startSlideshow		: function() {
		
			var _self	= this;
			
			this.slideshow	= setTimeout( function() {
				
				_self.$jmsWrapper.jmpress( 'next' );
				
				if( _self.options.autoplay ) {
				
					_self._startSlideshow();
				
				}
			
			}, this.options.interval );
		
		},
		// stops the slideshow
		_stopSlideshow		: function() {
		
			if( this.options.autoplay ) {
					
				clearTimeout( this.slideshow );
				this.options.autoplay	= false;
			
			}
		
		},
		_loadEvents			: function() {
			
			var _self = this;
			
			// navigation arrows
			if( this.$arrowPrev && this.$arrowNext ) {
			
				this.$arrowPrev.on( 'click.jmslideshow', function( event ) {
					
					_self._stopSlideshow();
				
					_self.$jmsWrapper.jmpress( 'prev' );

					return false;
				
				} );
				
				this.$arrowNext.on( 'click.jmslideshow', function( event ) {
					
					_self._stopSlideshow();
					
					_self.$jmsWrapper.jmpress( 'next' );
					
					return false;
				
				} );
				
			}
			
			// navigation dots
			if( this.$dots ) {
			
				this.$dots.children().on( 'click.jmslideshow', function( event ) {
				 	
					_self._stopSlideshow();
					
					_self.$jmsWrapper.jmpress( 'goTo', '.jmstep' + ( $(this).index() + 1 ) );
					
					return false;
				
				} );
			
			}
			
			// the touchend event is already defined in the jmpress plugin.
			// we just need to make sure the slideshow stops if the event is triggered
			this.$jmsWrapper.on( 'touchend.jmslideshow', function() {
			
				_self._stopSlideshow();
			
			} );
			
		}
	};
	
	var logError 			= function( message ) {
		if ( this.console ) {
			console.error( message );
		}
	};
	
	$.fn.jmslideshow		= function( options ) {
	
		if ( typeof options === 'string' ) {
			
			var args = Array.prototype.slice.call( arguments, 1 );
			
			this.each(function() {
			
				var instance = $.data( this, 'jmslideshow' );
				
				if ( !instance ) {
					logError( "cannot call methods on jmslideshow prior to initialization; " +
					"attempted to call method '" + options + "'" );
					return;
				}
				
				if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {
					logError( "no such method '" + options + "' for jmslideshow instance" );
					return;
				}
				
				instance[ options ].apply( instance, args );
			
			});
		
		} 
		else {
		
			this.each(function() {
			
				var instance = $.data( this, 'jmslideshow' );
				if ( !instance ) {
					$.data( this, 'jmslideshow', new $.JMSlideshow( options, this ) );
				}
			});
		
		}
		
		return this;
		
	};
	
})( jQuery );

/**
 * BxSlider v4.1.1 - Fully loaded, responsive content slider
 * http://bxslider.com
 *
 * Copyright 2013, Steven Wanderski - http://stevenwanderski.com - http://bxcreative.com
 * Written while drinking Belgian ales and listening to jazz
 *
 * Released under the MIT license - http://opensource.org/licenses/MIT
 */
!function(t){var e={},s={mode:"horizontal",slideSelector:"",infiniteLoop:!0,hideControlOnEnd:!1,speed:500,easing:null,slideMargin:0,startSlide:0,randomStart:!1,captions:!1,ticker:!1,tickerHover:!1,adaptiveHeight:!1,adaptiveHeightSpeed:500,video:!1,useCSS:!0,preloadImages:"visible",responsive:!0,touchEnabled:!0,swipeThreshold:50,oneToOneTouch:!0,preventDefaultSwipeX:!0,preventDefaultSwipeY:!1,pager:!0,pagerType:"full",pagerShortSeparator:" / ",pagerSelector:null,buildPager:null,pagerCustom:null,controls:!0,nextText:">",prevText:"<",nextSelector:null,prevSelector:null,autoControls:!1,startText:"Start",stopText:"Stop",autoControlsCombine:!1,autoControlsSelector:null,auto:!1,pause:4e3,autoStart:!0,autoDirection:"next",autoHover:!1,autoDelay:0,minSlides:1,maxSlides:1,moveSlides:0,slideWidth:0,onSliderLoad:function(){},onSlideBefore:function(){},onSlideAfter:function(){},onSlideNext:function(){},onSlidePrev:function(){}};t.fn.bxSlider=function(n){if(0==this.length)return this;if(this.length>1)return this.each(function(){t(this).bxSlider(n)}),this;var o={},r=this;e.el=this;var a=t(window).width(),l=t(window).height(),d=function(){o.settings=t.extend({},s,n),o.settings.slideWidth=parseInt(o.settings.slideWidth),o.children=r.children(o.settings.slideSelector),o.children.length<o.settings.minSlides&&(o.settings.minSlides=o.children.length),o.children.length<o.settings.maxSlides&&(o.settings.maxSlides=o.children.length),o.settings.randomStart&&(o.settings.startSlide=Math.floor(Math.random()*o.children.length)),o.active={index:o.settings.startSlide},o.carousel=o.settings.minSlides>1||o.settings.maxSlides>1,o.carousel&&(o.settings.preloadImages="all"),o.minThreshold=o.settings.minSlides*o.settings.slideWidth+(o.settings.minSlides-1)*o.settings.slideMargin,o.maxThreshold=o.settings.maxSlides*o.settings.slideWidth+(o.settings.maxSlides-1)*o.settings.slideMargin,o.working=!1,o.controls={},o.interval=null,o.animProp="vertical"==o.settings.mode?"top":"left",o.usingCSS=o.settings.useCSS&&"fade"!=o.settings.mode&&function(){var t=document.createElement("div"),e=["WebkitPerspective","MozPerspective","OPerspective","msPerspective"];for(var i in e)if(void 0!==t.style[e[i]])return o.cssPrefix=e[i].replace("Perspective","").toLowerCase(),o.animProp="-"+o.cssPrefix+"-transform",!0;return!1}(),"vertical"==o.settings.mode&&(o.settings.maxSlides=o.settings.minSlides),r.data("origStyle",r.attr("style")),r.children(o.settings.slideSelector).each(function(){t(this).data("origStyle",t(this).attr("style"))}),c()},c=function(){r.wrap('<div class="bx-wrapper"><div class="bx-viewport"></div></div>'),o.viewport=r.parent(),o.loader=t('<div class="bx-loading" />'),o.viewport.prepend(o.loader),r.css({width:"horizontal"==o.settings.mode?100*o.children.length+215+"%":"auto",position:"relative"}),o.usingCSS&&o.settings.easing?r.css("-"+o.cssPrefix+"-transition-timing-function",o.settings.easing):o.settings.easing||(o.settings.easing="swing"),f(),o.viewport.css({width:"100%",overflow:"hidden",position:"relative"}),o.viewport.parent().css({maxWidth:v()}),o.settings.pager||o.viewport.parent().css({margin:"0 auto 0px"}),o.children.css({"float":"horizontal"==o.settings.mode?"left":"none",listStyle:"none",position:"relative"}),o.children.css("width",u()),"horizontal"==o.settings.mode&&o.settings.slideMargin>0&&o.children.css("marginRight",o.settings.slideMargin),"vertical"==o.settings.mode&&o.settings.slideMargin>0&&o.children.css("marginBottom",o.settings.slideMargin),"fade"==o.settings.mode&&(o.children.css({position:"absolute",zIndex:0,display:"none"}),o.children.eq(o.settings.startSlide).css({zIndex:50,display:"block"})),o.controls.el=t('<div class="bx-controls" />'),o.settings.captions&&P(),o.active.last=o.settings.startSlide==x()-1,o.settings.video&&r.fitVids();var e=o.children.eq(o.settings.startSlide);"all"==o.settings.preloadImages&&(e=o.children),o.settings.ticker?o.settings.pager=!1:(o.settings.pager&&T(),o.settings.controls&&C(),o.settings.auto&&o.settings.autoControls&&E(),(o.settings.controls||o.settings.autoControls||o.settings.pager)&&o.viewport.after(o.controls.el)),g(e,h)},g=function(e,i){var s=e.find("img, iframe").length;if(0==s)return i(),void 0;var n=0;e.find("img, iframe").each(function(){t(this).one("load",function(){++n==s&&i()}).each(function(){this.complete&&t(this).load()})})},h=function(){if(o.settings.infiniteLoop&&"fade"!=o.settings.mode&&!o.settings.ticker){var e="vertical"==o.settings.mode?o.settings.minSlides:o.settings.maxSlides,i=o.children.slice(0,e).clone().addClass("bx-clone"),s=o.children.slice(-e).clone().addClass("bx-clone");r.append(i).prepend(s)}o.loader.remove(),S(),"vertical"==o.settings.mode&&(o.settings.adaptiveHeight=!0),o.viewport.height(p()),r.redrawSlider(),o.settings.onSliderLoad(o.active.index),o.initialized=!0,o.settings.responsive&&t(window).bind("resize",B),o.settings.auto&&o.settings.autoStart&&H(),o.settings.ticker&&L(),o.settings.pager&&I(o.settings.startSlide),o.settings.controls&&W(),o.settings.touchEnabled&&!o.settings.ticker&&O()},p=function(){var e=0,s=t();if("vertical"==o.settings.mode||o.settings.adaptiveHeight)if(o.carousel){var n=1==o.settings.moveSlides?o.active.index:o.active.index*m();for(s=o.children.eq(n),i=1;i<=o.settings.maxSlides-1;i++)s=n+i>=o.children.length?s.add(o.children.eq(i-1)):s.add(o.children.eq(n+i))}else s=o.children.eq(o.active.index);else s=o.children;return"vertical"==o.settings.mode?(s.each(function(){e+=t(this).outerHeight()}),o.settings.slideMargin>0&&(e+=o.settings.slideMargin*(o.settings.minSlides-1))):e=Math.max.apply(Math,s.map(function(){return t(this).outerHeight(!1)}).get()),e},v=function(){var t="100%";return o.settings.slideWidth>0&&(t="horizontal"==o.settings.mode?o.settings.maxSlides*o.settings.slideWidth+(o.settings.maxSlides-1)*o.settings.slideMargin:o.settings.slideWidth),t},u=function(){var t=o.settings.slideWidth,e=o.viewport.width();return 0==o.settings.slideWidth||o.settings.slideWidth>e&&!o.carousel||"vertical"==o.settings.mode?t=e:o.settings.maxSlides>1&&"horizontal"==o.settings.mode&&(e>o.maxThreshold||e<o.minThreshold&&(t=(e-o.settings.slideMargin*(o.settings.minSlides-1))/o.settings.minSlides)),t},f=function(){var t=1;if("horizontal"==o.settings.mode&&o.settings.slideWidth>0)if(o.viewport.width()<o.minThreshold)t=o.settings.minSlides;else if(o.viewport.width()>o.maxThreshold)t=o.settings.maxSlides;else{var e=o.children.first().width();t=Math.floor(o.viewport.width()/e)}else"vertical"==o.settings.mode&&(t=o.settings.minSlides);return t},x=function(){var t=0;if(o.settings.moveSlides>0)if(o.settings.infiniteLoop)t=o.children.length/m();else for(var e=0,i=0;e<o.children.length;)++t,e=i+f(),i+=o.settings.moveSlides<=f()?o.settings.moveSlides:f();else t=Math.ceil(o.children.length/f());return t},m=function(){return o.settings.moveSlides>0&&o.settings.moveSlides<=f()?o.settings.moveSlides:f()},S=function(){if(o.children.length>o.settings.maxSlides&&o.active.last&&!o.settings.infiniteLoop){if("horizontal"==o.settings.mode){var t=o.children.last(),e=t.position();b(-(e.left-(o.viewport.width()-t.width())),"reset",0)}else if("vertical"==o.settings.mode){var i=o.children.length-o.settings.minSlides,e=o.children.eq(i).position();b(-e.top,"reset",0)}}else{var e=o.children.eq(o.active.index*m()).position();o.active.index==x()-1&&(o.active.last=!0),void 0!=e&&("horizontal"==o.settings.mode?b(-e.left,"reset",0):"vertical"==o.settings.mode&&b(-e.top,"reset",0))}},b=function(t,e,i,s){if(o.usingCSS){var n="vertical"==o.settings.mode?"translate3d(0, "+t+"px, 0)":"translate3d("+t+"px, 0, 0)";r.css("-"+o.cssPrefix+"-transition-duration",i/1e3+"s"),"slide"==e?(r.css(o.animProp,n),r.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd",function(){r.unbind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd"),D()})):"reset"==e?r.css(o.animProp,n):"ticker"==e&&(r.css("-"+o.cssPrefix+"-transition-timing-function","linear"),r.css(o.animProp,n),r.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd",function(){r.unbind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd"),b(s.resetValue,"reset",0),N()}))}else{var a={};a[o.animProp]=t,"slide"==e?r.animate(a,i,o.settings.easing,function(){D()}):"reset"==e?r.css(o.animProp,t):"ticker"==e&&r.animate(a,speed,"linear",function(){b(s.resetValue,"reset",0),N()})}},w=function(){for(var e="",i=x(),s=0;i>s;s++){var n="";o.settings.buildPager&&t.isFunction(o.settings.buildPager)?(n=o.settings.buildPager(s),o.pagerEl.addClass("bx-custom-pager")):(n=s+1,o.pagerEl.addClass("bx-default-pager")),e+='<div class="bx-pager-item"><a href="" data-slide-index="'+s+'" class="bx-pager-link">'+n+"</a></div>"}o.pagerEl.html(e)},T=function(){o.settings.pagerCustom?o.pagerEl=t(o.settings.pagerCustom):(o.pagerEl=t('<div class="bx-pager" />'),o.settings.pagerSelector?t(o.settings.pagerSelector).html(o.pagerEl):o.controls.el.addClass("bx-has-pager").append(o.pagerEl),w()),o.pagerEl.delegate("a","click",q)},C=function(){o.controls.next=t('<a class="bx-next" href="">'+o.settings.nextText+"</a>"),o.controls.prev=t('<a class="bx-prev" href="">'+o.settings.prevText+"</a>"),o.controls.next.bind("click",y),o.controls.prev.bind("click",z),o.settings.nextSelector&&t(o.settings.nextSelector).append(o.controls.next),o.settings.prevSelector&&t(o.settings.prevSelector).append(o.controls.prev),o.settings.nextSelector||o.settings.prevSelector||(o.controls.directionEl=t('<div class="bx-controls-direction" />'),o.controls.directionEl.append(o.controls.prev).append(o.controls.next),o.controls.el.addClass("bx-has-controls-direction").append(o.controls.directionEl))},E=function(){o.controls.start=t('<div class="bx-controls-auto-item"><a class="bx-start" href="">'+o.settings.startText+"</a></div>"),o.controls.stop=t('<div class="bx-controls-auto-item"><a class="bx-stop" href="">'+o.settings.stopText+"</a></div>"),o.controls.autoEl=t('<div class="bx-controls-auto" />'),o.controls.autoEl.delegate(".bx-start","click",k),o.controls.autoEl.delegate(".bx-stop","click",M),o.settings.autoControlsCombine?o.controls.autoEl.append(o.controls.start):o.controls.autoEl.append(o.controls.start).append(o.controls.stop),o.settings.autoControlsSelector?t(o.settings.autoControlsSelector).html(o.controls.autoEl):o.controls.el.addClass("bx-has-controls-auto").append(o.controls.autoEl),A(o.settings.autoStart?"stop":"start")},P=function(){o.children.each(function(){var e=t(this).find("img:first").attr("title");void 0!=e&&(""+e).length&&t(this).append('<div class="bx-caption"><span>'+e+"</span></div>")})},y=function(t){o.settings.auto&&r.stopAuto(),r.goToNextSlide(),t.preventDefault()},z=function(t){o.settings.auto&&r.stopAuto(),r.goToPrevSlide(),t.preventDefault()},k=function(t){r.startAuto(),t.preventDefault()},M=function(t){r.stopAuto(),t.preventDefault()},q=function(e){o.settings.auto&&r.stopAuto();var i=t(e.currentTarget),s=parseInt(i.attr("data-slide-index"));s!=o.active.index&&r.goToSlide(s),e.preventDefault()},I=function(e){var i=o.children.length;return"short"==o.settings.pagerType?(o.settings.maxSlides>1&&(i=Math.ceil(o.children.length/o.settings.maxSlides)),o.pagerEl.html(e+1+o.settings.pagerShortSeparator+i),void 0):(o.pagerEl.find("a").removeClass("active"),o.pagerEl.each(function(i,s){t(s).find("a").eq(e).addClass("active")}),void 0)},D=function(){if(o.settings.infiniteLoop){var t="";0==o.active.index?t=o.children.eq(0).position():o.active.index==x()-1&&o.carousel?t=o.children.eq((x()-1)*m()).position():o.active.index==o.children.length-1&&(t=o.children.eq(o.children.length-1).position()),"horizontal"==o.settings.mode?b(-t.left,"reset",0):"vertical"==o.settings.mode&&b(-t.top,"reset",0)}o.working=!1,o.settings.onSlideAfter(o.children.eq(o.active.index),o.oldIndex,o.active.index)},A=function(t){o.settings.autoControlsCombine?o.controls.autoEl.html(o.controls[t]):(o.controls.autoEl.find("a").removeClass("active"),o.controls.autoEl.find("a:not(.bx-"+t+")").addClass("active"))},W=function(){1==x()?(o.controls.prev.addClass("disabled"),o.controls.next.addClass("disabled")):!o.settings.infiniteLoop&&o.settings.hideControlOnEnd&&(0==o.active.index?(o.controls.prev.addClass("disabled"),o.controls.next.removeClass("disabled")):o.active.index==x()-1?(o.controls.next.addClass("disabled"),o.controls.prev.removeClass("disabled")):(o.controls.prev.removeClass("disabled"),o.controls.next.removeClass("disabled")))},H=function(){o.settings.autoDelay>0?setTimeout(r.startAuto,o.settings.autoDelay):r.startAuto(),o.settings.autoHover&&r.hover(function(){o.interval&&(r.stopAuto(!0),o.autoPaused=!0)},function(){o.autoPaused&&(r.startAuto(!0),o.autoPaused=null)})},L=function(){var e=0;if("next"==o.settings.autoDirection)r.append(o.children.clone().addClass("bx-clone"));else{r.prepend(o.children.clone().addClass("bx-clone"));var i=o.children.first().position();e="horizontal"==o.settings.mode?-i.left:-i.top}b(e,"reset",0),o.settings.pager=!1,o.settings.controls=!1,o.settings.autoControls=!1,o.settings.tickerHover&&!o.usingCSS&&o.viewport.hover(function(){r.stop()},function(){var e=0;o.children.each(function(){e+="horizontal"==o.settings.mode?t(this).outerWidth(!0):t(this).outerHeight(!0)});var i=o.settings.speed/e,s="horizontal"==o.settings.mode?"left":"top",n=i*(e-Math.abs(parseInt(r.css(s))));N(n)}),N()},N=function(t){speed=t?t:o.settings.speed;var e={left:0,top:0},i={left:0,top:0};"next"==o.settings.autoDirection?e=r.find(".bx-clone").first().position():i=o.children.first().position();var s="horizontal"==o.settings.mode?-e.left:-e.top,n="horizontal"==o.settings.mode?-i.left:-i.top,a={resetValue:n};b(s,"ticker",speed,a)},O=function(){o.touch={start:{x:0,y:0},end:{x:0,y:0}},o.viewport.bind("touchstart",X)},X=function(t){if(o.working)t.preventDefault();else{o.touch.originalPos=r.position();var e=t.originalEvent;o.touch.start.x=e.changedTouches[0].pageX,o.touch.start.y=e.changedTouches[0].pageY,o.viewport.bind("touchmove",Y),o.viewport.bind("touchend",V)}},Y=function(t){var e=t.originalEvent,i=Math.abs(e.changedTouches[0].pageX-o.touch.start.x),s=Math.abs(e.changedTouches[0].pageY-o.touch.start.y);if(3*i>s&&o.settings.preventDefaultSwipeX?t.preventDefault():3*s>i&&o.settings.preventDefaultSwipeY&&t.preventDefault(),"fade"!=o.settings.mode&&o.settings.oneToOneTouch){var n=0;if("horizontal"==o.settings.mode){var r=e.changedTouches[0].pageX-o.touch.start.x;n=o.touch.originalPos.left+r}else{var r=e.changedTouches[0].pageY-o.touch.start.y;n=o.touch.originalPos.top+r}b(n,"reset",0)}},V=function(t){o.viewport.unbind("touchmove",Y);var e=t.originalEvent,i=0;if(o.touch.end.x=e.changedTouches[0].pageX,o.touch.end.y=e.changedTouches[0].pageY,"fade"==o.settings.mode){var s=Math.abs(o.touch.start.x-o.touch.end.x);s>=o.settings.swipeThreshold&&(o.touch.start.x>o.touch.end.x?r.goToNextSlide():r.goToPrevSlide(),r.stopAuto())}else{var s=0;"horizontal"==o.settings.mode?(s=o.touch.end.x-o.touch.start.x,i=o.touch.originalPos.left):(s=o.touch.end.y-o.touch.start.y,i=o.touch.originalPos.top),!o.settings.infiniteLoop&&(0==o.active.index&&s>0||o.active.last&&0>s)?b(i,"reset",200):Math.abs(s)>=o.settings.swipeThreshold?(0>s?r.goToNextSlide():r.goToPrevSlide(),r.stopAuto()):b(i,"reset",200)}o.viewport.unbind("touchend",V)},B=function(){var e=t(window).width(),i=t(window).height();(a!=e||l!=i)&&(a=e,l=i,r.redrawSlider())};return r.goToSlide=function(e,i){if(!o.working&&o.active.index!=e)if(o.working=!0,o.oldIndex=o.active.index,o.active.index=0>e?x()-1:e>=x()?0:e,o.settings.onSlideBefore(o.children.eq(o.active.index),o.oldIndex,o.active.index),"next"==i?o.settings.onSlideNext(o.children.eq(o.active.index),o.oldIndex,o.active.index):"prev"==i&&o.settings.onSlidePrev(o.children.eq(o.active.index),o.oldIndex,o.active.index),o.active.last=o.active.index>=x()-1,o.settings.pager&&I(o.active.index),o.settings.controls&&W(),"fade"==o.settings.mode)o.settings.adaptiveHeight&&o.viewport.height()!=p()&&o.viewport.animate({height:p()},o.settings.adaptiveHeightSpeed),o.children.filter(":visible").fadeOut(o.settings.speed).css({zIndex:0}),o.children.eq(o.active.index).css("zIndex",51).fadeIn(o.settings.speed,function(){t(this).css("zIndex",50),D()});else{o.settings.adaptiveHeight&&o.viewport.height()!=p()&&o.viewport.animate({height:p()},o.settings.adaptiveHeightSpeed);var s=0,n={left:0,top:0};if(!o.settings.infiniteLoop&&o.carousel&&o.active.last)if("horizontal"==o.settings.mode){var a=o.children.eq(o.children.length-1);n=a.position(),s=o.viewport.width()-a.outerWidth()}else{var l=o.children.length-o.settings.minSlides;n=o.children.eq(l).position()}else if(o.carousel&&o.active.last&&"prev"==i){var d=1==o.settings.moveSlides?o.settings.maxSlides-m():(x()-1)*m()-(o.children.length-o.settings.maxSlides),a=r.children(".bx-clone").eq(d);n=a.position()}else if("next"==i&&0==o.active.index)n=r.find("> .bx-clone").eq(o.settings.maxSlides).position(),o.active.last=!1;else if(e>=0){var c=e*m();n=o.children.eq(c).position()}if("undefined"!=typeof n){var g="horizontal"==o.settings.mode?-(n.left-s):-n.top;b(g,"slide",o.settings.speed)}}},r.goToNextSlide=function(){if(o.settings.infiniteLoop||!o.active.last){var t=parseInt(o.active.index)+1;r.goToSlide(t,"next")}},r.goToPrevSlide=function(){if(o.settings.infiniteLoop||0!=o.active.index){var t=parseInt(o.active.index)-1;r.goToSlide(t,"prev")}},r.startAuto=function(t){o.interval||(o.interval=setInterval(function(){"next"==o.settings.autoDirection?r.goToNextSlide():r.goToPrevSlide()},o.settings.pause),o.settings.autoControls&&1!=t&&A("stop"))},r.stopAuto=function(t){o.interval&&(clearInterval(o.interval),o.interval=null,o.settings.autoControls&&1!=t&&A("start"))},r.getCurrentSlide=function(){return o.active.index},r.getSlideCount=function(){return o.children.length},r.redrawSlider=function(){o.children.add(r.find(".bx-clone")).outerWidth(u()),o.viewport.css("height",p()),o.settings.ticker||S(),o.active.last&&(o.active.index=x()-1),o.active.index>=x()&&(o.active.last=!0),o.settings.pager&&!o.settings.pagerCustom&&(w(),I(o.active.index))},r.destroySlider=function(){o.initialized&&(o.initialized=!1,t(".bx-clone",this).remove(),o.children.each(function(){void 0!=t(this).data("origStyle")?t(this).attr("style",t(this).data("origStyle")):t(this).removeAttr("style")}),void 0!=t(this).data("origStyle")?this.attr("style",t(this).data("origStyle")):t(this).removeAttr("style"),t(this).unwrap().unwrap(),o.controls.el&&o.controls.el.remove(),o.controls.next&&o.controls.next.remove(),o.controls.prev&&o.controls.prev.remove(),o.pagerEl&&o.pagerEl.remove(),t(".bx-caption",this).remove(),o.controls.autoEl&&o.controls.autoEl.remove(),clearInterval(o.interval),o.settings.responsive&&t(window).unbind("resize",B))},r.reloadSlider=function(t){void 0!=t&&(n=t),r.destroySlider(),d()},d(),this}}(jQuery);

/* Modernizr 2.6.2 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-cssanimations-csstransitions-touch-shiv-cssclasses-prefixed-teststyles-testprop-testallprops-prefixes-domprefixes-load
 */
;window.Modernizr=function(a,b,c){function z(a){j.cssText=a}function A(a,b){return z(m.join(a+";")+(b||""))}function B(a,b){return typeof a===b}function C(a,b){return!!~(""+a).indexOf(b)}function D(a,b){for(var d in a){var e=a[d];if(!C(e,"-")&&j[e]!==c)return b=="pfx"?e:!0}return!1}function E(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:B(f,"function")?f.bind(d||b):f}return!1}function F(a,b,c){var d=a.charAt(0).toUpperCase()+a.slice(1),e=(a+" "+o.join(d+" ")+d).split(" ");return B(b,"string")||B(b,"undefined")?D(e,b):(e=(a+" "+p.join(d+" ")+d).split(" "),E(e,b,c))}var d="2.6.2",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k,l={}.toString,m=" -webkit- -moz- -o- -ms- ".split(" "),n="Webkit Moz O ms",o=n.split(" "),p=n.toLowerCase().split(" "),q={},r={},s={},t=[],u=t.slice,v,w=function(a,c,d,e){var f,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),l.appendChild(j);return f=["&#173;",'<style id="s',h,'">',a,"</style>"].join(""),l.id=h,(m?l:n).innerHTML+=f,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=g.style.overflow,g.style.overflow="hidden",g.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),g.style.overflow=k),!!i},x={}.hasOwnProperty,y;!B(x,"undefined")&&!B(x.call,"undefined")?y=function(a,b){return x.call(a,b)}:y=function(a,b){return b in a&&B(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=u.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(u.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(u.call(arguments)))};return e}),q.touch=function(){var c;return"ontouchstart"in a||a.DocumentTouch&&b instanceof DocumentTouch?c=!0:w(["@media (",m.join("touch-enabled),("),h,")","{#modernizr{top:9px;position:absolute}}"].join(""),function(a){c=a.offsetTop===9}),c},q.cssanimations=function(){return F("animationName")},q.csstransitions=function(){return F("transition")};for(var G in q)y(q,G)&&(v=G.toLowerCase(),e[v]=q[G](),t.push((e[v]?"":"no-")+v));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)y(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof f!="undefined"&&f&&(g.className+=" "+(b?"":"no-")+a),e[a]=b}return e},z(""),i=k=null,function(a,b){function k(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function l(){var a=r.elements;return typeof a=="string"?a.split(" "):a}function m(a){var b=i[a[g]];return b||(b={},h++,a[g]=h,i[h]=b),b}function n(a,c,f){c||(c=b);if(j)return c.createElement(a);f||(f=m(c));var g;return f.cache[a]?g=f.cache[a].cloneNode():e.test(a)?g=(f.cache[a]=f.createElem(a)).cloneNode():g=f.createElem(a),g.canHaveChildren&&!d.test(a)?f.frag.appendChild(g):g}function o(a,c){a||(a=b);if(j)return a.createDocumentFragment();c=c||m(a);var d=c.frag.cloneNode(),e=0,f=l(),g=f.length;for(;e<g;e++)d.createElement(f[e]);return d}function p(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return r.shivMethods?n(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+l().join().replace(/\w+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(r,b.frag)}function q(a){a||(a=b);var c=m(a);return r.shivCSS&&!f&&!c.hasCSS&&(c.hasCSS=!!k(a,"article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}mark{background:#FF0;color:#000}")),j||p(a,c),a}var c=a.html5||{},d=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,e=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,f,g="_html5shiv",h=0,i={},j;(function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",f="hidden"in a,j=a.childNodes.length==1||function(){b.createElement("a");var a=b.createDocumentFragment();return typeof a.cloneNode=="undefined"||typeof a.createDocumentFragment=="undefined"||typeof a.createElement=="undefined"}()}catch(c){f=!0,j=!0}})();var r={elements:c.elements||"abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",shivCSS:c.shivCSS!==!1,supportsUnknownElements:j,shivMethods:c.shivMethods!==!1,type:"default",shivDocument:q,createElement:n,createDocumentFragment:o};a.html5=r,q(b)}(this,b),e._version=d,e._prefixes=m,e._domPrefixes=p,e._cssomPrefixes=o,e.testProp=function(a){return D([a])},e.testAllProps=F,e.testStyles=w,e.prefixed=function(a,b,c){return b?F(a,b,c):F(a,"pfx")},g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+t.join(" "):""),e}(this,this.document),function(a,b,c){function d(a){return"[object Function]"==o.call(a)}function e(a){return"string"==typeof a}function f(){}function g(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function h(){var a=p.shift();q=1,a?a.t?m(function(){("c"==a.t?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){"img"!=a&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l=b.createElement(a),o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};1===y[c]&&(r=1,y[c]=[]),"object"==a?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),"img"!=a&&(r||2===y[c]?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i("c"==b?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),1==p.length&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&"[object Opera]"==o.call(a.opera),l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return"[object Array]"==o.call(a)},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,h){var i=b(a),j=i.autoCallback;i.url.split(".").pop().split("?").shift(),i.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]),i.instead?i.instead(a,e,f,g,h):(y[i.url]?i.noexec=!0:y[i.url]=1,f.load(i.url,i.forceCSS||!i.forceJS&&"css"==i.url.split(".").pop().split("?").shift()?"c":c,i.noexec,i.attrs,i.timeout),(d(e)||d(j))&&f.load(function(){k(),e&&e(i.origUrl,h,g),j&&j(i.origUrl,h,g),y[i.url]=2})))}function h(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var i,j,l=this.yepnope.loader;if(e(a))g(a,0,l,0);else if(w(a))for(i=0;i<a.length;i++)j=a[i],e(j)?g(j,0,l,0):w(j)?B(j):Object(j)===j&&h(j,l);else Object(a)===a&&h(a,l)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,null==b.readyState&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))};

/**
 * jquery.dlmenu.js v1.0.1
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
;( function( $, window, undefined ) {

	'use strict';

	// global
	var Modernizr = window.Modernizr, $body = $( 'body' );

	$.DLMenu = function( options, element ) {
		this.$el = $( element );
		this._init( options );
	};

	// the options
	$.DLMenu.defaults = {
		// classes for the animation effects
		animationClasses : { classin : 'dl-animate-in-1', classout : 'dl-animate-out-1' },
		// callback: click a link that has a sub menu
		// el is the link element (li); name is the level name
		onLevelClick : function( el, name ) { return false; },
		// callback: click a link that does not have a sub menu
		// el is the link element (li); ev is the event obj
		onLinkClick : function( el, ev ) { return false; }
	};

	$.DLMenu.prototype = {
		_init : function( options ) {

			// options
			this.options = $.extend( true, {}, $.DLMenu.defaults, options );
			// cache some elements and initialize some variables
			this._config();
			
			var animEndEventNames = {
					'WebkitAnimation' : 'webkitAnimationEnd',
					'OAnimation' : 'oAnimationEnd',
					'msAnimation' : 'MSAnimationEnd',
					'animation' : 'animationend'
				},
				transEndEventNames = {
					'WebkitTransition' : 'webkitTransitionEnd',
					'MozTransition' : 'transitionend',
					'OTransition' : 'oTransitionEnd',
					'msTransition' : 'MSTransitionEnd',
					'transition' : 'transitionend'
				};
			// animation end event name
			this.animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ] + '.dlmenu';
			// transition end event name
			this.transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ] + '.dlmenu',
			// support for css animations and css transitions
			this.supportAnimations = Modernizr.cssanimations,
			this.supportTransitions = Modernizr.csstransitions;

			this._initEvents();

		},
		_config : function() {
			this.open = false;
			this.$trigger = this.$el.children( '.dl-trigger' );
			this.$menu = this.$el.children( 'ul.dl-menu' );
			this.$menuitems = this.$menu.find( 'li:not(.dl-back)' );
			this.$el.find( 'ul.dl-submenu' ).prepend( '<li class="dl-back"><a href="#">back</a></li>' );
			this.$back = this.$menu.find( 'li.dl-back' );
		},
		_initEvents : function() {

			var self = this;

			this.$trigger.on( 'click.dlmenu', function() {
				
				if( self.open ) {
					self._closeMenu();
				} 
				else {
					self._openMenu();
				}
				return false;

			} );

			this.$menuitems.on( 'click.dlmenu', function( event ) {
				
				event.stopPropagation();

				var $item = $(this),
					$submenu = $item.children( 'ul.dl-submenu' );

				if( $submenu.length > 0 ) {

					var $flyin = $submenu.clone().css( 'opacity', 0 ).insertAfter( self.$menu ),
						onAnimationEndFn = function() {
							self.$menu.off( self.animEndEventName ).removeClass( self.options.animationClasses.classout ).addClass( 'dl-subview' );
							$item.addClass( 'dl-subviewopen' ).parents( '.dl-subviewopen:first' ).removeClass( 'dl-subviewopen' ).addClass( 'dl-subview' );
							$flyin.remove();
						};

					setTimeout( function() {
						$flyin.addClass( self.options.animationClasses.classin );
						self.$menu.addClass( self.options.animationClasses.classout );
						if( self.supportAnimations ) {
							self.$menu.on( self.animEndEventName, onAnimationEndFn );
						}
						else {
							onAnimationEndFn.call();
						}

						self.options.onLevelClick( $item, $item.children( 'a:first' ).text() );
					} );

					return false;

				}
				else {
					self.options.onLinkClick( $item, event );
				}

			} );

			this.$back.on( 'click.dlmenu', function( event ) {
				
				var $this = $( this ),
					$submenu = $this.parents( 'ul.dl-submenu:first' ),
					$item = $submenu.parent(),

					$flyin = $submenu.clone().insertAfter( self.$menu );

				var onAnimationEndFn = function() {
					self.$menu.off( self.animEndEventName ).removeClass( self.options.animationClasses.classin );
					$flyin.remove();
				};

				setTimeout( function() {
					$flyin.addClass( self.options.animationClasses.classout );
					self.$menu.addClass( self.options.animationClasses.classin );
					if( self.supportAnimations ) {
						self.$menu.on( self.animEndEventName, onAnimationEndFn );
					}
					else {
						onAnimationEndFn.call();
					}

					$item.removeClass( 'dl-subviewopen' );
					
					var $subview = $this.parents( '.dl-subview:first' );
					if( $subview.is( 'li' ) ) {
						$subview.addClass( 'dl-subviewopen' );
					}
					$subview.removeClass( 'dl-subview' );
				} );

				return false;

			} );
			
		},
		closeMenu : function() {
			if( this.open ) {
				this._closeMenu();
			}
		},
		_closeMenu : function() {
			var self = this,
				onTransitionEndFn = function() {
					self.$menu.off( self.transEndEventName );
					self._resetMenu();
				};
			
			this.$menu.removeClass( 'dl-menuopen' );
			this.$menu.addClass( 'dl-menu-toggle' );
			this.$trigger.removeClass( 'dl-active' );
			
			if( this.supportTransitions ) {
				this.$menu.on( this.transEndEventName, onTransitionEndFn );
			}
			else {
				onTransitionEndFn.call();
			}

			this.open = false;
		},
		openMenu : function() {
			if( !this.open ) {
				this._openMenu();
			}
		},
		_openMenu : function() {
			var self = this;
			// clicking somewhere else makes the menu close
			$body.off( 'click' ).on( 'click.dlmenu', function() {
				self._closeMenu() ;
			} );
			this.$menu.addClass( 'dl-menuopen dl-menu-toggle' ).on( this.transEndEventName, function() {
				$( this ).removeClass( 'dl-menu-toggle' );
			} );
			this.$trigger.addClass( 'dl-active' );
			this.open = true;
		},
		// resets the menu to its original state (first level of options)
		_resetMenu : function() {
			this.$menu.removeClass( 'dl-subview' );
			this.$menuitems.removeClass( 'dl-subview dl-subviewopen' );
		}
	};

	var logError = function( message ) {
		if ( window.console ) {
			window.console.error( message );
		}
	};

	$.fn.dlmenu = function( options ) {
		if ( typeof options === 'string' ) {
			var args = Array.prototype.slice.call( arguments, 1 );
			this.each(function() {
				var instance = $.data( this, 'dlmenu' );
				if ( !instance ) {
					logError( "cannot call methods on dlmenu prior to initialization; " +
					"attempted to call method '" + options + "'" );
					return;
				}
				if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {
					logError( "no such method '" + options + "' for dlmenu instance" );
					return;
				}
				instance[ options ].apply( instance, args );
			});
		} 
		else {
			this.each(function() {	
				var instance = $.data( this, 'dlmenu' );
				if ( instance ) {
					instance._init();
				}
				else {
					instance = $.data( this, 'dlmenu', new $.DLMenu( options, this ) );
				}
			});
		}
		return this;
	};

} )( jQuery, window );