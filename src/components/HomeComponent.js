import React, { useState, useEffect, useCallback  } from 'react';
import { FaBars, FaTrashAlt } from 'react-icons/fa';
import ModalNotification from './utils/ModalNotification';
import Sidebar from './utils/Sidebar'; 
import CryptoEncodage from './utils/CryptoEncodage';
import { postRequest } from '../services/apiService';


import { 
    capitalizeFirstLetter,     
    PortfolioGraph,
    
    TokenGraph,
    generateTokenChartData
    
} from '../services/graph'; 




function HomeComponent() {
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const [transformedData, setTransformedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [messageType, setMessageType] = useState("normal");
    const [selectedTokenDetails, setSelectedTokenDetails] = useState(null);
    const [redirectUrl, setRedirectUrl] = useState("");
    const uuid = localStorage.getItem('loggedIn');
    const [chartData, setChartData] = useState([]);
    
    
   

    const generateChartData = useCallback((data) => {
        const allTransactionDates = new Set();
        data.cryptos.forEach(crypto => {
            crypto.transaction.forEach(transaction => {
                allTransactionDates.add(transaction.date);
            });
        });
    
        const sortedDates = Array.from(allTransactionDates).sort();
        const portfolio_values = [];
        const processedSales = new Set(); // Pour suivre les ventes déjà traitées
    
        const dayBeforeFirstTransaction = new Date(new Date(sortedDates[0]).getTime() - 86400000);
        portfolio_values.push({
            date: dayBeforeFirstTransaction.toISOString().split('T')[0],
            value: 0
        });
    
        let prevYear = null;
        sortedDates.forEach(date => {
            let totalValueForDate = 0;
            let saleEvents = [];
            let buyEvents = [];
    
            let totalPortfolioValueForDate = 0;
    
            data.cryptos.forEach(crypto => {
                let current_supply_for_crypto = 0;
                let current_supply = 0;
                const price_by_date = {};
    
                crypto.historique.forEach(entry => {
                    price_by_date[entry.date] = entry.prix;
                });
    
                crypto.transaction.forEach(transaction => {
                    const transactionKey = `${crypto.nom}-${transaction.date}-${transaction.transactionType}-${transaction.supply}`;
                    if (new Date(transaction.date) <= new Date(date)) {
                        if (transaction.transactionType === "achat") {
                            current_supply += transaction.supply;
                            current_supply_for_crypto += transaction.supply;
                        } else if (transaction.transactionType === "vente") {
                            current_supply -= transaction.supply;
                            current_supply_for_crypto -= transaction.supply;
                        }
                    }
    
                    let closestPriceForCrypto;
                    if (price_by_date[date]) {
                        closestPriceForCrypto = price_by_date[date];
                    } else {
                        const availableDates = Object.keys(price_by_date).sort();
                        const latestDate = availableDates[availableDates.length - 1];
                        closestPriceForCrypto = price_by_date[latestDate];
                    }
                    totalPortfolioValueForDate += current_supply_for_crypto * closestPriceForCrypto;
    
                    if (new Date(transaction.date).setHours(0,0,0,0) === new Date(date).setHours(0,0,0,0)) {
                        let transactionPrice = price_by_date[transaction.date] || closestPriceForCrypto;
                        const totalPrice = transactionPrice * transaction.supply;
                        if (transaction.transactionType === "achat") {
                            buyEvents.push({ crypto: capitalizeFirstLetter(transaction.token), amount: transaction.supply, totalPrice });
                        } else if (transaction.transactionType === "vente" && !processedSales.has(transactionKey)) {
                            saleEvents.push({ crypto: capitalizeFirstLetter(transaction.token), amount: transaction.supply, totalPrice });
                            processedSales.add(transactionKey);
                        }
                    }
                });
    
                let closestPrice = price_by_date[date] || Object.values(price_by_date).pop();
                totalValueForDate += current_supply * closestPrice;
            });
    
            const currentYear = new Date(date).getFullYear();
            const isNewYear = currentYear !== prevYear;
            prevYear = currentYear;
    
            
            portfolio_values.push({
                date: date,
                value: totalValueForDate,
                totalPortfolioValue: totalPortfolioValueForDate,
                displayYear: isNewYear,
                sales: saleEvents,
                buys: buyEvents
            });
        });
    
        // Ajout d'un point de données pour la date d'aujourd'hui avec la valeur totale du portefeuille
        const today_str = new Date().toISOString().split('T')[0];
        portfolio_values.push({
            date: today_str,
            value: portfolio_values[portfolio_values.length - 1].value,
            totalPortfolioValue: portfolio_values[portfolio_values.length - 1].totalPortfolioValue,
            isToday: true  // indicate that this data point is for today's date
        });

    
        return portfolio_values;
    }, []);
    
   
    const toggleSidebar = () => {
        setSidebarVisible(!isSidebarVisible);
    }

    const showDetailTransactionToken = useCallback((tokenId) => {
        const tokenDetails = transformedData.cryptos.find(crypto => crypto.tokenId === tokenId);
        if (tokenDetails) {
            setSelectedTokenDetails(tokenDetails);
            setShowDetailsModal(true);
        } else {
            setMessage(`Détails non trouvés pour le token ${tokenId}`);
            setMessageType('error');
            setShowModal(true);
        }
    }, [transformedData]);

    const transformerLesTransactions = useCallback((transactions) => {
        // Calculate the total value of all cryptos on today's date
        let totalValueToday = 0;
        const today_str = new Date().toISOString().split('T')[0];
        transactions.cryptos.forEach(crypto => {
            const price_by_date = {};
            crypto.historique.forEach(entry => {
                price_by_date[entry.date] = entry.prix;
            });

            let current_supply = 0;
            crypto.transaction.forEach(transaction => {
                if (new Date(transaction.date) <= new Date(today_str)) {
                    if (transaction.transactionType === "achat") {
                        current_supply += transaction.supply;
                    } else if (transaction.transactionType === "vente") {
                        current_supply -= transaction.supply;
                    }
                }
            });

            let closestPriceForToday;
            if (price_by_date[today_str]) {
                closestPriceForToday = price_by_date[today_str];
            } else {
                const availableDates = Object.keys(price_by_date).sort();
                const latestDate = availableDates[availableDates.length - 1];
                closestPriceForToday = price_by_date[latestDate];
            }
            totalValueToday += current_supply * closestPriceForToday;
        });

        transactions["total_value_usd"] = totalValueToday;
        
        setTransformedData(transactions);
        console.log(transactions)
        const transformedChartData = generateChartData(transactions);
        setChartData(transformedChartData);
       
        return transactions;
    }, [generateChartData]);
    


    const loadListTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await postRequest('transactions_react.php', { uuid, type: 'load_transaction' });
            if (response && response.cryptos && response.cryptos.length > 0) {
                transformerLesTransactions(response);
                // Si un token est actuellement sélectionné, rafraîchissez ses détails
                if (selectedTokenDetails) {
                    const updatedTokenDetails = response.cryptos.find(crypto => crypto.tokenId === selectedTokenDetails.tokenId);
                    // Comparer les nouveaux détails avec les anciens
                    if (JSON.stringify(updatedTokenDetails) !== JSON.stringify(selectedTokenDetails)) {
                        setSelectedTokenDetails(updatedTokenDetails);
                        const transformedChartData = generateChartData(response);
                        setChartData(transformedChartData);
                        generateTokenChartData(selectedTokenDetails)
                        
                    }
                }
               
            } else {
                setMessage(response.message ||  "Erreur lors de la récupération des transactions.");
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
        
    }, [uuid, selectedTokenDetails, transformerLesTransactions, generateChartData]);

    
    useEffect(() => {
        if (!uuid) {
            setMessage('vous devez vous connecter.');
            setMessageType('error');
            setShowModal(true);
            setRedirectUrl("/");
            setTimeout(() => {
                window.location.href = "/";
                setShowModal(false);
            }, 2000);
            return;
        }
    
        loadListTransactions();
    }, [selectedTokenDetails, loadListTransactions, uuid]);


    const handleCloseDetails = useCallback(() => {
        setShowDetailsModal(false);
    }, []);


    const handleDeleteTransaction = useCallback(async (id) => {
        const confirmation = window.confirm("Êtes-vous sûr de vouloir supprimer cette transaction?");
         
         if (confirmation) {
             const uuid = localStorage.getItem('loggedIn');
             setLoading(true);  
            
             try {
                 const response = await postRequest('transactions_react.php', {
                     uuid: uuid,
                     transaction_id: id,
                     type: 'delete_transaction'
                 });
     
               //  console.log("Server response:", response);
 
                 if (response.success) {
                                      
                    loadListTransactions(); // <-- Ajoutez cette ligne ici                  
                    setMessage(response.message);
                    setMessageType('success');
                    setShowModal(true);

                    
                     
                 } else {
                     setMessage(response.message);
                     setMessageType('error');
                     setShowModal(true);
                     
                 }
                 
             } catch (error) {
                 console.error("Caught error:", error);
                 setMessage('Erreur lors de la communication avec le serveur.');
                 setMessageType('error');
                 setShowModal(true);
                 
                 
            } finally {
                setLoading(false);
            }
             
         }
    }, [ loadListTransactions]);


    
    

    return (
        <div className="centered-content-homecomponent">
            <FaBars className="menu-icon" onClick={toggleSidebar} size={24} style={{ display: isSidebarVisible ? 'none' : 'block' }} />

            <Sidebar 
                isSidebarVisible={isSidebarVisible} 
                toggleSidebar={toggleSidebar} 
                userEmail={localStorage.getItem('email')} 
                userUuid={localStorage.getItem('loggedIn')} 
                refreshData={loadListTransactions}  // Ajoutez cette ligne
               
        
            />

            <CryptoEncodage reloadTransactions={loadListTransactions} />

            {/* Your CryptoTables content starts here */}
            <div className="table-scroll-container">
                <table id="crypto-table" aria-label="Tableau des cryptomonnaies">
                    <thead>
                        <tr>
                            <th data-sort="token">Token</th>
                            <th>Logo</th>
                            <th data-sort="supply">Supply</th>
                            <th data-sort="invest"><span className="full-title">Investissement</span><span className="abbrev-title">Inv.</span></th>
                            <th data-sort="costPrice"><span className="full-title">Prix de reviens en $</span><span className="abbrev-title">Prix $</span></th>
                            <th data-sort="currentPrice"><span className="full-title">Prix du jour</span><span className="abbrev-title">Prix Jour</span></th>
                            <th data-sort="plDollar"><span className="full-title">P&L en $</span><span className="abbrev-title">P&L $</span></th>
                            <th data-sort="plPercent"><span className="full-title">P&L en %</span><span className="abbrev-title">P&L %</span></th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transformedData && transformedData.cryptos.map(crypto => (
                            <tr key={crypto.tokenId} style={{ color: crypto["p&l_dollar"] >= 0 ? 'green' : 'red' }}>
                                <td>{crypto.tokenId.toUpperCase()}</td>
                                <td><img src={crypto.image} alt={crypto.tokenId} width={40} /></td>
                                <td>{crypto.totalSupply}</td>
                                <td>{crypto.totalInvest}</td>
                                <td>{crypto.averagePrice.toFixed(2)}</td>
                                <td>{crypto.lastPrice.toFixed(2)}</td>
                                <td>{crypto["p&l_dollar"].toFixed(2)}</td>
                                <td>{crypto["p&l_percent"].toFixed(2)}%</td>
                                <td><button onClick={() => showDetailTransactionToken(crypto.tokenId)}>Détails</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="table-scroll-container_resume">
                {/* Tableau résumé */}
                <table id="crypto-table-resume" aria-label="Tableau résumé">
                    <thead>
                        <tr>
                            <th><span className="full-title">Total Investi</span><span className="abbrev-title">Tot. Inv.</span></th>
                            <th><span className="full-title">Total P&L en $</span><span className="abbrev-title">Tot. P&L $</span></th>
                            <th><span className="full-title">Total P&L en %</span><span className="abbrev-title">Tot. P&L %</span></th>
                            <th><span className="full-title">Valeur en $</span><span className="abbrev-title">Val. $</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {transformedData && (
                            <tr style={{ color: transformedData["total_p&l_dollar"] >= 0 ? 'green' : 'red' }}>
                                <td>{transformedData.totalInvestAllCrypto.toFixed(2)}</td>
                                <td>{transformedData["total_p&l_dollar"].toFixed(2)}</td>
                                <td>{transformedData["total_p&l_percent"].toFixed(2)}%</td>
                                <td>{transformedData["total_value_usd"].toFixed(2)}USD</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div> 

            {/* Graphique du portefeuille total */}
            <div id="total-portfolio-chart-container" className='container-graphique' aria-label="Conteneur du graphique du portefeuille total">
                <PortfolioGraph data={chartData} />
            </div>  




            {/* Content from ModalDetailsCrypto.js starts here */}
                    {showDetailsModal  && (
                        <div className="modal-overlay">
                            <div className={`modal-content-detail`}>
                            {selectedTokenDetails  && (
                                <div className="crypto-details">
                                    <div className="crypto-header">
                                        <div className="crypto-title">
                                            <h3>{selectedTokenDetails.tokenName} ({selectedTokenDetails.tokenId})</h3>
                                        </div>
                                        <div className="crypto-logo-container">
                                            <img src={selectedTokenDetails.image} alt={selectedTokenDetails.tokenName} className="crypto-logo" />
                                        </div>
                                        <div className="crypto-ath-close">
                                            <div className="close-modal">
                                                <button onClick={handleCloseDetails}>Fermer</button>
                                            </div>
                                            <div className="crypto-ath">
                                                <p>All Time High (ATH): {selectedTokenDetails.ath} USD</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="table-scroll-container">
                                        <h3 className='underTitre'>Détails pour {selectedTokenDetails.tokenId}</h3>
                                        {/* Tableau des transactions */}
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Investissement</th>
                                                    <th>Supply</th>
                                                    <th>Prix d'achat</th>
                                                    <th>Type</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedTokenDetails.transaction.map((transaction, index) => (
                                                    <tr 
                                                    key={index} 
                                                    className={transaction.transactionType === "achat" ? "transaction-achat" : transaction.transactionType === "vente" ? "transaction-vente" : ""}
                                                >
                                                        <td>{transaction.date}</td>
                                                        <td>{transaction.Invest} USD</td>
                                                        <td>{transaction.supply}</td>
                                                        <td>{transaction.purchasePrice}</td>
                                                        <td>{transaction.transactionType}</td>
                                                        <td>
                                                            <button className="delete-button" onClick={() => handleDeleteTransaction(transaction.id)}>
                                                                <FaTrashAlt />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                            

                                        <h3  className='underTitre'>Récapitulatif pour {selectedTokenDetails.tokenId}</h3>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Total Investi</th>
                                                    <th>Total Supply</th>
                                                    <th>Total P&L en $</th>
                                                    <th>Total P&L en %</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr 
                                                    className={
                                                        selectedTokenDetails['p&l_dollar'] > 0 ? 'positive' :
                                                        selectedTokenDetails['p&l_dollar'] < 0 ? 'negative' :
                                                        ''
                                                    }
                                                >
                                                    <td>{selectedTokenDetails.totalInvest}</td>
                                                    <td>{selectedTokenDetails.totalSupply}</td>
                                                    <td>{selectedTokenDetails['p&l_dollar']}</td>
                                                    <td>{selectedTokenDetails['p&l_percent']}%</td>
                                                </tr>
                                            </tbody>
                                        </table> 
                            
                                    </div>

                                    <div className="future-graph-placeholder container-graphique" style={{border: '1px solid #f0f0f0', marginTop: '1rem'}}>
                                        <div style={{}}>
                                            <div style={{}}>

                                            Graphique :
                                                <ul>
                                                    <li>Vert = Quantité {selectedTokenDetails.tokenName} </li>
                                                    <li>Gris =  Valeur en USD</li>
                                                </ul> 
                                            </div>
                                            <div style={{}}>
                                                <TokenGraph data={generateTokenChartData(selectedTokenDetails)} />
                                            </div>
                                        </div>
                                        
                                    </div>
                                    
                                </div>
                            )}
                            </div>
                        </div>
                    )}          
           
            {loading && <div>Chargement...</div>}

            
            <ModalNotification 
                message={message} 
                type={messageType} 
                isVisible={showModal} 
                onClose={() => setShowModal(false)} 
                caller="home"
                redirectUrl={redirectUrl}
            />             
            


            <div className="footer">
                <p>© 2023 Gestionnaire de Portefeuille Crypto. Tous droits réservés.</p>
                <p>Pour nous soutenir :</p>
                <ul>
                    <li>Wallet Polygon (Réseaux Polygon) : 0x5c2eabcb75b6138bdfe39fd9a0dae0716c6426bc</li>
                    <li>Wallet Eth (ERC20) : 0x5c2eabcb75b6138bdfe39fd9a0dae0716c6426bc</li>
                </ul>
            </div>
        </div>
    );
}

export default HomeComponent;
