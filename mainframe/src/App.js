import {HashRouter,Routes,Route} from "react-router-dom"; 
import { Provider } from 'react-redux';

import store from './redux';
import Login from './pages/Login';
import OAuthLogin from './pages/OAuthLogin';
import OAuthBack from './pages/OAuthBack';
import MainFrame from './pages/MainFrame';
import RedirectToOAuthLogin from './pages/RedirectToOAuthLogin';

function App() {
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
