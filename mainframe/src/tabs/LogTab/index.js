import { useSelector } from "react-redux";

export default function LogTab(){
    const logItems=useSelector(state=>state.log.items);
    const items=logItems.map(item=><div>{item}</div>);
    return (
        <div className="log-tab">
            {items}
        </div>
    );
}