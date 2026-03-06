import { useCallback, useState } from 'react';
import {Tree,Space,Button,Modal} from 'antd';
import { DeleteOutlined,AppstoreAddOutlined } from '@ant-design/icons';
import { useDispatch,useSelector } from 'react-redux';
import TreeForm from './TreeForm';
import I18nLabel from '../../../../../../component/I18nLabel';
import {initData} from '../../../../../../redux/tmpDataSlice';

import './index.css';

export default function EditTree({treeData,disabled,status,onDeleteItem,onAddItem,formConf,sendMessageToParent}){
    const dispatch = useDispatch();
    const [selectedKeys,setSelectedKeys]=useState([]);
    const [canDel,setCanDel]=useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const updateData = useSelector(state=>state.tmpdata.update);

    const showModal = () => {

        setIsModalOpen(true);
    };

    const handleOk = useCallback(() => {
        setIsModalOpen(false);
        console.log('updateData',updateData);
        //拿出数据，去做新增操作
        if(onAddItem){
            const addData=updateData[Object.keys(updateData)[0]];
            onAddItem(addData,selectedKeys[0]);
        }
        //然后将当前编辑的数据清空
        dispatch(initData);
    },[updateData,selectedKeys]);

    const handleCancel = () => {
        setIsModalOpen(false);
        //将当前编辑的数据清空
        dispatch(initData);
    };

    const onSelectTreeItems=(selectedKeys,{node})=>{
        setSelectedKeys(selectedKeys);
        if(node?.children?.length>0){
            setCanDel(false);
        } else {
            setCanDel(true);
        }
    }

    const onDelSelectedItem=useCallback(()=>{
        //删除当前选中的叶子节点
        if(selectedKeys.length>0&&onDeleteItem){
            onDeleteItem(selectedKeys[0])
        }
    },[selectedKeys])

    return (
        <>
            <div className='treelist-treeheader'>
                <Space>
                    <Button size='small' icon={<AppstoreAddOutlined />} onClick={showModal} />
                    <Button disabled={!canDel} size='small' icon={<DeleteOutlined />} onClick={onDelSelectedItem}/>
                </Space>
            </div>
            <Tree  
                treeData={treeData}
                disabled={disabled} 
                status={status}
                showLine={true}
                selectedKeys={selectedKeys}
                onSelect={onSelectTreeItems}
            />
            <Modal
                title={<I18nLabel label={formConf?.header.label}/>}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                width={formConf.width}
            >
                <TreeForm formConf={formConf} sendMessageToParent={sendMessageToParent}/>
            </Modal>
        </>
    )
}