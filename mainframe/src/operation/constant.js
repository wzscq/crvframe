/**
 * 以下为操作类型枚举常量定义
 */
export const OP_TYPE={
    OPEN:'open',  //"OP_TYPE_OPEN",   //打开窗口
    CLOSE:'close',  //"OP_TYPE_CLOSE",   //关闭窗口
    REQUEST:'request',   //"OP_TYPE_REQUEST",   //调用API
    UPDATE_FRAME_DATA:'updateFrameData',//"OP_TYPE_UPDATE_FRAME_DATA",  //更新子框架数据
    RELOAD_FRAME_DATA:'reloadFrameData',//"OP_TYPE_RELOAD_FRAME_DATA", //重新加载页面数据
    LOGOUT:'logout',//"OP_TYPE_LOGOUT",   //退出登录
    MESSAGE:'message',//"OP_TYPE_MESSAGE",  //弹出提示消息
    DOWNLOAD_FILE:'downloadFile' //"OP_TYPE_DOWNLOAD_FILE", //下载文件
}

/**
 * 以下为提示消息类型的定义
 */
export const MESSAGE_TYPE = {
    SUCCESS:'success',
    ERROR:'error',
    INFO:'info'
}

/**
 * 以下为操作返回结果
 */
export const OP_RESULT={
    SUCCESS:'success',//"OP_RESULT_SUCCESS",  //操作成功
    ERROR:'error',//"OP_RESULT_ERROR"  //操作失败
}

export const ERROR_CODE={
    TOKEN_EXPIRED:"10000004"
}

/**
 * 以下为打开窗口操作中，指定窗口打开位置的枚举常量定义
 */
 export const OPEN_LOCATION={
    TAB:'tab',//"LOCATION_TYPE_TAB",  //在tab页中打开窗口
    CURRENT:'current',//"LOCATION_TYPE_CURRENT",  //打开窗口替换当前页面
    MODAL:'modal',//"LOCATION_TYPE_MODAL"  //以模态框形式打开窗口
}

/**
 * 一下是主框架和iframe的消息通信中传递消息的类型
 */
export const FRAME_MESSAGE_TYPE={
    DO_OPERATION:'doOperation',//"DO_OPERATION",
    INIT:'init',//"INIT",
    UPDATE_DATA:'updateData',//"UPDATE_DATA",
    RELOAD_DATA:'reloadData',//"RELOAD_DATA",
    UPDATE_LOCALE:'updateLocale',//"UPDATE_LOCALE",
    QUERY_REQUEST:'queryRequest',//"QUERY_REQUEST",
    QUERY_RESPONSE:'queryResponse',//"QUERY_RESPONSE",
    GET_IMAGE:'getIamge' //"GET_IMAGE"
}

/**
 * 这里对一个操作项的数据结构做个说明
 * operationItem{
 *   包含以下属性
 *      操作类型
 *      type:
 *          目前可支持的操作类型参见操作类型枚举常量定义
 *      对操作的描述信息
 *      description:"",
 *      操作配置参数
 *      params:{
 *          这里的参数因不同的操作而不同
 *          地址
 *          url：
 *              对于打开的窗口，对应窗口的URL地址
 *              如果是打开内部对话框，则是对话框的ID
 *              如果是调用API则是API的地址
 *          location:
 *              仅对打开窗口操作有效，指定打开窗口的位置取值参见窗口打开位置的枚举常量定义
 *          method:
 *              请求类型，仅对调用API有效
 *      }
 *      
 *      输入数据，
 *      input:
 *          操作的输入项通常是从表单上获取的数据，在表单上点按钮时，获取表单数据作为按钮调用操作的输入
 *          如果当前操作存在前项操作，则可以是前项操作的输出数据(前一个操作的输出可作为后一个操作的输入)
 *          不同操作的输入、输出具体取值逻辑参照不同操作的说明
 *          总体数据结构如下，不同操作和场景会有所不同，具体可参照不同操作的说明
 *          
 *           {
 *                  modelid:model1
 *                  viewId:view1,
 *                  pagenation:{
 *                      total:100   总记录数
 *                      current:    当前页编号 
 *                      pageSize:      每页记录数
 *                  },
 *                  filter:{    过滤条件，待细化
 *                  },
 *                  selectedRows:[{id:1}],  List视图页面中选中行
 *                  list:[{
 *                      id:1,        //ID字段
 *                      f1:val,      //普通字段
 *                      f2:val,
 *                      f3:{         //关联字段
 *                          value:val,
 *                          model:modleid,
 *                          field:fieldid,
 *                          filter:{    过滤条件，待细化
 *                          },
 *                          list:{}   //这里的data和外层的data是一致的
 *                      }
 *                  }]
 *          }
 *                 
 * 
 *      输出数据
 *      output：
 *          这个是在操作执行完毕后获取到的数据，
 *          如果当前的操作项存在后续的操作项的话，这里的输出数据将作为后续操作项的输入数据
 *          对于打开窗口操作是没有输出数据的
 *          对于关闭窗口操作，如果没有前项操作则输出数据就是窗口表单的数据，如果有则使用输入数据作为输出
 *          对于调用API操作，输出就是API返回的数据
 *          数据结构如下
 *          {
 *              操作结果
 *              result:
 *                  表示操作时成功还是失败，对于关闭窗口操作，可以在参数中指定result是成功还是失败。
 *                  对于调用后台API，如果调用发生错误则result为失败，如果调用成功则从反回的数据中获取result状态
 *                  如果调用API的返回结果中没有result，则认为失败。
 *              data:{}  //和input的data结构相同
 *          }     
 * 
 *      操作成功时执行的下一个操作
 *      successOperation:
 *          这里成功，对于打开页面操作来说（一般时打开模态对话框操作），应该是点击确认返回，如果点击取消返回，则认为时失败。
 *          当操作是调用后台接口时，后台接口返回的result中应该携带
 *      
 *      操作执行失败时执行的下一个操作
 *      errorOperation:
 *      操作是否完成
 *      done:false
 *      操作结果类型，参见OP_RESULT枚举定义
 *      result
 *      错误消息
 *      message:"",
 *      是否正在执行中，仅对REQUEST请求操作有效
 *      pending,
 * }
 * 
 * 
 * 以下举几个常用的用例来校验操作的实现逻辑
 * 1、打开对话框显示数据
 *    这里首先是如何获取将要打开的对话框的数据，如果是从列表页获取，则当前列表页的选择的数据和查询条件等可以作为列表页的output来实现，
 * 这样在执行动作的时候就可以将当前output数据作为打开窗口操作的输入数据来处理。
 *    打开的对话框自动显示输入的数据，同时将数据设置为输出数据，在对话框上的后续操作的输入都将是这个输出。
 *    在对话框上对数据的修改将自动更新到这个输出数据上。
 * 2、调用一个API然后刷新界面
 *    如果API直接返回了有效数据，则可以在调用API后直接API的输出结果来调用页面的setOutput操作来更新页面显示的数据
 *    如果API没有直接返回有效的数据，则可以调用页面的refresh操作来刷新数据？
 * 3、向导页面的实现   
 *    相当于各个页面的output数据之间的传递，也可以考虑通过一个向导控件来实现，这样就只需要一个form表单中操作，感知更好
 * 4、关闭窗口时，窗口的output作为关闭窗口操作的input，如果关闭窗口有后续操作则这个input将作为后续操作的输入
 * 5、对数据的操作，包括创建、修改、删除和批量更新，
 *        创建和修改一般是针对小批量数据，在操作逻辑上他们是一致的，实际上可以抽象为保存数据操作，在保存数据时，通过一个list来提交多条数据，其中每条数据中都携带操作类型，
 *    这里的操作类型包括创建、修改、删除，其中修改和删除必须携带数据ID字段，保存数据可以实现关联数据的级联修改操作，级联修改操作一般用于主从关系表的同步修改。
 *    
 *        删除可以是单条也可以是多条需要单独实现，通过传递多个数据ID实现删除数据操作，批量操作中如果存在主从关系则需要根据配置进行级联删除。
 * 
 *        批量修改是指对于符合条件的数据，按照条件或者用户选择的记录行ID列表，将指定某些字段全部替换为指定的值，这里的操作模式一般有两种：
 *        1、在按钮的action当中已经配置了input->data>list中的数据，在视图页面点击按钮时，将这个数据和页面的过滤条件或选择数据行ID一起提交。
 *        2、点击按钮后先执行打开对话框操作，在对话框中录入数据后保存，这中情况下，首先在打开对话框时将视图页面选择的数据行和过滤条件作为输入传递给对话框，
 *           对话框执行操作时，根据配置将输入的过滤条件和选择行合并到页面表单数据作为请求的输入调用请求。
 * 6、表单的类型：新增和修改表单、其它表单
 *      在打开表单时通过url参数指定表单的类型，create（新增），update（修改表单），空（普通表单）
 *      create（新增）：按钮动作的第一个item的input->data>list中放入表单数据，同时在第一层模型对象数据中加入_save_type列，值为create
 *      update（修改表单）：按钮动作的第一个item的input->data>list中放入表单数据，同时在第一层模型对象数据中加入_save_type列，值为update
 *      空（普通表单）：按钮动作的第一个item的input->data>list中放入表单数据，不需要设置额外的操作指示列
 * 
 * 7、数据权限直接在角色上做，视图仅用于功能上的过滤不过权限控制，表单的下拉如果有数据过滤需求则应该直接在表单控件的配置中给出
 *    对于表单或视图上控件的下拉选项的查询取数如果通过操作流程来走则会增加耦合，降低并发效率，因此考虑在主框架单独给查询取数提供一个接口
 * 
 * 8、批量更新功能目前还没有实现，考虑实现方式
 * 
 * 9、编辑表单中如何实现多条数据的更新和一对多数据的同步编辑更新
 * 
 * 10、权限的实现
 */