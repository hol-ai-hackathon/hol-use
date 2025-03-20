// Common functionality across pages can go here
document.addEventListener('DOMContentLoaded', function() {
    // Initialize any common elements or functionality
    console.log('Main JS loaded');

    const helpLink = document.getElementById('helpLink');
    const helpPopup = document.getElementById('helpPopup');

    if (helpLink && helpPopup) {
        // Toggle popup on help link click
        helpLink.addEventListener('click', function(e) {
            e.preventDefault();
            helpPopup.classList.toggle('show');
        });

        // Close popup when clicking outside
        document.addEventListener('click', function(e) {
            if (!helpLink.contains(e.target) && !helpPopup.contains(e.target)) {
                helpPopup.classList.remove('show');
            }
        });

        // Prevent popup from closing when clicking inside it
        helpPopup.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}); 