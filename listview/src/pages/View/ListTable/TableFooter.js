import {Pagination,ConfigProvider} from 'antd';
import { useDispatch,useSelector } from 'react-redux';
import zh_CN from 'antd/lib/locale/zh_CN';
import en_US from 'antd/lib/locale/en_US';

import {setPagination} from '../../../redux/dataSlice';

import './TableFooter.css';
import useI18n from '../../../hooks/useI18n';

const locales={
    zh_CN:zh_CN,
    en_US:en_US
}

export default function TableFooter(){
    const {locale}=useI18n();
    const dispatch=useDispatch()
    const {total,pagination} = useSelector(state=>state.data.views[state.data.currentView].data);

    const onPaginationChange=(page, pageSize)=>{
        dispatch(setPagination({...pagination,current:page,pageSize:pageSize}));
    }

    const itemRender = (_, type, originalElement) => {
        console.log('itemRender:',type);
        return originalElement;
    };

    return (
        <ConfigProvider locale={locales[locale]}>
            <div className="list-table-footer">
                <div className="list-table-pagination">
                    <Pagination onChange={onPaginationChange} size="small" itemRender={itemRender} {...pagination} total={total} showSizeChanger />
                </div>
            </div>
        </ConfigProvider>
    );
}