import { useEffect, useState } from 'react';
import { Menu} from 'antd';
import { AppstoreFilled } from '@ant-design/icons';

import { getHost } from '../../../api';
import { createOpenOperation,setOperation,OPEN_LOCATION } from '../../../operation';
import useI18n from '../../../hook/useI18n';


export default function FunctionMenu(){
    const [firstOpen,setFirstOpen]=useState(true);
    const {getLocaleLabel}=useI18n();
    const handleClick=(e)=>{
        const key=e.key;
        const host=getHost();
        let params={
            url:host+key,
            title:"",
            key,
            location:OPEN_LOCATION.TAB
        }
        if(key==='/functions'){
            params.title={key:'page.main.functionList',default:'功能列表'};
            params.url=process.env.REACT_APP_FUNCTION_LIST_URL 
            //params.url="http://localhost:3001";
        }

        if(key==="/log"){
            params.title="Operation Log";
        }

        const operationItem=createOpenOperation(params,{},{key:'page.main.openPage',default:'打开功能页面'});
        setOperation(operationItem);
    }

    /*useEffect(()=>{
        if(firstOpen===true){
            const params={
                url:process.env.REACT_APP_FUNCTION_LIST_URL,
                title:{key:'page.main.functionList',defaultLabel:'功能列表'},
                key:'/functions',
                location:OPEN_LOCATION.TAB
            };
            const operationItem=createOpenOperation(params,{},{key:'page.main.openPage',default:'打开功能页面'});
            setFirstOpen(false);
            //这里可能是由于js执行顺序问题，同步执行会造成刷新页面时报错，暂时采用异步执行方式应对，后续可能考虑更合理的方式处理
            setTimeout(() => {
                //setOperation(operationItem);    
            }, 100);
        }
    },[firstOpen,setFirstOpen]);*/

    const menuItems=[
        {key:'/functions',icon:(<AppstoreFilled />),label:getLocaleLabel({key:'page.main.functionList',default:'功能列表'})}
    ];

    return (
        <Menu onClick={handleClick} selectedKeys={["mail"]} mode="horizontal" items={menuItems} />
    );
}