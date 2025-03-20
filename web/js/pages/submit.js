class LabRequestForm {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchButton = document.querySelector('.search-container .btn');
        this.searchResults = document.querySelector('.search-results');
        this.labRequestForm = document.querySelector('.lab-request-form');
        this.emailTags = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Search button click
        this.searchButton.addEventListener('click', () => this.search());
        
        // Enter key in search input
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.search();
            }
        });
    }

    search() {
        const searchValue = this.searchInput.value.trim();
        if (!searchValue) {
            alert('Please enter a DR# or Customer Name');
            return;
        }

        // Mock search results with customer names
        const mockResults = [
            { dr: 'DR12345', name: 'Acme Corporation', opportunity: 'OPP-001' },
            { dr: 'DR67890', name: 'Global Insurance Ltd', opportunity: 'OPP-002' },
            { dr: 'DR45678', name: 'TechCorp Solutions', opportunity: 'OPP-003' },
            { dr: 'DR98765', name: 'Healthcare Partners', opportunity: 'OPP-004' },
            { dr: 'DR23456', name: 'Retail Giants Inc', opportunity: 'OPP-005' }
        ];

        // Filter results based on search input
        const filteredResults = mockResults.filter(result => 
            result.dr.toLowerCase().includes(searchValue.toLowerCase()) ||
            result.name.toLowerCase().includes(searchValue.toLowerCase())
        );

        this.displaySearchResults(filteredResults);
    }

    displaySearchResults(results) {
        if (!this.searchResults) return;

        if (results.length === 0) {
            this.searchResults.innerHTML = '<p>No results found</p>';
        } else {
            const resultsList = results.map(result => `
                <div class="result-item">
                    <div class="result-info">
                        <h3>${result.dr}</h3>
                        <p>${result.name}</p>
                        <p class="opportunity">Opportunity: ${result.opportunity}</p>
                    </div>
                    <button 
                        class="btn btn-primary select-dr" 
                        data-dr="${result.dr}"
                        data-name="${result.name}"
                        onclick="labRequestForm.selectDR(this)"
                    >Select</button>
                </div>
            `).join('');

            this.searchResults.innerHTML = resultsList;
        }

        this.searchResults.style.display = 'grid';
        if (this.labRequestForm) {
            this.labRequestForm.style.display = 'none';
        }
    }

    selectDR(buttonElement) {
        const dr = buttonElement.getAttribute('data-dr');
        const name = buttonElement.getAttribute('data-name');
        
        console.log(`Selected DR: ${dr}, Customer: ${name}`);
        
        if (!this.labRequestForm) {
            console.error('Lab request form container not found');
            return;
        }

        // Show the lab request form with the selected DR details
        this.labRequestForm.innerHTML = `
            <h2>New Lab Request</h2>
            <div class="selected-dr">
                <p><strong>DR#:</strong> ${dr}</p>
                <p><strong>Customer:</strong> ${name}</p>
            </div>
            <form id="labRequestForm">
                <div class="form-group">
                    <h3>Select Solutions</h3>
                    <div class="solutions-grid">
                        <label class="solution-checkbox">
                            <input type="checkbox" name="solutions" value="aem">
                            <span>AEM</span>
                        </label>
                        <label class="solution-checkbox">
                            <input type="checkbox" name="solutions" value="workfront">
                            <span>Workfront</span>
                        </label>
                        <label class="solution-checkbox">
                            <input type="checkbox" name="solutions" value="aep">
                            <span>AEP</span>
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <h3>Add Users</h3>
                    <div class="email-input-container">
                        <input type="email" id="emailInput" placeholder="Enter email address">
                        <button type="button" class="btn btn-secondary" onclick="labRequestForm.addEmail()">Add</button>
                    </div>
                    <div id="emailTags" class="email-tags"></div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="labRequestForm.resetForm()">Reset</button>
                    <button type="button" class="btn btn-primary" onclick="labRequestForm.submitForm()">Submit Request</button>
                </div>
            </form>
        `;
        
        this.searchResults.style.display = 'none';
        this.labRequestForm.style.display = 'block';
        
        // Reset email tags when starting a new request
        this.emailTags = [];
    }

    addEmail() {
        const emailInput = document.getElementById('emailInput');
        const email = emailInput.value.trim();
        
        if (this.validateEmail(email)) {
            if (!this.emailTags.includes(email)) {
                this.emailTags.push(email);
                this.updateEmailTags();
            }
            emailInput.value = '';
        } else {
            alert('Please enter a valid email address');
        }
    }

    updateEmailTags() {
        const emailTagsContainer = document.getElementById('emailTags');
        if (!emailTagsContainer) return;
        
        emailTagsContainer.innerHTML = this.emailTags.map(email => `
            <div class="email-tag">
                <span>${email}</span>
                <button type="button" onclick="labRequestForm.removeEmail('${email}')">&times;</button>
            </div>
        `).join('');
    }

    removeEmail(email) {
        this.emailTags = this.emailTags.filter(e => e !== email);
        this.updateEmailTags();
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    resetForm() {
        this.emailTags = [];
        this.updateEmailTags();
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        const emailInput = document.getElementById('emailInput');
        if (emailInput) emailInput.value = '';
    }

    submitForm() {
        const solutions = Array.from(document.querySelectorAll('input[name="solutions"]:checked'))
            .map(cb => cb.value);

        if (solutions.length === 0) {
            alert('Please select at least one solution');
            return;
        }

        if (this.emailTags.length === 0) {
            alert('Please add at least one user email');
            return;
        }

        const formData = {
            solutions,
            users: this.emailTags
        };

        console.log('Submitting form data:', formData);
        
        // Show success modal
        const successModal = document.getElementById('successModal');
        if (successModal) {
            successModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    closeSuccessModal() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
            // Redirect to My Labs page
            window.location.href = 'mylabs.html';
        }
    }

    contactSupport() {
        const modal = document.getElementById('supportModal');
        if (modal) {
            modal.classList.add('show');
            // Prevent background scrolling
            document.body.style.overflow = 'hidden';
        }
    }

    closeSupportModal() {
        const modal = document.getElementById('supportModal');
        if (modal) {
            modal.classList.remove('show');
            // Restore background scrolling
            document.body.style.overflow = '';
        }
    }
}

// Initialize the form
const labRequestForm = new LabRequestForm();

// Add this event listener outside the class
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('supportModal');
        if (modal && modal.classList.contains('show')) {
            labRequestForm.closeSupportModal();
        }
    }
}); 