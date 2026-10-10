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
      showError('Invalid Link', 'Session ID or security token is missing from the URL. Please scan the QR code again.');
      return;
    }

    try {
      const data = await apiRequest('');
      currentSession = data.session;
      renderSessionState();
    } catch (err) {
      showError('Connection Error', err.message || 'Cannot reach workstation server.');
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
  if (durationSelector) {
    durationSelector.addEventListener('click', (e) => {
      const target = e.target.closest('.duration-chip');
      if (!target) return;
      document.querySelectorAll('.duration-chip').forEach((c) => c.classList.remove('selected'));
      target.classList.add('selected');
      selectedDurationMinutes = parseInt(target.dataset.mins || '15', 10);
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

  if (btnStartBreak) {
    btnStartBreak.addEventListener('click', async () => {
      btnStartBreak.disabled = true;
      btnStartBreak.textContent = 'Starting...';
      try {
        const data = await apiRequest('/start', 'POST');
        currentSession = data.session;
        startInProgressTimer();
      } catch (err) {
        alert(err.message || 'Failed to start break');
        btnStartBreak.disabled = false;
        btnStartBreak.textContent = 'Start Break & Step Outside';
      }
    });
  }

  if (btnCheckTimer) {
    btnCheckTimer.addEventListener('click', async () => {
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
