export const convertUrl=(url)=>{
    if(process.env.REACT_APP_CRV_LIST_VIEW_URL){
        url=url.replace('/listview/',process.env.REACT_APP_CRV_LIST_VIEW_URL); 
    }

    if(process.env.REACT_APP_CRV_FORM_VIEW_URL){
        url=url.replace('/formview/',process.env.REACT_APP_CRV_FORM_VIEW_URL); 
    }

    if(process.env.REACT_APP_CRV_REPORT_VIEW_URL){
        url=url.replace('/report/',process.env.REACT_APP_CRV_REPORT_VIEW_URL); 
        console.log(url);
    }

    return url;
}

export const parseUrl=(url)=>{
    const a = document.createElement("a");
    a.href=convertUrl(url);
    return a;
} 
