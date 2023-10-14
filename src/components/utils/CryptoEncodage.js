import React, { useEffect, useState } from 'react';
import { FaChevronDown, FaChevronUp, FaSearch } from 'react-icons/fa';
import { postRequest } from '../../services/apiService';
import ModalNotification from '../utils/ModalNotification'; 

function CryptoEncodage(props) {
    const [accordionOpen, setAccordionOpen] = useState(false);
    const [cryptos, setCryptos] = useState([]);

    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [messageType, setMessageType] = useState("normal");

    const [foundTokens, setFoundTokens] = useState([]);


    useEffect(() => {
        loadListCryptos();
    }, []);

    const loadListCryptos = async () => {
        const uuid = localStorage.getItem('loggedIn');
        if (!uuid) {
            // showMessage('Erreur: UUID non trouvé.', 'error');
            alert('Erreur: UUID non trouvé.'); // Remplacez cela par votre fonction showMessage
            return;
        }

        setLoading(true);
        
         try {
            const response = await postRequest('cryptos_react.php', { uuid, type: 'load_crypto' });
            if (response.success && response.cryptos.length > 0) {
                setCryptos(response.cryptos);
            } else {
                setMessageType('error');
                setMessage(response.message || "Erreur lors de la récupération des cryptos.");
                setShowModal(true);
            }
        } catch (error) {
            setMessage(error.message || "Une erreur est survenue.");
            setShowModal(true);
            setMessageType('error');
        } finally {
           setLoading(false);
        }
    };


    const handleSearchClick = async () => {
        try {
            //const searchTerm = /* obtenir la valeur du champ de recherche ici, par exemple: */ document.getElementById("searchInputId").value;
            const searchTerm = document.getElementById('crypto-name-add').value.trim();

            // Vérifiez si searchTerm est vide avant d'envoyer la requête
            if (!searchTerm.trim()) {
                alert("Veuillez entrer un terme de recherche.");
                return;
            }
    
            const response = await postRequest('findCrypto.php', { 
                uuid: localStorage.getItem('loggedIn'),
                type: 'search_token',
                searchTerm: searchTerm
            });
    
            if (response.success) {
                console.log(response.tokens); // ou affichez les tokens retournés d'une manière ou d'une autre
                setFoundTokens(response.tokens);
            } else {
                setMessage(response.message || "Une erreur est survenue.");
                setShowModal(true);
                setMessageType('error');
            }
        } catch (error) {
            alert("Une erreur est survenue lors de la recherche des tokens.");
        }
    }
    


    const handleAddTranscation = async () => {
        // Récupérer les valeurs des champs
        const selectedCrypto = document.getElementById('crypto-list');
        const quantity = document.getElementById('crypto-quantity').value;
        const amount = document.getElementById('amount').value;
        
        const selectedCryptoId = selectedCrypto.value; 
        const selectedCryptoName = selectedCrypto.options[selectedCrypto.selectedIndex].textContent; 
        const transactionType = document.getElementById('transaction-type').value;
        const transactionDate = document.getElementById('transaction-date').value;

        // Validation
        if (isNaN(quantity) || quantity <= 0) {
            setMessage("Quantité invalide.");
            setShowModal(true);
            setMessageType('error');
            return;
        }
        
        if (isNaN(amount) || amount <= 0) {
            setMessage("Montant invalide.");
            setShowModal(true);
            setMessageType('error');
            return;
        }

        if (!transactionDate) {
            setMessage("Veuillez sélectionner une date.");
            setShowModal(true);
            setMessageType('error');
            return;
        }

        setLoading(true);
        const uuid = localStorage.getItem('loggedIn');
        const purchasePrice = amount / quantity;

        try {
            const response = await postRequest('transactions_react.php', {
                uuid,
                token: selectedCryptoName,
                tokenId: selectedCryptoId,
                date: transactionDate,
                invest: amount,
                supply: quantity,
                purchasePrice,
                transactionType,
                type: 'add_transactions'
            });

            if (response.success) {
                // Réinitialiser les champs du formulaire
                document.getElementById('crypto-list').selectedIndex = 0;
                document.getElementById('crypto-quantity').value = '';
                document.getElementById('amount').value = '';
                document.getElementById('transaction-type').selectedIndex = 0;
                document.getElementById('transaction-date').value = '';

                props.reloadTransactions();
                // Message de succès
                setMessage('Transaction ajoutée avec succès!');
                setShowModal(true);
                setMessageType('success');
            } else {
                setMessage(response.message || 'Une erreur est survenue.');
                setShowModal(true);
                setMessageType('error');
            }
            

        } catch (error) {
            setMessage(error.message || "Une erreur est survenue.");
            setShowModal(true);
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    }

    const handleAddCrypto = async () => {
        // 1. Récupérez les valeurs des champs d'entrée
        const cryptoId = document.getElementById('crypto-id-add').value.trim();
        const cryptoName = document.getElementById('crypto-name-add').value.trim();
    
        // Vérifiez si les champs ne sont pas vides
        if (!cryptoId || !cryptoName) {
            setMessage('Veuillez remplir tous les champs.');
            setShowModal(true);
            setMessageType('error');
            return;
        }
    
        setLoading(true);
        const uuid = localStorage.getItem('loggedIn');
    
        try {
            const response = await postRequest('cryptos_react.php', {
                uuid,
                crypto_id: cryptoId.toLowerCase(),
                crypto_name: cryptoName.toUpperCase(),
                type: 'add_cryptos'
            });
    
            if (response.success) {
                // Rechargez la liste des cryptos
                await loadListCryptos();
                setMessage('Crypto ajoutée avec succès!');
                setShowModal(true);
                setMessageType('success');
                // Réinitialiser les champs du formulaire
                document.getElementById('crypto-id-add').value = '';
                document.getElementById('crypto-name-add').value = '';
               
            } else {
                setMessage(response.message || 'Une erreur est survenue.');
                showModal(true);
                setMessageType('error');
                
            }
        } catch (error) {
            setMessage(error.message || "Une erreur est survenue.");
            setShowModal(true);
            setMessageType('error');
            
        } finally {
           setLoading(false);
        }
    }
    


    return (
        <div className="container_encodage">
            <div className="accordion-controls">
                <span className="accordion-title">Encodage</span>
                {accordionOpen ? 
                    <FaChevronUp className="toggle-accordion" onClick={() => setAccordionOpen(!accordionOpen)} />
                    :
                    <FaChevronDown className="toggle-accordion" onClick={() => setAccordionOpen(!accordionOpen)} />
                }
            </div>

            {accordionOpen && (
                <div id="crypto-section-general" aria-label="Encodage"> 
                <div id="crypto-management-section" aria-label="Section de gestion des cryptos">
                    <h2 className='titre_encodage_section'>Ajout cryptos</h2>
                    <div className="search-container">
                        <label htmlFor="crypto-name-add" className="label_centre">Nom de la crypto:</label>
                        <div className="search-wrapper">
                            <input type="text" id="crypto-name-add" placeholder="Nom de la crypto" aria-label="Nom de la crypto" />
                            <FaSearch className="search-icon" onClick={handleSearchClick} />
                            <div className="search-results">
                                {foundTokens.map(token => (
                                    <div 
                                        key={token.data.id}  
                                        className="search-result-item"
                                        onClick={() => {
                                            document.getElementById('crypto-id-add').value = token.data.id;
                                            document.getElementById('crypto-name-add').value = token.data.name;
                                            setFoundTokens([]);  // Vider la liste des résultats
                                        }}
                                    >
                                        <img src={token.data.image} alt={token.data.name + " icon"} className="crypto-icon"/>
                                        <span className="crypto-name">{token.data.name}</span>
                                        <span className="crypto-id">({token.data.id})</span>
                                        <span className="crypto-symbol">{token.data.symbol}</span>
                                        <span className="crypto-price">
                                            ${token.data.current_price ? token.data.current_price.toFixed(2) : 'N/A'}
                                        </span>

                                    </div>
                                ))}
                            </div>


                        </div>
                    </div>

                    

                    <div className="search-container">
                        <label htmlFor="crypto-id-add" className="label_centre">Id Crypto:</label>
                        <input type="text" id="crypto-id-add" placeholder="ID de la crypto" aria-label="ID de la crypto" />
                    </div>
                    <button id="add-crypto" aria-label="Ajouter une crypto" onClick={handleAddCrypto} >Ajouter</button>
                </div>
                <div id="transaction-section" aria-label="Section d'encodage des transactions">
                    <h2 className='titre_encodage_section'>Ajout Transaction</h2>
                    <select id="crypto-list" aria-label="Liste des cryptomonnaies">
                        {cryptos.map(crypto => (
                            <option key={crypto.crypto_name+"_"+crypto.crypto_id} value={crypto.crypto_id}>
                                {crypto.crypto_name}
                            </option>
                        ))}
                    </select>
                    <input type="number" id="crypto-quantity" placeholder="Quantité" aria-label="Quantité de cryptomonnaie" />
                    <input type="number" id="amount" placeholder="Investissement en $" aria-label="Montant de l'investissement en dollars" />
                    <label htmlFor="transaction-type">Type de transaction:</label>
                    <select id="transaction-type" aria-label="Type de transaction">
                        <option value="achat">Achat</option>
                        <option value="vente">Vente</option>
                    </select>
                    <input type="date" id="transaction-date" aria-label="Date de la transaction" />
                    <button id="submit-transaction" aria-label="Soumettre la transaction" onClick={handleAddTranscation}>Soumettre</button>
                </div>
            </div>
            )}

            {loading && <div>Chargement...</div>}
            <ModalNotification 
                message={message} 
                type={messageType} 
                isVisible={showModal} 
                onClose={() => setShowModal(false)} 
                caller="encodage"
            />
        </div>
    );
}

export default CryptoEncodage;
