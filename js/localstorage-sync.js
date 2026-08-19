// Fast, reliable Supabase sync for the BeeOne Event app.
// localStorage is the instant local cache; Supabase is the shared database.
(function () {
  'use strict';

  if (!window.localStorage) return;

  var originalSet = Storage.prototype.setItem;
  var originalRemove = Storage.prototype.removeItem;
  var originalClear = Storage.prototype.clear;
  var started = false;
  var hydrating = true;
  var applyingRemote = false;
  var pending = Object.create(null);
  var timers = Object.create(null);
  var preHydrationWrites = Object.create(null);
  var client = null;

  function isDataKey(key) {
    return String(key).indexOf('eventalk_') === 0 || String(key) === 'homepage';
  }

  function parse(value) {
    try { return JSON.parse(value); }
    catch (e) { return { __raw: String(value) }; }
  }

  function sameData(a, b) {
    try { return JSON.stringify(a) === JSON.stringify(b); }
    catch (e) { return String(a) === String(b); }
  }

  function signal(name, detail) {
    try { window.dispatchEvent(new CustomEvent(name, { detail: detail || {} })); }
    catch (e) {}
  }

  function queueSave(key, value, immediate) {
    if (!client) return;
    pending[key] = value;
    if (timers[key]) clearTimeout(timers[key]);
    timers[key] = setTimeout(function () {
      timers[key] = null;
      flush(key);
    }, immediate ? 0 : 50);
  }

  function flush(key) {
    if (!client || !Object.prototype.hasOwnProperty.call(pending, key)) return;
    var value = pending[key];
    delete pending[key];

    client.from('eventalk_content').upsert({
      key: key,
      data: parse(value),
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' }).then(function (result) {
      if (result.error) {
        // Retry automatically. Local data is already safe in localStorage.
        console.error('Supabase save failed for ' + key + ':', result.error);
        signal('supabase-save-error', { key: key, error: result.error });
        pending[key] = value;
        setTimeout(function () { flush(key); }, 1000);
      } else {
        signal('supabase-saved', { key: key });
      }
    }).catch(function (err) {
      console.error('Supabase save failed for ' + key + ':', err);
      signal('supabase-save-error', { key: key, error: err });
      pending[key] = value;
      setTimeout(function () { flush(key); }, 1000);
    });
  }

  function flushAll() {
    Object.keys(pending).forEach(flush);
  }

  function hydrate() {
    if (!client) {
      hydrating = false;
      window._localstorageHydrated = true;
      signal('localstorage-hydrated', { remoteChanged: false });
      return;
    }

    client.from('eventalk_content')
      .select('key,data,updated_at')
      .then(function (result) {
        if (result.error) throw result.error;

        var rows = result.data || [];
        var remoteKeys = Object.create(null);
        var remoteChanged = false;

        rows.forEach(function (row) {
          if (!isDataKey(row.key)) return;
          remoteKeys[row.key] = true;

          var local = localStorage.getItem(row.key);
          var hadPreHydrationWrite = Object.prototype.hasOwnProperty.call(preHydrationWrites, row.key);

          // Supabase is authoritative for keys that already exist remotely.
          // This fixes stale localStorage after another device/browser updates data.
          if (!hadPreHydrationWrite && local !== null && !sameData(parse(local), row.data)) {
            applyingRemote = true;
            try { originalSet.call(localStorage, row.key, JSON.stringify(row.data)); }
            finally { applyingRemote = false; }
            remoteChanged = true;
          } else if (local === null) {
            applyingRemote = true;
            try { originalSet.call(localStorage, row.key, JSON.stringify(row.data)); }
            finally { applyingRemote = false; }
            remoteChanged = true;
          } else if (hadPreHydrationWrite && !sameData(parse(local), row.data)) {
            // A page may write default data while loading. Keep the database value
            // instead of accidentally overwriting real remote data with defaults.
            applyingRemote = true;
            try { originalSet.call(localStorage, row.key, JSON.stringify(row.data)); }
            finally { applyingRemote = false; }
            remoteChanged = true;
          }
        });

        // If a key exists only locally, save it once. This supports first-time setup.
        Object.keys(preHydrationWrites).forEach(function (key) {
          if (!remoteKeys[key]) queueSave(key, localStorage.getItem(key), true);
        });

        preHydrationWrites = Object.create(null);
        hydrating = false;
        window._localstorageHydrated = true;
        signal('localstorage-hydrated', { remoteChanged: remoteChanged });

        // Existing pages read localStorage during startup and do not all listen for
        // custom events. If remote data replaced stale/default local data, reload once
        // for this page so its existing render code sees the correct values.
        if (remoteChanged) {
          var reloadKey = 'eventalk_hydration_reload_' + location.pathname;
          if (!sessionStorage.getItem(reloadKey)) {
            sessionStorage.setItem(reloadKey, '1');
            setTimeout(function () { location.reload(); }, 20);
          }
        }
      })
      .catch(function (err) {
        console.error('Supabase load failed:', err);
        // Never block the website when Supabase is temporarily unavailable.
        Object.keys(preHydrationWrites).forEach(function (key) {
          queueSave(key, localStorage.getItem(key), true);
        });
        preHydrationWrites = Object.create(null);
        hydrating = false;
        window._localstorageHydrated = true;
        signal('localstorage-hydrated', { remoteChanged: false, error: err });
      });
  }

  function startSync() {
    if (started) return;
    started = true;

    if (!window.supabase || !window.SUPABASE_URL || !window.SUPABASE_ANON_KEY ||
        String(window.SUPABASE_URL).indexOf('YOUR_') === 0 ||
        String(window.SUPABASE_ANON_KEY).indexOf('YOUR_') === 0) {
      console.warn('Supabase is not configured. The app will use localStorage only.');
      hydrating = false;
      window._localstorageHydrated = true;
      signal('localstorage-hydrated', { remoteChanged: false });
      return;
    }

    client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
    window.eventalkSupabase = client;
    window.eventalkSupabaseReady = true;

    hydrate();
  }

  Storage.prototype.setItem = function (key, value) {
    originalSet.call(this, key, value); // instant local save

    if (this !== localStorage || !isDataKey(key) || applyingRemote) return;

    if (hydrating) {
      preHydrationWrites[String(key)] = true;
      return;
    }

    queueSave(String(key), value, false);
  };

  Storage.prototype.removeItem = function (key) {
    originalRemove.call(this, key); // instant local delete
    if (this !== localStorage || !isDataKey(key) || applyingRemote || !client) return;

    if (hydrating) {
      preHydrationWrites[String(key)] = true;
      return;
    }

    client.from('eventalk_content').delete().eq('key', String(key)).then(function (result) {
      if (result.error) {
        console.error('Supabase delete failed for ' + key + ':', result.error);
        signal('supabase-save-error', { key: key, error: result.error });
      }
    });
  };

  Storage.prototype.clear = function () {
    // Keep clear() local. The app does not use clear() for database operations.
    originalClear.call(this);
  };

  window.eventalkFlushSupabase = flushAll;
  window.addEventListener('pagehide', flushAll);
  window.addEventListener('beforeunload', flushAll);

  // Start as soon as Supabase CDN/config are available.
  if (window.supabase) startSync();
  else window.addEventListener('supabase-ready', startSync, { once: true });
})();
