// Cleaned app.js: Firebase Auth + Firestore persistence with debounced saves

(function(){
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  const landing = $('#landing');
  const appArea = $('#app-area');
  const btnStart = $('#btn-start');
  const btnSignIn = $('#btn-signin');
  const btnSignOut = $('#btn-signout');
  const datePicker = $('#date-picker');
  const remainingEl = $('#remaining');
  const activitiesList = $('#activities-list');
  const addForm = $('#add-activity-form');
  const inputTitle = $('#activity-title');
  const inputCat = $('#activity-category');
  const inputMin = $('#activity-minutes');
  const btnAnalyse = $('#btn-analyse');
  const dashboard = $('#dashboard');
  const noData = $('#no-data');
  const dashboardContent = $('#dashboard-content');
  const totalHoursEl = $('#total-hours');
  const numActivitiesEl = $('#num-activities');
  const progressBar = $('#progress-bar');
  const totalMinutesDisplay = $('#total-minutes');

  let activities = [];
  let currentUser = null;
  let currentDate = (new Date()).toISOString().slice(0,10);
  let isLoading = false;
  let saveTimer = null;
  const SAVE_DEBOUNCE_MS = 700;

  datePicker.value = currentDate;
  btnStart.onclick = () => { landing.classList.add('hidden'); appArea.classList.remove('hidden'); }

  function initFirebase(){
    if(!window.firebaseConfig) return console.warn('Missing firebase-config.js');
    firebase.initializeApp(window.firebaseConfig);
    window.auth = firebase.auth();
    window.db = firebase.firestore();
    window.googleProvider = new firebase.auth.GoogleAuthProvider();

    auth.onAuthStateChanged(u => {
      currentUser = u;
      if(u){
        btnSignIn.classList.add('hidden');
        btnSignOut.classList.remove('hidden');
        landing.classList.add('hidden');
        appArea.classList.remove('hidden');
        loadActivitiesForDate(currentDate);
      } else {
        btnSignIn.classList.remove('hidden');
        btnSignOut.classList.add('hidden');
        landing.classList.remove('hidden');
        appArea.classList.add('hidden');
      }
    });
  }

  btnSignIn.onclick = async ()=>{
    const choice = prompt('Sign in: 1=Email, 2=Google');
    if(choice === '2'){
      try{ await auth.signInWithPopup(googleProvider); }
      catch(e){ alert('Google sign-in failed: '+e.message); }
      return;
    }
    const email = prompt('Email:');
    const pass = prompt('Password:');
    if(!email || !pass) return;
    try{ await auth.signInWithEmailAndPassword(email, pass); }
    catch(e){
      try{ await auth.createUserWithEmailAndPassword(email, pass); }
      catch(err){ alert('Auth error: '+err.message); }
    }
  };
  btnSignOut.onclick = ()=> auth.signOut();

  function renderActivities(){
    activitiesList.innerHTML = '';
    activities.forEach(a=>{
      const el = document.createElement('div');
      el.className = 'activity-item';
      el.innerHTML = `<div><strong>${a.title}</strong><div class="muted">${a.category||'Uncategorized'}</div></div><div>${a.minutes}m <button data-id="${a.id}" class="btn small">Edit</button> <button data-del="${a.id}" class="btn small">Delete</button></div>`;
      activitiesList.appendChild(el);
    });
    updateRemaining();
    scheduleSave();
  }

  function updateRemaining(){
    const total = activities.reduce((s,i)=>s+i.minutes,0);
    const remaining = 1440 - total;
    remainingEl.textContent = `You have ${remaining} minutes left for this day.`;
    totalMinutesDisplay.textContent = `${total} / 1440 min`;
    const pct = Math.max(0, Math.min(100, Math.round((total/1440)*100)));
    if(progressBar) progressBar.style.width = pct + '%';
    if(remaining <= 60) remainingEl.classList.add('warning'); else remainingEl.classList.remove('warning');
    btnAnalyse.disabled = (total !== 1440);
  }

  addForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const title = inputTitle.value.trim();
    const category = inputCat.value.trim();
    const minutes = parseInt(inputMin.value,10);
    if(!title || !minutes) return alert('Provide title and minutes');
    const totalSoFar = activities.reduce((s,i)=>s+i.minutes,0);
    if(totalSoFar + minutes > 1440) return alert('Adding this would exceed 1440 minutes for the day.');
    const id = Date.now().toString(36);
    activities.push({id,title,category,minutes});
    inputTitle.value = '';
    inputCat.value = '';
    inputMin.value = '';
    renderActivities();
  });

  inputMin.addEventListener('input', ()=>{
    const v = parseInt(inputMin.value,10) || 0;
    const totalSoFar = activities.reduce((s,i)=>s+i.minutes,0);
    const remaining = 1440 - totalSoFar;
    const btnAdd = $('#btn-add-activity');
    if(btnAdd) btnAdd.disabled = (v <= 0 || v > remaining);
  });

  activitiesList.addEventListener('click', (e)=>{
    if(e.target.matches('[data-del]')){
      const id = e.target.getAttribute('data-del');
      activities = activities.filter(a=>a.id!==id);
      renderActivities();
    }
    if(e.target.matches('[data-id]')){
      const id = e.target.getAttribute('data-id');
      const a = activities.find(x=>x.id===id);
      const newTitle = prompt('Edit title', a.title);
      if(newTitle!=null) a.title = newTitle;
      const newMinRaw = prompt('Minutes', a.minutes);
      if(newMinRaw!=null){
        const newMin = parseInt(newMinRaw,10) || 0;
        const totalOther = activities.filter(x=>x.id!==id).reduce((s,i)=>s+i.minutes,0);
        if(totalOther + newMin > 1440) return alert('Updating this would exceed 1440 minutes for the day.');
        a.minutes = newMin;
      }
      renderActivities();
    }
  });

  datePicker.addEventListener('change', (e)=>{
    currentDate = e.target.value;
    loadActivitiesForDate(currentDate);
  });

  btnAnalyse.addEventListener('click', ()=> renderDashboard());

  let chart = null;
  function renderDashboard(){
    const total = activities.reduce((s,i)=>s+i.minutes,0);
    if(total===0){ noData.classList.remove('hidden'); dashboardContent.classList.add('hidden'); return; }
    noData.classList.add('hidden'); dashboardContent.classList.remove('hidden');
    totalHoursEl.textContent = (total/60).toFixed(1);
    numActivitiesEl.textContent = activities.length;
    const byCat = {};
    activities.forEach(a=>{ const k=a.category||'Uncategorized'; byCat[k]=(byCat[k]||0)+a.minutes });
    const labels = Object.keys(byCat);
    const data = labels.map(l=>byCat[l]);
    const ctx = document.getElementById('chart-pie').getContext('2d');
    if(chart) chart.destroy();
    chart = new Chart(ctx,{ type:'doughnut', data:{ labels, datasets:[{ data, backgroundColor:['#7c3aed','#06b6d4','#f97316','#ef4444','#10b981','#f59e0b','#ec4899','#8b5cf6'] }] }, options:{ responsive:true, plugins:{legend:{position:'bottom'}} } });
    const breakdown = $('#category-breakdown');
    breakdown.innerHTML = '<div class="breakdown-grid">'+labels.map(l=>`<div class="breakdown-item"><div class="breakdown-cat">${l}</div><div class="breakdown-time">${(byCat[l]/60).toFixed(1)}h</div></div>`).join('')+'</div>';
  }

  // Firestore persistence
  function scheduleSave(){
    if(saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(()=> saveActivitiesForDate(currentDate), SAVE_DEBOUNCE_MS);
  }

  async function loadActivitiesForDate(date){
    activities = [];
    isLoading = true;
    renderActivities();
    if(window.db && currentUser){
      try{
        const dayRef = db.collection('users').doc(currentUser.uid).collection('days').doc(date);
        const snap = await dayRef.get();
        if(snap.exists){
          const data = snap.data();
          if(Array.isArray(data.activities)) activities = data.activities;
        }
        const subsnap = await dayRef.collection('activities').get();
        if(!subsnap.empty){
          activities = subsnap.docs.map(d=>d.data()).sort((a,b)=> (a.createdAt||0)-(b.createdAt||0));
        }
      }catch(err){ console.error('Load error', err); }
    }
    isLoading = false;
    renderActivities();
  }

  async function saveActivitiesForDate(date){
    if(!currentUser || !window.db) return;
    try{
      const dayRef = db.collection('users').doc(currentUser.uid).collection('days').doc(date);
      await dayRef.set({ activities, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
      const subcol = dayRef.collection('activities');
      const existing = await subcol.get();
      const batch = db.batch();
      existing.docs.forEach(d=> batch.delete(d.ref));
      activities.forEach(a => {
        const docRef = subcol.doc(a.id);
        batch.set(docRef, Object.assign({}, a, { createdAt: a.createdAt || Date.now() }));
      });
      await batch.commit();
    }catch(err){ console.error('Save error', err); }
  }

  window.addEventListener('beforeunload', ()=>{ if(currentUser && window.db) saveActivitiesForDate(currentDate); });

  initFirebase();
  window.app = { renderDashboard, loadActivitiesForDate, saveActivitiesForDate };

})();

