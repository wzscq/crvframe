import store from "../redux";
import {setOperation as actionSetOperation} from '../redux/operationSlice';
import OperationDialog from "./OperationDialog";

export default OperationDialog;

export {
    OP_TYPE,
    OP_RESULT,
    OPEN_LOCATION,
    FRAME_MESSAGE_TYPE,
    ERROR_CODE
} from "./constant";

export {
    createOpenOperation,
    createCloseOperation,
    createRequestOperation,
    createUpdateFrameOperation,
    createLogoutOperation
} from './operationItemFactory';

export const setOperation=(operation)=>{
    store.dispatch(actionSetOperation(operation));
}
