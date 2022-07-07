import {useCallback } from 'react';
import {useSelector} from 'react-redux';

export default function useI18n(){
    const resources=useSelector(state=>state.i18n.resources);
    const locale=useSelector(state=>state.i18n.locale);

    const getLocaleErrorMessage=useCallback((item)=>{
        console.log('getLocaleErrorMessage:',item);
        if(item.errorCode){
            const key='error.'+item.errorCode;
            if(resources[key]){
                return resources[key];
            }
        }
        return item.message+' '+item.errorCode;
    },[resources]);

    const getLocaleLabel=useCallback((title)=>{
        if(title.key&&resources[title.key]){
            return resources[title.key];
        }

        if(title[locale]){
            return title[locale]
        }

        if(title.default){
            return title.default;
        }

        return title;
         
    },[resources,locale]);
        
    return {
        getLocaleLabel,
        getLocaleErrorMessage,
        locale,
        resources};
}