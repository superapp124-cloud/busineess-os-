import{s}from"./index.desktop-D1ZsQWQl.js";async function n(o,r,i){const{error:e}=await s.functions.invoke("register-device-token",{body:{token:r,userId:o,platform:i}});if(e)throw e}export{n as r};
