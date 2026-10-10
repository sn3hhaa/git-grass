/**
 * git-grass — Public Website Interactive Script
 * Lightweight, zero-dependency, accessible vanilla JS
 */

(function () {
  'use strict';

  // 1. Mobile Menu Drawer
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');

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
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('copied');
        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('copied');
        }, 2000);
      } catch {
        // Fallback prompt
        window.prompt('Copy command:', textToCopy);
      }
    });
  });

  // 3. Interactive Terminal Workflow Demo
  const demoContainer = document.getElementById('interactiveTerminal');
  if (demoContainer) {
    const demoSteps = [
      {
        step: 1,
        title: 'bash — git commit (hook intercept)',
        tabName: '1. Commit Gate Triggered',
        content: `<span class="term-dim">$</span> <span class="term-white">git commit -m "feat: complete distributed cache cluster"</span>

<span class="term-green">🌱 git-grass</span>

<span class="term-bold">Your AI can write the code.
It can't touch grass.</span>

<span class="term-amber">A break is required.</span>
Last outdoor break: <span class="term-white">74 minutes ago</span> (configured interval: 60 min)
Minimum required duration: <span class="term-green">10 minutes</span>
Your staged index tree is fingerprinted and safely preserved.

Scan the QR code to receive your project-aware challenge:

  <span class="term-green">█████████████████████████████████</span>
  <span class="term-green">████ ▄▄▄▄▄ █▀▄█▄ ▀█ █ ▄▄▄▄▄ ████</span>
  <span class="term-green">████ █   █ █ █ ▀█ ▄ █ █   █ ████</span>
  <span class="term-green">████ █▄▄▄█ █▀█▀ █▄▀ █ █▄▄▄█ ████</span>
  <span class="term-green">████▄▄▄▄▄▄▄█▄▀ ▀▄█▄▀█▄▄▄▄▄▄▄████</span>
  <span class="term-green">████ █▄▀ ▄▄  ▄█▀▄ ▀ ▀▀▄▄▀▄ ▄████</span>
  <span class="term-green">████ ▄▄▄▄▄ █▄█ ▀ ▄ ▄█ ▄ █  █████</span>
  <span class="term-green">█████████████████████████████████</span>

Or open in your phone's browser:
<span class="term-green">http://192.168.1.142:4242/?session=grass-7c42&token=9e81b...</span>

<span class="term-dim">Commit paused. Staged index locked until outdoor break check-in.</span>`
      },
      {
        step: 2,
        title: 'phone — challenge generated',
        tabName: '2. Mobile Challenge View',
        content: `<span class="term-dim"># [Mobile Browser on Local Wi-Fi]</span>
<span class="term-green">GET /api/session/grass-7c42?token=9e81b...</span> <span class="term-white">HTTP 200 OK</span>

<span class="term-green">✓ Repository Context Detected:</span> distributed-cache (category: <span class="term-white">systems</span>)
<span class="term-green">✓ AI Challenge Source:</span> Hosted Backboard AI (<span class="term-white">gemini-2.0-flash</span>)

<span class="term-bold term-white">Title: Kinetic Topology & Flow Walk</span>
<span class="term-dim">Category: Systems | Duration: 15 minutes (Phone-Free)</span>

<span class="term-white">Instructions:</span>
  1. Step away from your workstation into open air for 15 minutes.
  2. Walk to a public pathway intersection or observe natural branch bifurcations.
  3. Observe how physical pathways route traffic or water without centralized coordination.
  4. Keep your phone in your pocket. Do not take photos or open chat apps.

<span class="term-white">Reflection Prompt:</span>
  "How does physical pathway congestion compare to partition bottlenecks in your cluster?"

<span class="term-amber">Action:</span> Developer taps <span class="term-green">[Start Break & Step Outside 🌲]</span> and locks screen.`
      },
      {
        step: 3,
        title: 'phone — 15m outdoor walk & check-in',
        tabName: '3. 10m+ Timer & Check-In',
        content: `<span class="term-dim"># [Timer Running on Workstation & Phone]</span>
Status: <span class="term-green">BREAK_IN_PROGRESS</span>
Elapsed: <span class="term-white">15:02</span> (Minimum 10:00 satisfied)

<span class="term-dim">Developer returns refreshed from outdoor stroll.</span>
<span class="term-dim">Phone browser prompts for post-walk check-in:</span>

<span class="term-white">Reflection Prompt:</span>
  "How does physical pathway congestion compare to partition bottlenecks in your cluster?"

<span class="term-green">User Reflection:</span>
  <span class="term-white">"At the corner intersection, uneven road grade creates natural queuing.
  Similarly, our Redis key distribution lacks uniform hashing over hash rings."</span>

<span class="term-white">Commit Message:</span>
  <span class="term-white">"feat(cache): implement uniform hash-ring partition routing"</span>

<span class="term-amber">Action:</span> Developer taps <span class="term-green">[Commit & Release Workstation 🚀]</span>`
      },
      {
        step: 4,
        title: 'bash — git commit verified & unblocked',
        tabName: '4. Atomic Commit & Push',
        content: `<span class="term-dim"># [Workstation Server Validates Session Token & Staging Index]</span>
<span class="term-green">POST /api/session/grass-7c42/commit</span> <span class="term-white">HTTP 200 OK</span>

<span class="term-green">✓ Cryptographic token verified (constant-time equality)</span>
<span class="term-green">✓ Staged tree SHA-1 verified: 4b825dc642cb6eb9a060e54bf8d69288fbee4904</span>
<span class="term-green">✓ Safe process execution: git commit -m "feat(cache): implement uniform..."</span>

[main a8f910b] feat(cache): implement uniform hash-ring partition routing
 3 files changed, 142 insertions(+), 18 deletions(-)

<span class="term-green">✓ Auto-pushing to origin/main...</span>
To github.com:user/distributed-cache.git
   149e21f..a8f910b  main -> main

<span class="term-bold term-green">✓ Workstation released. You took your break and touched grass!</span>
<span class="term-dim">$</span> <span class="term-white">_</span>`
      }
    ];

    let currentStepIdx = 0;
    const bodyEl = demoContainer.querySelector('.terminal-body pre');
    const titleEl = demoContainer.querySelector('.terminal-title');
    const stepIndEl = demoContainer.querySelector('.step-indicator');
    const tabsContainer = demoContainer.querySelector('.terminal-tabs');

    function renderStep(idx) {
      currentStepIdx = idx;
      const data = demoSteps[idx];
      if (bodyEl) bodyEl.innerHTML = data.content;
      if (titleEl) titleEl.textContent = data.title;
      if (stepIndEl) stepIndEl.textContent = `Step ${data.step} of ${demoSteps.length}`;

      if (tabsContainer) {
        tabsContainer.querySelectorAll('.terminal-tab').forEach((tab, tIdx) => {
          tab.classList.toggle('active', tIdx === idx);
        });
      }
    }

    const btnNext = document.getElementById('demoBtnNext');
    const btnPrev = document.getElementById('demoBtnPrev');
    const btnReset = document.getElementById('demoBtnReset');

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        const next = (currentStepIdx + 1) % demoSteps.length;
        renderStep(next);
      });
    }

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        const prev = (currentStepIdx - 1 + demoSteps.length) % demoSteps.length;
        renderStep(prev);
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        renderStep(0);
      });
    }

    if (tabsContainer) {
      tabsContainer.querySelectorAll('.terminal-tab').forEach((tab, tIdx) => {
        tab.addEventListener('click', () => {
          renderStep(tIdx);
        });
      });
    }

    // Initial render
    renderStep(0);
  }

  // 4. Challenge Category Filter
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

  // 5. FAQ Accordion
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.faq-item');
      if (!parent) return;
      const isOpen = parent.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });
  });
})();
