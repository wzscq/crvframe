import './App.css';
import {HashRouter,Routes,Route} from "react-router-dom";
import View from './pages/View';

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
