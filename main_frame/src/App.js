import {HashRouter,Routes,Route,Navigate} from "react-router-dom"; 
import { Provider } from 'react-redux';

import store from './redux';
import Login from './pages/Login';
import MainFrame from './pages/MainFrame';

function App() {
  return (
    <Provider store={store}>
      <HashRouter>
        <Routes>
          <Route path="/" exact={true} element={<Navigate to="/login"/>} />
          <Route path="/login/:appID" exact={true} element={<Login/>} />
          <Route path="/mainframe" exact={true} element={<MainFrame/>} />
        </Routes>
      </HashRouter>
    </Provider>
  );
}

export default App;
