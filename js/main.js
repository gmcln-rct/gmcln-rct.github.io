// Help with scrolling profile list

document.addEventListener('DOMContentLoaded', function() {
    // Get the portfolio section and the portfolio title element
    const portfolioSection = document.getElementById('portfolio');
    const portfolioTitle = document.getElementById('skills-title');
    
    if (portfolioSection && portfolioTitle) {
      // Add scroll event listener to the portfolio section
      portfolioSection.addEventListener('scroll', function() {
        // Check the scroll position
        if (this.scrollTop > 40) {
          // If scrolled down, hide the title
          portfolioTitle.classList.add('hidden');
        } else {
          // If at the top, show the title
          portfolioTitle.classList.remove('hidden');
        }
      });
    }
  });