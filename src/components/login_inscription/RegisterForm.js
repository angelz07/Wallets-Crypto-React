import React, { useState } from 'react';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import ModalNotification from '../utils/ModalNotification';
import { postRequest } from '../../services/apiService';

function RegisterForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [messageType, setMessageType] = useState("normal");
    const [redirectUrl, setRedirectUrl] = useState("");

    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage("Les mots de passe ne correspondent pas.");
            setMessageType("error");
            setShowModal(true);
            return;
        }

        if(!email || !confirmPassword || !password) {
            setMessage("Tous les champs sont requis. (email, mot de passe et confirmation mot de passe)");
            setMessageType("error");
            setShowModal(true);
            return;
        }

        setLoading(true);
        const data = await postRequest('register_react.php', { email, password });
        setLoading(false);

        if (data.success) {
            setMessage("Inscription réussie. Vous pouvez maintenant vous connecter.");
            setMessageType("success");
            setShowModal(true);
            localStorage.setItem('loggedIn', data.message);
            localStorage.setItem('email', email);
            setRedirectUrl("/");
                setTimeout(() => {
                
                window.location.href = "/";
                setShowModal(false);
                
                
                }, 3000);  // Fermer le modal et rediriger après 3 secondes
        } else {
            setMessage(data.message || 'Une erreur est survenue lors de l\'inscription.');
            setMessageType('error');
            setShowModal(true);
        }
    };

    return (
        <div className="container centered-content">
            <form onSubmit={handleSubmit}>
                <div>
                    <FaEnvelope />
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <FaLock />
                    <input 
                        type="password" 
                        placeholder="Mot de passe" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div>
                    <FaLock />
                    <input 
                        type="password" 
                        placeholder="Confirmez le mot de passe" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                <button type="submit">S'inscrire</button>
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

export default RegisterForm;
