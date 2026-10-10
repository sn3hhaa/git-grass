/**
 * git-grass — Interactive Script
 * Lightweight, zero-dependency, accessible vanilla JS with optional GSAP motion
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

      const labelSpan = button.querySelector('span');
      const originalText = labelSpan ? labelSpan.textContent : button.textContent;

      try {
        await navigator.clipboard.writeText(textToCopy);
        if (labelSpan) labelSpan.textContent = 'Copied';
        button.classList.add('copied');
        setTimeout(() => {
          if (labelSpan) labelSpan.textContent = originalText;
          button.classList.remove('copied');
        }, 2000);
      } catch {
        window.prompt('Copy command:', textToCopy);
      }
    });
  });

  // 3. Interactive Product Demonstration (Step-by-step walkthrough)
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
        content: `<span class="tc-dim">$</span> <span class="tc-white">git commit -m "feat: complete distributed cache cluster"</span>

<span class="tc-green">[git-grass]</span>
<span class="tc-white">Your AI can write the code.
It cannot touch grass.</span>

Break interval reached (last break: 74 minutes ago).
Configured interval: 60 min | Minimum duration: 10 min
Staged tree SHA-1: <span class="tc-dim">4b825dc642cb6eb9a060e54bf8d69288fbee4904</span> (fingerprinted)

Local session server active at <span class="tc-green">http://192.168.1.48:4242</span>
Session ID: grass-7c42

<span class="tc-dim">Commit paused. Staged index locked until outdoor check-in.</span>`
      },
      {
        step: 2,
        title: 'phone — outdoor challenge generated',
        content: `<span class="tc-dim"># [Mobile Browser connected over Local Wi-Fi]</span>
<span class="tc-dim">GET /session/grass-7c42</span> <span class="tc-white">HTTP 200 OK</span>

[ok] Repository Context: distributed-cache (category: systems)
[ok] AI Challenge Source: Hosted Inference (Backboard gemini-2.0-flash)

<span class="tc-white">Title: Kinetic Topology & Flow Walk</span>
Category: Systems | Duration: 15 minutes (Phone-Free)

<span class="tc-white">Instructions:</span>
  1. Step outside into open air for 15 minutes.
  2. Walk toward a pathway intersection or trail bifurcation.
  3. Observe how physical pathways route pedestrian or vehicular flow
     without centralized coordination or lock contention.
  4. Keep your phone in your pocket during the walk.

<span class="tc-green">Action: Developer taps [Start Break & Step Outside] and locks screen.</span>`
      },
      {
        step: 3,
        title: 'phone — 10m+ outdoor reflection timer',
        content: `<span class="tc-dim"># [Timer Running on Local Session Server]</span>
Status: <span class="tc-white">BREAK_IN_PROGRESS</span>
Elapsed: <span class="tc-white">15:02</span> (Minimum 10:00 satisfied)

<span class="tc-dim">Developer returns refreshed from outdoor stroll.</span>
<span class="tc-dim">Phone browser prompts for post-walk check-in:</span>

<span class="tc-white">Reflection Prompt:</span>
  "How does physical pathway congestion compare to partition bottlenecks in your cluster?"

<span class="tc-white">User Reflection:</span>
  "Uneven grade at the street corner causes queuing. Similarly, our Redis key
  distribution lacks uniform hashing across partition rings."

<span class="tc-green">Action: Developer taps [Confirm Break & Unlock Workstation]</span>`
      },
      {
        step: 4,
        title: 'bash — git commit verified & unblocked',
        content: `<span class="tc-dim"># [Workstation Server Validates Session Token & Staged Tree Hash]</span>
<span class="tc-dim">POST /api/session/grass-7c42/commit</span> <span class="tc-white">HTTP 200 OK</span>

[ok] Cryptographic token verified (constant-time timingSafeEqual)
[ok] Staged tree SHA-1 verified: 4b825dc642cb6eb9a060e54bf8d69288fbee4904
[ok] Executing atomic commit: git commit -m "feat(cache): implement uniform..."

[main a8f910b] feat(cache): implement uniform hash-ring partition routing
 3 files changed, 142 insertions(+), 18 deletions(-)

<span class="tc-white">[ok] Auto-pushing to origin/main...</span>
To github.com:user/distributed-cache.git
   149e21f..a8f910b  main -> main

<span class="tc-green">[ok] Workstation released. You took your break and touched grass.</span>
<span class="tc-dim">$</span> <span class="tc-white">_</span>`
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

  // 4. Challenge Category Filter for Documentation Pages
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

  // 5. FAQ Accordion for Documentation Pages
  const faqTriggers = document.querySelectorAll('.faq-trigger, .faq-question');
  faqTriggers.forEach((btn) => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.faq-entry') || btn.closest('.faq-item');
      if (!parent) return;
      const isOpen = parent.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });
  });

  // 6. Restrained, Accessible GSAP Animations
  if (typeof window.gsap !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const gsap = window.gsap;

    // Subtle hero entrance
    gsap.from('.announcement-pill', { opacity: 0, y: 10, duration: 0.5, ease: 'power2.out', delay: 0.05 });
    gsap.from('.headline', { opacity: 0, y: 14, duration: 0.65, ease: 'power2.out', delay: 0.12 });
    gsap.from('.hero-desc', { opacity: 0, y: 12, duration: 0.6, ease: 'power2.out', delay: 0.2 });
    gsap.from('.hero-cta-group', { opacity: 0, y: 10, duration: 0.5, ease: 'power2.out', delay: 0.28 });
    gsap.from('.hero-asymmetric-stage', { opacity: 0, y: 16, duration: 0.75, ease: 'power2.out', delay: 0.35 });

    // Subtle scroll reveals
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.from(entry.target, { opacity: 0, y: 16, duration: 0.6, ease: 'power2.out' });
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      document.querySelectorAll('.bento-card, .interactive-demo-card, .install-box').forEach((el) => {
        observer.observe(el);
      });
    }
  }
})();
