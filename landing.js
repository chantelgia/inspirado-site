// InspiraDo landing page: animations, the sticky feature phone, analytics, waitlist.
(function () {
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Analytics (PostHog, same project as the app) ----------
  // No cookies or local storage (persistence: memory), no session recording,
  // no autocapture: only the events below. Disclosed in privacy.html.
  var PH_KEY = 'phc_BkzGmsCw3hCfvYjeoKE5QQBxfECkYkE9dUUZprPxps5B';
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  if (PH_KEY.indexOf('phc_') === 0 && location.hostname !== 'localhost') {
    posthog.init(PH_KEY, {
      api_host: 'https://us.i.posthog.com',
      persistence: 'memory',
      autocapture: false,
      capture_pageview: true,
      capture_pageleave: true,
      disable_session_recording: true,
    });
    posthog.register({ site: 'marketing' });
  }
  function track(event, props) {
    try { window.posthog && posthog.capture(event, props || {}, { transport: 'sendBeacon' }); } catch (e) {}
  }

  // Keep campaign tags (?utm_...) when someone continues to the web app.
  var utm = location.search.match(/utm_[a-z]+=[^&]+/g);
  document.querySelectorAll('[data-webapp]').forEach(function (a) {
    if (utm) a.href = 'https://app.inspirado.app/?' + utm.join('&');
    a.addEventListener('click', function () { track('webapp_click', { placement: a.dataset.webapp }); });
  });
  document.querySelectorAll('[data-appstore]').forEach(function (a) {
    a.addEventListener('click', function () { track('appstore_click', { placement: a.dataset.appstore }); });
  });
  document.querySelectorAll('[data-track]').forEach(function (a) {
    a.addEventListener('click', function () { track(a.dataset.track, { placement: a.dataset.placement }); });
  });

  // ---------- Nav border on scroll ----------
  var nav = document.getElementById('nav');
  var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 40); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- Reveal on scroll + section views ----------
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }
  if ('IntersectionObserver' in window) {
    var seen = {};
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var id = e.target.id;
        if (e.isIntersecting && !seen[id]) { seen[id] = 1; track('section_view', { section: id }); }
      });
    }, { threshold: 0.35 });
    ['problem', 'how', 'features', 'for'].forEach(function (id) { var el = document.getElementById(id); if (el) so.observe(el); });

    // ---------- The mess sorts itself into one project ----------
    var mess = document.getElementById('mess');
    if (mess) {
      if (reduce) mess.classList.add('sorted');
      var mo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { setTimeout(function () { mess.classList.add('sorted'); }, 700); mo.disconnect(); }
        });
      }, { threshold: 0.7 });
      mo.observe(mess);
    }

    // ---------- Sticky feature phone (desktop) ----------
    var stage = document.getElementById('stage-img');
    var feats = document.querySelectorAll('.feat');
    var current = 'home';
    var fo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        feats.forEach(function (f) { f.classList.toggle('active', f === e.target); });
        var shot = e.target.dataset.shot;
        if (shot && shot !== current && stage) {
          current = shot;
          stage.classList.add('swap');
          setTimeout(function () { stage.src = 'img/' + shot + '-720.webp'; stage.onload = function () { stage.classList.remove('swap'); }; }, 180);
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    feats.forEach(function (f) { fo.observe(f); });
    // Warm the cache so swaps are instant.
    window.addEventListener('load', function () {
      if (window.innerWidth < 960) return;
      feats.forEach(function (f) { var i = new Image(); i.src = 'img/' + f.dataset.shot + '-720.webp'; });
    });
  }

  // ---------- Year ----------
  document.querySelectorAll('.yr').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  // ---------- iPad / Android waitlist (Supabase public anon key, insert-only table) ----------
  var SB = 'https://otepuszjiruqwgnuykbc.supabase.co';
  var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90ZXB1c3pqaXJ1cXdnbnV5a2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MDUxNjQsImV4cCI6MjEwNzE4MTE2NH0.teJWQ8IVewEbBHbHhBNN4g36rU5vs-UuJW2Xvy8_EP8';
  var form = document.getElementById('wl-form'), inp = document.getElementById('wl-email'), msg = document.getElementById('wl-msg');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = (inp.value || '').trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { msg.textContent = 'Enter a valid email.'; return; }
    msg.textContent = 'Adding you…';
    fetch(SB + '/rest/v1/waitlist', {
      method: 'POST',
      headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ email: email, source: 'website' }),
    }).then(function (r) {
      if (r.ok || r.status === 409) { msg.textContent = "You're on the list. We'll email you when it lands."; form.reset(); track('waitlist_join'); }
      else msg.textContent = 'Something went wrong. Try again.';
    }).catch(function () { msg.textContent = 'Network error. Try again.'; });
  });
})();
