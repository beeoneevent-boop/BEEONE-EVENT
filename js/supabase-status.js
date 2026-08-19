(function () {
  'use strict';
  window.eventalkSupabaseStatus = function () {
    return {
      configured: !!(window.SUPABASE_URL && window.SUPABASE_ANON_KEY),
      connected: !!window.eventalkSupabaseReady,
      hydrated: !!window._localstorageHydrated
    };
  };
})();
