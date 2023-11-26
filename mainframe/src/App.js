import {HashRouter,Routes,Route} from "react-router-dom"; 
import { Provider } from 'react-redux';

import store from './redux';
import Login from './pages/Login';
import OAuthLogin from './pages/OAuthLogin';
import OAuthBack from './pages/OAuthBack';
import MainFrame from './pages/MainFrame';
import RedirectToOAuthLogin from './pages/RedirectToOAuthLogin';
import {
  checkBrowserVersion,
  getCheckBrower
} from './utils/checkBroswerVersion';


function App() {

  if(getCheckBrower()==='true'){
    const isSupport=checkBrowserVersion();
    if(!isSupport){
      return (
        <div style={{color:'red',textAlign:'center'}}>
          <h4>浏览器版本过低，请升级浏览器！</h4>
          <h4>请使用Chrome浏览器或者Edge浏览器，版本号: <span style={{weight:700}}>110</span> 以上</h4>
        </div>
      );
    }
  }

  return (
    <Provider store={store}>
      <HashRouter>
        <Routes>
          <Route path="/:appID" exact={true} element={<RedirectToOAuthLogin/>} />
          <Route path="/login/:appID" exact={true} element={<Login/>} />
          <Route path="/OAuthLogin/:appID" exact={true} element={<OAuthLogin/>} />
          <Route path="/OAuthBack/:appID" exact={true} element={<OAuthBack/>} />
          <Route path="/mainframe" exact={true} element={<MainFrame/>} />
        </Routes>
      </HashRouter>
    </Provider>
  );
}

export default App;
