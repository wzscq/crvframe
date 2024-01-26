import NormalGroupItem from "./NormalGroupItem";
import SuperGroupItem from "./SuperGroupItem";
import useI18n from "../../hook/useI18n";

export default function GroupItem({item,index}){
  const {getLocaleLabel}=useI18n();

  return (
    <>
      {item.children?.length>0?<SuperGroupItem getLocaleLabel={getLocaleLabel} index={index} item={item}/>:<NormalGroupItem getLocaleLabel={getLocaleLabel} item={item} index={index} />}
    </>
  );
}