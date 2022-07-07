import {HashRouter,Routes,Route} from "react-router-dom";
import Form from './pages/Form';

import './App.css';

function App() {
  return (
    <div className="App">
      <HashRouter>
        <Routes>
          <Route path="/:modelID/:formID/:formType" exact={true} element={<Form/>} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
