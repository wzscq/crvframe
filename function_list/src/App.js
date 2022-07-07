import FunctionList from './pages/FunctionList';
import useFrame from "./hooks/useFrame";

import './App.css';

function App() {
  const sendMessageToParent=useFrame();
  return (
    <div className="App">
        <FunctionList  sendMessageToParent={sendMessageToParent}/>
    </div>
  );
}

export default App;
