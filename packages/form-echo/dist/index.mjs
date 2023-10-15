var g=class{id;value;metadata;valueFromFieldToStore;valueFromStoreToField;constructor(n){this.id=n.id,this.value=n.value,this.metadata=n.metadata,this.valueFromFieldToStore=n.valueFromFieldToStore,this.valueFromStoreToField=n.valueFromStoreToField??(()=>this.value??"")}get storeToFieldValue(){return this.valueFromStoreToField(this.value)}};function $(e){return e instanceof Object&&"parseAsync"in e&&typeof e.parseAsync=="function"}function G(e){return e instanceof Object&&"errors"in e}function P(e){return G(e)?e.format()._errors.join(", "):e instanceof Error?e.message:"Something went wrong!"}function K(e,n){let t="";switch(n){case"date":t=e.toISOString().slice(0,10);break;case"time":t=e.toTimeString().slice(0,8);break;case"datetime-local":t=`${e.getFullYear()}-${`${e.getMonth()+1}`.padStart(2,"0")}-${`${e.getDate()}`.padStart(2,"0")}T${`${e.getHours()}`.padStart(2,"0")}:${`${e.getMinutes()}`.padStart(2,"0")}`;break;case"week":let a=e.getFullYear(),d=j(e);t=`${a}-W${d.toString().length<2?"0"+d.toString():d.toString()}`;break;case"month":t=e.toISOString().slice(0,7);break;default:break}return t}function U(e,n){let t;switch(n){case"date":t=new Date(e);break;case"time":let[a,d,v]=e.toString().split(":");t=new Date,t.setHours(Number(a||0)),t.setMinutes(Number(d||0)),t.setSeconds(Number(v||0));break;case"datetime-local":t=new Date(e.toString().replace(" ","T"));break;case"week":let[y,s]=e.toString().split("-W"),i=Number(y),o=Number(s);t=Z(i,o);break;case"month":t=new Date(`${e}-01`);break;default:t=new Date;break}return t}function j(e){let n=new Date(e.getFullYear(),0,1),t=(e.valueOf()-n.valueOf())/(1e3*60*60*24);return Math.floor(t/7)+1}function Z(e,n){let t=new Date(e,0,1),a=(8-t.getDay())%7,d=new Date(t);d.setDate(t.getDate()+a);let v=(n-1)*7,y=new Date(d);return y.setDate(d.getDate()+v),y}var C={formatDate:K,parseDate:U,getWeekNumber:j,getFirstDateOfWeek:Z};import{createStore as W}from"zustand";import{useId as Y,useState as L}from"react";var R=e=>W(B(e)),ue=e=>{let n=Y();return L(R({...e,baseId:e.baseId||n}))[0]};var q={parse:function(e){return function(n){return n?C.parseDate(n,e):null}},format:function(e){return function(n){return n?C.formatDate(n,e):null}}};function h(e){return function(n){let t=Symbol();return(n??t)!==t?e:n}}var z={toEmptyString:function(e){return e??""},toUndefined:function(e){return e??void 0},toNull:function(e){return e??null},to:function(e){return function(n){let t=Symbol();return(n??t)===t?e:n}},falsy:{toEmptyString:function(e){return h("")(e)},toUndefined:function(e){return h(void 0)(e)},toNull:function(e){return h(null)(e)},to:h}};function E(e){return function(n){return n||e}}var J={toEmptyString:E(""),toUndefined:E(void 0),toNull:E(null),to:E};function k(e){return function(n){return n&&e}}var Q={toEmptyString:k(""),toUndefined:k(void 0),toNull:k(null),to:k},u={onDateInput:q,onNullable:z,onFalsy:J,onTruthy:Q},X=u,D=[1,2,3],ce={to:u.onFalsy.to("lol")(D),emptyString:u.onFalsy.toEmptyString(D),null:u.onFalsy.toNull(D),undefined:u.onFalsy.toUndefined(D)},H=0,Fe={to:u.onFalsy.to("lol")(H),emptyString:u.onFalsy.toEmptyString(H),null:u.onFalsy.toNull(H),undefined:u.onFalsy.toUndefined(H)},A=[1,2,3],ve={to:u.onNullable.to("lol")(A),emptyString:u.onNullable.toEmptyString(A),null:u.onNullable.toNull(A),undefined:u.onNullable.toUndefined(A)},w=null,ye={to:u.onNullable.to("lol")(w),emptyString:u.onNullable.toEmptyString(w),null:u.onNullable.toNull(w),undefined:u.onNullable.toUndefined(w)},T=[1,2,3],pe={to:u.onNullable.falsy.to("lol")(T),emptyString:u.onNullable.falsy.toEmptyString(T),null:u.onNullable.falsy.toNull(T),undefined:u.onNullable.falsy.toUndefined(T)},x=null,Ve={to:u.onNullable.to("lol")(x),emptyString:u.onNullable.toEmptyString(x),null:u.onNullable.toNull(x),undefined:u.onNullable.toUndefined(x)};function ee(e,n){if(!e.initialValues||typeof e.initialValues!="object")throw new Error("");let t={baseId:n,formId:`${n}-form`,fieldsNames:{},fieldsNamesMap:{},validatedFieldsNames:[],validatedFieldsNamesMap:{},manualValidatedFields:[],manualValidatedFieldsMap:[],referencedValidatedFields:[],referencedValidatedFieldsMap:[]};t.fieldsNames=Object.keys(e.initialValues);for(let a of t.fieldsNames)t.fieldsNamesMap[a]=!0;for(let a in e.validationsHandlers){if(t.validatedFieldsNames.push(a),t.validatedFieldsNamesMap[a]=!0,a in t.fieldsNamesMap){t.referencedValidatedFields.push(a),t.referencedValidatedFieldsMap[a]=!0;continue}t.manualValidatedFields.push(a),t.manualValidatedFieldsMap[a]=!0}return t}function te(e,n){let t={submit:!0,blur:!0},a=!1,d,v={};for(let y of n.validatedFieldsNames){let s=e.validationsHandlers?.[y];if(v[y]={handler:s?$(s)?i=>s.parse(i):s:void 0,currentDirtyEventsCounter:0,failedAttempts:0,passedAttempts:0,events:{blur:{failedAttempts:0,passedAttempts:0,isActive:e.validationEvents?.blur??!0,isDirty:!1,error:null},change:{failedAttempts:0,passedAttempts:0,isActive:e.validationEvents?.change??!1,isDirty:!1,error:null},submit:{failedAttempts:0,passedAttempts:0,isActive:e.validationEvents?.submit??!1,isDirty:!1,error:null}},isDirty:!1,metadata:{name:y}},e.validationEvents&&(a=!0,t={...t,...e.validationEvents}),a)for(d in t)v[y].events[d].isActive=!!typeof t[d]}return v}function ne(e,n,t){let a={};for(let d of t.fieldsNames)a[d]=new g({value:e.initialValues[d],valueFromFieldToStore:e.valuesFromFieldsToStore?.[d]?e.valuesFromFieldsToStore[d]:void 0,valueFromStoreToField:e.valuesFromStoreToFields?.[d]?e.valuesFromStoreToFields[d]:void 0,id:`${n}field-${String(d)}`,metadata:{name:d,initialValue:e.initialValues[d]}});return a}function N(e){return function(n){if(!n.validations[e.name].events[e.validationEvent].isActive)return n;let t=n.currentDirtyFieldsCounter,a={...n.validations[e.name]};return e.message?(a.failedAttempts++,a.events[e.validationEvent].failedAttempts++,a.isDirty||(a.currentDirtyEventsCounter++,a.currentDirtyEventsCounter>0&&t++),a.events[e.validationEvent].error={message:e.message},a.error={message:e.message},a.events[e.validationEvent].isDirty=!0,a.isDirty=!0):(a.passedAttempts++,a.events[e.validationEvent].passedAttempts++,a.isDirty&&(a.currentDirtyEventsCounter--,a.currentDirtyEventsCounter===0&&t--),a.events[e.validationEvent].error=null,a.error=null,a.events[e.validationEvent].isDirty=!1,a.isDirty=!1),n.currentDirtyFieldsCounter=t,n.isDirty=t>0,n.validations={...n.validations,[e.name]:a},n}}function O(e,n){return function(t){let a=t.fields[e];return a.value=typeof n=="function"?n(a.value):n,{...t,fields:{...t.fields,[e]:a}}}}var ae={fields:!0,validations:!0,submit:!1,focus:!0};function B(e){let n=e.baseId?`${e.baseId}-`:"",t=ee(e,n),a=ne(e,n,t),d=te(e,t);return(v,y)=>({baseId:n,metadata:t,validations:d,fields:a,id:`${n}form`,isDirty:!1,submit:{counter:0,passedAttempts:0,failedAttempts:0,errorMessage:null,isActive:!1},focus:{isActive:!1,field:null},currentDirtyFieldsCounter:0,utils:{getFieldValues(){let s=y(),i={},o;for(o in s.fields)i[o]=s.fields[o].value;return i},setSubmitState(s){v(function(i){return{submit:{...i.submit,...typeof s=="function"?s(i.submit):s}}})},setFocusState(s,i,o){v(function(l){let r=l;if(!o&&r.validations[i].events.blur.isActive){try{r.validations[i].handler(i&&s!==i?r.utils.getFieldValues():r.fields[s].value,"blur"),r=N({name:i,message:null,validationEvent:"blur"})(r)}catch(V){let p=r.utils.errorFormatter(V,"blur");r=N({name:i,message:p,validationEvent:"blur"})(r)}if(r.focus.isActive&&r.focus.field.name!==s)return r}return{...r,focus:o?{isActive:!0,field:{name:s,id:r.fields[s].id}}:{isActive:!1,field:null}}})},resetFormStore:function(s=ae){return v(function(i){let o=i.fields,l=i.validations,r=i.isDirty,V=i.submit,p=i.focus;if(s.fields){let m=typeof window>"u"?S=>{let f=o[S];f.value=f.metadata.initialValue}:S=>{let f=o[S],b=document.getElementById(f.id);b&&(b.value=f.metadata.initialValue??""),f.value=f.metadata.initialValue},c;for(c in o)m(c)}if(s.validations){for(let m in l){l[m].failedAttempts=0,l[m].passedAttempts=0,l[m].isDirty=!1,l[m].error=null;let c;for(c in l[m].events)l[m].events[c].failedAttempts=0,l[m].events[c].passedAttempts=0,l[m].events[c].isDirty=!1,l[m].events[c].error=null}r=!1}return s.submit&&(V={counter:0,passedAttempts:0,failedAttempts:0,errorMessage:null,isActive:!1}),s.focus&&(p={isActive:!1,field:null}),{fields:o,validations:l,isDirty:r,submit:V,focus:p}})},setFieldValue(s,i){return v(O(s,i))},setFieldError(s){v(N(s))},errorFormatter:e.errorFormatter??P,handleOnInputChange(s,i,o){let l=y(),r=l.fields[s],V=typeof i=="function"?i(r.value):i,p=r.valueFromFieldToStore?r.valueFromFieldToStore(V):V,m=o||(l.metadata.referencedValidatedFieldsMap[s]?s:void 0),c=O,S=N;if(m&&l.validations[m].events.change.isActive)try{l=c(s,l.validations[m].handler(o&&o!==s?l.utils.getFieldValues():p,"change"))(l),l=S({name:m,message:null,validationEvent:"change"})(l)}catch(f){l=S({name:m,message:l.utils.errorFormatter(f,"change"),validationEvent:"change"})(l),l=c(s,p)(l)}else l=c(s,p)(l);v(l)},getFieldEventsListeners(s,i){let o=y(),l=i??s;return{onChange:r=>{o.utils.handleOnInputChange(s,r.target.value)},onFocus:()=>{o.utils.setFocusState(s,l,!0)},onBlur:()=>{o.utils.setFocusState(s,l,!1)}}},handleSubmit(s){return async function(i){i.preventDefault();let o=y();o.utils.setSubmitState({isActive:!0});let l=o.metadata,r=o.fields,V=o.validations,p={},m={},c={},S=!1,f;for(f in r){p[f]=r[f].value;try{let F=f in l.referencedValidatedFieldsMap&&V[f].handler;if(typeof F!="function"||!V[f].events.submit.isActive)continue;m[f]=F(r[f].value,"submit"),c[f]={name:f,message:null,validationEvent:"submit"}}catch(F){c[f]={name:f,message:o.utils.errorFormatter(F,"submit"),validationEvent:"submit"}}}let b;for(b of l.manualValidatedFields)try{let F=o.validations[b].handler;if(typeof F!="function")continue;m[b]=F(p,"submit"),c[b]={name:b,message:null,validationEvent:"submit"}}catch(F){c[b]={name:b,message:o.utils.errorFormatter(F,"submit"),validationEvent:"submit"}}let M=y(),_;for(_ in c){let F=c[_];M=N(c[_])(M),typeof F.message=="string"&&(S=!0)}if(S)v(M),o.utils.setSubmitState(F=>({isActive:!1,counter:F.counter+1,failedAttempts:F.counter+1,errorMessage:null}));else try{await s({event:i,values:p,validatedValues:m,hasError:S,errors:c}),o.utils.setSubmitState(F=>({isActive:!1,counter:F.counter+1,passedAttempts:F.counter+1,errorMessage:null}))}catch(F){o.utils.setSubmitState(I=>({isActive:!1,counter:I.counter+1,failedAttempts:I.counter+1,errorMessage:o.utils.errorFormatter(F,"submit")}))}}}}})}export{B as createFormStoreBuilder,q as dateInput,P as errorFormatter,K as formatDate,X as fvh,Z as getFirstDateOfWeek,j as getWeekNumber,R as handleCreateFormStore,C as inputDateHelpers,G as isZodError,$ as isZodValidator,J as onFalsy,h as onNotNullableTo,z as onNullable,Q as onTruthy,k as onTruthyTo,U as parseDate,ue as useCreateFormStore};
//# sourceMappingURL=index.mjs.map