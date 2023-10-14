import React from 'react';

function ModalNotification({ message, type, isVisible, onClose, caller , redirectUrl }) {
    if (!isVisible) return null;
  //  console.log("ModalNotification appelé par:", caller);

    const handleClose = () => {
        if(redirectUrl && redirectUrl !== "") {
            
                  window.location.href = redirectUrl;
             
            
        } else {
            onClose(); // Ferme le modal si aucune redirection n'est spécifiée
        }
    };

    const notificationClass = `notification ${type}`;

    return (
        <div className="modal-overlay">
            <div className={`modal-content ${notificationClass}`}>
                <p>{message}</p>
                <button onClick={handleClose}>Fermer</button>
            </div>
        </div>
    );
}

export default ModalNotification;
