import SingleSelectForOptions from "./SingleSelectForOptions";
import SingleSelectForManyToOne from "./SingleSelectForManyToOne";
import {FIELD_TYPE} from '../../../../../../utils/constant';

export default function SingleSelect(props){
    const {field}=props;
    if(field.fieldType){
        if(field.fieldType===FIELD_TYPE.MANY2ONE){
            return (<SingleSelectForManyToOne {...props} />)
        }
    }

    return (<SingleSelectForOptions {...props} />)
}