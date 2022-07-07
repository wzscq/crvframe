import { useMemo } from 'react';
import {useSelector} from 'react-redux';
import {ConfigProvider} from 'antd';
import zh_CN from 'antd/lib/locale/zh_CN';
import en_US from 'antd/lib/locale/en_US';


import FormControl from './FormControl';
import FormHeader from './FormHeader';
import { FORM_TYPE } from '../../utils/constant';
import './FormView.css';
import useI18n from '../../hook/useI18n';

const locales={
    zh_CN:zh_CN,
    en_US:en_US
}

export default function FormView({fromTitle,formType,sendMessageToParent}){
    const {locale}=useI18n();
    const {forms,fields,operations} = useSelector(state=>state.definition);
    const rowKey = useSelector(state=>{
        return Object.keys(state.data.updated)[0]
    });

    const dataPath=useMemo(()=>{
        return [rowKey];
    },[rowKey]);
    
    const form=useMemo(()=>{
        if(forms.length>0){
            return forms[0];
        } else {
            return null;
        }
    },[forms]);
    
    const {controls,colCount,rowHeight}=useMemo(()=>{
        if(form){
            const {colCount,rowHeight}=form;
            const controls=form.controls.map((item,index)=>{
                const field=fields.find(element=>element.field===item.field);
                //如果是编辑页面，则将ID字段置为不可修改,详情页面则所有字段都不允许修改
                if((item.field==='id'&&formType===FORM_TYPE.EDIT)||
                    formType===FORM_TYPE.DETAIL){
                    return (<FormControl dataPath={dataPath} sendMessageToParent={sendMessageToParent}  item={{...item,disabled:true}} field={field} key={index} />);
                } else {
                    return (<FormControl dataPath={dataPath} sendMessageToParent={sendMessageToParent} item={item} field={field} key={index} />);
                }
            });
            return {controls,colCount,rowHeight}
        } else {
            return {controls:[],colCount:1,rowHeight:30}
        }
    },[form,fields,formType,dataPath,sendMessageToParent]);

    const {headerLabel,headerOperations}=useMemo(()=>{
        let headerLabel=null;
        let headerOperations=[];
        if(form&&form.header){
            headerLabel=fromTitle?fromTitle:form.header.label;
            const formOperations=form.header.operations;
            if(Array.isArray(formOperations)){
                headerOperations=formOperations.map(element=>{
                    if(element.operationID){
                        const opItem=operations.find(item=>item.id===element.operationID);
                        if(opItem){
                            return {...opItem,...element}
                        } else {
                            return null;
                        }
                    }
                    return element;
                });
                headerOperations=headerOperations.filter(item=>item!=null);
            }
        }
        return {headerLabel,headerOperations}
    },[form,operations,fromTitle]);

    const {footLabel,footOperations}=useMemo(()=>{
        let footLabel=null;
        let footOperations=[];
        if(form&&form.footer){
            footLabel=form.footer.label;
            const formOperations=form.footer.operations;
            if(Array.isArray(formOperations)){
                footOperations=formOperations.map(element=>{
                    if(element.operationID){
                        const opItem=operations.find(item=>item.id===element.operationID);
                        if(opItem){
                            return {...opItem,...element}
                        } else {
                            return null;
                        }
                    }
                    return element;
                });
                footOperations=footOperations.filter(item=>item!=null);
            }
        }
        return {footLabel,footOperations}
    },[form,operations]);

    return (
        <ConfigProvider locale={locales[locale]}>
            <div className='form-view'>
                <div className='form-header'>
                    <FormHeader sendMessageToParent={sendMessageToParent} form={form} label={headerLabel} operations={headerOperations} />
                </div>
                <div className='form-content'>
                    <div className='form-grid' style={{gridTemplateColumns: "repeat("+colCount+", 1fr)",gridAutoRows:"minmax("+rowHeight+"px, auto)"}}>
                        {controls}
                    </div>
                </div>
                <div className='form-footer'>
                    <FormHeader sendMessageToParent={sendMessageToParent} form={form}  label={footLabel} operations={footOperations} />
                </div>
            </div>
        </ConfigProvider>
    );
}