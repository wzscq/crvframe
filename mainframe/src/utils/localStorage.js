export const localeStorage={
    set:(appID,locale)=>{
        localStorage.setItem('app_'+appID+'_locale',locale);
    },
    get:(appID)=>{
        return localStorage.getItem('app_'+appID+'_locale');
    }
} 

