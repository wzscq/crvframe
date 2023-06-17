import {useCallback } from 'react';
import {useSelector} from 'react-redux';

export default function useI18n(){
    const {locale,resources}=useSelector(state=>state.i18n);

    const getLocaleLabel=useCallback((title)=>{
        if(title.key){
            if(resources[title.key]){
                return resources[title.key];
            } 

            if(title.default){
                return title.default;
            }
            
            return title.key;
        }

        if(title[locale]){
            return title[locale]
        }
        
        return title;
         
    },[locale,resources]);
        
    return {getLocaleLabel,locale};
}