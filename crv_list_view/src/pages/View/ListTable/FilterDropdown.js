import {Space,Button,Divider} from 'antd';
import {SortAscendingOutlined,SortDescendingOutlined,CheckOutlined  } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';

import {setSorter,setFixedColumn} from '../../../redux/dataSlice';
import FilterInput from './FilterInput';
import I18nLabel from '../../../components/I18nLabel';

import './FilterDropdown.css';

export default function FilterDropdown({ sendMessageToParent,field,index }){
    const dispatch=useDispatch();
    const {sorter,fixedColumn} = useSelector(state=>state.data.views[state.data.currentView].data);
    const ascActive=(sorter.length>0?sorter[0].field===field.field&&sorter[0].order==='asc':false);
    const descActive=(sorter.length>0?sorter[0].field===field.field&&sorter[0].order==='desc':false);
    const isFixed=(fixedColumn===index+1);
    
    return (
        <div className='filter-dropdown'>
            <Space direction="vertical">
                <Button
                    type='link'
                    size='small'
                    style={{color:ascActive?'#40a9ff':'grey'}}
                    icon={<SortAscendingOutlined/>}
                    onClick={() => {
                        dispatch(setSorter([{field:field.field,order:'asc'}]));
                    }}
                >
                    <I18nLabel label={{key:'page.crvlistview.asc',default:'升序'}}/>
                </Button>
                <Button
                    type='link'
                    size='small'
                    style={{color:descActive?'#40a9ff':'grey'}}
                    icon={<SortDescendingOutlined />}
                    onClick={() => {
                        dispatch(setSorter([{field:field.field,order:'desc'}]));
                    }}
                >
                    <I18nLabel label={{key:'page.crvlistview.desc',default:'降序'}}/>
                </Button>
            </Space>
            <Divider/>
            <Space direction="vertical">
                <Button
                    type='link'
                    size='small'
                    style={{color:isFixed?'#40a9ff':'grey'}}
                    icon={isFixed?<CheckOutlined />:null}
                    onClick={() => {
                        dispatch(setFixedColumn(index+1));
                    }}
                >
                    <I18nLabel label={{key:'page.crvlistview.fixTheColumn',default:'冻结列'}}/>
                </Button>
            </Space>
            <Divider/>
            <FilterInput sendMessageToParent={sendMessageToParent} field={field} />
        </div>
    );
}
    