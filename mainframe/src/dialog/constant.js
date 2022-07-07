import ChangePassword from "./ChangePassword";

export const DIALOG_TYPE = {
    CHANGE_PASSWORD:'DIALOG_CHANGEPASSWORD'
}

export const dialogRepository = {
    [DIALOG_TYPE.CHANGE_PASSWORD]:{title:{key:'dialog.changePassword.title',default:"修改密码"},component:<ChangePassword />},
};