
import { useState } from "react";
import Header from "./header";
import Footer from "./footer";
import { finduserbymail } from "../Model/database";

//  on reçoit setUser comme prop (envoyer par App.jsx)
function Login({ setUser }) {

  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin() {
    // cherche l'utilisateur dans la base
    const foundUser = finduserbymail(mail, password);

    if (foundUser) {
      // connexion reussie on envoie user a App.jsx
      setUser(foundUser);
    } else {
    
      setError("Email ou mot de passe incorrect");
    }
  }

  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="hero-content" id="main">
            <h1>Connexion</h1>
            <p>Accedez a votre E-Wallet en toute securite.</p>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <div className="login-form">
              <div className="input-group">
                {/* onChange met a jour le state mail */}
                <input
                  type="email"
                  placeholder="Adresse e-mail"
                  value={mail}
                  onChange={(e) => setMail(e.target.value)}
                />
              </div>
              <div className="input-group">
                {/* onChange met a jour le state password */}
                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
          
              <button type="button" className="btn btn-primary" onClick={handleLogin}>
                Se connecter
              </button>
            </div>

          </div>
          <div className="hero-image">
            <img src="../src/assets/e-Wallet6.gif" alt="Illustration de connexion" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Login;
