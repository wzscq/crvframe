export const userInfoStorage={
    set:(user)=>{
        sessionStorage.setItem("userInfo",JSON.stringify(user));
    },
    get:()=>{
        const userStr=sessionStorage.getItem("userInfo");
        if(userStr!=null&&userStr?.length>0){
            return JSON.parse(userStr);
        }
        return {userName:"",token:"",appID:""};
    },
    clear:()=>{
        sessionStorage.removeItem("userInfo");
    }
} 