document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const toggle = document.getElementById('theme-toggle');
  const footer = document.querySelector('footer p');
  const hamburger = document.getElementById('hamburger');
  const navList = document.querySelector('nav ul');
  const fills = document.querySelectorAll('.fill');


  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    toggle.checked = true;
  }

  toggle.addEventListener('change', () => {
    body.classList.toggle('dark-mode');
    localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
  });

  
  const year = new Date().getFullYear();
  footer.innerHTML = `&copy; ${year} Kiss-Horkai László`;

 
  hamburger.addEventListener('click', () => {
    navList.classList.toggle('active');
  });


  window.addEventListener('scroll', () => {
    const skillsSection = document.querySelector('.skills');
    if (!skillsSection) return;
    const position = skillsSection.getBoundingClientRect().top;
    const screenPosition = window.innerHeight / 1.3;

    if (position < screenPosition) {
      fills.forEach(fill => {
        const percent = fill.getAttribute('data-percent');
        fill.style.width = percent;
      });
    }
  });

  const accountBtn = document.getElementById('account-link');
  const dropdown = document.getElementById('account-dropdown');
  const authPanel = document.getElementById('auth-panel');
  const userInfo = document.getElementById('user-info');
  const authTitle = document.getElementById('auth-title');
  const authUsername = document.getElementById('auth-username');
  const authEmail = document.getElementById('auth-email');
  const authBtn = document.getElementById('auth-btn');
  const authToggleText = document.getElementById('auth-toggle');
  const loggedUser = document.getElementById('logged-user');
  const logoutBtn = document.getElementById('logout-btn');

  let isRegistering = false;

  function updateUI() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      authPanel.classList.add('hidden');
      userInfo.classList.remove('hidden');
      loggedUser.textContent = user.username;
    } else {
      userInfo.classList.add('hidden');
      authPanel.classList.remove('hidden');
    }
  }

  function updateToggleText() {
    authToggleText.innerHTML = isRegistering
      ? 'Van már fiókod? <a href="#" id="toggle-link">Lépj be</a>'
      : 'Nincs fiókod? <a href="#" id="toggle-link">Regisztrálj</a>';

    document.getElementById('toggle-link').addEventListener('click', (e) => {
      e.preventDefault();
      isRegistering = !isRegistering;
      authTitle.textContent = isRegistering ? 'Regisztráció' : 'Bejelentkezés';
      authBtn.textContent = isRegistering ? 'Regisztrálok' : 'Bejelentkezés';
      updateToggleText();
    });
  }

  accountBtn.addEventListener('click', (e) => {
    e.preventDefault();
    dropdown.classList.toggle('hidden');
    accountBtn.setAttribute(
      'aria-expanded',
      dropdown.classList.contains('hidden') ? 'false' : 'true'
    );
  });

  document.addEventListener('click', (e) => {
    if (!accountBtn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
      accountBtn.setAttribute('aria-expanded', 'false');
    }
  });

  authBtn.addEventListener('click', () => {
    const username = authUsername.value.trim();
    const email = authEmail.value.trim();

    if (!username || !email) {
      alert('Kérlek, tölts ki minden mezőt!');
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (isRegistering) {
      localStorage.setItem('user', JSON.stringify({ username, email }));
      alert('Sikeres regisztráció!');
    } else {
      if (!storedUser || storedUser.email !== email || storedUser.username !== username) {
        alert('Hibás felhasználónév vagy email!');
        return;
      }
      alert(`Üdv újra, ${storedUser.username}!`);
    }

    updateUI();
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    updateUI();
  });

  updateToggleText();
  updateUI();

  const messagesEl = document.getElementById('messages');
  const userInput = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  const chatToggle = document.getElementById('chat-toggle');
  const chatContainer = document.getElementById('chat-container');

  const chatMemory = [];
  let isLearning = false;
  let learningKey = '';

  let learnedResponses = JSON.parse(localStorage.getItem('learnedResponses')) || {};

  function fuzzyIncludes(text, keyword) {
    let i = 0;
    for (const char of text) {
      if (char === keyword[i]) i++;
      if (i === keyword.length) return true;
    }
    return false;
  }

 
  function botResponse(input) {
    const text = input.toLowerCase();

    
    if (learnedResponses[text]) {
      return learnedResponses[text];
    }

    const responses = [
      {
        keywords: ['szia', 'hello', 'hali', 'csá'],
        answers: [
          'Szia! Miben segíthetek?',
          'Helló! Mit szeretnél tudni?',
          'Csáó, miben segíthetek ma?'
        ],
      },
      {
        keywords: ['projektek', 'munka', 'portfolio'],
        answers: [
          'Nézd meg a projektjeimet fent a Projektek szekcióban!',
          'A portfóliómban találod a legjobb munkáimat.',
        ],
      },
      {
        keywords: ['név'],
        answers: [
          'Chatbot vagyok, a portfóliód része :)',
          'Engem csak chatbotnak hívnak.',
        ],
      },
      {
        keywords: ['hogy vagy', 'hogy vagy?'],
        answers: [
          'Jól vagyok, köszönöm! Te hogy vagy?',
          'Remekül, köszi a kérdést! És te?'
        ],
      },
    ];

    
    if (chatMemory.length > 0) {
      const lastUserMessage = chatMemory[chatMemory.length - 1].toLowerCase();
      if (lastUserMessage.includes('hogy vagy') && text.includes('jól')) {
        return 'Örülök, hogy jól vagy!';
      }
    }

    for (const r of responses) {
      if (r.keywords.some(k => fuzzyIncludes(text, k))) {
        const ans = r.answers[Math.floor(Math.random() * r.answers.length)];
        return ans;
      }
    }

    return null; 
  }

  function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.classList.add('message', sender);
    msg.textContent = text;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  sendBtn.addEventListener('click', () => {
    const input = userInput.value.trim();
    if (!input) return;

    if (isLearning) {
      learnedResponses[learningKey] = input;
      localStorage.setItem('learnedResponses', JSON.stringify(learnedResponses));
      addMessage('Köszönöm, megtanultam!', 'bot');
      userInput.value = '';
      isLearning = false;
      learningKey = '';
      return;
    }

    addMessage(input, 'user');
    userInput.value = '';

    const response = botResponse(input);

    if (response !== null) {
      chatMemory.push(input);
      if (chatMemory.length > 10) chatMemory.shift();

      setTimeout(() => {
        addMessage(response, 'bot');
      }, 500);
    } else {
      setTimeout(() => {
        addMessage('Ezt még nem tudom. Mit kellene válaszolnom erre?', 'bot');
        isLearning = true;
        learningKey = input.toLowerCase();
      }, 500);
    }
  });

  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendBtn.click();
    }
  });

  chatToggle.addEventListener('click', () => {
    chatContainer.classList.toggle('hidden');
  });
});
