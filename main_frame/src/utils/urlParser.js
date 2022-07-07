export const convertUrl=(url)=>{
    if(process.env.REACT_APP_CRV_LIST_VIEW_URL){
        url=url.replace('/crv_list_view/',process.env.REACT_APP_CRV_LIST_VIEW_URL); 
    }

    if(process.env.REACT_APP_CRV_FORM_VIEW_URL){
        url=url.replace('/crv_form_view/',process.env.REACT_APP_CRV_FORM_VIEW_URL); 
    }
    return url;
}

export const parseUrl=(url)=>{
    const a = document.createElement("a");
    a.href=convertUrl(url);
    return a;
} 
