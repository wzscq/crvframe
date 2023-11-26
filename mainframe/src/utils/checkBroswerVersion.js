export function checkBrowserVersion() {
  const { userAgent } = navigator
  //检查浏览器版本是否有效
  console.log("userAgent:",userAgent);

  if (userAgent.includes('Firefox/')) {
    // Firefox
    console.log(`Firefox v${userAgent.split('Firefox/')[1]}`)
  } else if (userAgent.includes('Edg/')) {
    // Edge (Chromium)
    const verString=userAgent.split('Edg/')[1]
    console.log(`Edg v${verString}`)
    const verNumber=verString.substring(0,verString.indexOf('.'));
    const verInt=parseInt(verNumber);
    console.log("verInt:",verInt);
    if(verInt>=110){
      return true;
    }
  } else if (userAgent.includes('Chrome/')) {
    // Chrome
    const verString=userAgent.split('Chrome/')[1]
    console.log(`Chrome v${verString}`)
    const verNumber=verString.substring(0,verString.indexOf('.'));
    const verInt=parseInt(verNumber);
    console.log("verInt:",verInt);
    if(verInt>=110){
      return true;
    }
  } else if (userAgent.includes('Safari/')) {
    // Safari
    console.log(`Safari v${userAgent.split('Safari/')[1]}`)
  }

  return false;
}

export const getCheckBrower=()=>{
  const rootElement=document.getElementById('root');
  const checkBrower=rootElement.getAttribute("checkBrower");
  console.log("checkBrower:"+checkBrower);
  return checkBrower;
}