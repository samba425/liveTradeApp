import { AfterViewInit,Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-learn',
  templateUrl: './learn.component.html',
  styleUrls: ['./learn.component.css']
})
export class LearnComponent implements OnInit, AfterViewInit {

  constructor() { }

  ngOnInit() {
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
  setTimeout(() => this.initToggles(), 0);
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
    icon.innerText = '+';
    icon.style.cursor = 'pointer';
    icon.style.marginRight = '8px';
    header.insertBefore(icon, header.firstChild);

    // COPY icon
    const copyIcon = document.createElement('span');
    copyIcon.className = 'gc-copy-icon';
    copyIcon.innerText = '📋'; // or use SVG icon
    copyIcon.title = 'Copy this section';
    copyIcon.style.cursor = 'pointer';
    copyIcon.style.marginLeft = '10px';
    header.appendChild(copyIcon);

    // Initially collapse all content under this GC heading
    let next = header.nextElementSibling;
    while (next && next.tagName !== 'H1') {
      (next as HTMLElement).classList.add('gc-content', 'gc-collapsed');
      next = next.nextElementSibling;
    }

    // Toggle logic (accordion style)
    header.addEventListener('click', (event) => {
      // Ignore clicks on copy icon
      if ((event.target as HTMLElement).classList.contains('gc-copy-icon')) return;

      const isCollapsed = icon.innerText === '+';

      // Close other sections
      Array.prototype.forEach.call(headers, (otherHeader: Element) => {
        if (otherHeader !== header) {
          let sib = otherHeader.nextElementSibling;
          while (sib && sib.tagName !== 'H1') {
            (sib as HTMLElement).classList.add('gc-collapsed');
            sib = sib.nextElementSibling;
          }
          const otherIcon = otherHeader.querySelector('.gc-toggle-icon');
          if (otherIcon) otherIcon.textContent = '+';
        }
      });

      // Toggle this one
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
  setTimeout(() => {
    var headers = document.querySelectorAll('#gc-doc h1');
    Array.prototype.forEach.call(headers, function (header: Element) {
      var text = header.textContent ? header.textContent.trim() : '';
      if (text.indexOf('GC ') === 0) {
        // Make clickable
        header.setAttribute('style', 'cursor: pointer; color: #e6adb0;');
        
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



 
}