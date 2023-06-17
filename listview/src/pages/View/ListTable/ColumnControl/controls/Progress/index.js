import { Progress} from 'antd';

export default function ProgressBar({text,field, record, index}){
  let value=parseInt(text,10);
  return <Progress percent={value} size={"samll"} />;
}