"use strict";var $=Object.defineProperty;var ee=Object.getOwnPropertyDescriptor;var te=Object.getOwnPropertyNames;var ne=Object.prototype.hasOwnProperty;var ae=(e,t)=>{for(var n in t)$(e,n,{get:t[n],enumerable:!0})},se=(e,t,n,a)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of te(t))!ne.call(e,r)&&r!==n&&$(e,r,{get:()=>t[r],enumerable:!(a=ee(t,r))||a.enumerable});return e};var le=e=>se($({},"__esModule",{value:!0}),e);var fe={};ae(fe,{createFormStoreBuilder:()=>O,dateInput:()=>R,errorFormatter:()=>j,formatDate:()=>U,fvh:()=>Q,getFirstDateOfWeek:()=>B,getWeekNumber:()=>Z,handleCreateFormStore:()=>L,inputDateHelpers:()=>k,isZodError:()=>K,isZodValidator:()=>P,onFalsy:()=>z,onNotNullableTo:()=>N,onNullable:()=>q,onTruthy:()=>J,onTruthyTo:()=>h,parseDate:()=>W,useCreateFormStore:()=>oe});module.exports=le(fe);var g=class{id;value;metadata;valueFromFieldToStore;valueFromStoreToField;constructor(t){this.id=t.id,this.value=t.value,this.metadata=t.metadata,this.valueFromFieldToStore=t.valueFromFieldToStore,this.valueFromStoreToField=t.valueFromStoreToField??(()=>this.value??"")}get storeToFieldValue(){return this.valueFromStoreToField(this.value)}};function P(e){return e instanceof Object&&"parseAsync"in e&&typeof e.parseAsync=="function"}function K(e){return e instanceof Object&&"errors"in e}function j(e){return K(e)?e.format()._errors.join(", "):e instanceof Error?e.message:"Something went wrong!"}function U(e,t){let n="";switch(t){case"date":n=e.toISOString().slice(0,10);break;case"time":n=e.toTimeString().slice(0,8);break;case"datetime-local":n=`${e.getFullYear()}-${`${e.getMonth()+1}`.padStart(2,"0")}-${`${e.getDate()}`.padStart(2,"0")}T${`${e.getHours()}`.padStart(2,"0")}:${`${e.getMinutes()}`.padStart(2,"0")}`;break;case"week":let a=e.getFullYear(),r=Z(e);n=`${a}-W${r.toString().length<2?"0"+r.toString():r.toString()}`;break;case"month":n=e.toISOString().slice(0,7);break;default:break}return n}function W(e,t){let n;switch(t){case"date":n=new Date(e);break;case"time":let[a,r,v]=e.toString().split(":");n=new Date,n.setHours(Number(a||0)),n.setMinutes(Number(r||0)),n.setSeconds(Number(v||0));break;case"datetime-local":n=new Date(e.toString().replace(" ","T"));break;case"week":let[y,s]=e.toString().split("-W"),i=Number(y),o=Number(s);n=B(i,o);break;case"month":n=new Date(`${e}-01`);break;default:n=new Date;break}return n}function Z(e){let t=new Date(e.getFullYear(),0,1),n=(e.valueOf()-t.valueOf())/(1e3*60*60*24);return Math.floor(n/7)+1}function B(e,t){let n=new Date(e,0,1),a=(8-n.getDay())%7,r=new Date(n);r.setDate(n.getDate()+a);let v=(t-1)*7,y=new Date(r);return y.setDate(r.getDate()+v),y}var k={formatDate:U,parseDate:W,getWeekNumber:Z,getFirstDateOfWeek:B};var Y=require("zustand");var D=require("react"),L=e=>(0,Y.createStore)(O(e)),oe=e=>{let t=(0,D.useId)();return(0,D.useState)(L({...e,baseId:e.baseId||t}))[0]};var R={parse:function(e){return function(t){return t?k.parseDate(t,e):null}},format:function(e){return function(t){return t?k.formatDate(t,e):null}}};function N(e){return function(t){let n=Symbol();return(t??n)!==n?e:t}}var q={toEmptyString:function(e){return e??""},toUndefined:function(e){return e??void 0},toNull:function(e){return e??null},to:function(e){return function(t){let n=Symbol();return(t??n)===n?e:t}},falsy:{toEmptyString:function(e){return N("")(e)},toUndefined:function(e){return N(void 0)(e)},toNull:function(e){return N(null)(e)},to:N}};function H(e){return function(t){return t||e}}var z={toEmptyString:H(""),toUndefined:H(void 0),toNull:H(null),to:H};function h(e){return function(t){return t&&e}}var J={toEmptyString:h(""),toUndefined:h(void 0),toNull:h(null),to:h},u={onDateInput:R,onNullable:q,onFalsy:z,onTruthy:J},Q=u,A=[1,2,3],Se={to:u.onFalsy.to("lol")(A),emptyString:u.onFalsy.toEmptyString(A),null:u.onFalsy.toNull(A),undefined:u.onFalsy.toUndefined(A)},w=0,be={to:u.onFalsy.to("lol")(w),emptyString:u.onFalsy.toEmptyString(w),null:u.onFalsy.toNull(w),undefined:u.onFalsy.toUndefined(w)},T=[1,2,3],ge={to:u.onNullable.to("lol")(T),emptyString:u.onNullable.toEmptyString(T),null:u.onNullable.toNull(T),undefined:u.onNullable.toUndefined(T)},x=null,Ne={to:u.onNullable.to("lol")(x),emptyString:u.onNullable.toEmptyString(x),null:u.onNullable.toNull(x),undefined:u.onNullable.toUndefined(x)},M=[1,2,3],he={to:u.onNullable.falsy.to("lol")(M),emptyString:u.onNullable.falsy.toEmptyString(M),null:u.onNullable.falsy.toNull(M),undefined:u.onNullable.falsy.toUndefined(M)},_=null,Ee={to:u.onNullable.to("lol")(_),emptyString:u.onNullable.toEmptyString(_),null:u.onNullable.toNull(_),undefined:u.onNullable.toUndefined(_)};function ie(e,t){if(!e.initialValues||typeof e.initialValues!="object")throw new Error("");let n={baseId:t,formId:`${t}-form`,fieldsNames:{},fieldsNamesMap:{},validatedFieldsNames:[],validatedFieldsNamesMap:{},manualValidatedFields:[],manualValidatedFieldsMap:[],referencedValidatedFields:[],referencedValidatedFieldsMap:[]};n.fieldsNames=Object.keys(e.initialValues);for(let a of n.fieldsNames)n.fieldsNamesMap[a]=!0;for(let a in e.validationsHandlers){if(n.validatedFieldsNames.push(a),n.validatedFieldsNamesMap[a]=!0,a in n.fieldsNamesMap){n.referencedValidatedFields.push(a),n.referencedValidatedFieldsMap[a]=!0;continue}n.manualValidatedFields.push(a),n.manualValidatedFieldsMap[a]=!0}return n}function re(e,t){let n={submit:!0,blur:!0},a=!1,r,v={};for(let y of t.validatedFieldsNames){let s=e.validationsHandlers?.[y];if(v[y]={handler:s?P(s)?i=>s.parse(i):s:void 0,currentDirtyEventsCounter:0,failedAttempts:0,passedAttempts:0,events:{blur:{failedAttempts:0,passedAttempts:0,isActive:e.validationEvents?.blur??!0,isDirty:!1,error:null},change:{failedAttempts:0,passedAttempts:0,isActive:e.validationEvents?.change??!1,isDirty:!1,error:null},submit:{failedAttempts:0,passedAttempts:0,isActive:e.validationEvents?.submit??!1,isDirty:!1,error:null}},isDirty:!1,metadata:{name:y}},e.validationEvents&&(a=!0,n={...n,...e.validationEvents}),a)for(r in n)v[y].events[r].isActive=!!typeof n[r]}return v}function de(e,t,n){let a={};for(let r of n.fieldsNames)a[r]=new g({value:e.initialValues[r],valueFromFieldToStore:e.valuesFromFieldsToStore?.[r]?e.valuesFromFieldsToStore[r]:void 0,valueFromStoreToField:e.valuesFromStoreToFields?.[r]?e.valuesFromStoreToFields[r]:void 0,id:`${t}field-${String(r)}`,metadata:{name:r,initialValue:e.initialValues[r]}});return a}function E(e){return function(t){if(!t.validations[e.name].events[e.validationEvent].isActive)return t;let n=t.currentDirtyFieldsCounter,a={...t.validations[e.name]};return e.message?(a.failedAttempts++,a.events[e.validationEvent].failedAttempts++,a.isDirty||(a.currentDirtyEventsCounter++,a.currentDirtyEventsCounter>0&&n++),a.events[e.validationEvent].error={message:e.message},a.error={message:e.message},a.events[e.validationEvent].isDirty=!0,a.isDirty=!0):(a.passedAttempts++,a.events[e.validationEvent].passedAttempts++,a.isDirty&&(a.currentDirtyEventsCounter--,a.currentDirtyEventsCounter===0&&n--),a.events[e.validationEvent].error=null,a.error=null,a.events[e.validationEvent].isDirty=!1,a.isDirty=!1),t.currentDirtyFieldsCounter=n,t.isDirty=n>0,t.validations={...t.validations,[e.name]:a},t}}function X(e,t){return function(n){let a=n.fields[e];return a.value=typeof t=="function"?t(a.value):t,{...n,fields:{...n.fields,[e]:a}}}}var ue={fields:!0,validations:!0,submit:!1,focus:!0};function O(e){let t=e.baseId?`${e.baseId}-`:"",n=ie(e,t),a=de(e,t,n),r=re(e,n);return(v,y)=>({baseId:t,metadata:n,validations:r,fields:a,id:`${t}form`,isDirty:!1,submit:{counter:0,passedAttempts:0,failedAttempts:0,errorMessage:null,isActive:!1},focus:{isActive:!1,field:null},currentDirtyFieldsCounter:0,utils:{getFieldValues(){let s=y(),i={},o;for(o in s.fields)i[o]=s.fields[o].value;return i},setSubmitState(s){v(function(i){return{submit:{...i.submit,...typeof s=="function"?s(i.submit):s}}})},setFocusState(s,i,o){v(function(l){let d=l;if(!o&&d.validations[i].events.blur.isActive){try{d.validations[i].handler(i&&s!==i?d.utils.getFieldValues():d.fields[s].value,"blur"),d=E({name:i,message:null,validationEvent:"blur"})(d)}catch(V){let p=d.utils.errorFormatter(V,"blur");d=E({name:i,message:p,validationEvent:"blur"})(d)}if(d.focus.isActive&&d.focus.field.name!==s)return d}return{...d,focus:o?{isActive:!0,field:{name:s,id:d.fields[s].id}}:{isActive:!1,field:null}}})},resetFormStore:function(s=ue){return v(function(i){let o=i.fields,l=i.validations,d=i.isDirty,V=i.submit,p=i.focus;if(s.fields){let m=typeof window>"u"?S=>{let f=o[S];f.value=f.metadata.initialValue}:S=>{let f=o[S],b=document.getElementById(f.id);b&&(b.value=f.metadata.initialValue??""),f.value=f.metadata.initialValue},c;for(c in o)m(c)}if(s.validations){for(let m in l){l[m].failedAttempts=0,l[m].passedAttempts=0,l[m].isDirty=!1,l[m].error=null;let c;for(c in l[m].events)l[m].events[c].failedAttempts=0,l[m].events[c].passedAttempts=0,l[m].events[c].isDirty=!1,l[m].events[c].error=null}d=!1}return s.submit&&(V={counter:0,passedAttempts:0,failedAttempts:0,errorMessage:null,isActive:!1}),s.focus&&(p={isActive:!1,field:null}),{fields:o,validations:l,isDirty:d,submit:V,focus:p}})},setFieldValue(s,i){return v(X(s,i))},setFieldError(s){v(E(s))},errorFormatter:e.errorFormatter??j,handleOnInputChange(s,i,o){let l=y(),d=l.fields[s],V=typeof i=="function"?i(d.value):i,p=d.valueFromFieldToStore?d.valueFromFieldToStore(V):V,m=o||(l.metadata.referencedValidatedFieldsMap[s]?s:void 0),c=X,S=E;if(m&&l.validations[m].events.change.isActive)try{l=c(s,l.validations[m].handler(o&&o!==s?l.utils.getFieldValues():p,"change"))(l),l=S({name:m,message:null,validationEvent:"change"})(l)}catch(f){l=S({name:m,message:l.utils.errorFormatter(f,"change"),validationEvent:"change"})(l),l=c(s,p)(l)}else l=c(s,p)(l);v(l)},getFieldEventsListeners(s,i){let o=y(),l=i??s;return{onChange:d=>{o.utils.handleOnInputChange(s,d.target.value)},onFocus:()=>{o.utils.setFocusState(s,l,!0)},onBlur:()=>{o.utils.setFocusState(s,l,!1)}}},handleSubmit(s){return async function(i){i.preventDefault();let o=y();o.utils.setSubmitState({isActive:!0});let l=o.metadata,d=o.fields,V=o.validations,p={},m={},c={},S=!1,f;for(f in d){p[f]=d[f].value;try{let F=f in l.referencedValidatedFieldsMap&&V[f].handler;if(typeof F!="function"||!V[f].events.submit.isActive)continue;m[f]=F(d[f].value,"submit"),c[f]={name:f,message:null,validationEvent:"submit"}}catch(F){c[f]={name:f,message:o.utils.errorFormatter(F,"submit"),validationEvent:"submit"}}}let b;for(b of l.manualValidatedFields)try{let F=o.validations[b].handler;if(typeof F!="function")continue;m[b]=F(p,"submit"),c[b]={name:b,message:null,validationEvent:"submit"}}catch(F){c[b]={name:b,message:o.utils.errorFormatter(F,"submit"),validationEvent:"submit"}}let C=y(),I;for(I in c){let F=c[I];C=E(c[I])(C),typeof F.message=="string"&&(S=!0)}if(S)v(C),o.utils.setSubmitState(F=>({isActive:!1,counter:F.counter+1,failedAttempts:F.counter+1,errorMessage:null}));else try{await s({event:i,values:p,validatedValues:m,hasError:S,errors:c}),o.utils.setSubmitState(F=>({isActive:!1,counter:F.counter+1,passedAttempts:F.counter+1,errorMessage:null}))}catch(F){o.utils.setSubmitState(G=>({isActive:!1,counter:G.counter+1,failedAttempts:G.counter+1,errorMessage:o.utils.errorFormatter(F,"submit")}))}}}}})}0&&(module.exports={createFormStoreBuilder,dateInput,errorFormatter,formatDate,fvh,getFirstDateOfWeek,getWeekNumber,handleCreateFormStore,inputDateHelpers,isZodError,isZodValidator,onFalsy,onNotNullableTo,onNullable,onTruthy,onTruthyTo,parseDate,useCreateFormStore});
//# sourceMappingURL=index.js.map