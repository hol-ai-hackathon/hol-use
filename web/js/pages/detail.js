class LabDetail {
    constructor() {
        this.initializeElements();
        this.loadLabDetails();
        this.addModalsToPage();
    }

    initializeElements() {
        this.contentContainer = document.querySelector('.lab-detail-content');
        this.labId = new URLSearchParams(window.location.search).get('id');
    }

    async loadLabDetails() {
        if (!this.labId) {
            this.showError('No lab ID provided');
            return;
        }

        // Mock API call - replace with actual API call
        const mockLab = {
            id: this.labId,
            dr: "DR12345",
            name: "Acme Corporation",
            status: "active",
            expiry: "2024-12-31",
            solutions: ["AEM", "Workfront"],
            environment: "https://author-p35437-e1520092.adobeaemcloud.com/",
            imsOrg: "Adobe Hands-on Labs 3",
            users: ["user1@adobe.com", "user2@adobe.com"]
        };

        this.renderLabDetails(mockLab);
    }

    renderLabDetails(lab) {
        this.contentContainer.innerHTML = `
            <div class="detail-header">
                <h1>${lab.dr} - ${lab.name}</h1>
                <div class="detail-status">
                    <span class="lab-status status-${lab.status}">${lab.status.charAt(0).toUpperCase() + lab.status.slice(1)}</span>
                </div>
            </div>

            <div class="detail-body">
                <div class="detail-section">
                    <h2>Environment Details</h2>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Environment URL</div>
                            <div class="info-value url">
                                <a href="${lab.environment}" target="_blank">${lab.environment}</a>
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">IMS Organization</div>
                            <div class="info-value">${lab.imsOrg}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Solutions</div>
                            <div class="info-value">${lab.solutions.join(', ')}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Expiry</div>
                            <div class="info-value">${new Date(lab.expiry).toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h2>Users</h2>
                    <div class="users-list">
                        ${lab.users.map(user => `
                            <span class="user-tag">${user}</span>
                        `).join('')}
                    </div>
                </div>

                <div class="detail-section">
                    <h2>Actions</h2>
                    <div class="actions-grid">
                        <div class="action-card">
                            <h3>Request Extension</h3>
                            <p>Extend the lab duration</p>
                            <button class="btn btn-primary" onclick="labDetail.requestExtension()">Request</button>
                        </div>
                        <div class="action-card">
                            <h3>Additional Features</h3>
                            <p>Request more features</p>
                            <button class="btn btn-primary" onclick="labDetail.showFeaturesModal()">Request</button>
                        </div>
                        <div class="action-card">
                            <h3>Send TOU</h3>
                            <p>Send Terms of Use</p>
                            <button class="btn btn-primary" onclick="labDetail.showTOUModal()">Send</button>
                        </div>
                        <div class="action-card">
                            <h3>Add Users</h3>
                            <p>Add more users to lab</p>
                            <button class="btn btn-primary" onclick="labDetail.showAddUsersModal()">Add</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showError(message) {
        this.contentContainer.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <a href="mylabs.html" class="btn btn-primary">Back to My Labs</a>
            </div>
        `;
    }

    addModalsToPage() {
        // Extension Modal
        const extensionModal = document.createElement('div');
        extensionModal.id = 'extensionModal';
        extensionModal.className = 'modal';
        extensionModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Request Extension</h2>
                    <button class="modal-close" onclick="labDetail.closeModal('extensionModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to request an extension for this lab?</p>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="labDetail.closeModal('extensionModal')">Cancel</button>
                    <button class="btn btn-primary" onclick="labDetail.confirmExtension()">Confirm</button>
                </div>
            </div>
        `;

        // Features Modal
        const featuresModal = document.createElement('div');
        featuresModal.id = 'featuresModal';
        featuresModal.className = 'modal';
        featuresModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Request Additional Features</h2>
                    <button class="modal-close" onclick="labDetail.closeModal('featuresModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="features-list">
                        <label class="feature-checkbox">
                            <input type="checkbox" name="features" value="dynamic_media">
                            <span class="checkbox-custom"></span>
                            <span class="feature-label">
                                <strong>Dynamic Media</strong>
                                <span class="feature-description">Enable asset transformation and delivery</span>
                            </span>
                        </label>
                        <label class="feature-checkbox">
                            <input type="checkbox" name="features" value="brand_portal">
                            <span class="checkbox-custom"></span>
                            <span class="feature-label">
                                <strong>Brand Portal</strong>
                                <span class="feature-description">Asset distribution and sharing</span>
                            </span>
                        </label>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="labDetail.closeModal('featuresModal')">Cancel</button>
                    <button class="btn btn-primary" onclick="labDetail.submitFeatures()">Submit Request</button>
                </div>
            </div>
        `;

        // TOU Modal
        const touModal = document.createElement('div');
        touModal.id = 'touModal';
        touModal.className = 'modal';
        touModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Send Terms of Use</h2>
                    <button class="modal-close" onclick="labDetail.closeModal('touModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="touEmail">Email Address</label>
                        <input type="email" id="touEmail" placeholder="Enter email address">
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="labDetail.closeModal('touModal')">Cancel</button>
                    <button class="btn btn-primary" onclick="labDetail.sendTOU()">Send TOU</button>
                </div>
            </div>
        `;

        // Add Users Modal
        const usersModal = document.createElement('div');
        usersModal.id = 'usersModal';
        usersModal.className = 'modal';
        usersModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Add Users</h2>
                    <button class="modal-close" onclick="labDetail.closeModal('usersModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="userEmails">Email Addresses</label>
                        <textarea 
                            id="userEmails" 
                            placeholder="Enter email addresses (one per line or comma-separated)"
                            rows="6"
                        ></textarea>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="labDetail.closeModal('usersModal')">Cancel</button>
                    <button class="btn btn-primary" onclick="labDetail.addUsers()">Add Users</button>
                </div>
            </div>
        `;

        // Success Modal
        const successModal = document.createElement('div');
        successModal.id = 'successModal';
        successModal.className = 'modal';
        successModal.innerHTML = `
            <div class="modal-content success-modal">
                <div class="modal-header">
                    <h2>Success</h2>
                    <button class="modal-close" onclick="labDetail.closeModal('successModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="success-icon">✓</div>
                    <p id="successMessage"></p>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="labDetail.closeModal('successModal')">Close</button>
                </div>
            </div>
        `;

        // Append all modals to body
        document.body.appendChild(extensionModal);
        document.body.appendChild(featuresModal);
        document.body.appendChild(touModal);
        document.body.appendChild(usersModal);
        document.body.appendChild(successModal);
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    showSuccessMessage(message) {
        const messageElement = document.getElementById('successMessage');
        if (messageElement) {
            messageElement.textContent = message;
            this.showModal('successModal');
        }
    }

    requestExtension() {
        this.showModal('extensionModal');
    }

    confirmExtension() {
        this.closeModal('extensionModal');
        this.showSuccessMessage('Extension request submitted successfully!');
    }

    showFeaturesModal() {
        this.showModal('featuresModal');
    }

    submitFeatures() {
        const data = {
            "engagement_id": this.projectId,
            "sandboxProvisioningRequestID": parseInt(this.projectId, 10)
        };

        const url = 'https://prod-57.eastus2.logic.azure.com:443/workflows/fae5e55f1e344c52b7a3e9ec7aeacd7a/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=oJfcz8qZLkcGOXZCO1i7HFvQWYsPkIfBfXE8JlsMtUA';

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                return response.json();
            }
            return null;
        })
        .then(() => {
            this.closeModal('featuresModal');
            this.showSuccessMessage('Feature request submitted successfully!');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to submit feature request. Please try again.');
        });
    }

    showTOUModal() {
        this.showModal('touModal');
    }

    sendTOU() {
        const email = document.getElementById('touEmail').value;
        if (!this.validateEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }

        const data = {
            "name": "User",
            "email": email,
            "sandboxProvisioningRequestID": "788"
        };

        const url = 'https://prod-05.eastus2.logic.azure.com:443/workflows/d4c6df16e6c248cf9a3c547980973e9c/triggers/manual/paths/invoke?api-version=2016-10-01&sp=/triggers/manual/run&sv=1.0&sig=6GJ02IZauvR_yHYlqpfE_Ag5RQluD7IXAiLvBv5XYCY';

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            this.closeModal('touModal');
            this.showSuccessMessage('Terms of Use sent successfully!');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to send Terms of Use. Please try again.');
        });
    }

    showAddUsersModal() {
        this.showModal('usersModal');
    }

    addUsers() {
        const emails = document.getElementById('userEmails').value
            .split(/[\n,]/)
            .map(email => email.trim())
            .filter(email => email);

        if (emails.length === 0) {
            alert('Please enter at least one email address');
            return;
        }

        const invalidEmails = emails.filter(email => !this.validateEmail(email));
        if (invalidEmails.length > 0) {
            alert(`Invalid email format for: ${invalidEmails.join(', ')}`);
            return;
        }

        this.closeModal('usersModal');
        this.showSuccessMessage('Users added successfully!');
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}

// Initialize the detail page
const labDetail = new LabDetail(); 