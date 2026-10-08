/* =============================================================
   KAGE-INSPIRED INTERACTION ENGINE · RANVEER SANGWAN PORTFOLIO
   Features: Custom Cursor, Reveal Observers, Sticky Nav,
   Progress Rail, and Chapter Navigation
   ============================================================= */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. Custom Interactive Cursor Dot ── */
  const cursor = document.getElementById('cursor');
  let mouseX = -100, mouseY = -100;
  let curX = -100, curY = -100;
  let isMoving = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isMoving) {
      curX = mouseX;
      curY = mouseY;
      isMoving = true;
    }
  });

  function renderCursor() {
    curX += (mouseX - curX) * 0.22;
    curY += (mouseY - curY) * 0.22;
    if (cursor) {
      cursor.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
    }
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Attach hover expand states to interactive targets
  const interactiveElements = document.querySelectorAll(
    'a, button, [data-cursor], .chip, .card, .les, .c-card'
  );
  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => cursor && cursor.classList.add('act'));
    el.addEventListener('mouseleave', () => cursor && cursor.classList.remove('act'));
  });

  /* ── 2. Sticky & Auto-hiding Navbar on Scroll ── */
  const nav = document.getElementById('nav');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    // Add blurred backdrop when scrolled past 40px
    if (currentScrollY > 40) {
      nav.classList.add('stuck');
    } else {
      nav.classList.remove('stuck');
    }

    // Auto hide on rapid scroll down, reveal on scroll up
    if (currentScrollY > 200 && currentScrollY > lastScrollY && !nav.classList.contains('menu-open')) {
      nav.style.transform = 'translate3d(0, -100%, 0)';
    } else {
      nav.style.transform = 'none';
    }

    lastScrollY = currentScrollY;
  }, { passive: true });

  /* ── 3. Mobile Navigation Drawer ── */
  const burger = document.getElementById('burger');
  const navlinks = document.getElementById('navlinks');

  if (burger) {
    burger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('menu-open');
      burger.classList.toggle('active', isOpen);
    });

    // Close mobile drawer when an anchor is clicked
    navlinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('menu-open');
        burger.classList.remove('active');
      });
    });
  }

  /* ── 4. Scroll Reveal via IntersectionObserver ── */
  const reveals = document.querySelectorAll('[data-rv]');
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('rv-in');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach((el) => revealObserver.observe(el));

  // Auto trigger top reveals on load
  setTimeout(() => {
    document.querySelectorAll('.hero [data-rv]').forEach((el) => {
      el.classList.add('rv-in');
    });
  }, 100);

  /* ── 5. Progress Rail & Active Section Tracking ── */
  const sections = document.querySelectorAll('section[id], footer[id]');
  const railButtons = document.querySelectorAll('.rail button');
  const chips = document.querySelectorAll('.chip');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;

          // Update rail indicator
          railButtons.forEach((btn) => {
            btn.classList.toggle('on', btn.getAttribute('data-target') === id);
          });

          // Update chapter chip highlights
          chips.forEach((chip) => {
            chip.classList.toggle('on', chip.getAttribute('data-chip') === id);
          });
        }
      });
    },
    { threshold: 0.35 }
  );

  sections.forEach((sec) => sectionObserver.observe(sec));

  // Rail button click handlers
  railButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Chapter chips click handlers
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const targetId = chip.getAttribute('data-chip');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ── 6. Smooth Scroll for all Internal Anchor Links ── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#top') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

});
