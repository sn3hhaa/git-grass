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
        content: `<span class="syn-dim">$</span> git commit -m "feat: complete distributed cache cluster"

<span class="syn-periwinkle">[git-grass]</span>
<span class="syn-white">Your AI can write the code.
It cannot touch grass.</span>

Break interval reached (last break: 74 minutes ago).
Configured interval: 60 min | Minimum duration: 10 min
Staged tree SHA-1: <span class="syn-dim">4b825dc642cb6eb9a060e54bf8d69288fbee4904</span> (fingerprinted)

Local session server listening on <span class="syn-periwinkle">http://192.168.1.48:4242</span>
Session ID: grass-7c42

<span class="syn-dim">Commit paused. Staged index locked until outdoor check-in.</span>`
      },
      {
        step: 2,
        title: 'phone — outdoor challenge generated',
        content: `<span class="syn-dim"># [Mobile Browser connected over Local Wi-Fi]</span>
<span class="syn-dim">GET /session/grass-7c42</span> <span class="syn-white">HTTP 200 OK</span>

[ok] Repository Context: distributed-cache (category: systems)
[ok] AI Challenge Source: Hosted Inference (Backboard gemini-2.0-flash)

<span class="syn-white">Title: Kinetic Topology & Flow Walk</span>
Category: Systems | Duration: 15 minutes (Phone-Free)

<span class="syn-white">Instructions:</span>
  1. Step outside into open air for 15 minutes.
  2. Walk toward a pathway intersection or trail bifurcation.
  3. Observe how physical pathways route pedestrian flow
     without centralized coordination or lock contention.
  4. Keep your phone in your pocket during the walk.

<span class="syn-periwinkle">Action: Developer taps [Start Break & Step Outside] and locks screen.</span>`
      },
      {
        step: 3,
        title: 'phone — 10m+ outdoor reflection timer',
        content: `<span class="syn-dim"># [Timer Running on Local Session Server]</span>
Status: <span class="syn-white">BREAK_IN_PROGRESS</span>
Elapsed: <span class="syn-white">15:02</span> (Minimum 10:00 satisfied)

<span class="syn-dim">Developer returns refreshed from outdoor stroll.</span>
<span class="syn-dim">Phone browser prompts for post-walk check-in:</span>

<span class="syn-white">Reflection Prompt:</span>
  "How does physical pathway congestion compare to partition bottlenecks in your cluster?"

<span class="syn-white">User Reflection:</span>
  "Uneven grade at the street corner causes queuing. Similarly, our Redis key
  distribution lacks uniform hashing across partition rings."

<span class="syn-periwinkle">Action: Developer taps [Confirm Break & Unlock Workstation]</span>`
      },
      {
        step: 4,
        title: 'bash — git commit verified & unblocked',
        content: `<span class="syn-dim"># [Workstation Server Validates Session Token & Staged Tree Hash]</span>
<span class="syn-dim">POST /api/session/grass-7c42/commit</span> <span class="syn-white">HTTP 200 OK</span>

[ok] Cryptographic token verified (constant-time timingSafeEqual)
[ok] Staged tree SHA-1 verified: 4b825dc642cb6eb9a060e54bf8d69288fbee4904
[ok] Executing atomic commit: git commit -m "feat(cache): implement uniform..."

[main a8f910b] feat(cache): implement uniform hash-ring partition routing
 3 files changed, 142 insertions(+), 18 deletions(-)

<span class="syn-white">[ok] Auto-pushing to origin/main...</span>
To github.com:user/distributed-cache.git
   149e21f..a8f910b  main -> main

<span class="syn-periwinkle">[ok] Workstation released. You took your break and touched grass.</span>
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
})();
