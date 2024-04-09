import { lazy,Suspense } from 'react'; 
import {HashRouter,Routes,Route} from "react-router-dom"; 
import { Provider } from 'react-redux';

import store from './redux';
//import Login from './pages/Login';
//import OAuthLogin from './pages/OAuthLogin';
//import OAuthBack from './pages/OAuthBack';
//import MainFrame from './pages/MainFrame';
//import MenuGroup from './pages/MenuGroup';
//import RedirectToOAuthLogin from './pages/RedirectToOAuthLogin';
import {
  checkBrowserVersion,
  getCheckBrower
} from './utils/checkBroswerVersion';

const Login = lazy(() => import('./pages/Login'));
const RedirectToOAuthLogin = lazy(() => import('./pages/RedirectToOAuthLogin'));
const OAuthLogin = lazy(() => import('./pages/OAuthLogin'));
const OAuthBack = lazy(() => import('./pages/OAuthBack'));
const MainFrame = lazy(() => import('./pages/MainFrame'));
const MenuGroup = lazy(() => import('./pages/MenuGroup'));

function App() {
  if(getCheckBrower()==='true'){
    const isSupport=checkBrowserVersion();
    if(!isSupport){
      return (
        <div style={{color:'red',textAlign:'center'}}>
          <h4>浏览器版本过低，请升级浏览器！</h4>
          <h4>请使用Chrome浏览器或者Edge浏览器，版本号: <span style={{weight:700}}>100</span> 以上</h4>
        </div>
      );
    }
  }

  return (
    <Provider store={store}>
      <HashRouter>
        <Routes>
          <Route path="/:appID" exact={true} element={<Suspense><RedirectToOAuthLogin/></Suspense>} />
          <Route path="/login/:appID" exact={true} element={<Suspense><Login/></Suspense>} />
          <Route path="/OAuthLogin/:appID" exact={true} element={<Suspense><OAuthLogin/></Suspense>} />
          <Route path="/OAuthBack/:appID" exact={true} element={<Suspense><OAuthBack/></Suspense>} />
          <Route path="/mainframe/:menuGroup" exact={true} element={<Suspense><MainFrame/></Suspense>} />
          <Route path="/menugroup" exact={true} element={<Suspense><MenuGroup/></Suspense>} />
        </Routes>
      </HashRouter>
    </Provider>
  );
}

export default App;
