// Add this to your tabs.js file or replace it if needed

document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const contentSections = document.querySelectorAll('.content');
    
    // Function to switch tabs
    function switchTab(targetId) {
      // First hide all content sections
      contentSections.forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none'; // Ensure it's fully hidden
      });
      
      // Then remove active class from all tab buttons
      tabButtons.forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Activate the selected tab and content
      const selectedTab = document.querySelector(`[data-id="${targetId}"]`);
      const selectedContent = document.getElementById(targetId);
      
      if (selectedTab && selectedContent) {
        selectedTab.classList.add('active');
        selectedContent.classList.add('active');
        selectedContent.style.display = 'flex'; // Ensure it's visible
        
        // Special handling for portfolio section
        if (targetId === 'portfolio') {
          const portfolioList = document.getElementById('portfolio-list');
          if (portfolioList) {
            // Reset scroll position when switching to portfolio
            portfolioList.scrollTop = 0;
            
            // Make sure the title is visible
            const portfolioTitle = document.querySelector('#portfolio #skills-title');
            if (portfolioTitle) {
              portfolioTitle.classList.remove('hidden');
            }
          }
        }
      }
    }
    
    // Add click event listeners to all tab buttons
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-id');
        switchTab(targetId);
      });
    });
    
    // Check if there's a hash in the URL and switch to that tab
    if (window.location.hash) {
      const targetId = window.location.hash.substring(1);
      switchTab(targetId);
    }
  });