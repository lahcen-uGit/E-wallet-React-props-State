// ============================================================
// FICHIER : src/component/dashbord.jsx
// ============================================================

import { useState } from "react";
import Header from "./header";
import Footer from "./footer";
import { finduserbyaccount, findbeneficiarieByid } from "../Model/database";

function Dashboard({ user }) {

  // ---- Popups ----
  const [showTransfer, setShowTransfer] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);

  // ---- State pour rafraîchir l'affichage après transfert/recharge ----
  const [currentUser, setCurrentUser] = useState(user);

  // ---- States pour les champs du formulaire TRANSFERT ----
  const [beneficiaryId, setBeneficiaryId] = useState("");   // le bénéficiaire choisi
  const [sourceCard, setSourceCard]       = useState("");   // la carte choisie
  const [amount, setAmount]               = useState("");   // le montant tapé

  // ---- States pour les champs du formulaire RECHARGE ----
  const [sourceCard2, setSourceCard2] = useState("");       // la carte choisie
  const [amount2, setAmount2]         = useState("");       // le montant tapé

  // ---- Calculs ----
  const monthlyIncome = currentUser.wallet.transactions
    .filter((t) => t.type === "credit")
    .reduce((total, t) => total + t.amount, 0);

  const monthlyExpenses = currentUser.wallet.transactions
    .filter((t) => t.type === "debit")
    .reduce((total, t) => total + t.amount, 0);

  const currentDate = new Date().toLocaleDateString("fr-FR");


  //**********************  FONCTIONS TRANSFER **************************//


  function checkUser(numcompte) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const beneficiary = finduserbyaccount(numcompte);
        if (beneficiary) {
          resolve(beneficiary);
        } else {
          reject("Destinataire non trouvé");
        }
      }, 1000);
    });
  }

  function checkSolde(expediteur, amt) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (expediteur.wallet.balance > amt) {
          resolve("Solde suffisant");
        } else {
          reject("Solde insuffisant");
        }
      }, 500);
    });
  }

  function updateSolde(expediteur, destinataire, amt) {
    return new Promise((resolve) => {
      setTimeout(() => {
        expediteur.wallet.balance -= amt;
        destinataire.wallet.balance += amt;
        resolve("Solde mis à jour");
      }, 200);
    });
  }

  function addtransactions(expediteur, destinataire, amt) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const debit = {
          id: Date.now(),
          type: "debit",
          amount: amt,
          date: new Date().toLocaleDateString(),
          to: destinataire.name,
          etat: "valide",
        };
        const credit = {
          id: Date.now() + 1,
          type: "credit",
          amount: amt,
          date: new Date().toLocaleDateString(),
          from: expediteur.name,
          etat: "valide",
        };
        expediteur.wallet.transactions.push(debit);
        destinataire.wallet.transactions.push(credit);
        resolve("Transaction enregistrée");
      }, 300);
    });
  }

  async function transfer(expediteur, numcompte, amt) {
    try {
      const destinataire = await checkUser(numcompte);
      console.log("Étape 1 : Destinataire trouvé →", destinataire.name);

      const soldeMessage = await checkSolde(expediteur, amt);
      console.log("Étape 2 :", soldeMessage);

      const updateMessage = await updateSolde(expediteur, destinataire, amt);
      console.log("Étape 3 :", updateMessage);

      const transactionMessage = await addtransactions(expediteur, destinataire, amt);
      console.log("Étape 4 :", transactionMessage);

      setCurrentUser({ ...currentUser });
      alert(`Transfert de ${amt} MAD réussi !`);
      setShowTransfer(false);

    } catch (erreur) {
      alert(erreur);
    }
  }

  
  // on utilise directement les states : beneficiaryId, amount
  function handleTransfer() {
    const beneficiaryAccount = findbeneficiarieByid(currentUser.id, beneficiaryId).account;
    transfer(currentUser, beneficiaryAccount, Number(amount));
  }

  // ********************** FONCTIONS RECHARGE **************************//


  function checkmontant(amt) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (amt <= 0) {
          reject("Le montant doit être supérieur à 0");
        } else if (amt < 10 || amt > 5000) {
          reject("Le montant doit être compris entre 10 et 5000 MAD");
        } else {
          resolve("Montant valide");
        }
      }, 500);
    });
  }

  function checkCardExpiry(numcarte) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const card = currentUser.wallet.cards.find((c) => c.numcards === numcarte);
        if (card) {
          const today = new Date();
          const expiryDate = new Date(card.expiry);
          if (expiryDate > today) {
            resolve("Carte valide");
          } else {
            reject("Carte expirée");
          }
        } else {
          reject("Carte non trouvée");
        }
      }, 500);
    });
  }

  function updatemontant(amt) {
    return new Promise((resolve) => {
      setTimeout(() => {
        currentUser.wallet.balance += amt;
        resolve("Solde mis à jour");
      }, 200);
    });
  }

  function addtransactionrecharge(amt, numcarte) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const transaction = {
          id: Date.now(),
          type: "Recharge",
          amount: amt,
          date: new Date().toLocaleDateString(),
          from: "Carte " + numcarte,
          etat: "valid",
        };
        currentUser.wallet.transactions.push(transaction);
        resolve("Transaction de recharge enregistrée");
      }, 200);
    });
  }

  function addtransactionechec(amt, numcarte) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const transaction = {
          id: Date.now(),
          type: "Recharge",
          amount: amt,
          date: new Date().toLocaleDateString(),
          from: "Carte " + numcarte,
          etat: "échouée",
        };
        currentUser.wallet.transactions.push(transaction);
        resolve("Transaction échouée enregistrée");
      }, 200);
    });
  }

  async function recharge(numcarte, amt) {
    try {
      const cardMessage = await checkCardExpiry(numcarte);
      console.log("Étape 1 :", cardMessage);

      const montantMessage = await checkmontant(amt);
      console.log("Étape 2 :", montantMessage);

      const updateMessage = await updatemontant(amt);
      console.log("Étape 3 :", updateMessage);

      const transactionMessage = await addtransactionrecharge(amt, numcarte);
      console.log("Étape 4 :", transactionMessage);

      setCurrentUser({ ...currentUser });
      alert(`Recharge de ${amt} MAD réussie !`);
      setShowRecharge(false);

    } catch (erreur) {
      alert(erreur);
      await addtransactionechec(amt, numcarte);
      setCurrentUser({ ...currentUser });
    }
  }


  // on utilise directement les state : sourceCard2, amount2
  function handleRecharge() {
    recharge(sourceCard2, Number(amount2));
  }




  return (
    <>
      <Header />
      <main className="dashboard-main">
        <div className="dashboard-container">

          
          <aside className="dashboard-sidebar">
            <nav className="sidebar-nav">
              <ul>
                <li className="active">
                  <a href="#overview"><i className="fas fa-home"></i><span>Vue d'ensemble</span></a>
                </li>
                <li>
                  <a href="#transactions"><i className="fas fa-exchange-alt"></i><span>Transactions</span></a>
                </li>
                <li>
                  <a href="#cards"><i className="fas fa-credit-card"></i><span>Mes cartes</span></a>
                </li>
                <li>
                  <a href="#transfers"><i className="fas fa-paper-plane"></i><span>Transferts</span></a>
                </li>
                <li className="separator"></li>
                <li>
                  <a href="#support"><i className="fas fa-headset"></i><span>Aide & Support</span></a>
                </li>
              </ul>
            </nav>
          </aside>

          
          <div className="dashboard-content">
            <section id="overview" className="dashboard-section active">

              <div className="section-header">
                <h2>Bonjour, <span>{currentUser.name}</span> !</h2>
                <p className="date-display">{currentDate}</p>
              </div>

              <div className="summary-cards">
                <div className="summary-card">
                  <div className="card-icon blue"><i className="fas fa-wallet"></i></div>
                  <div className="card-details">
                    <span className="card-label">Solde disponible</span>
                    <span className="card-value">{currentUser.wallet.balance} {currentUser.wallet.currency}</span>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="card-icon green"><i className="fas fa-arrow-up"></i></div>
                  <div className="card-details">
                    <span className="card-label">Revenus</span>
                    <span className="card-value">{monthlyIncome} MAD</span>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="card-icon red"><i className="fas fa-arrow-down"></i></div>
                  <div className="card-details">
                    <span className="card-label">Dépenses</span>
                    <span className="card-value">{monthlyExpenses} MAD</span>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="card-icon purple"><i className="fas fa-credit-card"></i></div>
                  <div className="card-details">
                    <span className="card-label">Cartes actives</span>
                    <span className="card-value">{currentUser.wallet.cards.length}</span>
                  </div>
                </div>
              </div>

              <div className="quick-actions">
                <h3>Actions rapides</h3>
                <div className="action-buttons">
                  <button className="action-btn" type="button" onClick={() => setShowTransfer(true)}>
                    <i className="fas fa-paper-plane"></i><span>Transférer</span>
                  </button>
                  <button className="action-btn" type="button" onClick={() => setShowRecharge(true)}>
                    <i className="fas fa-plus-circle"></i><span>Recharger</span>
                  </button>
                  <button className="action-btn" type="button">
                    <i className="fas fa-hand-holding-usd"></i><span>Demander</span>
                  </button>
                </div>
              </div>

              <div className="recent-transactions">
                <div className="section-header">
                  <h3>Transactions récentes</h3>
                </div>
                <div className="transactions-list">
                  {currentUser.wallet.transactions.map((transaction) => (
                    <div key={transaction.id} className="transaction-item">
                      <div>{transaction.date}</div>
                      <div>{transaction.amount} MAD</div>
                      <div>{transaction.type}</div>
                      <div>{transaction.etat}</div>
                    </div>
                  ))}
                </div>
              </div>

            </section>

            <section id="cards" className="dashboard-section">
              <div className="section-header">
                <h2>Mes cartes</h2>
                <button className="btn btn-secondary" type="button">
                  <i className="fas fa-plus"></i> Ajouter une carte
                </button>
              </div>
              <div className="cards-grid">
                {currentUser.wallet.cards.map((card) => (
                  <div key={card.numcards} className="card-item">
                    <div className={`card-preview ${card.type}`}>
                      <div className="card-chip"></div>
                      <div className="card-number">**** {card.numcards}</div>
                      <div className="card-holder">{currentUser.name}</div>
                      <div className="card-expiry">{card.expiry}</div>
                      <div className="card-type">{card.type}</div>
                    </div>
                    <div className="card-actions">
                      <button className="card-action" title="Définir par défaut" type="button"><i className="fas fa-star"></i></button>
                      <button className="card-action" title="Geler la carte" type="button"><i className="fas fa-snowflake"></i></button>
                      <button className="card-action" title="Supprimer" type="button"><i className="fas fa-trash"></i></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* POPUP TRANSFERT */}
      {showTransfer && (
        <div className="popup-overlay active">
          <div className="popup-content">
            <div className="popup-header">
              <h2>Effectuer un transfert</h2>
              <button className="btn-close" type="button" onClick={() => setShowTransfer(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="popup-body">
              <div className="transfer-form">

                <div className="form-group">
                  <label><i className="fas fa-user"></i> Bénéficiaire</label>
                  <select
                    value={beneficiaryId}
                    onChange={(e) => setBeneficiaryId(e.target.value)}
                  >
                    {/* value="" : option par défaut non sélectionnable */}
                    <option value="" disabled>Choisir un bénéficiaire</option>
                    {currentUser.wallet.beneficiaries.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label><i className="fas fa-credit-card"></i> Depuis ma carte</label>
                  <select
                    value={sourceCard}
                    onChange={(e) => setSourceCard(e.target.value)}
                  >
                    <option value="" disabled>Sélectionner une carte</option>
                    {currentUser.wallet.cards.map((card) => (
                      <option key={card.numcards} value={card.numcards}>
                        {card.type} **** {card.numcards}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Montant</label>
                  <div className="amount-input">
                    <input
                      type="number"
                      min="1"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <span className="currency">MAD</span>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowTransfer(false)}>
                    Annuler
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleTransfer}>
                    <i className="fas fa-paper-plane"></i> Transférer
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP RECHARGE */}
      {showRecharge && (
        <div className="popup-overlay active">
          <div className="popup-content">
            <div className="popup-header">
              <h2>Effectuer un rechargement</h2>
              <button className="btn-close" type="button" onClick={() => setShowRecharge(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="popup-body">
              <div className="transfer-form">

                <div className="form-group">
                  <label><i className="fas fa-credit-card"></i> Depuis ma carte</label>
                  <select
                    value={sourceCard2}
                    onChange={(e) => setSourceCard2(e.target.value)}
                  >
                    <option value="" disabled>Sélectionner une carte</option>
                    {currentUser.wallet.cards.map((card) => (
                      <option key={card.numcards} value={card.numcards}>
                        {card.type} **** {card.numcards}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label><i className="fas fa-money-bill"></i> Montant</label>
                  <div className="amount-input">
                    <input
                      type="number"
                      min="1"
                      placeholder="0.00"
                      value={amount2}
                      onChange={(e) => setAmount2(e.target.value)}
                    />
                    <span className="currency">MAD</span>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowRecharge(false)}>
                    Annuler
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleRecharge}>
                    <i className="fas fa-paper-plane"></i> Recharger
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default Dashboard;
