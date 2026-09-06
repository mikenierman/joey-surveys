import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);

const freshVisit = () => ({
  asking: null,
  selling: null,
  usesPouches: null,
  pouchInfo: null,
  reset: null,
  present: null,
  facings: 0,
  oos: 0,
  shelfPos: null,
  shelf: null,
  backstock: null,
  replenished: null,
  fixes: { faced: false, shrink: false, placement: false, none: false },
  unc: null,
  uncNote: '',
  orderPlaced: null,
  pos: { sign: null, strike: null, strip: null },
  extPos: { sign: false, strike: false, bollards: false, other: false, none: false },
  educated: null,
  leaveBehind: null,
  reorderTags: null,
  priceVisible: null,
  priceOk: null,
  photos: { p1: false, p2: false, p3: false, p4: false, p5: false, p6: false, p7: false, p8: false, p9: false },
  followReq: null,
  followNote: ''
});

export default function JoeyApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [view, setView] = useState('login');
  const [stores, setStores] = useState([]);
  const [visits, setVisits] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [activeStore, setActiveStore] = useState(null);
  const [v, setV] = useState(freshVisit());
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ done: 0, todo: 0, total: 0 });

  useEffect(() => {
    const user = localStorage.getItem('joey_user');
    const type = localStorage.getItem('joey_user_type');
    if (user && type) {
      setCurrentUser(JSON.parse(user));
      setUserType(type);
      if (type === 'admin') setView('admin');
      else setView('route');
      loadData();
    }
  }, [loadData]);

  const loadData = async () => {
    try {
      const { data: storesData } = await supabase.from('stores').select('*');
      if (storesData) setStores(storesData);

      const { data: visitsData } = await supabase
        .from('visits')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (visitsData) {
        setVisits(visitsData);
        if (storesData) {
          const done = new Set(visitsData.map(v => v.store_number)).size;
          const total = storesData.length;
          setStats({ done, todo: total - done, total });
        }
      }
    } catch (e) {
      showToast('Error loading data');
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2600);
  };

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const userObj = {
        email,
        name: email.split('@')[0],
      };

      let role = 'rep';
      if (email === 'mike@direct2retailers.com') role = 'admin';
      if (email.includes('manager')) role = 'manager';

      localStorage.setItem('joey_user', JSON.stringify(userObj));
      localStorage.setItem('joey_user_type', role);
      
      setCurrentUser(userObj);
      setUserType(role);
      setView(role === 'admin' ? 'admin' : 'route');
      
      loadData();
      showToast(`Welcome, ${userObj.name}!`);
    } catch (e) {
      showToast('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('joey_user');
    localStorage.removeItem('joey_user_type');
    setCurrentUser(null);
    setUserType(null);
    setView('login');
  };

  const filteredStores = stores.filter(s => {
    if (userType === 'rep' && s.assigned_to !== currentUser?.email) return false;
    if (filter === 'done') return visits.find(v => v.store_number === s.site_number);
    if (filter === 'todo') return !visits.find(v => v.store_number === s.site_number);
    if (search) {
      const q = search.toLowerCase();
      return s.site_number?.includes(q) || s.city?.toLowerCase().includes(q);
    }
    return true;
  });

  const submitCheck = async () => {
    setLoading(true);
    try {
      const payload = {
        store_number: activeStore.site_number,
        store_city: activeStore.city,
        store_address: activeStore.address,
        pog_set: activeStore.pog_set,
        reset_date: activeStore.reset_date,
        visit_date: new Date().toISOString(),
        rep_name: currentUser.name,
        survey_data: v,
        submitted_by: currentUser.email
      };

      const { error } = await supabase.from('visits').insert([payload]);
      if (error) throw error;

      showToast(`CK #${activeStore.site_number} submitted!`);
      setView('route');
      setActiveStore(null);
      loadData();
    } catch (e) {
      showToast('Error submitting visit');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    if (v.asking === null || v.selling === null) return 'Check in: Answer all questions';
    if (v.present === null) return 'Find it: Mark if JOEY is present';
    if (v.present === 'yes' && v.facings < 1) return 'Find it: Add facings';
    if (v.shelf === null) return 'Stock: How stocked is JOEY?';
    if (v.educated === null) return 'Educate: Was manager educated?';
    if (v.priceVisible === null) return 'Educate: Is price visible?';
    if (Object.values(v.photos).filter(p => p).length === 0) return 'Photos: Upload at least one photo';
    if (v.orderPlaced === null) return 'Photos: Do they need an order?';
    return null;
  };

  if (view === 'login') {
    return <LoginView onLogin={handleLogin} loading={loading} />;
  }

  if (view === 'admin') {
    return (
      <AdminDashboard 
        visits={visits} 
        stores={stores}
        stats={stats}
        onLogout={handleLogout}
      />
    );
  }

  if (view === 'check') {
    return (
      <CheckView
        v={v}
        setV={setV}
        activeStore={activeStore}
        currentUser={currentUser}
        validate={validate}
        onSubmit={submitCheck}
        onBack={() => setView('route')}
        loading={loading}
      />
    );
  }

  return (
    <RouteView
      stores={filteredStores}
      stats={stats}
      filter={filter}
      onFilterChange={setFilter}
      search={search}
      onSearchChange={setSearch}
      onStoreClick={(store) => {
        setActiveStore(store);
        setV(freshVisit());
        setView('check');
      }}
      currentUser={currentUser}
      userType={userType}
      onAdminClick={() => setView('admin')}
      onLogout={handleLogout}
    />
  );
}

function LoginView({ onLogin, loading }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Joey × Circle K</h1>
          <p>Store Visit Survey</p>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onLogin(email, password); }}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        
        <div className="login-demo">
          <p>Demo accounts:</p>
          <code>mikenierman@gmail.com / demo</code>
          <code>mike@direct2retailers.com / demo</code>
        </div>
      </div>
    </div>
  );
}

function RouteView({ stores, stats, filter, onFilterChange, search, onSearchChange, onStoreClick, currentUser, userType, onAdminClick, onLogout }) {
  const pct = stats.total > 0 ? Math.round(100 * stats.done / stats.total) : 0;
  
  return (
    <div className="route-view">
      <div className="route-header">
        <div className="header-left">
          <h1>Circle K Route</h1>
          <p className="rep-name">👤 {currentUser?.name}</p>
        </div>
        <div className="header-buttons">
          {userType === 'manager' || userType === 'admin' ? (
            <button className="admin-btn" onClick={onAdminClick}>Dashboard</button>
          ) : null}
          <button className="logout-btn" onClick={onLogout}>Sign out</button>
        </div>
      </div>

      <div className="route-content">
        <div className="hero-card">
          <div className="progress-ring">
            <svg viewBox="0 0 118 118">
              <circle cx="59" cy="59" r="50" className="ring-bg" />
              <circle cx="59" cy="59" r="50" className="ring-fg" style={{
                strokeDasharray: `${2 * Math.PI * 50}`,
                strokeDashoffset: `${2 * Math.PI * 50 * (1 - stats.done / stats.total)}`
              }} />
            </svg>
            <div className="ring-label">
              <div className="ring-pct">{pct}%</div>
            </div>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-num">{stats.done} of {stats.total}</div>
              <div className="stat-label">Stores checked</div>
            </div>
            <div className="stat">
              <div className="stat-num green">{stats.todo}</div>
              <div className="stat-label">To go</div>
            </div>
          </div>
        </div>

        <input 
          className="search-input"
          type="search" 
          placeholder="Search store or city"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <div className="filter-tabs">
          {['all', 'todo', 'done'].map(f => (
            <button 
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => onFilterChange(f)}
            >
              {f === 'all' ? 'All' : f === 'todo' ? 'To do' : 'Done'} 
              <span className="count">{f === 'all' ? stats.total : f === 'todo' ? stats.todo : stats.done}</span>
            </button>
          ))}
        </div>

        <div className="stores-list">
          {stores.length === 0 ? (
            <div className="no-results">NO STORES MATCH</div>
          ) : (
            stores.map(store => (
              <button
                key={store.site_number}
                className="store-card"
                onClick={() => onStoreClick(store)}
              >
                <div className="store-badge">GO</div>
                <div className="store-info">
                  <div className="store-name">Circle K #{store.site_number}</div>
                  <div className="store-addr">{store.address}, {store.city}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function CheckView({ v, setV, activeStore, currentUser, validate, onSubmit, onBack, loading }) {
  return (
    <div className="check-view">
      <div className="check-header">
        <button className="back-btn" onClick={onBack}>‹</button>
        <div>
          <h1>Merch Visit</h1>
          <p className="check-subtitle">CK #{activeStore?.site_number}</p>
        </div>
      </div>

      <div className="visit-content">
        <div className="phase-card">
          <div className="phase-title">Check in</div>
          <div className="q">Are customers asking for JOEY?</div>
          <YesNoButtons value={v.asking} onChange={(val) => setV({...v, asking: val})} />
          
          <div className="q">Has JOEY been selling well?</div>
          <YesNoButtons value={v.selling} onChange={(val) => setV({...v, selling: val})} />
        </div>

        <div className="phase-card">
          <div className="phase-title">Find it</div>
          <div className="q">Is JOEY in the set?</div>
          <YesNoButtons value={v.present} onChange={(val) => setV({...v, present: val})} />
          
          {v.present === 'yes' && (
            <>
              <div className="q">Facings and out of stock</div>
              <div className="stepper-row">
                <Stepper label="Facings" value={v.facings} onChange={(val) => setV({...v, facings: val})} />
                <Stepper label="Out of stock" value={v.oos} onChange={(val) => setV({...v, oos: val})} />
              </div>
            </>
          )}
        </div>

        {v.present === 'yes' && (
          <div className="phase-card">
            <div className="phase-title">Stock</div>
            <div className="q">How stocked is JOEY?</div>
            <OptionsGrid 
              options={['well', 'low', 'out']}
              labels={{well: 'Well stocked', low: 'Low', out: 'Out'}}
              value={v.shelf}
              onChange={(val) => setV({...v, shelf: val})}
            />
          </div>
        )}

        <div className="phase-card">
          <div className="phase-title">Educate & Price</div>
          <div className="q">Did you educate the manager?</div>
          <YesNoButtons value={v.educated} onChange={(val) => setV({...v, educated: val})} />
          
          <div className="q">Is the shelf price visible?</div>
          <YesNoButtons value={v.priceVisible} onChange={(val) => setV({...v, priceVisible: val})} />
        </div>

        <div className="phase-card">
          <div className="phase-title">Photos</div>
          <div className="q">Upload photos (tap to select)</div>
          <div className="photo-grid">
            {['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9'].map(id => (
              <button key={id} className={`photo-slot ${v.photos[id] ? 'captured' : ''}`} onClick={() => setV({...v, photos: {...v.photos, [id]: !v.photos[id]}})}>
                {v.photos[id] ? '✓' : '📷'}
              </button>
            ))}
          </div>

          <div className="q">Do they need an order?</div>
          <YesNoButtons value={v.orderPlaced} onChange={(val) => setV({...v, orderPlaced: val})} />
        </div>
      </div>

      <div className="submit-bar">
        <button 
          className="submit-btn" 
          disabled={!!validate() || loading}
          onClick={onSubmit}
        >
          {loading ? 'Submitting...' : 'Submit visit'}
        </button>
        <div className="submit-hint">
          {validate() || 'Ready to submit!'}
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ visits, stores, stats, onLogout }) {
  return (
    <div className="admin-view">
      <div className="admin-header">
        <h1>Joey Admin Dashboard</h1>
        <button onClick={onLogout}>Sign out</button>
      </div>

      <div className="admin-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.done}</div>
          <div className="stat-label">Stores completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.todo}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{Math.round(100 * stats.done / stats.total)}%</div>
          <div className="stat-label">Completion</div>
        </div>
      </div>

      <div className="recent-visits">
        <h2>Recent Submissions</h2>
        {visits.slice(0, 10).map(v => (
          <div key={v.id} className="visit-row">
            <span>CK #{v.store_number}</span>
            <span>{v.rep_name}</span>
            <span>{new Date(v.created_at).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function YesNoButtons({ value, onChange }) {
  return (
    <div className="button-group">
      <button className={`btn ${value === 'yes' ? 'active good' : ''}`} onClick={() => onChange(value === 'yes' ? null : 'yes')}>Yes</button>
      <button className={`btn ${value === 'no' ? 'active warn' : ''}`} onClick={() => onChange(value === 'no' ? null : 'no')}>No</button>
    </div>
  );
}

function OptionsGrid({ options, labels = {}, value, onChange }) {
  return (
    <div className="options-grid">
      {options.map(opt => (
        <button 
          key={opt}
          className={`option-btn ${value === opt ? 'active' : ''}`}
          onClick={() => onChange(value === opt ? null : opt)}
        >
          {labels[opt] || opt}
        </button>
      ))}
    </div>
  );
}

function Stepper({ label, value, onChange }) {
  return (
    <div className="stepper">
      <div className="stepper-label">{label}</div>
      <div className="stepper-controls">
        <button onClick={() => onChange(Math.max(0, value - 1))}>−</button>
        <span>{value}</span>
        <button onClick={() => onChange(Math.min(99, value + 1))}>+</button>
      </div>
    </div>
  );
}
