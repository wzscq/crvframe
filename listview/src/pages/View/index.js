import { Col, Row,ConfigProvider } from 'antd';
import { useEffect,lazy,Suspense } from 'react';
import { useSelector,useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import zh_CN from 'antd/lib/locale/zh_CN';
import en_US from 'antd/lib/locale/en_US';


import useFrame from '../../hooks/useFrame';
import ListOperationBar from './ListOperationBar';
//import ListTable from './ListTable';
import ModelViewList from './ModelViewList';

import PageLoading from './PageLoading';
import SearchBar from './SearchBar';
import StatusBar from './StatusBar';

import {createGetModelConfMessage} from '../../utils/normalOperations';
import {initDataView} from '../../redux/dataSlice';
import NoView from './NoView';
//import ColumnSettingDialog from './ColumnSettingDialog';
import useI18n from '../../hooks/useI18n';
import FrameContext from '../../components/FrameContext';

import './index.css';

const ColumnSettingDialog=lazy(()=>import('./ColumnSettingDialog'));
const ListTable=lazy(()=>import('./ListTable'));

const locales={
    zh_CN:zh_CN,
    en_US:en_US
}

export default function View(){
    const dispatch= useDispatch();
    const {locale}=useI18n();
    const {loaded,views,showColumnSettingDialog,appConf} = useSelector(state=>state.definition);
    const {initialized} = useSelector(state=>state.data);
    const {origin,item}=useSelector(state=>state.frame);
    const sendMessageToParent=useFrame();
    const {modelID}=useParams();

    useEffect(()=>{
        if(origin&&item){
            if(loaded===false){
                //加载配置
                console.log('get model config ...');
                sendMessageToParent(createGetModelConfMessage({frameType:item.frameType,frameID:item.params.key,origin:origin},modelID,item.params.views));
            } else if (initialized===false) {
                console.log("loaded views :",views);
                console.log("appConf:",appConf);
                dispatch(initDataView({views,currentView:item.params.view,filter:item.params.filter,filterValueLabel:item.params.filterValueLabel, appConf}));
            }
        }
    },[loaded,origin,item,modelID,initialized,dispatch,sendMessageToParent,views]);

    if(loaded&&initialized){
        if(views?.length>0){            
            return (
                <ConfigProvider locale={locales[locale]} >
                    <FrameContext.Provider value={{sendMessageToParent}}>
                        <Suspense>
                            <div className='list_view_main'>
                                <Row>
                                    <Col span={6}><ModelViewList/></Col>
                                    <Col span={18}><ListOperationBar sendMessageToParent={sendMessageToParent}/></Col>
                                </Row>
                                <Row>
                                    <Col span={18}><StatusBar/></Col>
                                    <Col span={6}><SearchBar/></Col>
                                </Row>
                                <Row>
                                    <Col span={24}><ListTable sendMessageToParent={sendMessageToParent} /></Col>                   
                                </Row>
                            </div>
                            {showColumnSettingDialog===true?<ColumnSettingDialog/>:null}
                        </Suspense>
                    </FrameContext.Provider>
                </ConfigProvider>
            );
        } else {
            return(<NoView/>);
        }
    } else {
        return(<PageLoading/>);
    }
}