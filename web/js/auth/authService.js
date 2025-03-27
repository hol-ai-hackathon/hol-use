class AuthService {
    constructor() {
        this.msalInstance = msalInstance;
        this.account = null;
        this.init();
    }

    async init() {
        const currentAccounts = this.msalInstance.getAllAccounts();
        if (currentAccounts.length > 0) {
            this.account = currentAccounts[0];
            this.updateUI();
        }
    }

    async login() {
        try {
            const loginResponse = await this.msalInstance.loginPopup(loginRequest);
            this.account = loginResponse.account;
            this.updateUI();
        } catch (error) {
            console.error(error);
        }
    }

    async logout() {
        try {
            await this.msalInstance.logoutPopup({
                account: this.account
            });
            this.account = null;
            this.updateUI();
        } catch (error) {
            console.error(error);
        }
    }

    async getToken() {
        if (!this.account) {
            throw new Error("User not logged in");
        }

        try {
            const response = await this.msalInstance.acquireTokenSilent({
                ...loginRequest,
                account: this.account
            });
            return response.accessToken;
        } catch (error) {
            console.error(error);
            // If silent token acquisition fails, try popup
            const response = await this.msalInstance.acquireTokenPopup(loginRequest);
            return response.accessToken;
        }
    }

    updateUI() {
        const loginButton = document.getElementById('loginButton');
        const logoutButton = document.getElementById('logoutButton');
        const welcomeMessage = document.getElementById('welcomeMessage');
        
        if (this.account) {
            loginButton.style.display = 'none';
            logoutButton.style.display = 'block';
            welcomeMessage.textContent = `Welcome, ${this.account.username}!`;
            welcomeMessage.style.display = 'block';
        } else {
            loginButton.style.display = 'block';
            logoutButton.style.display = 'none';
            welcomeMessage.style.display = 'none';
        }
    }

    isAuthenticated() {
        return !!this.account;
    }
} 