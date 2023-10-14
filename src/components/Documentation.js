import React from 'react';
import { FaBook } from 'react-icons/fa';
function Documentation() {
    return (
        
        <div className="documentation">
            {/* Bouton pour fermer le composant */}
            <a href="/" target="_self" rel="noopener noreferrer">
                    <FaBook /> Acceuil
                </a>

            {/* Le reste de votre contenu HTML ici */}
            <h1>Wallets-Cryptos 🪙</h1>

                <h2>📌 Description</h2>
                <p><strong>Wallets-Cryptos</strong> est un gestionnaire de portefeuille crypto qui permet aux utilisateurs de gérer leurs actifs cryptographiques, d'ajouter des transactions et de visualiser l'historique de leurs transactions et de leur portefeuille.</p>

                <h2>🛠 Prérequis</h2>
                <ul>
                    <li>Serveur web supportant <strong>PHP</strong> (ex : Apache, Nginx)</li>
                    <li>Base de données (ex : MySQL, MariaDB)</li>
                    <li>Une base de données MySQL configurée selon la structure fournie dans le fichier <code>docs/infos_mysql.txt</code>.</li>
                </ul>

                <h2>🚀 Installation et configuration</h2>
                <ol>
                    <li><strong>Clonez le dépôt</strong> GitHub ou téléchargez l'archive ZIP.</li>
                    <li>Placez les fichiers dans le répertoire de votre serveur web.</li>
                    <li>Configurez la base de données en modifiant le fichier <code>config.php</code> dans le répertoire <code>php</code>.</li>
                    <li>Assurez-vous que toutes les dépendances dans le répertoire <code>libs</code> sont correctement liées.</li>
                    <li>Lancez votre serveur web et accédez à <code>index.html</code> pour commencer.</li>
                </ol>

                <h2>📖 Utilisation</h2>
                <ul>
                    <li>Inscription : Accédez à <code>index.html</code> et remplissez le formulaire d'inscription.</li>
                    <li>Connexion : Utilisez vos identifiants pour vous connecter.</li>
                    <li>Ajout de cryptos : Une fois connecté, utilisez la section "Ajout cryptos" pour ajouter de nouveaux actifs cryptographiques à votre portefeuille.</li>
                    <li>Utilisez l'icône de recherche à côté du champ nom crypto pour rechercher le bon ID de la crypto sur CoinGecko.</li>
                    <li>Ajout de transactions : Utilisez la section "Ajout Transaction" pour ajouter de nouvelles transactions.</li>
                    <li>Historique : Consultez l'historique de vos transactions et de votre portefeuille pour chaque crypto.</li>
                    <li>Les cryptos et les transactions peuvent être sauvegardés dans un fichier pour une restauration ultérieure à l'aide des boutons Sauvegarde et Restauration.</li>
                </ul>

                <h2>💖 Soutien</h2>
                <p>Si vous souhaitez soutenir notre projet, vous pouvez faire un don aux adresses suivantes :</p>
                <ul>
                    <li>Matic : 0x5c2eabcb75b6138bdfe39fd9a0dae0716c6426bc</li>
                    <li>Ethereum (ETH) : 0x5c2eabcb75b6138bdfe39fd9a0dae0716c6426bc</li>
                </ul>
            {/* ... */}
        </div>
    );
};

export default Documentation;