class LabMaterials {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.querySelectorAll('.material-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // Here you would typically handle the download or viewing of the material
                console.log('Opening material:', link.querySelector('.material-title').textContent);
                alert('Material download/viewing would be implemented here');
            });
        });
    }
}

// Initialize the materials page
const labMaterials = new LabMaterials(); 