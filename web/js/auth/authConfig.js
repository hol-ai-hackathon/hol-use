const msalConfig = {
    auth: {
        clientId: "0075f1c3-bf1e-4161-bae5-698e3c7fe457",  // The one you got from Azure AD registration
        authority: "https://login.microsoftonline.com/fa7b1b5a-7b34-4387-94ae-d2c178decee1",  // Your tenant ID
        redirectUri: window.location.origin + "/web/",
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    }
};

// Define the scopes needed for your application
const loginRequest = {
   /*  scopes: [
        "User.Read",  // Basic user profile
        "https://prod-57.eastus2.logic.azure.com/user_impersonation"  // For Logic App access
    ] */

    scopes: ["User.Read", "profile", "api://0ca5d1ab-48ae-4fcf-b6ab-7e8d519edb7e/access_as_user"]
};

// Add API endpoints that need token
const apiConfig = {
    logicAppEndpoint: "https://prod-57.eastus2.logic.azure.com:443/workflows/fae5e55f1e344c52b7a3e9ec7aeacd7a/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=oJfcz8qZLkcGOXZCO1i7HFvQWYsPkIfBfXE8JlsMtUA"
};

const msalInstance = new msal.PublicClientApplication(msalConfig); 