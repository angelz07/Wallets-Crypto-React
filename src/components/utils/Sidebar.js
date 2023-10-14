import React, { useState  } from 'react';
import { FaTimes, FaSignOutAlt, FaRedo, FaKey, FaSave, FaUpload, FaTrashAlt, FaBook } from 'react-icons/fa';

import ModalNotificationSidebar from '../utils/ModalNotificationSidebar';
import { postRequest, postFileRequest } from '../../services/apiService';



function Sidebar(props) {

    
    const [messageSidebar, setMessageSidebar] = useState(null);
    const [showModalSidebar, setShowModalSidebar] = useState(false);
    const [messageTypeSidebar, setMessageTypeSidebar] = useState("normal");
    const [redirectUrlSidebar, setRedirectUrlSidebar] = useState("");

    const fileInputRef = React.useRef(null);  // Créez une référence pour l'élément d'entrée du fichier


    

    const logout = () => {
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('email');
        window.location.href = "/";
    }


    const refreshData = () => {
        // Logique pour rafraîchir les données
        props.refreshData();  // Appellez la fonction loadListTransactions qui a été passée en tant que prop
        setMessageSidebar(`Les Datas on été rafraichi`);
        setMessageTypeSidebar('success');
        setRedirectUrlSidebar("");
        setShowModalSidebar(true);
    }

    const changePassword = async () => {
        const uuid = localStorage.getItem('loggedIn');
        if (!uuid) {
            setMessageSidebar('Erreur: UUID non trouvé.');
            setMessageTypeSidebar('error');
            setShowModalSidebar(true);
            return;
        }
        
        const newPassword = prompt('Veuillez entrer votre nouveau mot de passe:');
        if (newPassword && newPassword.trim() !== '') {
            try {
                const response = await postRequest('change_password_react.php', {
                    uuid: uuid,
                    password: newPassword
                });
                
                // Assuming your server returns a message field in its response
                if (response.message.includes("succès")) {
                    setMessageSidebar(response.message);
                    setMessageTypeSidebar('success');
                    setRedirectUrlSidebar("/");

                    localStorage.removeItem('loggedIn');
                    localStorage.removeItem('email');
                    setTimeout(() => {
            
                        window.location.href = "/";
                        setShowModalSidebar(false);
                    
                    
                    }, 3000);  // Fermer le modal et rediriger après 3 secondes

                } else {
                    setMessageSidebar(response.message);
                    setMessageTypeSidebar('error');
                    
                }
                setShowModalSidebar(true);
    
            } catch (error) {
                setMessageSidebar('Erreur lors du changement du mot de passe.');
                setMessageTypeSidebar('error');
                setShowModalSidebar(true);
            }
        }
    }
    

    const backupData = async () => {
        const uuid = localStorage.getItem('loggedIn');
        if (!uuid) {
            setMessageSidebar('Erreur: UUID non trouvé.');
            setMessageTypeSidebar('error');
            setShowModalSidebar(true);
            return;
        }
    
        try {
            const response = await postRequest('export_react.php', { uuid: uuid });
    
            if (response.success && response.filename) {
                setMessageSidebar(response.message);
                setMessageTypeSidebar('success');
                setShowModalSidebar(true);
    
                // Créer un élément <a> pour déclencher le téléchargement
                let downloadLink = document.createElement('a');
                downloadLink.href = response.filename;
                downloadLink.download = response.filename.split('/').pop(); // Assurez-vous d'obtenir le nom du fichier sans chemin
                console.log(downloadLink)
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            } else {
                setMessageSidebar(response.message || 'Une erreur est survenue');
                setMessageTypeSidebar('error');
                setShowModalSidebar(true);
            }
        } catch (error) {
            setMessageSidebar('Erreur lors de l\'exportation des données.');
            setMessageTypeSidebar('error');
            setShowModalSidebar(true);
        }
    }
    

    const restoreData = () => {
        // Logique pour restaurer les données   import_react.php
        fileInputRef.current.click();
    }

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const uuid = localStorage.getItem('loggedIn');


        try {
            const response = await postFileRequest('import_react.php', {
                uuid: uuid,
                importFile: file
            });

            if (response.status === 'success') {
                setMessageSidebar(response.message);
                setMessageTypeSidebar('success');
                setShowModalSidebar(true);
                props.refreshData();
            } else {
                setMessageSidebar(response.message || 'Une erreur est survenue');
                setMessageTypeSidebar('error');
                setShowModalSidebar(true);
            }
        } catch (error) {
            setMessageSidebar("Une erreur est survenue lors de l'importation des données.");
            setMessageTypeSidebar('error');
            setShowModalSidebar(true);
        }
    };

    const deleteWallet = async () => {
        const uuid = localStorage.getItem('loggedIn');
        
        if (!uuid) {
            setMessageSidebar("Erreur: UUID non trouvé."); 
            setMessageTypeSidebar('error');
            setShowModalSidebar(true);
            return;
        }
    
        const confirmation = window.confirm('Êtes-vous sûr de vouloir supprimer votre portefeuille? Cette action est irréversible.');
        if (!confirmation) return;
    
        try {
            const response = await postRequest('delete_wallet_react.php', { uuid: uuid });
    
            // Puisque votre fichier PHP renvoie maintenant un objet JSON, vérifiez l'attribut "success" pour déterminer le succès ou l'échec
            if (response.success) {
                setMessageSidebar(response.message);
                setMessageTypeSidebar('success');
                setShowModalSidebar(true);
                
                setRedirectUrlSidebar("/");

                    localStorage.removeItem('loggedIn');
                    localStorage.removeItem('email');
                    setTimeout(() => {
            
                        window.location.href = "/";
                        setShowModalSidebar(false);
                    
                    
                    }, 3000);  // Fermer le modal et rediriger après 3 secondes
                    
            } else {
                setMessageSidebar(response.message);
                setMessageTypeSidebar('error');
                setShowModalSidebar(true);
            }
        } catch (error) {
            setMessageSidebar("Erreur lors de la suppression du portefeuille.");
            setMessageTypeSidebar('error');
            setShowModalSidebar(true);
        }
    }
    
    

    return (
        <>
        <div className="sidebar" style={{ display: props.isSidebarVisible ? 'block' : 'none' }}>
            <div className="sidebar-close-container">
                <FaTimes className="close-icon" onClick={props.toggleSidebar} size={24} />
            </div>
            <div id="user-info">
                <div id="user-email-wrapper">
                    <span id="user-email-display">{props.userEmail}</span>
                </div>
                <div id="user-uuid-wrapper">
                    <label id="user-uuid-label" htmlFor="user-uuid-display">UUID:</label>
                    <span id="user-uuid-display">{props.userUuid}</span>
                </div>
                <button className="bp_profile bp_profile_orange" onClick={logout}>
                    <FaSignOutAlt /> Se déconnecter
                </button>
                <button className="bp_profile" onClick={refreshData}>
                    <FaRedo /> Rafraîchir les Datas
                </button>
                <button className="bp_profile" onClick={changePassword}>
                    <FaKey /> Changer mot de passe
                </button>
                <hr />
                <button className="bp_profile" onClick={backupData}>
                    <FaSave /> Sauvegarde
                </button>
                <button className="bp_profile" onClick={restoreData}>
                    <FaUpload /> Restauration
                </button>
                <button className="bp_profile bp_profile_rouge" onClick={deleteWallet}>
                    <FaTrashAlt /> Supprimer Portefeuille
                </button>
                <a href="/docs" target="_self" rel="noopener noreferrer">
                    <FaBook /> Documentation
                </a>
                
            </div>

            <ModalNotificationSidebar 
                message={messageSidebar} 
                type={messageTypeSidebar} 
                isVisible={showModalSidebar} 
                onClose={() => setShowModalSidebar(false)} 
                caller="sidebar"
                redirectUrl={redirectUrlSidebar}
            />  

            <input
                type="file"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".sql"
            />

            

        </div>
        </>
    );
}

export default Sidebar;
