

//const PROXY_URL = "http://localhost:6061/";
//const BASE_URL = "https://wallets.telecom4all.be/php/";
const PROXY_URL = "http://localhost:6061/";
const targetURL = "https://wallets.telecom4all.be/php_react/";
const finalURL = PROXY_URL + targetURL;

export async function postRequest(endpoint, data) {
    const URL = finalURL + endpoint;

    const formData = new URLSearchParams();
    for (const key in data) {
        formData.append(key, data[key]);
    }

    try {
        const response = await fetch(URL, {
            method: 'POST',
            body: formData,
        });

        
        if (!response.ok) { // Vérifier si la réponse HTTP est une erreur (ex: 404, 500, etc.)
            throw new Error("Erreur serveur: " + response.statusText);
        }

        return await response.json();
    } catch (error) {
        throw error; // Propager l'erreur pour la traiter dans le composant
    }
}




export async function postFileRequest(endpoint, fileData) {
    const URL = finalURL + endpoint;

    const formData = new FormData();
    for (const key in fileData) {
        formData.append(key, fileData[key]);
    }

    try {
        const response = await fetch(URL, {
            method: 'POST',
            body: formData, // Pas besoin de définir manuellement l'en-tête Content-Type ici. Le navigateur le fera pour vous.
        });

        if (!response.ok) {
            throw new Error("Erreur serveur: " + response.statusText);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}
