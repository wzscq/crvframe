import I18nLabel from '../../../components/I18nLabel';

import './index.css';

export default function NoView(){
  return (
    <div className="no-view-main">
      <I18nLabel label={{key:'page.crvlistview.noView',default:'没有找到和您当前访问权限匹配的数据视图，您可以和管理员联系处理'}} />      
    </div>
  )
}