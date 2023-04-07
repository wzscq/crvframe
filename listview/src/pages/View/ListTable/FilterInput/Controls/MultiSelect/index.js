import MultiSelectForOptions from "./MultiSelectForOptions";
import MultiSelectForRelatedField from "./MultiSelectForRelatedField";
import {FIELD_TYPE} from '../../../../../../utils/constant';

export default function MultiSelect(props){
    const {field}=props;
    if(field.fieldType){
        if(field.fieldType===FIELD_TYPE.MANY2ONE||
          field.fieldType===FIELD_TYPE.MANY2MANY){
            return (<MultiSelectForRelatedField {...props} />)
        }
    }

    return (<MultiSelectForOptions {...props} />)
}