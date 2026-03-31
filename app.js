// ===== VIDEO BACKGROUND (HTML5) =====
// Autoplay guard: ensure the video plays even if browser initially blocks it
document.addEventListener('DOMContentLoaded', () => {
    const vid = document.getElementById('bgVideo');
    if (!vid) return;
    vid.muted = true;
    const playPromise = vid.play();
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            // If autoplay blocked, retry on first user interaction
            document.addEventListener('click', () => vid.play(), { once: true });
            document.addEventListener('touchstart', () => vid.play(), { once: true });
        });
    }
});

// ===== NAVIGATION =====
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');
const navToggle = document.getElementById('navToggle');
const navLinksContainer = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);

    let current = '';
    sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 100) {
            current = section.id;
        }
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.section === current);
    });
});

navToggle.addEventListener('click', () => {
    navLinksContainer.classList.toggle('open');
    navToggle.classList.toggle('open');
});

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        target.scrollIntoView({ behavior: 'smooth' });
        navLinksContainer.classList.remove('open');
        navToggle.classList.remove('open');
    });
});

// ===== COUNTER ANIMATION =====
function animateCounter(el, target, duration = 1500) {
    let start = 0;
    const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        el.textContent = Math.floor(progress * target);
        if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('[data-target]').forEach(el => {
                animateCounter(el, parseInt(el.dataset.target));
            });
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelector('.hero-stats') && counterObserver.observe(document.querySelector('.hero-stats'));

// ===== TEAMS GRID =====
function buildTeams() {
    const grid = document.getElementById('teamsGrid');
    if (!grid) return;

    F1_TEAMS.forEach((team, i) => {
        const teamDrivers = F1_DRIVERS.filter(d => d.team === team.id);
        const card = document.createElement('div');
        card.className = 'team-card';
        card.style.setProperty('--team-color', team.color);
        card.style.animationDelay = `${i * 0.08}s`;
        card.innerHTML = `
      <div class="team-card-inner">
        <div class="team-color-bar"></div>
        <div class="team-card-header">
          <div class="team-logo-placeholder" style="color:${team.color}; border-color:${team.color}40">
            <span>${team.shortName.substring(0, 2)}</span>
          </div>
          <div class="team-info">
            <div class="team-short">${team.shortName}</div>
            <h3 class="team-name">${team.name}</h3>
          </div>
        </div>
        <div class="team-chassis">${team.chassis}</div>
        <div class="team-meta">
          <div class="team-meta-item">
            <span class="meta-label">Principal</span>
            <span class="meta-value">${team.principal}</span>
          </div>
          <div class="team-meta-item">
            <span class="meta-label">Engine</span>
            <span class="meta-value">${team.powerUnit}</span>
          </div>
          <div class="team-meta-item">
            <span class="meta-label">Base</span>
            <span class="meta-value">${team.base}</span>
          </div>
          <div class="team-meta-item">
            <span class="meta-label">Titles</span>
            <span class="meta-value team-titles">${team.championships}</span>
          </div>
        </div>
        <div class="team-drivers-preview">
          ${teamDrivers.map(d => `
            <div class="driver-chip" style="border-color:${team.color}50">
              <span class="driver-num" style="color:${team.color}">${d.number}</span>
              <span class="driver-chip-name">${d.shortName}</span>
            </div>
          `).join('')}
        </div>
        <button class="team-more-btn" data-team="${team.id}" style="border-color:${team.color}; color:${team.color}">
          TEAM PROFILE
        </button>
      </div>
    `;
        grid.appendChild(card);
        observer.observe(card);
    });

    document.querySelectorAll('.team-more-btn').forEach(btn => {
        btn.addEventListener('click', () => openTeamModal(btn.dataset.team));
    });
}

// ===== DRIVERS GRID =====
function buildDriverFilters() {
    const container = document.getElementById('driversFilter');
    if (!container) return;
    F1_TEAMS.forEach(team => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.team = team.id;
        btn.id = `filter-${team.id}`;
        btn.style.setProperty('--btn-color', team.color);
        btn.textContent = team.shortName;
        container.appendChild(btn);
    });

    container.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterDrivers(btn.dataset.team);
    });
}

function buildDrivers() {
    const grid = document.getElementById('driversGrid');
    if (!grid) return;

    F1_DRIVERS.forEach((driver, i) => {
        const team = F1_TEAMS.find(t => t.id === driver.team);
        const card = document.createElement('div');
        card.className = 'driver-card reveal';
        card.dataset.team = driver.team;
        card.style.setProperty('--team-color', team.color);
        card.style.animationDelay = `${i * 0.05}s`;
        card.innerHTML = `
      <div class="driver-card-inner">
        <div class="driver-number-bg">${driver.number}</div>
        <div class="driver-card-top">
          <div class="driver-country">${driver.nationality}</div>
          <div class="driver-num-badge" style="color:${team.color}">${driver.number}</div>
        </div>
        <div class="driver-avatar" style="border-color:${team.color}; background: linear-gradient(135deg, ${team.color}22, ${team.color}05)">
          <span class="driver-initials">${driver.initials}</span>
          <div class="driver-avatar-ring" style="border-color:${team.color}40"></div>
        </div>
        <div class="driver-details">
          <div class="driver-team-tag" style="color:${team.color}; background:${team.color}18">${team.shortName}</div>
          <h3 class="driver-name">${driver.name}</h3>
          <div class="driver-stats-row">
            <div class="dstat">
              <span class="dstat-val">${driver.wins}</span>
              <span class="dstat-lbl">WINS</span>
            </div>
            <div class="dstat">
              <span class="dstat-val">${driver.podiums}</span>
              <span class="dstat-lbl">PODIUMS</span>
            </div>
            <div class="dstat">
              <span class="dstat-val">${driver.championships}</span>
              <span class="dstat-lbl">TITLES</span>
            </div>
          </div>
        </div>
        <button class="driver-profile-btn" data-driver="${driver.id}" style="background:${team.color}">
          VIEW PROFILE
        </button>
      </div>
    `;
        grid.appendChild(card);
        observer.observe(card);
    });

    document.querySelectorAll('.driver-profile-btn').forEach(btn => {
        btn.addEventListener('click', () => openDriverModal(btn.dataset.driver));
    });
}

function filterDrivers(teamId) {
    document.querySelectorAll('.driver-card').forEach(card => {
        const show = teamId === 'all' || card.dataset.team === teamId;
        card.style.display = show ? 'block' : 'none';
        if (show) {
            card.style.animation = 'none';
            card.offsetHeight;
            card.style.animation = 'cardReveal 0.4s ease forwards';
        }
    });
}

// ===== STANDINGS =====
function buildStandings() {
    const driverTable = document.getElementById('driverStandings');
    const constructorTable = document.getElementById('constructorStandings');
    if (!driverTable || !constructorTable) return;

    DRIVER_STANDINGS.forEach((entry, i) => {
        const row = document.createElement('div');
        row.className = 'standing-row reveal';
        row.style.animationDelay = `${i * 0.07}s`;
        row.innerHTML = `
      <div class="standing-pos ${entry.pos <= 3 ? 'top-' + entry.pos : ''}">${entry.pos}</div>
      <div class="standing-bar-wrap">
        <div class="standing-bar" style="background:${entry.color}; width:${Math.max(5, 100 - i * 8)}%"></div>
      </div>
      <div class="standing-name">${entry.name}</div>
      <div class="standing-pts" style="color:${entry.color}">TBD</div>
    `;
        driverTable.appendChild(row);
        observer.observe(row);
    });

    CONSTRUCTOR_STANDINGS.forEach((entry, i) => {
        const row = document.createElement('div');
        row.className = 'standing-row reveal';
        row.style.animationDelay = `${i * 0.07}s`;
        row.innerHTML = `
      <div class="standing-pos ${entry.pos <= 3 ? 'top-' + entry.pos : ''}">${entry.pos}</div>
      <div class="standing-bar-wrap">
        <div class="standing-bar" style="background:${entry.color}; width:${Math.max(5, 100 - i * 8)}%"></div>
      </div>
      <div class="standing-name">${entry.name}</div>
      <div class="standing-pts" style="color:${entry.color}">TBD</div>
    `;
        constructorTable.appendChild(row);
        observer.observe(row);
    });
}

// ===== MODALS =====
const modalOverlay = document.getElementById('modalOverlay');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const modalClose = document.getElementById('modalClose');

function openTeamModal(teamId) {
    const team = F1_TEAMS.find(t => t.id === teamId);
    const drivers = F1_DRIVERS.filter(d => d.team === teamId);
    modalContent.innerHTML = `
    <div class="modal-team-header" style="border-bottom:3px solid ${team.color}">
      <div class="modal-team-logo" style="color:${team.color}; border-color:${team.color}">${team.shortName.substring(0, 2)}</div>
      <div>
        <div class="modal-team-short" style="color:${team.color}">${team.shortName}</div>
        <h2 class="modal-title">${team.name}</h2>
        <div class="modal-badge">${team.chassis} · ${team.firstEntry}</div>
      </div>
    </div>
    <p class="modal-bio">${team.description}</p>
    <div class="modal-stats">
      <div class="modal-stat"><span class="modal-stat-val" style="color:${team.color}">${team.championships}</span><span>Titles</span></div>
      <div class="modal-stat"><span class="modal-stat-val" style="color:${team.color}">${team.powerUnit}</span><span>Engine</span></div>
      <div class="modal-stat"><span class="modal-stat-val" style="color:${team.color}">${team.base.split(',')[1] || team.base}</span><span>Base</span></div>
    </div>
    <h3 class="modal-drivers-title">DRIVERS</h3>
    <div class="modal-drivers">
      ${drivers.map(d => `
        <div class="modal-driver-chip" style="border-color:${team.color}50; background:${team.color}10">
          <span class="modal-driver-num" style="color:${team.color}">${d.number}</span>
          <span class="modal-driver-name">${d.name}</span>
          <span class="modal-driver-nat">${d.nationality}</span>
        </div>
      `).join('')}
    </div>
  `;
    document.getElementById('modal').style.setProperty('--modal-accent', team.color);
    openModal();
}

function openDriverModal(driverId) {
    const driver = F1_DRIVERS.find(d => d.id === driverId);
    const team = F1_TEAMS.find(t => t.id === driver.team);
    modalContent.innerHTML = `
    <div class="modal-driver-header" style="border-bottom:3px solid ${team.color}">
      <div class="modal-driver-avatar" style="border-color:${team.color}; background:linear-gradient(135deg, ${team.color}33, ${team.color}08)">
        <span>${driver.initials}</span>
      </div>
      <div>
        <div class="modal-driver-num-big" style="color:${team.color}">${driver.number}</div>
        <h2 class="modal-title">${driver.name}</h2>
        <div class="modal-badge" style="background:${team.color}20; color:${team.color}">${team.name} · ${driver.nationality}</div>
      </div>
    </div>
    <p class="modal-bio">${driver.bio}</p>
    <div class="modal-stats">
      <div class="modal-stat"><span class="modal-stat-val" style="color:${team.color}">${driver.championships}</span><span>Championships</span></div>
      <div class="modal-stat"><span class="modal-stat-val" style="color:${team.color}">${driver.wins}</span><span>Wins</span></div>
      <div class="modal-stat"><span class="modal-stat-val" style="color:${team.color}">${driver.podiums}</span><span>Podiums</span></div>
      <div class="modal-stat"><span class="modal-stat-val" style="color:${team.color}">${driver.age}</span><span>Age</span></div>
    </div>
  `;
    document.getElementById('modal').style.setProperty('--modal-accent', team.color);
    openModal();
}

function openModal() {
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// ===== INTERSECTION OBSERVER FOR REVEAL =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

// ===== SMOOTH SCROLL =====
document.querySelector('.cta-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('teams').scrollIntoView({ behavior: 'smooth' });
});
document.querySelector('.scroll-indicator')?.addEventListener('click', () => {
    document.getElementById('teams').scrollIntoView({ behavior: 'smooth' });
});

// ===== INIT =====
buildTeams();
buildDriverFilters();
buildDrivers();
buildStandings();