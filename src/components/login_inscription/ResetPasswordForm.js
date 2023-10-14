import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaCode } from 'react-icons/fa';
import ModalNotification from '../utils/ModalNotification';
import { postRequest } from '../../services/apiService';

function ResetPasswordForm() {
    let [email, setEmail] = useState('');
    let [reset_code, setCode] = useState('');
    let [new_password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [messageType, setMessageType] = useState("normal");
    const [redirectUrl, setRedirectUrl] = useState("");

    const handleSendCode = async (e) => {
        e.preventDefault();

        if(!email) {
            setMessage("L'adresse e-mail est requise.");
            setMessageType("error");
            setShowModal(true);
            return;
        }

        setLoading(true);
        const data = await postRequest('send_code_reset_password_react.php', { email });
        setLoading(false);

        if (data.success) {
            setMessage("Le code de réinitialisation a été envoyé à votre adresse e-mail.");
            setMessageType("info");
            setShowModal(true);
        } else {
            setMessage(data.message || 'Une erreur est survenue lors de l\'envoi du code.');
            setMessageType('error');
            setShowModal(true);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if(!email || !reset_code || !new_password) {
            setMessage("Tous les champs sont requis. (email, code et nouveau mot de passe)");
            setMessageType("error");
            setShowModal(true);
            return;
        }

        setLoading(true);
        new_password = new_password.trim();
        reset_code = reset_code.trim();
        email = email.trim();

        const data = await postRequest('reset_password_react.php', { email, reset_code, new_password });
        setLoading(false);

        if (data.success) {
            
            setMessage("Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.");
            setMessageType("success");
            setShowModal(true);

            setRedirectUrl("/");
            setTimeout(() => {
            
                window.location.href = "/";
                setShowModal(false);            
            
            }, 3000);  // Fermer le modal et rediriger après 3 secondes

        } else {
            setMessage(data.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe.');
            setMessageType('error');
            setShowModal(true);
        }
    };

    return (
        <div className="container centered-content">
            <form onSubmit={handleSendCode}>
                <div>
                    <FaEnvelope />
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <button type="submit">Envoyer le code</button>
            </form>

            <form onSubmit={handleResetPassword}>
                <div>
                    <FaCode />
                    <input 
                        type="text" 
                        placeholder="Code de réinitialisation" 
                        value={reset_code} 
                        onChange={(e) => setCode(e.target.value)}
                    />
                </div>
                <div>
                    <FaLock />
                    <input 
                        type="password" 
                        placeholder="Nouveau mot de passe" 
                        value={new_password} 
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit">Réinitialiser le mot de passe</button>
            </form>
            {loading && <div>Chargement...</div>}
            <ModalNotification 
                message={message} 
                type={messageType} 
                isVisible={showModal} 
                onClose={() => setShowModal(false)} 
                redirectUrl={redirectUrl}
            />
        </div>
    );
}

export default ResetPasswordForm;
