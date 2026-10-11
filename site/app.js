/**
 * git-grass — Interactive Script (Cursor-style Dark Design)
 * Lightweight, accessible, zero external dependencies
 */

(function () {
  'use strict';

  // 1. Mobile Menu Drawer
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer') || document.querySelector('.mobile-menu');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });

    // Close on link click
    mobileDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
        mobileDrawer.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // 2. Copy Snippet Buttons
  document.querySelectorAll('.btn-copy').forEach((button) => {
    button.addEventListener('click', async () => {
      const textToCopy = button.getAttribute('data-copy') || '';
      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        button.classList.add('copied');
        const iconContainer = button.querySelector('.cursor-copy-icon');
        if (iconContainer) {
          iconContainer.innerHTML = '<svg class="lucide-icon lucide-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
          setTimeout(() => {
            iconContainer.innerHTML = '<svg class="lucide-icon lucide-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>';
            button.classList.remove('copied');
          }, 2000);
        } else {
          const originalText = button.textContent;
          button.textContent = 'Copied';
          setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
          }, 2000);
        }
      } catch {
        window.prompt('Copy command:', textToCopy);
      }
    });
  });

  // 2.5 Package Manager Switcher Tabs (npm | npx | source)
  const tabConfigs = {
    npm: {
      html: '<span class="syn-func">npm</span> <span class="syn-pkg">install</span> <span class="syn-flag">-g</span> <span class="syn-str">git-grass</span>',
      copy: 'npm install -g git-grass && git grass init'
    },
    npx: {
      html: '<span class="syn-func">npx</span> <span class="syn-pkg">git-grass</span> <span class="syn-str">init</span>',
      copy: 'npx git-grass init'
    },
    source: {
      html: '<span class="syn-func">git</span> <span class="syn-pkg">clone</span> <span class="syn-str">github.com/sn3hhaa/git-grass</span>',
      copy: 'git clone https://github.com/sn3hhaa/git-grass.git && cd git-grass && npm install && npm run build'
    }
  };

  function updateSelectorTabs(targetTab) {
    const config = tabConfigs[targetTab];
    if (!config) return;

    document.querySelectorAll('.os-pill').forEach((pill) => {
      const tab = pill.getAttribute('data-tab') || pill.textContent.trim().toLowerCase();
      pill.classList.toggle('active', tab === targetTab);
    });

    const stageCode = document.getElementById('stageCmdCode');
    const stageBox = document.getElementById('stageCmdBox');
    if (stageCode) stageCode.innerHTML = config.html;
    if (stageBox) stageBox.setAttribute('data-copy', config.copy);

    const ctaCode = document.getElementById('ctaCmdCode');
    const ctaBox = document.getElementById('ctaCmdBox');
    if (ctaCode) ctaCode.innerHTML = config.html;
    if (ctaBox) ctaBox.setAttribute('data-copy', config.copy);
  }

  document.querySelectorAll('.os-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const tab = pill.getAttribute('data-tab') || pill.textContent.trim().toLowerCase();
      updateSelectorTabs(tab);
    });
  });

  // 3. Interactive Terminal Workflow Demo
  const demoOutput = document.getElementById('demoConsoleOutput');
  const demoTitle = document.getElementById('demoStepTitle');
  const demoIndicator = document.getElementById('demoStepIndicator');
  const tabBtns = document.querySelectorAll('.demo-tab-btn');
  const btnPrev = document.getElementById('demoBtnPrev');
  const btnNext = document.getElementById('demoBtnNext');
  const btnReset = document.getElementById('demoBtnReset');

  if (demoOutput) {
    const demoSteps = [
      {
        step: 1,
        title: 'bash — git commit (hook intercept)',
        content: `<span class="syn-dim">$</span> <span class="syn-func">git</span> <span class="syn-pkg">commit</span> <span class="syn-flag">-m</span> <span class="syn-str">"feat: distributed cache"</span>

<span class="syn-pkg">[git-grass]</span> Break interval reached (74m since last break).
<span class="syn-dim">Staged tree SHA-1: 4b825dc642cb6eb9... (preserved)</span>
<span class="syn-func">Local pairing URL:</span> <span class="syn-pkg">http://192.168.1.48:4242</span>

<span class="syn-dim">Commit paused. Scan terminal QR or open link to receive challenge.</span>`
      },
      {
        step: 2,
        title: 'phone — outdoor challenge generated',
        content: `<span class="syn-dim">GET /session/grass-7c42 HTTP 200 OK</span>
<span class="syn-func">Repository Context:</span> Systems / distributed-cache
<span class="syn-func">Challenge:</span> <span class="syn-pkg">Kinetic Topology Walk (15m)</span>

<span class="syn-white">Instructions:</span>
  1. Step outside into open air.
  2. Observe pedestrian flow at intersections without central locking.
  3. Keep phone in pocket during walk.

<span class="syn-dim">Status: Developer taps [Start Break] and steps away.</span>`
      },
      {
        step: 3,
        title: 'phone — 10m+ outdoor reflection timer',
        content: `<span class="syn-dim"># [Timer Running on Local Session Server]</span>
<span class="syn-func">Status:</span> BREAK_IN_PROGRESS
<span class="syn-func">Elapsed:</span> <span class="syn-white">15:04</span> (Minimum 10m satisfied)

<span class="syn-white">Reflection Note:</span>
  "Uneven curb grade causes pedestrian queuing, analogous to partition skew in our hash ring."

<span class="syn-dim">Action: Tapped [Confirm Break & Unlock Workstation] on phone.</span>`
      },
      {
        step: 4,
        title: 'bash — git commit verified & unblocked',
        content: `<span class="syn-dim">POST /api/session/grass-7c42/commit HTTP 200 OK</span>
<span class="syn-func">[ok]</span> Cryptographic token verified (timingSafeEqual)
<span class="syn-func">[ok]</span> Staged tree SHA-1 verified (atomic match)

<span class="syn-white">[main a8f910b] feat: distributed cache</span>
<span class="syn-dim">3 files changed, 142 insertions(+)</span>

<span class="syn-pkg">[ok]</span> Commit released and pushed to origin/main.
<span class="syn-dim">$</span> <span class="syn-white">_</span>`
      }
    ];

    let currentStep = 0;

    function renderDemo(idx) {
      currentStep = idx;
      const data = demoSteps[idx];
      demoOutput.innerHTML = data.content;
      if (demoTitle) demoTitle.textContent = data.title;
      if (demoIndicator) demoIndicator.textContent = `Step ${data.step} of ${demoSteps.length}`;

      tabBtns.forEach((btn, bIdx) => {
        btn.classList.toggle('active', bIdx === idx);
      });
    }

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const stepNum = parseInt(btn.getAttribute('data-step') || '0', 10);
        renderDemo(stepNum);
      });
    });

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        const next = (currentStep + 1) % demoSteps.length;
        renderDemo(next);
      });
    }

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        const prev = (currentStep - 1 + demoSteps.length) % demoSteps.length;
        renderDemo(prev);
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        renderDemo(0);
      });
    }

    // Initial render
    renderDemo(0);
  }

  // 4. Challenge Category Filter for Challenge Showcase
  const categoryButtons = document.querySelectorAll('.category-btn');
  const challengeCards = document.querySelectorAll('.challenge-card');

  if (categoryButtons.length && challengeCards.length) {
    categoryButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category') || 'all';
        categoryButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        challengeCards.forEach((card) => {
          const cardCat = card.getAttribute('data-category');
          if (cat === 'all' || cardCat === cat) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // 5. FAQ Accordion for Documentation
  const faqTriggers = document.querySelectorAll('.faq-trigger, .faq-question');
  faqTriggers.forEach((btn) => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.faq-entry') || btn.closest('.faq-item');
      if (!parent) return;
      const isOpen = parent.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });
  });

  // 6. Theme: Pure Dark Developer Tool Mode (Locked to Pitch Dark)
  document.body.setAttribute('data-theme', 'dark');

  // 7. Contact Form AJAX Submission (snehatwiari474@gmail.com)
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btnSubmitContact');
      if (!btn) return;

      const setBtnLabel = (label) => {
        const span = btn.querySelector('span');
        if (!span) {
          btn.innerHTML = `<span>${label}</span>`;
          return;
        }
        span.style.opacity = '0';
        span.style.transform = 'translateY(2px)';
        setTimeout(() => {
          span.textContent = label;
          span.style.opacity = '1';
          span.style.transform = 'translateY(0)';
        }, 150);
      };

      btn.disabled = true;
      setBtnLabel('Sending...');

      const formData = new FormData(contactForm);
      const payload = Object.fromEntries(formData.entries());
      payload._subject = payload.subject ? `[git-grass] ${payload.subject}` : 'New Message from git-grass';
      payload._replyto = payload.email || '';
      payload._captcha = 'false';

      try {
        const response = await fetch('https://formsubmit.co/ajax/snehatwiari474@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        await response.json();
        contactForm.reset();
      } catch {
        contactForm.reset();
      } finally {
        setBtnLabel('Sent!');
        setTimeout(() => {
          setBtnLabel('Send');
          btn.disabled = false;
        }, 2200);
      }
    });
  }

  // 8. Footer Suggestion Form: Redirects directly to Contact Page with pre-filled message
  const suggestionForm = document.getElementById('footerSuggestionForm');
  if (suggestionForm) {
    suggestionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('footerSuggestionInput');
      if (!input || !input.value.trim()) return;

      const userText = input.value.trim();
      const isSubdir = window.location.pathname.includes('/docs/') ||
                       window.location.pathname.includes('/architecture/') ||
                       window.location.pathname.includes('/challenges/') ||
                       window.location.pathname.includes('/changelog/') ||
                       window.location.pathname.includes('/contributing/') ||
                       window.location.pathname.includes('/privacy/') ||
                       window.location.pathname.includes('/license/');
      const basePath = isSubdir ? '../contact/index.html' : 'contact/index.html';
      const targetUrl = `${basePath}?msg=${encodeURIComponent(userText)}&subject=${encodeURIComponent('Feature / Outdoor Challenge Suggestion')}`;
      window.location.href = targetUrl;
    });
  }

  // 8b. Contact Page: Auto pre-fill message & subject from query params
  const contactMsgEl = document.getElementById('contactMessage');
  const contactSubjEl = document.getElementById('contactSubject');
  const contactNameEl = document.getElementById('contactName');
  if (contactMsgEl) {
    const urlParams = new URLSearchParams(window.location.search);
    const prefillMsg = urlParams.get('msg');
    const prefillSubj = urlParams.get('subject');
    if (prefillMsg) {
      contactMsgEl.value = prefillMsg;
    }
    if (prefillSubj && contactSubjEl) {
      contactSubjEl.value = prefillSubj;
    }
    if (prefillMsg && contactNameEl) {
      contactNameEl.focus();
    }
  }

  // 9. Looping Fork / Star Button Transition (Fast loop with Golden Star icon)
  const btnForkLoop = document.getElementById('btnForkLoop');
  const forkLoopText = document.getElementById('forkLoopText');
  const forkLoopIcon = document.getElementById('forkLoopIcon');

  if (forkLoopText) {
    const loopStates = [
      {
        text: 'Fork repository',
        href: 'https://github.com/sn3hhaa/git-grass/fork',
        icon: '<svg class="lucide-icon lucide-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><circle cx="18" cy="6" r="3"></circle><path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9"></path><path d="M12 12v3"></path></svg>'
      },
      {
        text: 'Star on GitHub',
        href: 'https://github.com/sn3hhaa/git-grass',
        icon: '<svg class="lucide-icon lucide-icon-sm" viewBox="0 0 24 24" fill="#EAB308" stroke="#EAB308" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>'
      }
    ];
    let loopIdx = 0;
    setInterval(() => {
      forkLoopText.style.opacity = '0';
      forkLoopText.style.transform = 'translateY(2px)';
      if (forkLoopIcon) {
        forkLoopIcon.style.opacity = '0';
        forkLoopIcon.style.transform = 'scale(0.85)';
      }
      setTimeout(() => {
        loopIdx = (loopIdx + 1) % loopStates.length;
        const current = loopStates[loopIdx];
        forkLoopText.textContent = current.text;
        if (btnForkLoop) btnForkLoop.href = current.href;
        if (forkLoopIcon) {
          forkLoopIcon.innerHTML = current.icon;
          forkLoopIcon.style.opacity = '1';
          forkLoopIcon.style.transform = 'scale(1)';
        }
        forkLoopText.style.opacity = '1';
        forkLoopText.style.transform = 'translateY(0)';
      }, 180);
    }, 1600);
  }

  // 10. Contact / Suggestion / Report Issue Intent Switcher (Image 3)
  const intentPills = document.querySelectorAll('.intent-pill');
  const contactHeading = document.getElementById('contactHeading');
  const contactSubtitle = document.getElementById('contactSubtitle');
  const contactSubject = document.getElementById('contactSubject');

  if (intentPills.length && contactHeading) {
    const intentData = {
      contact: {
        heading: "Let's connect.",
        subtitle: 'Have a question about git-grass, architecture, or open-source collaboration? Reach out directly.',
        placeholder: 'Question or collaboration inquiry'
      },
      suggest: {
        heading: 'Suggest an idea.',
        subtitle: 'Have a clever physical outdoor challenge or workflow feature idea? We would love to add it.',
        placeholder: 'Challenge suggestion or feature proposal'
      },
      report: {
        heading: 'Report an issue.',
        subtitle: 'Encountered unexpected hook behavior, session glitch, or platform bug? Let us know.',
        placeholder: 'Bug report / unexpected behavior'
      }
    };

    intentPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const intent = pill.getAttribute('data-intent');
        intentPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');

        const data = intentData[intent];
        if (data) {
          contactHeading.textContent = data.heading;
          if (contactSubtitle) contactSubtitle.textContent = data.subtitle;
          if (contactSubject) contactSubject.value = data.placeholder;
        }
      });
    });
  }

  // 11. Docs Left Sidebar Interactive Accordion
  document.querySelectorAll('.doc-nav-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.doc-nav-group');
      if (group) {
        group.classList.toggle('collapsed');
      }
    });
  });
})();
