function b(e){return e instanceof Object&&"parseAsync"in e&&typeof e.parseAsync=="function"}function w(e){return e instanceof Object&&"errors"in e}function D(e){return w(e)?e.format()._errors.join(", "):e instanceof Error?e.message:"Something went wrong!"}function N(e,d){let t="";switch(d){case"date":t=e.toISOString().slice(0,10);break;case"time":t=e.toTimeString().slice(0,8);break;case"datetime-local":t=`${e.getFullYear()}-${`${e.getMonth()+1}`.padStart(2,"0")}-${`${e.getDate()}`.padStart(2,"0")}T${`${e.getHours()}`.padStart(2,"0")}:${`${e.getMinutes()}`.padStart(2,"0")}`;break;case"week":let n=e.getFullYear(),u=k(e);t=`${n}-W${u.toString().length<2?"0"+u.toString():u.toString()}`;break;case"month":t=e.toISOString().slice(0,7);break;default:break}return t}function H(e,d){let t;switch(d){case"date":t=new Date(e);break;case"time":let[n,u,l]=e.toString().split(":");t=new Date,t.setHours(Number(n||0)),t.setMinutes(Number(u||0)),t.setSeconds(Number(l||0));break;case"datetime-local":t=new Date(e.toString().replace(" ","T"));break;case"week":let[m,s]=e.toString().split("-W"),i=Number(m),r=Number(s);t=E(i,r);break;case"month":t=new Date(`${e}-01`);break;default:t=new Date;break}return t}function k(e){let d=new Date(e.getFullYear(),0,1),t=(e.valueOf()-d.valueOf())/(1e3*60*60*24);return Math.floor(t/7)+1}function E(e,d){let t=new Date(e,0,1),n=(8-t.getDay())%7,u=new Date(t);u.setDate(t.getDate()+n);let l=(d-1)*7,m=new Date(u);return m.setDate(u.getDate()+l),m}var j={formatDate:N,parseDate:H,getWeekNumber:k,getFirstDateOfWeek:E};import{createStore as C}from"zustand";import{useId as M,useState as T}from"react";var A=e=>C(h(e)),W=e=>{let d=M();return T(A({...e,baseId:e.baseId||d}))[0]};function I(e,d){if(!e.initialValues||typeof e.initialValues!="object")throw new Error("");let t={baseId:d,formId:`${d}_form`,fieldsNames:{},fieldsNamesMap:{},validatedFieldsNames:[],validatedFieldsNamesMap:{},manualValidatedFields:[],manualValidatedFieldsMap:[],referencedValidatedFields:[],referencedValidatedFieldsMap:[]};t.fieldsNames=Object.keys(e.initialValues);for(let n of t.fieldsNames)t.fieldsNamesMap[n]=!0;for(let n in e.validationsHandlers){if(t.validatedFieldsNames.push(n),t.validatedFieldsNamesMap[n]=!0,n in t.fieldsNamesMap){t.referencedValidatedFields.push(n),t.referencedValidatedFieldsMap[n]=!0;continue}t.manualValidatedFields.push(n),t.manualValidatedFieldsMap[n]=!0}return t}function x(e,d){let t={submit:!0},n=!1,u,l={};for(let m of d.validatedFieldsNames){let s=e.validationsHandlers?.[m];if(l[m]={handler:s?b(s)?i=>s.parse(i):s:void 0,currentDirtyEventsCounter:0,failedAttempts:0,passedAttempts:0,events:{change:{failedAttempts:0,passedAttempts:0,isActive:!1,isDirty:!1,error:null},submit:{failedAttempts:0,passedAttempts:0,isActive:!1,isDirty:!1,error:null}},isDirty:!1,metadata:{name:m}},e.validationEvents&&(n=!0,t={...t,...e.validationEvents}),n)for(u in t)l[m].events[u].isActive=!!typeof t[u]}return l}function $(e,d,t){let n=e.isUpdatingFieldsValueOnError??!0,u={};for(let l of t.fieldsNames)u[l]={value:e.initialValues[l],isUpdatingValueOnError:n,valueFromFieldToStore:e.valuesFromFieldsToStore?.[l]?e.valuesFromFieldsToStore[l]:void 0,valueFromStoreToField:e.valuesFromStoreToFields?.[l]?e.valuesFromStoreToFields[l]:void 0,id:`${d}field-${String(l)}`,metadata:{name:l,initialValue:e.initialValues[l]}};return u}var P={fields:!0,validations:!0,submitCounter:!1};function h(e){let d=e.baseId?`${e.baseId}-`:"",t=I(e,d),n=$(e,d,t),u=x(e,t);return(l,m)=>({baseId:d,metadata:t,validations:u,fields:n,id:`${d}-form`,isDirty:!1,isSubmitting:!1,submitCounter:0,currentDirtyFieldsCounter:0,utils:{setIsSubmitting(s){l(function(i){return{...i,isSubmitting:typeof s=="function"?s(i.isSubmitting):s}})},resetFormStore:function(s=P){return l(function(i){let r=i.fields,a=i.validations,c=i.isDirty,p=i.submitCounter;if(s.fields){let o;for(o in r)r[o].value=r[o].metadata.initialValue}if(s.validations){for(let o in a){a[o].failedAttempts=0,a[o].passedAttempts=0,a[o].isDirty=!1,a[o].error=null;let F;for(F in a[o].events)a[o].events[F].failedAttempts=0,a[o].events[F].passedAttempts=0,a[o].events[F].isDirty=!1,a[o].events[F].error=null}c=!1}return s.submitCounter&&(p=0),{...i,fields:r,validations:a,isDirty:c,submitCounter:p}})},setFieldValue(s,i){return l(function(r){return{fields:{...r.fields,[s]:{...r.fields[s],value:typeof i=="function"?i(r.fields[s].value):i}}}})},setFieldErrors(s){l(function(i){if(!i.validations[s.name].events[s.validationEvent].isActive)return i;let r=i.currentDirtyFieldsCounter,a=i.validations[s.name];return s.message?(a.failedAttempts++,a.events[s.validationEvent].failedAttempts++,a.isDirty||(a.currentDirtyEventsCounter++,a.currentDirtyEventsCounter>0&&r++),a.events[s.validationEvent].error={message:s.message},a.error={message:s.message},a.events[s.validationEvent].isDirty=!0,a.isDirty=!0):(a.passedAttempts++,a.events[s.validationEvent].passedAttempts++,a.isDirty&&(a.currentDirtyEventsCounter--,a.currentDirtyEventsCounter===0&&r--),a.events[s.validationEvent].error=null,a.error=null,a.events[s.validationEvent].isDirty=!1,a.isDirty=!1),{...i,currentDirtyFieldsCounter:r,isDirty:r>0,validations:{...i.validations,[s.name]:a}}})},errorFormatter:e.errorFormatter??D,handleOnInputChange(s,i,r){let a=m(),c=a.fields[s],p=typeof i=="function"?i(c.value):c.valueFromFieldToStore?c.valueFromFieldToStore(i):i,o=r||(a.metadata.referencedValidatedFieldsMap[s]?s:void 0);if(o&&a.validations[o].events.change.isActive)try{a.utils.setFieldValue(s,a.validations[o].handler(p,"change")),a.utils.setFieldErrors({name:o,message:null,validationEvent:"change"})}catch(F){a.utils.setFieldErrors({name:o,message:a.utils.errorFormatter(F,"change"),validationEvent:"change"}),c.isUpdatingValueOnError&&a.utils.setFieldValue(s,p)}else a.utils.setFieldValue(s,p)},handleSubmit(s){return async function(i){i.preventDefault();let r=m();r.utils.setIsSubmitting(!0);let a=r.metadata,c=r.fields,p=r.validations,o={},F={},y={},S=!1,f;for(f in c){o[f]=c[f].value;try{let v=f in a.referencedValidatedFieldsMap&&p[f].handler;if(typeof v!="function"||!p[f].events.submit.isActive)continue;F[f]=v(c[f].value,"submit"),y[f]={name:f,message:null,validationEvent:"submit"}}catch(v){y[f]={name:f,message:r.utils.errorFormatter(v,"submit"),validationEvent:"submit"}}}let V;for(V of a.manualValidatedFields)try{let v=r.validations[V].handler;if(typeof v!="function")continue;F[V]=v(o,"submit"),y[V]={name:V,message:null,validationEvent:"submit"}}catch(v){y[V]={name:V,message:r.utils.errorFormatter(v,"submit"),validationEvent:"submit"}}let g;for(g in y){let v=y[g];r.utils.setFieldErrors(y[g]),typeof v.message=="string"&&(S=!0)}r.utils.setIsSubmitting(!1),!S&&await s({event:i,values:o,validatedValues:F,hasError:S,errors:y})}}}})}export{h as createFormStoreBuilder,D as errorFormatter,N as formatDate,E as getFirstDateOfWeek,k as getWeekNumber,A as handleCreateFormStore,j as inputDateHelpers,w as isZodError,b as isZodValidator,H as parseDate,W as useCreateFormStore};
//# sourceMappingURL=index.mjs.map