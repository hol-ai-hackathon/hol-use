class ChatManager {
    constructor() {
        // Initialize with saved state or default values
        const savedState = this.loadState();
        if (savedState) {
            this.currentState = savedState.currentState;
            this.selectedDR = savedState.selectedDR;
            this.selectedSolutions = new Set(savedState.selectedSolutions);
            this.emailList = new Set(savedState.emailList);
            this.tempEmail = savedState.tempEmail;
            this.pendingEmails = savedState.pendingEmails;
        } else {
            this.currentState = 'initial';
            this.selectedDR = null;
            this.selectedSolutions = new Set();
            this.emailList = new Set();
            this.tempEmail = null;
            this.pendingEmails = null;
        }

        // Initialize DOM elements
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        
        // Add event listeners
        this.sendButton.addEventListener('click', () => this.handleUserInput());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleUserInput();
        });

        // Restore chat history if exists
        this.restoreChatHistory();

        // If no history, show initial options
        if (!this.loadChatHistory()) {
            this.displayInitialOptions();
        }

        // Add window focus event listener
        window.addEventListener('focus', () => this.handleWindowFocus());

        document.getElementById('clearChat')?.addEventListener('click', () => this.handleClearChat());
    }

    // Save state after each significant action
    saveState() {
        const state = {
            currentState: this.currentState,
            selectedDR: this.selectedDR,
            selectedSolutions: Array.from(this.selectedSolutions),
            emailList: Array.from(this.emailList),
            tempEmail: this.tempEmail,
            pendingEmails: this.pendingEmails
        };
        localStorage.setItem('holAgentState', JSON.stringify(state));
    }

    // Load saved state
    loadState() {
        const savedState = localStorage.getItem('holAgentState');
        return savedState ? JSON.parse(savedState) : null;
    }

    // Save chat history
    saveChatHistory() {
        const messages = Array.from(this.chatMessages.children).map(msg => {
            // Get the actual message content without the options
            const messageContent = msg.querySelector('.message-content')?.innerHTML || '';
            const messageData = {
                content: messageContent,
                isUser: msg.classList.contains('user-message'),
                type: msg.getAttribute('data-message-type') || 'text'
            };

            // Save options if they exist
            const options = msg.querySelector('.options-container');
            if (options) {
                messageData.options = Array.from(options.children).map(opt => ({
                    text: opt.textContent,
                    value: opt.getAttribute('data-value')
                }));
            }

            return messageData;
        });
        localStorage.setItem('holAgentChat', JSON.stringify(messages));
    }

    // Load chat history
    loadChatHistory() {
        return JSON.parse(localStorage.getItem('holAgentChat'));
    }

    // Restore chat history
    restoreChatHistory() {
        const history = this.loadChatHistory();
        const savedState = this.loadState();
        
        if (history && savedState) {
            this.chatMessages.innerHTML = ''; // Clear existing messages
            
            // Restore state first
            this.currentState = savedState.currentState;
            this.selectedDR = savedState.selectedDR;
            this.selectedSolutions = new Set(savedState.selectedSolutions);
            this.emailList = new Set(savedState.emailList);
            this.tempEmail = savedState.tempEmail;
            this.pendingEmails = savedState.pendingEmails;

            history.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = msg.isUser ? 'user-message' : 'bot-message';
                
                // Create content container
                const contentDiv = document.createElement('div');
                contentDiv.className = 'message-content';
                contentDiv.innerHTML = msg.content;
                messageDiv.appendChild(contentDiv);

                // Recreate options if they exist
                if (msg.options) {
                    const optionsDiv = document.createElement('div');
                    optionsDiv.className = 'options-container';
                    msg.options.forEach(option => {
                        // Create button with current state context
                        const button = this.createClickableOptionWithState(
                            option.text, 
                            option.value, 
                            this.currentState
                        );
                        optionsDiv.appendChild(button);
                    });
                    messageDiv.appendChild(optionsDiv);
                }

                this.chatMessages.appendChild(messageDiv);
            });
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    }

    // Handle window focus
    handleWindowFocus() {
        const savedState = this.loadState();
        if (savedState) {
            this.currentState = savedState.currentState;
            this.selectedDR = savedState.selectedDR;
            this.selectedSolutions = new Set(savedState.selectedSolutions);
            this.emailList = new Set(savedState.emailList);
            this.tempEmail = savedState.tempEmail;
            this.pendingEmails = savedState.pendingEmails;
        }
    }

    createClickableOption(text, value) {
        const button = document.createElement('button');
        button.className = 'option-button chat-button';
        button.textContent = text;
        button.setAttribute('data-value', value);
        button.addEventListener('click', () => {
            this.handleUserInput(value);
        });
        return button;
    }

    createClickableOptionWithState(text, value, state) {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = text;
        button.setAttribute('data-value', value);
        button.setAttribute('data-state', state);
        
        button.addEventListener('click', () => {
            // Handle the click based on the stored state
            switch(state) {
                case 'confirm_users_needed':
                    this.handleUserConfirmation(value);
                    break;
                case 'confirm_tou':
                    this.handleTOUConfirmation(value);
                    break;
                case 'confirm_add_users':
                    this.handleConfirmAddUsers(value);
                    break;
                case 'confirm_completion':
                    this.handleConfirmCompletion(value);
                    break;
                case 'lab_management':
                    this.handleLabManagement(value);
                    break;
                case 'env_options':
                    this.handleEnvironmentOptions(value);
                    break;
                case 'support_options':
                    this.handleSupportOptions(value);
                    break;
                case 'confirm_new_dr':
                    if (value === 'confirm') {
                        this.displayNewLabSolutionOptions();
                    } else if (value === 'search_again') {
                        this.currentState = 'search_new_dr';
                        this.displayMessage("Please enter DR# or Opportunity Name:");
                    }
                    break;
                default:
                    this.handleUserInput(value);
                    break;
            }
        });
        
        return button;
    }

    displayMessage(message, isUser = false, options = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'user-message' : 'bot-message';
        
        // Create a container for the message content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        if (typeof message === 'string') {
            contentDiv.textContent = message;
        } else {
            contentDiv.appendChild(message);
        }
        messageDiv.appendChild(contentDiv);

        // Add options if they exist
        if (options) {
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'options-container';
            options.forEach(option => {
                const button = this.createClickableOption(option.text, option.value);
                optionsDiv.appendChild(button);
            });
            messageDiv.appendChild(optionsDiv);
        }

        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        this.saveChatHistory();
        return messageDiv;
    }

    displayInitialOptions() {
        this.displayMessage("Choose an option or just type to start chatting:", false, [
            { text: "1. Request a new Hands-on Lab", value: "1" },
            { text: "2. Manage an existing HOL", value: "2" },
            { text: "3. Check Master Lab Material", value: "3" }
        ]);
    }

    displayNewLabOptions() {
        this.displayMessage("Please choose an option:", false, [
            { text: "1. Search by DR# or Opportunity Name", value: "1" },
            { text: "2. I don't have a DR", value: "2" }
        ]);
    }

    async searchDR(query) {
        if (query.length < 3) {
            this.displayMessage("Please enter at least 3 characters to search.");
            return;
        }

        const searchQuery = query.toLowerCase();
        const mockData = [
            { dr: "DR12345", name: "ABC Life Insurance" },
            { dr: "DR67890", name: "XYZ University" },
            { dr: "DR4177218", name: "Nemetschek SE" }
        ];

        const results = mockData.filter(item => 
            item.dr.toLowerCase().includes(searchQuery) || 
            item.name.toLowerCase().includes(searchQuery)
        );

        if (results.length > 0) {
            this.selectedDR = results[0];
            this.displayMessage(`Found: ${this.selectedDR.dr} (${this.selectedDR.name})`, false, [
                { text: "Confirm and Continue", value: "confirm" },
                { text: "Search Again", value: "search_again" }
            ]);
            this.currentState = 'confirm_search';
        } else {
            this.displayMessage("Try Again with a valid DR/Name");
        }
    }

    handleExistingLabSearch(input) {
        this.searchDR(input);
    }

    handleSearchConfirmation(input) {
        switch(input.toLowerCase()) {
            case 'confirm':
                this.displayLabManagementOptions();
                break;
            case 'search_again':
                this.currentState = 'manage_existing';
                this.displayMessage("Please enter a Name or DR# to search:");
                break;
            default:
                this.displayMessage("Please select a valid option");
                break;
        }
    }

    async searchDRForNewLab(query) {
        if (query.length < 3) {
            this.displayMessage("Please enter at least 3 characters to search.");
            return;
        }

        const searchQuery = query.toLowerCase();
        const mockData = [
            { dr: "DR12345", name: "ABC Life Insurance" },
            { dr: "DR67890", name: "XYZ University" },
            { dr: "DR4177218", name: "Nemetschek SE" }
        ];

        const results = mockData.filter(item => 
            item.dr.toLowerCase().includes(searchQuery) || 
            item.name.toLowerCase().includes(searchQuery)
        );

        if (results.length > 0) {
            this.selectedDR = results[0];
            this.displayMessage(`Found: ${this.selectedDR.dr} (${this.selectedDR.name})`, false, [
                { text: "Confirm and Continue", value: "confirm" },
                { text: "Search Again", value: "search_again" }
            ]);
            this.currentState = 'confirm_new_dr';
        } else {
            this.displayMessage("Try Again with a valid DR/Name");
        }
    }

    handleUserInput(input = null) {
        const userInput = input || this.userInput.value.trim();
        if (!userInput) return;

        if (!input) {
            this.displayMessage(userInput, true);
        }
        this.userInput.value = '';

        switch (this.currentState) {
            case 'initial':
                this.handleInitialChoice(userInput);
                break;
            case 'new_lab':
                this.handleNewLabChoice(userInput);
                break;
            case 'search_dr':
                this.searchDR(userInput);
                break;
            case 'manage_existing':
                this.handleExistingLabSearch(userInput);
                break;
            case 'confirm_search':
                this.handleSearchConfirmation(userInput);
                break;
            case 'select_solutions':
                // Handled by checkbox UI
                break;
            case 'input_emails':
                this.handleEmailInput(userInput);
                break;
            case 'final_confirmation':
                this.handleFinalConfirmation(userInput);
                break;
            case 'completed':
                if (userInput.toLowerCase() === 'restart') {
                    this.resetState();
                }
                break;
            case 'lab_management':
                this.handleLabManagement(userInput);
                break;
            case 'env_options':
                this.handleEnvironmentOptions(userInput);
                break;
            case 'support_options':
                this.handleSupportOptions(userInput);
                break;
            case 'add_users':
                this.handleAddUsers(userInput);
                break;
            case 'confirm_add_users':
                this.handleConfirmAddUsers(userInput);
                break;
            case 'confirm_completion':
                this.handleConfirmCompletion(userInput);
                break;
            case 'send_tou_email':
                this.handleTOUEmail(userInput);
                break;
            case 'share_project_email':
                this.handleShareProjectEmail(userInput);
                break;
            case 'search_new_dr':
                this.searchDRForNewLab(userInput);
                break;
            case 'confirm_new_dr':
                if (userInput === 'confirm') {
                    this.displayNewLabSolutionOptions();
                } else if (userInput === 'search_again') {
                    this.currentState = 'search_new_dr';
                    this.displayMessage("Please enter DR# or Opportunity Name:");
                }
                break;
            case 'new_lab_users':
                this.handleNewLabUsers(userInput);
                break;
            case 'new_lab_confirmation':
                this.handleNewLabConfirmation(userInput);
                break;
            case 'confirm_users_needed':
                this.handleUserConfirmation(userInput);
                break;
            case 'confirm_tou':
                this.handleTOUConfirmation(userInput);
                break;
            case 'confirm_clear':
                if (input === 'confirm_clear') {
                    this.resetState();
                } else {
                    this.displayLabManagementOptions();
                }
                break;
        }

        // Save state
        this.saveState();
    }

    handleInitialChoice(input) {
        switch (input.toLowerCase()) {
            case '1':
            case 'request a new hands-on lab':
                this.currentState = 'new_lab';
                this.displayNewLabOptions();
                break;
            case '2':
            case 'manage an existing hol':
                this.currentState = 'manage_existing';
                this.displayMessage("Please enter a Name or DR# to search:");
                break;
            case '3':
            case 'check master lab material':
                this.displayLabMaterials();
                break;
            default:
                this.displayMessage("Please select a valid option (1, 2, or 3)");
                break;
        }
    }

    handleNewLabChoice(input) {
        switch (input.toLowerCase()) {
            case '1':
            case 'search by dr# or opportunity name':
                this.currentState = 'search_new_dr';
                this.displayMessage("Please enter DR# or Opportunity Name:");
                break;
            case '2':
            case 'i don\'t have a dr':
                const messageDiv = document.createElement('div');
                messageDiv.innerHTML = 'DR is required to raise a new lab request. Drop an email to <a href="mailto:hol@adobe.com" class="email-link">hol@adobe.com</a>';
                this.displayMessage(messageDiv);
                this.currentState = 'initial';
                this.displayInitialOptions();
                break;
            default:
                this.displayMessage("Please select a valid option (1 or 2)");
                break;
        }
    }

    displayLabManagementOptions() {
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'summary-container';
        summaryDiv.innerHTML = `
            <div class="summary-title">Managing Lab: ${this.selectedDR.dr}</div>
            <div class="summary-item">${this.selectedDR.name}</div>
        `;
        this.displayMessage(summaryDiv);

        this.currentState = 'lab_management';
        this.displayMessage("Choose an option:", false, [
            { text: "View Environment Details", value: "view_env" },
            { text: "Add More Users", value: "add_users" },
            { text: "Mark As Complete", value: "mark_complete" },
            { text: "Send TOU", value: "send_tou" },
            { text: "Share Project", value: "share_project" },
            { text: "Request Support", value: "request_support" }
        ]);
    }

    displayEnvironmentOptions() {
        const envDiv = document.createElement('div');
        envDiv.className = 'summary-container';
        envDiv.innerHTML = `
            <div class="summary-title">Environment Details:</div>
            <div class="env-detail">
                <span class="detail-label">Lab:</span>
                <span class="detail-value">${this.selectedDR.dr} (${this.selectedDR.name})</span>
            </div>
            <div class="env-detail">
                <span class="detail-label">Status:</span>
                <span class="detail-value status-active">Active</span>
            </div>
            <div class="env-detail">
                <span class="detail-label">Expiry:</span>
                <span class="detail-value expiry-warning">14 days remaining</span>
            </div>
            <div class="env-detail">
                <span class="detail-label">Environment URL:</span>
                <span class="detail-value"><a href="https://author-p35437-e1520092.adobeaemcloud.com/" target="_blank" class="env-link">AEM</a></span>
            </div>
            <div class="env-detail">
                <span class="detail-label">IMS Org:</span>
                <span class="detail-value">Adobe Hands-on Labs 3</span>
            </div>
        `;
        this.displayMessage(envDiv);

        this.currentState = 'env_options';
        this.displayMessage("Choose an option:", false, [
            { text: "Request 1 Week Extension", value: "request_extension" },
            { text: "Request Additional Features", value: "request_features" },
            { text: "Back to Lab Options", value: "back_to_management" }
        ]);
    }

    displaySupportOptions() {
        this.currentState = 'support_options';
        this.displayMessage("Support Options:", false, [
            { text: "Request Technical Support", value: "tech_support" },
            { text: "Request Delivery Support", value: "delivery_support" },
            { text: "Back to Lab Options", value: "back_to_management" }
        ]);
    }

    handleLabManagement(input) {
        switch(input.toLowerCase()) {
            case 'view_env':
                this.displayEnvironmentOptions();
                break;
            case 'add_users':
                this.currentState = 'add_users';
                this.displayMessage("Enter email addresses of users to add (comma-separated):");
                break;
            case 'mark_complete':
                this.displayMessage("Are you Sure?", false, [
                    { text: "Yes, this Project is complete", value: "confirm_complete" },
                    { text: "No, Wait! Go Back!!", value: "back_to_management" }
                ]);
                this.currentState = 'confirm_completion';
                break;
            case 'send_tou':
                this.currentState = 'send_tou_email';
                const touMessage = document.createElement('div');
                touMessage.className = 'summary-container';
                touMessage.innerHTML = `
                    <div class="summary-title">Send Terms of Use</div>
                    <div class="summary-item">Enter email address to send Terms of Use:</div>
                    <div class="summary-item">Review <a href="http://www.adobe.com" target="_blank" class="tou-link">Sample TOU</a></div>
                `;
                this.displayMessage(touMessage);
                break;
            case 'share_project':
                this.displayMessage("Enter email address to share the project:");
                this.currentState = 'share_project_email';
                break;
            case 'request_support':
                this.displaySupportOptions();
                break;
            case 'back_to_management':
                this.displayLabManagementOptions();
                break;
        }
    }

    displayAdditionalFeaturesOptions() {
        const features = [
            { id: 'dynamic_media', name: 'Dynamic Media' },
            { id: 'brand_portal', name: 'Brand Portal' },
            { id: 'content_automation', name: 'Content Automation' },
            { id: 'workfront_integration', name: 'Workfront Integration' }
        ];

        const messageDiv = document.createElement('div');
        messageDiv.className = 'summary-container';
        messageDiv.innerHTML = `
            <div class="summary-title">Select Additional Features:</div>
            <div class="summary-item">Choose the features you would like to request</div>
        `;
        this.displayMessage(messageDiv);

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'checkbox-options';

        features.forEach(feature => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = feature.id;
            checkbox.value = feature.id;
            
            const label = document.createElement('label');
            label.htmlFor = feature.id;
            label.textContent = feature.name;
            
            const wrapper = document.createElement('div');
            wrapper.className = 'checkbox-wrapper';
            wrapper.appendChild(checkbox);
            wrapper.appendChild(label);
            
            optionsDiv.appendChild(wrapper);
        });

        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Confirm Selection';
        confirmButton.className = 'confirm-button';
        confirmButton.addEventListener('click', () => this.handleAdditionalFeaturesSelection());

        const messageContainer = document.createElement('div');
        messageContainer.appendChild(optionsDiv);
        messageContainer.appendChild(confirmButton);
        
        this.displayMessage(messageContainer);
        this.currentState = 'selecting_features';
    }

    async handleAdditionalFeaturesSelection() {
        const selectedFeatures = new Set();
        const checkboxes = document.querySelectorAll('.checkbox-options input:checked');
        
        if (checkboxes.length === 0) {
            this.displayMessage("Please select at least one feature");
            return;
        }

        checkboxes.forEach(checkbox => {
            // Convert checkbox values to match API expected format
            const featureName = checkbox.value
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join('');
            selectedFeatures.add(featureName);
        });

        // Prepare API request
        const requestBody = {
            engagement_id: 792, // This should come from your DR data in the future
            features: Array.from(selectedFeatures)
        };

        try {
            const response = await fetch('https://prod-57.eastus2.logic.azure.com:443/workflows/fae5e55f1e344c52b7a3e9ec7aeacd7a/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=oJfcz8qZLkcGOXZCO1i7HFvQWYsPkIfBfXE8JlsMtUA', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Display success message
            const featuresDiv = document.createElement('div');
            featuresDiv.className = 'summary-container';
            featuresDiv.innerHTML = `
                <div class="summary-title">Additional Features Request</div>
                <div class="summary-item">Your request for the following features has been submitted:</div>
                ${Array.from(selectedFeatures).map(feature => `
                    <div class="summary-item">- ${feature}</div>
                `).join('')}
                <div class="summary-item">A Sales Velocity Manager will review and get back to you.</div>
            `;
            this.displayMessage(featuresDiv, false, [
                { text: "Back to Lab Options", value: "back_to_management" }
            ]);
            this.currentState = 'lab_management';

        } catch (error) {
            console.error('Error:', error);
            this.displayMessage("There was an error submitting your request. Please try again later.", false, [
                { text: "Back to Lab Options", value: "back_to_management" }
            ]);
        }
    }

    handleEnvironmentOptions(input) {
        switch(input.toLowerCase()) {
            case 'request_extension':
                const extensionDiv = document.createElement('div');
                extensionDiv.className = 'summary-container';
                extensionDiv.innerHTML = `
                    <div class="summary-title">Extension Request Submitted</div>
                    <div class="summary-item">Your request for lab extension has been submitted for review.</div>
                    <div class="summary-item">You will be notified once approved.</div>
                `;
                this.displayMessage(extensionDiv, false, [
                    { text: "Back to Lab Options", value: "back_to_management" }
                ]);
                this.currentState = 'lab_management';
                break;

            case 'request_features':
                this.displayAdditionalFeaturesOptions();
                break;

            case 'back_to_management':
                this.displayLabManagementOptions();
                break;
        }
    }

    handleSupportOptions(input) {
        const supportDiv = document.createElement('div');
        supportDiv.className = 'summary-container';
        supportDiv.innerHTML = `
            <div class="summary-title">Support Request Submitted</div>
            <div class="summary-item">Your request has been sent to a Sales Velocity Manager for review.</div>
            <div class="summary-item">For urgent help, reach out via slack <a href="https://adobe.enterprise.slack.com/archives/C082GPFPL6N" target="_blank" class="slack-link">#hands-on-labs</a></div>
        `;
        
        switch(input.toLowerCase()) {
            case 'tech_support':
            case 'delivery_support':
                this.displayMessage(supportDiv, false, [
                    { text: "Back to Lab Options", value: "back_to_management" }
                ]);
                break;
            case 'back_to_management':
                this.displayLabManagementOptions();
                break;
        }
    }

    handleAddUsers(input) {
        const emails = input.split(',').map(email => email.trim());
        const invalidEmails = emails.filter(email => !this.validateEmail(email));
        
        if (invalidEmails.length > 0) {
            this.displayMessage(`Invalid email format for: ${invalidEmails.join(', ')}`);
            return;
        }

        const confirmDiv = document.createElement('div');
        confirmDiv.className = 'summary-container';
        confirmDiv.innerHTML = `
            <div class="summary-title">Please confirm the following users:</div>
            ${emails.map(email => `
                <div class="summary-item">- ${email}</div>
            `).join('')}
        `;
        
        this.pendingEmails = emails; // Store emails for confirmation
        this.displayMessage(confirmDiv, false, [
            { text: "Confirm Users", value: "confirm_users" },
            { text: "Cancel", value: "back_to_management" }
        ]);
        this.currentState = 'confirm_add_users';
    }

    handleConfirmAddUsers(input) {
        if (input === 'confirm_users') {
            this.displayMessage("Requested users will be onboarded to the environment shortly.", false, [
                { text: "Back to Lab Options", value: "back_to_management" }
            ]);
        } else {
            this.displayLabManagementOptions();
        }
    }

    handleConfirmCompletion(input) {
        if (input === 'confirm_complete') {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'summary-container';
            messageDiv.innerHTML = `
                <div class="summary-title">Request Marked as Complete</div>
                <div class="summary-item">The environment and access will be auto-recycled within 24 hours.</div>
            `;
            this.displayMessage(messageDiv, false, [
                { text: "Back to Lab Options", value: "back_to_management" }
            ]);
        } else {
            this.displayLabManagementOptions();
        }
    }

    handleTOUEmail(input) {
        if (!this.validateEmail(input)) {
            this.displayMessage("Please enter a valid email address.");
            return;
        }

        // Store email temporarily and show confirmation
        this.tempEmail = input;
        const confirmDiv = document.createElement('div');
        confirmDiv.className = 'summary-container';
        confirmDiv.innerHTML = `
            <div class="summary-title">Confirm Terms of Use</div>
            <div class="summary-item">Are you sure you want to send Terms of Use to: ${input}?</div>
        `;
        
        this.displayMessage(confirmDiv, false, [
            { text: "Yes, Send TOU", value: "confirm_tou" },
            { text: "Cancel", value: "back_to_management" }
        ]);
        this.currentState = 'confirm_tou';
    }

    async handleTOUConfirmation(input) {
        if (input === 'confirm_tou') {
            // Show loading state
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'loading-container';
            loadingDiv.innerHTML = `
                <div class="loading-spinner"></div>
                <div class="loading-text">Sending Terms of Use...</div>
            `;
            const loadingMessage = this.displayMessage(loadingDiv);  // Store reference to loading message

            try {
                const requestBody = {
                    name: "User",
                    email: this.tempEmail,
                    sandboxProvisioningRequestID: 790
                };

                const response = await fetch('https://prod-05.eastus2.logic.azure.com:443/workflows/d4c6df16e6c248cf9a3c547980973e9c/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=6GJ02IZauvR_yHYlqpfE_Ag5RQluD7IXAiLvBv5XYCY', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Remove loading message
                if (loadingMessage && loadingMessage.parentNode) {
                    loadingMessage.parentNode.removeChild(loadingMessage);
                }

                const successDiv = document.createElement('div');
                successDiv.className = 'summary-container';
                successDiv.innerHTML = `
                    <div class="summary-title">Terms of Use Sent</div>
                    <div class="summary-item">Terms of Use has been sent to: ${this.tempEmail}</div>
                `;
                
                this.displayMessage(successDiv, false, [
                    { text: "Back to Lab Options", value: "back_to_management" }
                ]);
                this.currentState = 'lab_management';

            } catch (error) {
                console.error('Error:', error);
                // Remove loading message
                if (loadingMessage && loadingMessage.parentNode) {
                    loadingMessage.parentNode.removeChild(loadingMessage);
                }
                
                this.displayMessage("There was an error sending the Terms of Use. Please try again later.", false, [
                    { text: "Back to Lab Options", value: "back_to_management" }
                ]);
            }
        } else {
            this.displayLabManagementOptions();
        }
    }

    handleShareProjectEmail(input) {
        if (!this.validateEmail(input)) {
            this.displayMessage("Please enter a valid email address.");
            return;
        }

        const confirmDiv = document.createElement('div');
        confirmDiv.className = 'summary-container';
        confirmDiv.innerHTML = `
            <div class="summary-title">Project Shared Successfully</div>
            <div class="summary-item">Your colleague will now have access to this project and lab environment.</div>
        `;

        this.displayMessage(confirmDiv, false, [
            { text: "Back to Lab Options", value: "back_to_management" }
        ]);
        this.currentState = 'lab_management';
    }

    displayLabMaterials() {
        const materialsDiv = document.createElement('div');
        materialsDiv.className = 'lab-materials';

        // Create sections for better organization
        const popularSection = [
            { title: 'AEM Edge Delivery', url: 'http://adobe.com/go/eds' },
            { title: 'Content Supply Chain', url: 'http://adobe.com/go/csc' }
        ];

        const otherSection = [
            { title: 'AEM Forms', url: 'http://adobe.com/go/aem-forms-hol' },
            { title: 'AEM Sites', url: 'http://adobe.com/go/aem-sites-hol' },
            { title: 'AEM Assets', url: 'http://adobe.com/go/aem-assets-hol' },
            { title: 'AEM Headless', url: 'http://adobe.com/go/aem-headless-hol' },
            { title: 'AEM (Move to Cloud)', url: 'http://adobe.com/go/move-to-cloud-hol' }
        ];

        // Create HTML content
        let html = `
            <h3 class="materials-header">Most Popular Labs</h3>
            <div class="materials-section">
                ${popularSection.map(item => `
                    <div class="material-item">
                        <div class="material-title">${item.title}</div>
                        <a href="${item.url}" target="_blank" class="material-link">${item.url}</a>
                    </div>
                `).join('')}
            </div>

            <h3 class="materials-header">Other Labs</h3>
            <div class="materials-section">
                ${otherSection.map(item => `
                    <div class="material-item">
                        <div class="material-title">${item.title}</div>
                        <a href="${item.url}" target="_blank" class="material-link">${item.url}</a>
                    </div>
                `).join('')}
            </div>`;

        materialsDiv.innerHTML = html;
        this.displayMessage(materialsDiv);
    }

    handleEmailInput(input) {
        const { validEmails, invalidEmails } = this.validateEmails(input);

        if (invalidEmails.length > 0) {
            this.displayMessage(`Invalid email format for: ${invalidEmails.join(', ')}`);
            return;
        }

        this.emailList = new Set(validEmails);
        this.displayMessage(`Confirmed emails: ${Array.from(this.emailList).join(', ')}`);
        this.displayFinalConfirmation();
    }

    displayFinalConfirmation() {
        const summary = `
            DR: ${this.selectedDR.dr} (${this.selectedDR.name})
            Solutions: ${Array.from(this.selectedSolutions).join(', ')}
            Users: ${Array.from(this.emailList).join(', ')}
        `;
        
        this.displayMessage("Summary of your request:", false);
        this.displayMessage(summary, false, [
            { text: "Confirm and Submit", value: "submit" },
            { text: "Start Over", value: "restart" }
        ]);
        this.currentState = 'final_confirmation';
    }

    handleFinalConfirmation(input) {
        if (input.toLowerCase() === 'submit') {
            this.displayMessage("Request submitted successfully!", false, [
                { text: "Start Over", value: "restart" }
            ]);
            this.currentState = 'completed';
        } else if (input.toLowerCase() === 'restart') {
            this.resetState();
        }
    }

    resetState() {
        // Clear all state
        this.currentState = 'initial';
        this.selectedDR = null;
        this.selectedSolutions.clear();
        this.emailList.clear();
        this.tempEmail = null;
        this.pendingEmails = null;

        // Clear all storage
        localStorage.clear();  // This will clear everything in localStorage

        // Clear the chat messages
        this.chatMessages.innerHTML = '';

        // Start fresh
        this.displayInitialOptions();
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }

    displayNewLabSolutionOptions() {
        const solutions = [
            { id: 'aem', name: 'AEM' },
            { id: 'aep', name: 'AEP' },
            { id: 'workfront', name: 'Workfront' }
        ];

        const messageDiv = document.createElement('div');
        messageDiv.innerHTML = 'Select solutions for your lab (multiple selection allowed):';
        this.displayMessage(messageDiv);

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'checkbox-options';

        solutions.forEach(solution => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = solution.id;
            checkbox.value = solution.id;
            
            const label = document.createElement('label');
            label.htmlFor = solution.id;
            label.textContent = solution.name;
            
            const wrapper = document.createElement('div');
            wrapper.className = 'checkbox-wrapper';
            wrapper.appendChild(checkbox);
            wrapper.appendChild(label);
            
            optionsDiv.appendChild(wrapper);
        });

        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Confirm Selection';
        confirmButton.className = 'confirm-button';
        confirmButton.addEventListener('click', () => this.handleNewLabSolutionSelection());

        const messageContainer = document.createElement('div');
        messageContainer.appendChild(optionsDiv);
        messageContainer.appendChild(confirmButton);
        
        this.displayMessage(messageContainer);
        this.currentState = 'new_lab_solutions';
    }

    handleNewLabSolutionSelection() {
        this.selectedSolutions = new Set();
        const checkboxes = document.querySelectorAll('.checkbox-options input:checked');
        
        if (checkboxes.length === 0) {
            this.displayMessage("Please select at least one solution");
            return;
        }

        checkboxes.forEach(checkbox => {
            this.selectedSolutions.add(checkbox.value);
        });

        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'summary-container';
        summaryDiv.innerHTML = `
            <div class="summary-title">Selected Solutions:</div>
            ${Array.from(this.selectedSolutions).map(solution => `
                <div class="summary-item">- ${solution.toUpperCase()}</div>
            `).join('')}
        `;
        this.displayMessage(summaryDiv);
        this.promptForUserConfirmation();
    }

    promptForUserConfirmation() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'summary-container';
        messageDiv.innerHTML = `
            <div class="summary-title">Do you have email ids of external users you would like to onboard?</div>
        `;
        this.displayMessage(messageDiv, false, [
            { text: "Yes", value: "yes_users" },
            { text: "No", value: "no_users" }
        ]);
        this.currentState = 'confirm_users_needed';
    }

    handleUserConfirmation(input) {
        switch(input.toLowerCase()) {
            case 'yes_users':
                this.promptForNewLabUsers();
                break;
            case 'no_users':
                this.emailList = new Set();  // Empty set for no users
                this.displayNewLabSummary();
                break;
        }
    }

    displayNewLabSummary() {
        const summary = document.createElement('div');
        summary.className = 'summary-container';
        summary.innerHTML = `
            <div class="summary-title">New Lab Request Summary:</div>
            <div class="summary-item">- DR: ${this.selectedDR.dr} (${this.selectedDR.name})</div>
            <div class="summary-item">- Solutions: ${Array.from(this.selectedSolutions).join(', ')}</div>
            <div class="summary-item">- Users to be onboarded: ${this.emailList.size > 0 ? Array.from(this.emailList).join(', ') : 'None'}</div>
        `;

        this.displayMessage(summary, false, [
            { text: "Confirm and Submit", value: "submit_new_lab" },
            { text: "Start Over", value: "restart" }
        ]);
        this.currentState = 'new_lab_confirmation';
    }

    handleNewLabConfirmation(input) {
        if (input === 'submit_new_lab') {
            this.displayMessage("Your lab request has been submitted successfully! You will receive further instructions via email.", false, [
                { text: "Start Over", value: "restart" }
            ]);
        } else if (input === 'restart') {
            this.resetState();
        }
    }

    promptForNewLabUsers() {
        this.currentState = 'new_lab_users';
        const messageDiv = document.createElement('div');
        messageDiv.className = 'summary-container';
        messageDiv.innerHTML = `
            <div class="summary-title">Enter email addresses for lab access:</div>
            <div class="summary-item">Please provide comma-separated email addresses</div>
        `;
        this.displayMessage(messageDiv);
    }

    handleNewLabUsers(input) {
        const emails = input.split(',').map(email => email.trim());
        const invalidEmails = emails.filter(email => !this.validateEmail(email));
        
        if (invalidEmails.length > 0) {
            this.displayMessage(`Invalid email format for: ${invalidEmails.join(', ')}`);
            return;
        }

        this.emailList = new Set(emails);
        this.displayNewLabSummary();
    }

    // Add confirmation before clearing
    handleClearChat() {
        const confirmDiv = document.createElement('div');
        confirmDiv.className = 'summary-container';
        confirmDiv.innerHTML = `
            <div class="summary-title">Clear History</div>
            <div class="summary-item">Are you sure? This will permanently delete all chat history.</div>
        `;
        
        this.displayMessage(confirmDiv, false, [
            { text: "Yes, Clear Everything", value: "confirm_clear" },
            { text: "Cancel", value: "cancel_clear" }
        ]);
        this.currentState = 'confirm_clear';
    }
}

// Initialize chat when popup opens
document.addEventListener('DOMContentLoaded', () => {
    new ChatManager();
}); 