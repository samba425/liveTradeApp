import { AfterViewInit,Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-learn',
  templateUrl: './learn.component.html',
  styleUrls: ['./learn.component.css']
})
export class LearnComponent implements OnInit, AfterViewInit {

  searchTerm: string = '';
  allExpanded: boolean = false;
  allKnowledgeExpanded: boolean = false;
  gcSections: Array<{title: string, id: string}> = [];

  constructor() { }

  ngOnInit() {
    // Initialize knowledge base sections as collapsed
    this.initializeKnowledgeBase();
  }

  initializeKnowledgeBase() {
    // Ensure all knowledge base sections start collapsed
    setTimeout(() => {
      const sections = [
        'global-markets',
        'fundamental-analysis', 
        'stock-metrics',
        'ratio-guidelines',
        'trading-strategies',
        'earnings-strategy',
        'stock-selection',
        'ratios-table'
      ];
      
      sections.forEach(sectionId => {
        const content = document.getElementById(`content-${sectionId}`);
        const icon = document.getElementById(`icon-${sectionId}`);
        
        if (content && icon) {
          content.classList.add('collapsed');
          icon.textContent = '+';
        }
      });
    }, 100);
  }

    @ViewChild('mdRef') mdRef!: ElementRef;

  copyMarkdown() {
    // Get the container element with rendered markdown HTML
    const container = document.getElementById('gc-doc');
    if (!container) {
      alert('Markdown content not found!');
      return;
    }

    // Extract plain text from the rendered markdown content (without the copy button)
    // Here, we remove the button temporarily so its text is not copied
    const copyBtn = container.querySelector('button');
    if (copyBtn) copyBtn.style.display = 'none';

    const textToCopy = container.innerText || container.textContent || '';

    if (copyBtn) copyBtn.style.display = '';

    if (!textToCopy.trim()) {
      alert('No content to copy');
      return;
    }

    // Use clipboard API (with TS type fix)
    (navigator as any).clipboard.writeText(textToCopy).then(() => {
      alert('Markdown content copied!');
    }).catch(() => {
      alert('Failed to copy content.');
    });
  }

  
onMarkdownReady() {
  // Delay so DOM has time to render markdown HTML
  setTimeout(() => {
    this.initToggles();
    this.createNavigationTabs();
    // Ensure all GC sections start collapsed by default
    this.collapseAllGCSections();
  }, 500);
}

collapseAllGCSections() {
  const container = document.getElementById('gc-doc');
  if (!container) return;

  const headers = container.querySelectorAll('h1');
  this.allExpanded = false; // Set to false to ensure collapsed state

  Array.prototype.forEach.call(headers, (header: Element) => {
    const text = header.textContent ? header.textContent.trim() : '';
    if (text.startsWith('GC ')) {
      const icon = header.querySelector('.gc-toggle-icon');
      let next = header.nextElementSibling;
      
      // Collapse all content under this GC header
      while (next && next.tagName !== 'H1') {
        (next as HTMLElement).classList.add('gc-collapsed');
        next = next.nextElementSibling;
      }
      
      // Set icon to collapsed state
      if (icon) {
        icon.textContent = '+';
      }
    }
  });
}

onSearch() {
  const container = document.getElementById('gc-doc');
  if (!container) return;

  const headers = container.querySelectorAll('h1');
  
  if (!this.searchTerm.trim()) {
    // Show all sections if search is empty
    Array.prototype.forEach.call(headers, (header: Element) => {
      const text = header.textContent ? header.textContent.trim() : '';
      if (text.startsWith('GC ')) {
        (header as HTMLElement).style.display = '';
        // Show all content under this header
        let next = header.nextElementSibling;
        while (next && next.tagName !== 'H1') {
          (next as HTMLElement).style.display = '';
          next = next.nextElementSibling;
        }
      }
    });
    return;
  }

  // Hide all sections first
  Array.prototype.forEach.call(headers, (header: Element) => {
    const text = header.textContent ? header.textContent.trim() : '';
    if (text.startsWith('GC ')) {
      const matchesSearch = text.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      if (matchesSearch) {
        // Show matching section
        (header as HTMLElement).style.display = '';
        // Show all content under this header
        let next = header.nextElementSibling;
        while (next && next.tagName !== 'H1') {
          (next as HTMLElement).style.display = '';
          (next as HTMLElement).classList.remove('gc-collapsed');
          next = next.nextElementSibling;
        }
        // Update toggle icon to show expanded
        const icon = header.querySelector('.gc-toggle-icon');
        if (icon) icon.textContent = '−';
      } else {
        // Hide non-matching section
        (header as HTMLElement).style.display = 'none';
        // Hide all content under this header
        let next = header.nextElementSibling;
        while (next && next.tagName !== 'H1') {
          (next as HTMLElement).style.display = 'none';
          next = next.nextElementSibling;
        }
      }
    }
  });
}

clearSearch() {
  this.searchTerm = '';
  this.onSearch();
}

toggleAllSections() {
  const container = document.getElementById('gc-doc');
  if (!container) return;

  const headers = container.querySelectorAll('h1');
  
  // If this is the first time or allExpanded is undefined, default to collapsed (false)
  if (this.allExpanded === undefined) {
    this.allExpanded = false;
  }
  
  this.allExpanded = !this.allExpanded;

  Array.prototype.forEach.call(headers, (header: Element) => {
    const text = header.textContent ? header.textContent.trim() : '';
    if (text.startsWith('GC ')) {
      const icon = header.querySelector('.gc-toggle-icon');
      let next = header.nextElementSibling;
      
      while (next && next.tagName !== 'H1') {
        if (this.allExpanded) {
          (next as HTMLElement).classList.remove('gc-collapsed');
        } else {
          (next as HTMLElement).classList.add('gc-collapsed');
        }
        next = next.nextElementSibling;
      }
      
      if (icon) {
        icon.textContent = this.allExpanded ? '−' : '+';
      }
    }
  });
}

scrollToSection(sectionId: string) {
  console.log(`Scrolling to section: ${sectionId}`);
  const element = document.getElementById(sectionId);
  
  if (element) {
    console.log('Element found, expanding and scrolling');
    
    // First expand the section
    const icon = element.querySelector('.gc-toggle-icon');
    let next = element.nextElementSibling;
    
    while (next && next.tagName !== 'H1') {
      (next as HTMLElement).classList.remove('gc-collapsed');
      next = next.nextElementSibling;
    }
    
    if (icon) {
      icon.textContent = '−';
    }
    
    // Then scroll to it
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
    
    // Add highlight effect
    element.classList.add('gc-highlight');
    setTimeout(() => {
      element.classList.remove('gc-highlight');
    }, 2000);
  } else {
    console.log(`Element with id ${sectionId} not found`);
  }
}

createNavigationTabs() {
  const container = document.getElementById('gc-doc');
  const navContainer = document.getElementById('gc-nav-tabs');
  
  if (!container || !navContainer) {
    console.log('Container or navContainer not found');
    return;
  }

  const headers = container.querySelectorAll('h1');
  this.gcSections = [];
  
  console.log(`Found ${headers.length} h1 headers`);
  
  Array.prototype.forEach.call(headers, (header: Element, index: number) => {
    const text = header.textContent ? header.textContent.trim() : '';
    console.log(`Header ${index}: "${text}"`);
    
    if (text.startsWith('GC ')) {
      const id = `gc-section-${index}`;
      (header as HTMLElement).id = id;
      
      this.gcSections.push({
        title: text,
        id: id
      });
      console.log(`Added section: ${text} with id: ${id}`);
    }
  });

  console.log(`Total GC sections found: ${this.gcSections.length}`);

  // Create navigation tabs
  navContainer.innerHTML = '';
  
  if (this.gcSections.length === 0) {
    navContainer.innerHTML = '<p style="color: #666; font-style: italic;">No GC sections found. Please wait for content to load...</p>';
    return;
  }
  
  this.gcSections.forEach(section => {
    const tab = document.createElement('button');
    tab.className = 'gc-nav-tab';
    tab.textContent = section.title;
    tab.onclick = () => {
      console.log(`Clicking on section: ${section.title}`);
      this.scrollToSection(section.id);
    };
    navContainer.appendChild(tab);
  });
  
  console.log('Navigation tabs created');
}

initToggles() {
  const container = document.getElementById('gc-doc');
  if (!container) return;

  const headers = container.querySelectorAll('h1');

  Array.prototype.forEach.call(headers, (header: Element) => {
    const text = header.textContent ? header.textContent.trim() : '';
    if (!text.startsWith('GC ')) return;

    // Style
    (header as HTMLElement).classList.add('gc-header');

    // Toggle icon
    const icon = document.createElement('span');
    icon.className = 'gc-toggle-icon';
    icon.innerText = '+';  // Start collapsed
    icon.style.cursor = 'pointer';
    icon.style.marginRight = '8px';
    header.insertBefore(icon, header.firstChild);

    // COPY icon
    const copyIcon = document.createElement('span');
    copyIcon.className = 'gc-copy-icon';
    copyIcon.innerText = '📋';
    copyIcon.title = 'Copy this section';
    copyIcon.style.cursor = 'pointer';
    copyIcon.style.marginLeft = '10px';
    header.appendChild(copyIcon);

    // Initially collapse all content under this GC heading (DEFAULT COLLAPSED)
    let next = header.nextElementSibling;
    while (next && next.tagName !== 'H1') {
      (next as HTMLElement).classList.add('gc-content', 'gc-collapsed');
      next = next.nextElementSibling;
    }

    // Toggle logic (individual section toggle, NOT accordion)
    header.addEventListener('click', (event) => {
      // Ignore clicks on copy icon
      if ((event.target as HTMLElement).classList.contains('gc-copy-icon')) return;

      const isCollapsed = icon.innerText === '+';

      // Toggle only this section (no accordion behavior)
      let n = header.nextElementSibling;
      while (n && n.tagName !== 'H1') {
        if (isCollapsed) {
          (n as HTMLElement).classList.remove('gc-collapsed');
        } else {
          (n as HTMLElement).classList.add('gc-collapsed');
        }
        n = n.nextElementSibling;
      }
      icon.innerText = isCollapsed ? '−' : '+';
    });

    // Copy icon click handler
    copyIcon.addEventListener('click', (event) => {
      event.stopPropagation(); // prevent toggling

      // Collect text content of this section
      let contentTexts: string[] = [];
      let sib = header.nextElementSibling;
      while (sib && sib.tagName !== 'H1') {
        contentTexts.push((sib as HTMLElement).innerText || '');
        sib = sib.nextElementSibling;
      }
      const textToCopy = contentTexts.join('\n\n');

      // Clipboard API with TS workaround
      (navigator as any).clipboard.writeText(textToCopy).then(() => {
        alert('Section copied to clipboard!');
      }).catch(() => {
        alert('Failed to copy section.');
      });
    });
  });

}




  ngAfterViewInit() {
    // Retry creating navigation tabs if they weren't created initially
    setTimeout(() => {
      this.retryCreateNavigation();
    }, 1000);

    setTimeout(() => {
      var headers = document.querySelectorAll('#gc-doc h1');
      Array.prototype.forEach.call(headers, function (header: Element) {
        var text = header.textContent ? header.textContent.trim() : '';
        if (text.indexOf('GC ') === 0) {
          // Make clickable
          header.setAttribute('style', 'cursor: pointer; color: #ac1fd2c4;font-size: x-large;');
          
          // Initially hide all content under this GC header (DEFAULT COLLAPSED)
          var next = header.nextElementSibling;
          while (next && next.tagName !== 'H1') {
            (next as HTMLElement).style.display = 'none';
            next = next.nextElementSibling;
          }
          
          header.addEventListener('click', function () {
            var next = header.nextElementSibling;
            var show = false;

            if (!next) return;
            if ((next as HTMLElement).style.display === 'none') show = true;

            // Hide/show until the next h1 (next GC section)
            while (next && next.tagName !== 'H1') {
              (next as HTMLElement).style.display = show ? '' : 'none';
              next = next.nextElementSibling;
            }
          });
        }
      });
    }, 500); // Wait for markdown to fully render
  }

  retryCreateNavigation() {
    const navContainer = document.getElementById('gc-nav-tabs');
    if (navContainer && (navContainer.children.length === 0 || navContainer.innerHTML.includes('No GC sections found'))) {
      console.log('Retrying navigation creation...');
      this.createNavigationTabs();
    }
  }

  toggleKnowledgeSection(sectionId: string) {
    const content = document.getElementById(`content-${sectionId}`);
    const icon = document.getElementById(`icon-${sectionId}`);
    
    if (content && icon) {
      const isCollapsed = content.classList.contains('collapsed');
      
      if (isCollapsed) {
        content.classList.remove('collapsed');
        icon.textContent = '−';
      } else {
        content.classList.add('collapsed');
        icon.textContent = '+';
      }
    }
  }

  toggleAllKnowledgeBase() {
    this.allKnowledgeExpanded = !this.allKnowledgeExpanded;
    
    const sections = [
      'global-markets',
      'fundamental-analysis', 
      'stock-metrics',
      'ratio-guidelines',
      'trading-strategies',
      'earnings-strategy',
      'stock-selection',
      'ratios-table'
    ];
    
    sections.forEach(sectionId => {
      const content = document.getElementById(`content-${sectionId}`);
      const icon = document.getElementById(`icon-${sectionId}`);
      
      if (content && icon) {
        if (this.allKnowledgeExpanded) {
          content.classList.remove('collapsed');
          icon.textContent = '−';
        } else {
          content.classList.add('collapsed');
          icon.textContent = '+';
        }
      }
    });
  }

 
}