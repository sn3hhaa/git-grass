// git-grass mobile client application
(function () {
  'use strict';

  // Extract query parameters
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session') || '';
  const token = params.get('token') || '';

  // App state
  let currentSession = null;
  let timerInterval = null;
  let selectedDurationMinutes = 15;
  let isStandaloneMode = params.get('mode') === 'standalone';

  const standaloneCatalog = [
    {
      title: 'Distributed Infrastructure Walk',
      category: 'systems',
      durationMinutes: 15,
      instructions: [
        'Lock your phone and step outside for a 15-minute walk.',
        'Observe physical infrastructure: utility lines, drainage channels, traffic signals, or street routing.',
        'Notice how physical systems handle redundancy, bottlenecks, and load balancing.'
      ],
      reflectionPrompt: 'What physical routing junction or infrastructure detail reminded you of backend architecture?',
      safetyNotes: ['Stay on pedestrian walkways and remain aware of traffic at intersections.']
    },
    {
      title: 'Everyday Information Systems',
      category: 'web',
      durationMinutes: 15,
      instructions: [
        'Step outside and walk at a relaxed pace without looking at your screen.',
        'Examine public physical signage, street markers, architectural wayfinding, and natural light contrast.',
        'Observe how distance, glare, and typography affect human readability outdoors.'
      ],
      reflectionPrompt: 'What design element made a physical sign or landmark immediately clear from a distance?',
      safetyNotes: ['Keep your head up and watch for uneven pavement or cyclists.']
    },
    {
      title: 'Real-World Level Designer',
      category: 'gamedev',
      durationMinutes: 15,
      instructions: [
        'Step outside and treat your neighborhood block like an open-world level.',
        'Spot 3 distinct elevation shifts, natural choke points, or sightline blockers.',
        'Observe how sunlight and shadow guide visual attention across the environment.'
      ],
      reflectionPrompt: 'Which physical obstacle or sightline outdoors could inspire an engaging level mechanic?',
      safetyNotes: ['Do not enter restricted areas or private property while exploring.']
    },
    {
      title: 'Pattern & Texture Observer',
      category: 'ml',
      durationMinutes: 15,
      instructions: [
        'Walk outdoors and focus your vision on natural high-dimensional data: tree bark, leaf veins, cloud formations.',
        'Compare two similar natural objects and identify the subtle variance between them.',
        'Rest your eyes by alternating between close-up textures and the furthest horizon.'
      ],
      reflectionPrompt: 'What distinctive feature made one natural pattern stand out from surrounding noise?',
      safetyNotes: ['Avoid touching unfamiliar plants or wildlife during observation.']
    },
    {
      title: 'Soundscape Explorer',
      category: 'audio',
      durationMinutes: 15,
      instructions: [
        'Step outside without headphones or earbuds.',
        'Identify three distinct acoustic layers: a near sound, a mid-range sound, and a distant ambient sound.',
        'Notice how buildings, trees, and wind shape reverberation and directional audio.'
      ],
      reflectionPrompt: 'Which outdoor sound was most subtle once you tuned out the primary ambient noise?',
      safetyNotes: ['Maintain full situational awareness near roads and crossings.']
    }
  ];

  // DOM elements
  const views = {
    loading: document.getElementById('stateLoading'),
    error: document.getElementById('stateError'),
    setup: document.getElementById('stateSetup'),
    challenge: document.getElementById('stateChallenge'),
    inProgress: document.getElementById('stateInProgress'),
    completion: document.getElementById('stateCompletion'),
    committing: document.getElementById('stateCommitting'),
    success: document.getElementById('stateSuccess')
  };

  const headerStatusBadge = document.getElementById('headerStatusBadge');
  const repoNameTag = document.getElementById('repoNameTag');
  const categoryTag = document.getElementById('categoryTag');
  const durationSelector = document.getElementById('durationSelector');
  const btnViewChallenge = document.getElementById('btnViewChallenge');
  const btnStartBreak = document.getElementById('btnStartBreak');
  const btnRetryConnection = document.getElementById('btnRetryConnection');
  const btnStandaloneChallenge = document.getElementById('btnStandaloneChallenge');
  const btnCheckTimer = document.getElementById('btnCheckTimer');

  const challengeTitle = document.getElementById('challengeTitle');
  const challengeCategoryLabel = document.getElementById('challengeCategoryLabel');
  const challengeDurationLabel = document.getElementById('challengeDurationLabel');
  const instructionsList = document.getElementById('instructionsList');
  const safetyList = document.getElementById('safetyList');

  const timerValue = document.getElementById('timerValue');
  const timerSubLabel = document.getElementById('timerSubLabel');
  const timerProgressBar = document.getElementById('timerProgressBar');
  const reflectionPromptPreview = document.getElementById('reflectionPromptPreview');

  const completionForm = document.getElementById('completionForm');
  const reflectionLabel = document.getElementById('reflectionLabel');
  const reflectionInput = document.getElementById('reflectionInput');
  const commitMessageInput = document.getElementById('commitMessageInput');

  const receiptCommitHash = document.getElementById('receiptCommitHash');
  const receiptCommitMsg = document.getElementById('receiptCommitMsg');
  const receiptPushStatus = document.getElementById('receiptPushStatus');
  const pushReceiptRow = document.getElementById('pushReceiptRow');
  const receiptBreakDuration = document.getElementById('receiptBreakDuration');
  const btnShareProduct = document.getElementById('btnShareProduct');
  const shareFeedback = document.getElementById('shareFeedback');

  const errorMessageTitle = document.getElementById('errorMessageTitle');
  const errorMessageBody = document.getElementById('errorMessageBody');

  function switchView(viewKey) {
    Object.values(views).forEach((v) => {
      if (v) v.classList.remove('active');
    });
    if (views[viewKey]) {
      views[viewKey].classList.add('active');
    }
  }

  function showError(title, message) {
    if (errorMessageTitle) errorMessageTitle.textContent = title;
    if (errorMessageBody) errorMessageBody.textContent = message;
    switchView('error');
  }

  function decodeEmbeddedChallenge() {
    const chParam = params.get('ch');
    if (!chParam) return null;
    try {
      const b64 = chParam.replace(/-/g, '+').replace(/_/g, '/');
      const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : '';
      const bytes = Uint8Array.from(atob(b64 + pad), (c) => c.charCodeAt(0));
      const jsonStr = new TextDecoder().decode(bytes);
      const parsed = JSON.parse(jsonStr);
      if (parsed && parsed.title && Array.isArray(parsed.instructions)) {
        return parsed;
      }
    } catch {
      // ignore decode error
    }
    return null;
  }

  function startStandaloneMode() {
    isStandaloneMode = true;
    const requestedCat = params.get('cat') || params.get('category') || 'systems';
    const requestedDur = parseInt(params.get('dur') || '15', 10) || 15;
    selectedDurationMinutes = requestedDur;
    const embedded = decodeEmbeddedChallenge();
    const picked = embedded || standaloneCatalog.find((c) => c.category === requestedCat) || standaloneCatalog[0];

    currentSession = {
      sessionId: sessionId,
      repositoryName: params.get('repo') || 'repository',
      status: 'SESSION_CREATED',
      requiredDurationMinutes: selectedDurationMinutes,
      breakStartedAt: null,
      challenge: { ...picked, durationMinutes: selectedDurationMinutes },
      commitMessage: '',
      commitResult: { commitHash: 'verified-outdoor' },
      pushResult: { attempted: false }
    };
    if (categoryTag) categoryTag.textContent = picked.category;
    renderSessionState();
  }

  async function apiRequest(path, method = 'GET', body = null) {
    const url = `/api/session/${sessionId}${path}?token=${encodeURIComponent(token)}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    };
    if (body) {
      options.body = JSON.stringify({ ...body, token });
    }

    const res = await fetch(url, options);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Server request failed');
    }
    return data;
  }

  async function loadInitialSession() {
    if (!sessionId || !token) {
      if (headerStatusBadge) headerStatusBadge.textContent = 'Idle';
      switchView('error');
      return;
    }

    try {
      const data = await apiRequest('');
      currentSession = data.session;
      renderSessionState();
    } catch {
      // Phone scanned a valid CLI QR code (sessionId & token present) on mobile data:
      // seamlessly load the CLI-assigned challenge encoded in the QR URL parameters
      startStandaloneMode();
    }
  }

  function renderSessionState() {
    if (!currentSession) return;

    if (repoNameTag) repoNameTag.textContent = currentSession.repositoryName || 'Repository';

    const status = currentSession.status;

    if (status === 'SESSION_CREATED' || status === 'IDLE' || status === 'BREAK_REQUIRED') {
      if (headerStatusBadge) headerStatusBadge.textContent = 'Setup';
      switchView('setup');
    } else if (status === 'CHALLENGE_READY') {
      renderChallengeView();
    } else if (status === 'BREAK_IN_PROGRESS') {
      startInProgressTimer();
    } else if (status === 'AWAITING_COMPLETION' || status === 'COMPLETED') {
      renderCompletionForm();
    } else if (status === 'COMMITTING') {
      switchView('committing');
      pollStatusUntilFinished();
    } else if (status === 'COMMITTED' || status === 'PUSHED' || status === 'PUSH_FAILED') {
      renderSuccessView();
    } else {
      renderChallengeView();
    }
  }

  function renderChallengeView() {
    if (headerStatusBadge) headerStatusBadge.textContent = 'Challenge';
    const challenge = currentSession.challenge;
    if (!challenge) {
      switchView('setup');
      return;
    }

    if (challengeTitle) challengeTitle.textContent = challenge.title;
    if (challengeCategoryLabel) challengeCategoryLabel.textContent = challenge.category;
    if (challengeDurationLabel) challengeDurationLabel.textContent = `${challenge.durationMinutes} min`;
    if (categoryTag) categoryTag.textContent = challenge.category;

    if (instructionsList) {
      instructionsList.innerHTML = '';
      challenge.instructions.forEach((step) => {
        const li = document.createElement('li');
        li.textContent = step;
        instructionsList.appendChild(li);
      });
    }

    if (safetyList) {
      safetyList.innerHTML = '';
      challenge.safetyNotes.forEach((note) => {
        const li = document.createElement('li');
        li.textContent = note;
        safetyList.appendChild(li);
      });
    }

    switchView('challenge');
  }

  function startInProgressTimer() {
    if (headerStatusBadge) headerStatusBadge.textContent = 'Active Walk';
    switchView('inProgress');

    if (currentSession.challenge && reflectionPromptPreview) {
      reflectionPromptPreview.textContent = currentSession.challenge.reflectionPrompt;
    }

    if (timerInterval) clearInterval(timerInterval);

    function update() {
      if (!currentSession || !currentSession.breakStartedAt) return;
      const startTime = new Date(currentSession.breakStartedAt).getTime();
      const requiredMs = currentSession.requiredDurationMinutes * 60 * 1000;
      const now = Date.now();
      const elapsedMs = now - startTime;
      const remainingMs = Math.max(0, requiredMs - elapsedMs);

      const totalSecondsRemaining = Math.ceil(remainingMs / 1000);
      const minutes = Math.floor(totalSecondsRemaining / 60);
      const seconds = totalSecondsRemaining % 60;

      if (timerValue) {
        timerValue.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }

      const fraction = Math.min(1, elapsedMs / requiredMs);
      if (timerProgressBar) {
        timerProgressBar.style.width = `${Math.round(fraction * 100)}%`;
      }

      if (timerSubLabel) {
        if (remainingMs > 0) {
          timerSubLabel.textContent = `Remaining of ${currentSession.requiredDurationMinutes} min outdoor walk`;
        } else {
          timerSubLabel.textContent = 'Break duration satisfied! Step indoors to check in.';
        }
      }

      if (remainingMs <= 0) {
        clearInterval(timerInterval);
        renderCompletionForm();
      }
    }

    update();
    timerInterval = setInterval(update, 1000);
  }

  function renderCompletionForm() {
    if (headerStatusBadge) headerStatusBadge.textContent = 'Check-in';
    switchView('completion');

    if (currentSession.challenge && reflectionLabel) {
      reflectionLabel.textContent = `Reflection: "${currentSession.challenge.reflectionPrompt}"`;
    }

    if (currentSession.commitMessage && commitMessageInput) {
      commitMessageInput.value = currentSession.commitMessage;
    }
  }

  function renderSuccessView() {
    if (headerStatusBadge) headerStatusBadge.textContent = 'Success';
    switchView('success');

    if (receiptCommitHash) {
      receiptCommitHash.textContent = currentSession.commitResult?.commitHash || 'Committed';
    }
    if (receiptCommitMsg) {
      receiptCommitMsg.textContent = currentSession.commitMessage || 'git-grass commit';
    }

    if (pushReceiptRow && receiptPushStatus) {
      if (currentSession.pushResult?.attempted) {
        pushReceiptRow.style.display = 'flex';
        receiptPushStatus.textContent = currentSession.pushResult.success
          ? `Pushed to ${currentSession.pushResult.remote}/${currentSession.pushResult.branch}`
          : `Push failed: ${currentSession.pushResult.error || 'Check network'}`;
      } else {
        pushReceiptRow.style.display = 'none';
      }
    }

    if (receiptBreakDuration) {
      const mins = currentSession.requiredDurationMinutes || 10;
      receiptBreakDuration.textContent = `${mins} minutes outdoors`;
    }
  }

  async function pollStatusUntilFinished() {
    const pollInterval = setInterval(async () => {
      try {
        const data = await apiRequest('/status');
        if (data.status === 'COMMITTED' || data.status === 'PUSHED' || data.status === 'PUSH_FAILED') {
          clearInterval(pollInterval);
          currentSession.status = data.status;
          currentSession.commitResult = data.commitResult;
          currentSession.pushResult = data.pushResult;
          renderSuccessView();
        }
      } catch {
        // keep polling
      }
    }, 2000);
  }

  // Event handlers
  const domainSelector = document.getElementById('domainSelector');
  const btnBackToSetup = document.getElementById('btnBackToSetup');

  if (domainSelector) {
    domainSelector.addEventListener('click', (e) => {
      const target = e.target.closest('.duration-chip');
      if (!target) return;
      domainSelector.querySelectorAll('.duration-chip').forEach((c) => c.classList.remove('selected'));
      target.classList.add('selected');
      const domain = target.dataset.domain || 'systems';
      const picked = standaloneCatalog.find((c) => c.category === domain) || standaloneCatalog[0];
      if (currentSession) {
        currentSession.challenge = { ...picked, durationMinutes: selectedDurationMinutes };
      }
      if (categoryTag) categoryTag.textContent = domain;
    });
  }

  if (durationSelector) {
    durationSelector.addEventListener('click', (e) => {
      const target = e.target.closest('.duration-chip');
      if (!target) return;
      durationSelector.querySelectorAll('.duration-chip').forEach((c) => c.classList.remove('selected'));
      target.classList.add('selected');
      selectedDurationMinutes = parseInt(target.dataset.mins || '15', 10);
    });
  }

  if (btnBackToSetup) {
    btnBackToSetup.addEventListener('click', () => {
      switchView('setup');
    });
  }

  if (btnViewChallenge) {
    btnViewChallenge.addEventListener('click', () => {
      if (currentSession && currentSession.challenge) {
        currentSession.requiredDurationMinutes = selectedDurationMinutes;
        currentSession.challenge.durationMinutes = selectedDurationMinutes;
      }
      renderChallengeView();
    });
  }

  if (btnStandaloneChallenge) {
    btnStandaloneChallenge.addEventListener('click', () => {
      startStandaloneMode();
    });
  }

  if (btnStartBreak) {
    btnStartBreak.addEventListener('click', async () => {
      btnStartBreak.disabled = true;
      btnStartBreak.textContent = 'Starting...';

      if (isStandaloneMode) {
        currentSession.breakStartedAt = new Date().toISOString();
        currentSession.status = 'BREAK_IN_PROGRESS';
        btnStartBreak.disabled = false;
        btnStartBreak.textContent = 'Start Break & Step Outside';
        startInProgressTimer();
        return;
      }

      try {
        const data = await apiRequest('/start', 'POST');
        currentSession = data.session;
        startInProgressTimer();
      } catch (err) {
        // Fallback to standalone timer if phone switched to mobile data outdoors
        isStandaloneMode = true;
        currentSession.breakStartedAt = new Date().toISOString();
        currentSession.status = 'BREAK_IN_PROGRESS';
        startInProgressTimer();
      } finally {
        btnStartBreak.disabled = false;
        btnStartBreak.textContent = 'Start Break & Step Outside';
      }
    });
  }

  if (btnCheckTimer) {
    btnCheckTimer.addEventListener('click', async () => {
      if (isStandaloneMode) {
        const startTime = new Date(currentSession.breakStartedAt).getTime();
        const elapsedMins = Math.floor((Date.now() - startTime) / 60000);
        if (elapsedMins >= currentSession.requiredDurationMinutes) {
          if (timerInterval) clearInterval(timerInterval);
          renderCompletionForm();
        } else {
          alert(`Standalone Timer: ${elapsedMins} of ${currentSession.requiredDurationMinutes} minutes completed.`);
        }
        return;
      }

      try {
        const data = await apiRequest('/status');
        if (data.satisfied) {
          if (timerInterval) clearInterval(timerInterval);
          renderCompletionForm();
        } else {
          alert(`Timer verified with workstation: ${data.elapsedMinutes} of ${data.requiredDurationMinutes} minutes completed.`);
        }
      } catch (err) {
        alert(err.message || 'Workstation unreachable');
      }
    });
  }

  if (completionForm) {
    completionForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const reflection = reflectionInput ? reflectionInput.value.trim() : '';
      const commitMsg = commitMessageInput ? commitMessageInput.value.trim() : '';

      if (!reflection) {
        alert('Please answer the reflection prompt.');
        return;
      }
      if (!commitMsg) {
        alert('Please provide a Git commit message.');
        return;
      }

      switchView('committing');

      if (isStandaloneMode) {
        currentSession.userReflection = reflection;
        currentSession.commitMessage = commitMsg;
        currentSession.status = 'COMMITTED';
        currentSession.commitResult = { commitHash: 'outdoor-verified' };
        setTimeout(() => {
          renderSuccessView();
        }, 500);
        return;
      }

      try {
        // Step 1: Complete break check-in
        await apiRequest('/complete', 'POST', {
          reflection,
          commitMessage: commitMsg
        });

        // Step 2: Trigger workstation commit & push
        const commitData = await apiRequest('/commit', 'POST', {
          commitMessage: commitMsg
        });

        currentSession = commitData.session;
        renderSuccessView();
      } catch (err) {
        alert(err.message || 'Error completing commit.');
        switchView('completion');
      }
    });
  }

  if (btnRetryConnection) {
    btnRetryConnection.addEventListener('click', () => {
      isStandaloneMode = false;
      switchView('loading');
      loadInitialSession();
    });
  }

  if (btnShareProduct) {
    btnShareProduct.addEventListener('click', async () => {
      const shareData = {
        title: 'git-grass — Open-Source Developer Wellness',
        text: 'Your AI can write the code. It cannot touch grass. Just completed an outdoor break with git-grass.',
        url: 'https://github.com/sn3hhaa/git-grass'
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
          return;
        } catch (err) {
          if (err.name === 'AbortError') return;
        }
      }

      // Safe fallback: copy public project URL to clipboard without any sensitive data
      try {
        await navigator.clipboard.writeText('https://github.com/sn3hhaa/git-grass');
        if (shareFeedback) {
          shareFeedback.style.display = 'block';
          setTimeout(() => {
            if (shareFeedback) shareFeedback.style.display = 'none';
          }, 3500);
        }
      } catch {
        alert('git-grass repository: https://github.com/sn3hhaa/git-grass');
      }
    });
  }

  // Boot
  loadInitialSession();
})();
