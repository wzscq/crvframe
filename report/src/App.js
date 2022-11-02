import {HashRouter,Routes,Route} from "react-router-dom";
import Report from './pages/Report';

import './App.css';

function App() {
  return (
    <div className="App">
      <HashRouter>
        <Routes>
          <Route path="/:reportID" exact={true} element={<Report/>} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;