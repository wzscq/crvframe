import {HashRouter,Routes,Route} from "react-router-dom";
import View from './pages/View';

import './App.css';

function App() {
  return (
    <div className="App">
      <HashRouter>
        <Routes>
          <Route path="/:modelID" exact={true} element={<View/>} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
