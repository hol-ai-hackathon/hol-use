class ProjectManager {
    static getProjectId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id') || '790'; // Updated default to 790
    }

    static validateProjectId(id) {
        // Add validation logic here if needed
        return true;
    }
} 