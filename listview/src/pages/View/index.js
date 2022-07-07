import { Col, Row } from 'antd';
import { useEffect } from 'react';
import { useSelector,useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import useFrame from '../../hooks/useFrame';
import ListOperationBar from './ListOperationBar';
import ListTable from './ListTable';
import ModelViewList from './ModelViewList';

import PageLoading from './PageLoading';
import SearchBar from './SearchBar';
import StatusBar from './StatusBar';

import {createGetModelConfMessage} from '../../utils/normalOperations';

import './index.css';

import {initDataView} from '../../redux/dataSlice';

export default function View(){
    const dispatch= useDispatch();
    const {loaded,views} = useSelector(state=>state.definition);
    const {currentView} = useSelector(state=>state.data);
    const {origin,item}=useSelector(state=>state.frame);
    const sendMessageToParent=useFrame();
    const {modelID}=useParams();

    useEffect(()=>{
        if(origin&&item){
            if(loaded===false){
                //加载配置
                console.log('get model config ...');
                sendMessageToParent(createGetModelConfMessage({frameType:item.frameType,frameID:item.params.key,origin:origin},modelID));
            } else {
                console.log("loaded views :",views);
                dispatch(initDataView(views));
            }
        }
    },[loaded,origin,item,modelID,dispatch,sendMessageToParent,views]);

    if(loaded&&currentView){
        return (
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
        );
    } else {
        return(<PageLoading/>);
    }
}