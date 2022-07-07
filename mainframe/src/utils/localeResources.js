var localeResources={};

export const setLocaleResources=(res)=>{
    localeResources=res;
}

export const getLocaleLabel=(label)=>{
    if(label.key&&localeResources[label.key]){
        return localeResources[label.key];
    }

    if(label.default){
        return label.default;
    }

    return 'undefined';
}

export const getLocaleErrorMessage=(item)=>{
    console.log('getLocaleErrorMessage:',item);
    if(item.errorCode){
        const key='error.'+item.errorCode;
        if(localeResources[key]){
            return localeResources[key];
        }
    }
    return item.message+' '+item.errorCode;
};