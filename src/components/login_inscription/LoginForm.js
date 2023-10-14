import React, { useState } from 'react';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import ModalNotification from '../utils/ModalNotification';
import { postRequest } from '../../services/apiService';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [messageType, setMessageType] = useState("normal");
    const [redirectUrl, setRedirectUrl] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!email ||  !password) {
            setMessage("Tous les champs sont requis. (email et mot de passe)");
            setMessageType("error");
            setShowModal(true);
            return;
        }

        setLoading(true);
        const data = await postRequest('connection_react.php', { email, password });
        setLoading(false);


        if (data.success) {
            localStorage.setItem('loggedIn', data.uuid);
            localStorage.setItem('email', email);

            setMessage("Connexion Réussie.");
            setMessageType("success");
            setShowModal(true);
            setRedirectUrl("/");
            setTimeout(() => {
            
                window.location.href = "/";
                setShowModal(false);
            
            
            }, 3000);  // Fermer le modal et rediriger après 3 secondes
        } else {
            setMessage(data.message || 'Une erreur est survenue.');
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
                <button type="submit">Se connecter</button>
                <div className="lien_objet_auth" onClick={() => window.location.href = '/reset-password'} >
                        Mot de passe oublié?
                    </div>
                   
            <div className="lien_objet_auth" onClick={() => window.location.href = '/register'} >
                        Inscription
                    </div>
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

export default LoginForm;
