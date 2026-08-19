(function(){
  var STORAGE_KEY = 'eventalk_admin_authenticated';
  var USERS_KEY = 'eventalk_admin_users';
  var SUPER_ADMIN_USERNAME = 'RASHID313';
  var SUPER_ADMIN_PASSWORD = '662830';
  var SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
  var sessionTimeoutId = null;

  function isAuthenticated(){
    return localStorage.getItem(STORAGE_KEY) === 'true';
  }

  function resetSessionTimeout(){
    if(!isAuthenticated()) return;
    if(sessionTimeoutId) clearTimeout(sessionTimeoutId);
    sessionTimeoutId = setTimeout(function(){
      logout();
      if(window.location.pathname.includes('admin') || window.location.pathname.includes('login') === false){
        alert('Your session has expired due to inactivity. Please login again.');
        window.location.href = 'login.html';
      }
    }, SESSION_TIMEOUT_MS);
  }

  function initActivityTracking(){
    if(!isAuthenticated()) return;
    resetSessionTimeout();
    var events = ['click', 'keypress', 'mousemove', 'scroll', 'touchstart'];
    events.forEach(function(event){
      document.addEventListener(event, resetSessionTimeout, true);
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initActivityTracking);
  } else {
    initActivityTracking();
  }

  function getUsers(){
    try {
      var raw = localStorage.getItem(USERS_KEY);
      var users = raw ? JSON.parse(raw) : [];
      return Array.isArray(users) ? users : [];
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users){
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function addUser(username, password){
    if(typeof username !== 'string' || !username.trim()){
      return { success: false, error: 'Username is required.' };
    }
    if(typeof password !== 'string' || !password.trim()){
      return { success: false, error: 'Password is required.' };
    }
    username = username.trim();
    if(username === SUPER_ADMIN_USERNAME){
      return { success: false, error: 'Cannot add the super admin username.' };
    }
    var users = getUsers();
    if(users.some(function(user){ return user.username === username; })){
      return { success: false, error: 'That username already exists.' };
    }
    users.push({ username: username, password: password });
    saveUsers(users);
    return { success: true };
  }

  function deleteUser(username){
    if(username === SUPER_ADMIN_USERNAME){
      return { success: false, error: 'Cannot delete the super admin.' };
    }
    var users = getUsers();
    var remaining = users.filter(function(user){ return user.username !== username; });
    if(remaining.length === users.length){
      return { success: false, error: 'User not found.' };
    }
    saveUsers(remaining);
    return { success: true };
  }

  function login(username, password){
    if(typeof username !== 'string' || typeof password !== 'string'){
      return false;
    }
    username = username.trim();
    if(username === SUPER_ADMIN_USERNAME && password === SUPER_ADMIN_PASSWORD){
      localStorage.setItem(STORAGE_KEY, 'true');
      initActivityTracking();
      return true;
    }
    var users = getUsers();
    var match = users.find(function(user){ return user.username === username && user.password === password; });
    if(match){
      localStorage.setItem(STORAGE_KEY, 'true');
      initActivityTracking();
      return true;
    }
    return false;
  }

  function logout(){
    if(sessionTimeoutId) clearTimeout(sessionTimeoutId);
    localStorage.removeItem(STORAGE_KEY);
  }

  function getSuperAdmin(){
    return { username: SUPER_ADMIN_USERNAME, password: SUPER_ADMIN_PASSWORD };
  }

  window.adminAuth = {
    isAuthenticated: isAuthenticated,
    getUsers: getUsers,
    addUser: addUser,
    deleteUser: deleteUser,
    login: login,
    logout: logout,
    getSuperAdmin: getSuperAdmin
  };
})();
