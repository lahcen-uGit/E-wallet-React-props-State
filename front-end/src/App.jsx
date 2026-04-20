
import { useState } from "react";
import Login from "./component/login";
import Dashboard from "./component/dashbord";
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {

  // user = null au debut 
  const [user, setUser] = useState(null);

  return (
    <>
      {/* Si user est null  affiche Login, sinon affiche Dashboard */}
      {user === null
        ? <Login setUser={setUser} />
        : <Dashboard user={user} />
      }
    </>
  );
}

export default App;
