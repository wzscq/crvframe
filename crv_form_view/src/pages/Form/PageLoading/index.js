import {Spin} from 'antd';
import './index.css';
export default function PageLoading(){
    return (
        <div className="page-loading-main">
            <Spin size="large"></Spin>
        </div>
    )    
}