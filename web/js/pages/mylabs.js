class MyLabs {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.loadLabs();
    }

    initializeElements() {
        this.labsGrid = document.getElementById('labsGrid');
        this.statusFilter = document.getElementById('statusFilter');
        this.searchInput = document.getElementById('searchLabs');
    }

    attachEventListeners() {
        this.statusFilter.addEventListener('change', () => this.filterLabs());
        this.searchInput.addEventListener('input', () => this.filterLabs());
    }

    async loadLabs() {
        // Mock data - replace with actual API call
        const mockLabs = [
            {
                id: 1,
                dr: "DR12345",
                name: "ABC Life Insurance",
                status: "active",
                expiry: "2024-03-15",
                solutions: ["AEM", "AEP"],
                environment: "https://author-p35437-e1520092.adobeaemcloud.com/",
                users: ["user1@adobe.com", "user2@adobe.com"]
            },
            {
                id: 2,
                dr: "DR67890",
                name: "XYZ University",
                status: "pending",
                solutions: ["Workfront"],
                users: ["user3@adobe.com"]
            },
            {
                id: 3,
                dr: "DR145678",
                name: "MakeMyWorldTrip Inc",
                status: "completed",
                expiry: "2024-02-01",
                solutions: ["AEM"],
                environment: "https://author-p35437-e1520092.adobeaemcloud.com/",
                users: ["user4@adobe.com", "user5@adobe.com"]
            }
        ];

        this.labs = mockLabs;
        this.renderLabs(this.labs);
    }

    renderLabs(labs) {
        this.labsGrid.innerHTML = '';
        
        labs.forEach(lab => {
            const card = document.createElement('div');
            card.className = 'lab-card';
            card.innerHTML = `
                <div class="lab-header">
                    <h3 class="lab-title">${lab.dr} - ${lab.name}</h3>
                </div>
                <div class="lab-content">
                    <div class="lab-info">
                        <div class="lab-info-item">
                            <span class="lab-info-label">Status:</span>
                            <span class="lab-status status-${lab.status}">${lab.status.charAt(0).toUpperCase() + lab.status.slice(1)}</span>
                        </div>
                        ${lab.expiry ? `
                        <div class="lab-info-item">
                            <span class="lab-info-label">Expiry:</span>
                            <span>${new Date(lab.expiry).toLocaleDateString()}</span>
                        </div>
                        ` : ''}
                        <div class="lab-info-item">
                            <span class="lab-info-label">Solutions:</span>
                            <span>${lab.solutions.join(', ')}</span>
                        </div>
                    </div>
                    <div class="lab-actions">
                        <a href="detail.html?id=${lab.id}" class="btn btn-primary">View Details</a>
                        ${lab.status === 'active' ? `
                            <button class="btn btn-secondary" onclick="myLabs.markComplete(${lab.id})">Mark Complete</button>
                        ` : ''}
                    </div>
                </div>
            `;
            this.labsGrid.appendChild(card);
        });
    }

    filterLabs() {
        const statusValue = this.statusFilter.value;
        const searchValue = this.searchInput.value.toLowerCase();

        const filteredLabs = this.labs.filter(lab => {
            const matchesStatus = statusValue === 'all' || lab.status === statusValue;
            const matchesSearch = lab.dr.toLowerCase().includes(searchValue) || 
                                lab.name.toLowerCase().includes(searchValue);
            return matchesStatus && matchesSearch;
        });

        this.renderLabs(filteredLabs);
    }

    async markComplete(labId) {
        if (confirm('Are you sure you want to mark this lab as complete?')) {
            // Mock API call
            console.log(`Marking lab ${labId} as complete`);
            
            // Update local data
            const lab = this.labs.find(l => l.id === labId);
            if (lab) {
                lab.status = 'completed';
                this.filterLabs(); // Re-render with updated data
            }
        }
    }
}

// Initialize My Labs page
const myLabs = new MyLabs(); 