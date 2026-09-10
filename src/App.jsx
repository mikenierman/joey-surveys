import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import {
  loadStores,
  loadVisits,
  storeIsDone,
  submitVisit,
  exportVisitsCsv,
} from './lib/data';
import {
  PHASES,
  POS_ITEMS,
  POS_OPTS,
  compressImageFile,
  currentCycleKey,
  freshVisit,
  requiredPhotoGroups,
  validateVisit,
  visitFlags,
} from './lib/visitLogic';
import {
  GPS_STATUS,
  captureGps,
  evaluateLocation,
  locationBannerCopy,
} from './lib/gps';
import { uploadVisitPhotos } from './lib/photos';

const DEMO_PASSWORD = 'demo';
const DEMO_ADMIN = 'mike@direct2retailers.com';
const DEMO_REP = 'mikenierman@gmail.com';
const DEMO_CLIENT = 'joey@joeypouches.com';
const DEMO_ROUTE_SIZE = 18;

function displayName(email) {
  const local = (email || '').split('@')[0] || 'Rep';
  return local
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function roleForEmail(email) {
  const e = (email || '').toLowerCase();
  if (e === DEMO_ADMIN) return 'admin';
  if (e === DEMO_CLIENT || e.endsWith('@joeypouches.com')) return 'client';
  if (e.includes('manager')) return 'manager';
  return 'rep';
}

function homeViewForRole(role) {
  if (role === 'admin' || role === 'manager') return 'admin';
  if (role === 'client') return 'client';
  return 'route';
}

/** Stable ~18-store demo slice for Mike (Grand Canyon first, then by site). */
function demoRouteStores(allStores) {
  const bySite = (a, b) => String(a.site_number).localeCompare(String(b.site_number));
  const gc = allStores
    .filter((s) => /Grand Canyon/i.test(s.business_unit || ''))
    .sort(bySite);
  if (gc.length >= DEMO_ROUTE_SIZE) return gc.slice(0, DEMO_ROUTE_SIZE);
  const rest = allStores
    .filter((s) => !/Grand Canyon/i.test(s.business_unit || ''))
    .sort(bySite);
  return [...gc, ...rest].slice(0, DEMO_ROUTE_SIZE);
}

function applyGpsResult(setV, store, capture) {
  const evaluated = evaluateLocation(capture, store);
  setV((prev) => ({
    ...prev,
    gps: evaluated.gps,
    gpsStatus: evaluated.gpsStatus,
    gpsUnavailable: evaluated.gpsUnavailable,
    locationMismatch: evaluated.locationMismatch,
    gpsDistanceM: evaluated.gpsDistanceM,
    gpsError: evaluated.gpsError,
  }));
  return evaluated;
}

export default function JoeyApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [view, setView] = useState('login');
  const [stores, setStores] = useState([]);
  const [visits, setVisits] = useState([]);
  const [dataSource, setDataSource] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [activeStore, setActiveStore] = useState(null);
  const [v, setV] = useState(freshVisit());
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [adminFollowOnly, setAdminFollowOnly] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');
  const cycleKey = currentCycleKey();

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }, []);

  const refreshData = useCallback(async () => {
    setBootLoading(true);
    try {
      const [{ stores: s, source }, visitsData] = await Promise.all([
        loadStores(),
        loadVisits(),
      ]);
      setStores(s);
      setVisits(visitsData);
      setDataSource(source);
    } catch (e) {
      showToast(e.message || 'Error loading data');
    } finally {
      setBootLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const user = localStorage.getItem('joey_user');
    const type = localStorage.getItem('joey_user_type');
    if (user && type) {
      setCurrentUser(JSON.parse(user));
      setUserType(type);
      setView(homeViewForRole(type));
      refreshData();
    }
  }, [refreshData]);

  const myStores = useMemo(() => {
    if (!currentUser) return [];
    const email = (currentUser.email || '').toLowerCase();
    if (userType === 'admin' || userType === 'manager' || userType === 'client') {
      return stores;
    }
    if (email === DEMO_REP) {
      return demoRouteStores(stores);
    }
    return stores.filter((s) => (s.assigned_to || '').toLowerCase() === email);
  }, [stores, currentUser, userType]);

  const stats = useMemo(() => {
    const total = myStores.length;
    const done = myStores.filter((s) => storeIsDone(s, visits, cycleKey)).length;
    return { done, todo: total - done, total };
  }, [myStores, visits, cycleKey]);

  const filteredStores = useMemo(() => {
    const q = search.trim().toLowerCase();
    return myStores.filter((s) => {
      const done = storeIsDone(s, visits, cycleKey);
      if (filter === 'done' && !done) return false;
      if (filter === 'todo' && done) return false;
      if (!q) return true;
      return (
        String(s.site_number).includes(q) ||
        (s.city || '').toLowerCase().includes(q) ||
        (s.address || '').toLowerCase().includes(q) ||
        (s.state || '').toLowerCase().includes(q)
      );
    });
  }, [myStores, visits, cycleKey, filter, search]);

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const e = email.trim().toLowerCase();
      if (!e || !password) {
        showToast('Enter email and password');
        return;
      }
      if (password !== DEMO_PASSWORD) {
        showToast('Invalid password');
        return;
      }
      const role = roleForEmail(e);
      const userObj = { email: e, name: displayName(e) };
      localStorage.setItem('joey_user', JSON.stringify(userObj));
      localStorage.setItem('joey_user_type', role);
      setCurrentUser(userObj);
      setUserType(role);
      setView(homeViewForRole(role));
      await refreshData();
      showToast(`Welcome, ${userObj.name}`);
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
    setActiveStore(null);
  };

  const refreshVisitGps = useCallback(
    async (store = activeStore) => {
      if (!store) return null;
      setV((prev) => ({
        ...prev,
        gpsStatus: GPS_STATUS.PENDING,
        gpsError: null,
      }));
      const capture = await captureGps();
      return applyGpsResult(setV, store, capture);
    },
    [activeStore]
  );

  const startVisit = (store) => {
    if (storeIsDone(store, visits, cycleKey)) {
      showToast('Already submitted this cycle');
      return;
    }
    setActiveStore(store);
    setV(freshVisit());
    setView('check');
    captureGps().then((capture) => applyGpsResult(setV, store, capture));
  };

  const handleSubmit = async () => {
    const err = validateVisit(v);
    if (err) {
      showToast(err);
      return;
    }
    setLoading(true);
    try {
      let visitState = v;
      // One last GPS attempt if we still don't have coordinates
      if (!v.gps || v.gpsStatus === GPS_STATUS.PENDING) {
        const evaluated = await refreshVisitGps(activeStore);
        if (evaluated) {
          visitState = {
            ...v,
            gps: evaluated.gps,
            gpsStatus: evaluated.gpsStatus,
            gpsUnavailable: evaluated.gpsUnavailable,
            locationMismatch: evaluated.locationMismatch,
            gpsDistanceM: evaluated.gpsDistanceM,
            gpsError: evaluated.gpsError,
          };
        }
      }
      const flags = visitFlags(visitState);
      const isException =
        visitState.exception === 'closed' || visitState.exception === 'inaccessible';
      const isRefusal = visitState.exception === 'refused';
      const followup =
        flags.length > 0 || visitState.followReq === 'yes' || isException || isRefusal;
      const { photo_urls } = await uploadVisitPhotos({
        cycleKey,
        storeNumber: activeStore.site_number,
        photos: visitState.photos,
      });
      const survey_data = { ...visitState, photos: undefined };
      const payload = {
        store_number: String(activeStore.site_number),
        store_city: activeStore.city,
        store_address: activeStore.address,
        store_state: activeStore.state,
        business_unit: activeStore.business_unit,
        pog_set: activeStore.pog_set,
        reset_date: activeStore.reset_date,
        visit_date: new Date().toISOString(),
        cycle_key: cycleKey,
        rep_name: currentUser.name,
        submitted_by: currentUser.email,
        status: isException ? 'exception' : isRefusal ? 'in_review' : 'submitted',
        followup,
        flags,
        survey_data,
        photo_urls,
        gps: visitState.gps,
      };
      const { synced } = await submitVisit(payload);
      showToast(
        synced
          ? `CK #${activeStore.site_number} submitted`
          : `CK #${activeStore.site_number} saved (will sync)`
      );
      setView('route');
      setActiveStore(null);
      await refreshData();
    } catch (e) {
      showToast(e.message || 'Error submitting visit');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'login') {
    return <LoginView onLogin={handleLogin} loading={loading} toast={toast} />;
  }

  if (view === 'admin' || view === 'client') {
    return (
      <AdminDashboard
        mode={view === 'client' ? 'client' : 'admin'}
        visits={visits}
        stores={stores}
        stats={stats}
        myStores={myStores}
        cycleKey={cycleKey}
        dataSource={dataSource}
        onLogout={handleLogout}
        onBackToRoute={() => setView('route')}
        selectedVisit={selectedVisit}
        setSelectedVisit={setSelectedVisit}
        followOnly={adminFollowOnly}
        setFollowOnly={setAdminFollowOnly}
        search={adminSearch}
        setSearch={setAdminSearch}
        toast={toast}
        showToast={showToast}
        bootLoading={bootLoading}
        onRefresh={refreshData}
      />
    );
  }

  if (view === 'check') {
    return (
      <CheckView
        v={v}
        setV={setV}
        activeStore={activeStore}
        validate={() => validateVisit(v)}
        onSubmit={handleSubmit}
        onRetryGps={() => refreshVisitGps(activeStore)}
        onBack={() => {
          setView('route');
          setActiveStore(null);
        }}
        loading={loading}
        toast={toast}
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
      onStoreClick={startVisit}
      isDone={(s) => storeIsDone(s, visits, cycleKey)}
      currentUser={currentUser}
      userType={userType}
      cycleKey={cycleKey}
      dataSource={dataSource}
      bootLoading={bootLoading}
      onAdminClick={() => setView('admin')}
      onLogout={handleLogout}
      toast={toast}
    />
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return <div className="toast show">{toast}</div>;
}

function LocationBanner({ v, onRetry }) {
  const copy = locationBannerCopy(v);
  const busy = v?.gpsStatus === GPS_STATUS.PENDING;
  const showRetry =
    !busy &&
    v?.gpsStatus !== GPS_STATUS.OK &&
    typeof onRetry === 'function';

  return (
    <div className={`geo-banner geo-${copy.tone}`}>
      <div className="geo-banner-text">
        <strong>{copy.title}</strong>
        <span>{copy.body}</span>
      </div>
      {showRetry ? (
        <button type="button" className="geo-retry" onClick={onRetry}>
          Retry GPS
        </button>
      ) : null}
    </div>
  );
}

function LoginView({ onLogin, loading, toast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="login-container">
      <Toast toast={toast} />
      <div className="login-card">
        <div className="login-header">
          <h1>Joey × Circle K</h1>
          <p>Store Visit Survey</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onLogin(email, password);
          }}
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="login-demo">
          <p>Demo accounts (password: demo)</p>
          <code>{DEMO_REP}</code>
          <code>{DEMO_ADMIN}</code>
          <code>{DEMO_CLIENT}</code>
        </div>
      </div>
    </div>
  );
}

function RouteView({
  stores,
  stats,
  filter,
  onFilterChange,
  search,
  onSearchChange,
  onStoreClick,
  isDone,
  currentUser,
  userType,
  cycleKey,
  dataSource,
  bootLoading,
  onAdminClick,
  onLogout,
  toast,
}) {
  const pct = stats.total > 0 ? Math.round((100 * stats.done) / stats.total) : 0;
  const circ = 2 * Math.PI * 50;

  return (
    <div className="route-view">
      <Toast toast={toast} />
      <div className="route-header">
        <div className="header-left">
          <h1>Circle K Route</h1>
          <p className="rep-name">
            {currentUser?.name} · {cycleKey}
            {dataSource ? ` · ${dataSource}` : ''}
          </p>
        </div>
        <div className="header-buttons">
          {userType === 'manager' || userType === 'admin' ? (
            <button className="admin-btn" onClick={onAdminClick}>
              Dashboard
            </button>
          ) : null}
          <button className="logout-btn" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </div>

      <div className="route-content">
        <div className="hero-card">
          <div className="progress-ring">
            <svg viewBox="0 0 118 118">
              <circle cx="59" cy="59" r="50" className="ring-bg" />
              <circle
                cx="59"
                cy="59"
                r="50"
                className="ring-fg"
                style={{
                  strokeDasharray: `${circ}`,
                  strokeDashoffset: `${circ * (1 - (stats.total ? stats.done / stats.total : 0))}`,
                }}
              />
            </svg>
            <div className="ring-label">
              <div className="ring-pct">{pct}%</div>
            </div>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-num">
                {stats.done} of {stats.total}
              </div>
              <div className="stat-label">Stores checked</div>
            </div>
            <div className="stat">
              <div className="stat-num green">{stats.todo}</div>
              <div className="stat-label">To go</div>
            </div>
          </div>
        </div>

        <div className="bonus-banner">
          <div className="bonus-copy">
            Complete assigned stores this cycle. Pay terms appear in your settlement
            hub — not in this survey.
          </div>
        </div>

        <input
          className="search-input"
          type="search"
          placeholder="Search store, city, or address"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <div className="filter-tabs">
          {[
            ['all', 'All', stats.total],
            ['todo', 'To do', stats.todo],
            ['done', 'Done', stats.done],
          ].map(([f, label, count]) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => onFilterChange(f)}
            >
              {label}
              <span className="count">{count}</span>
            </button>
          ))}
        </div>

        <div className="stores-list">
          {bootLoading ? (
            <div className="no-results">Loading stores…</div>
          ) : stores.length === 0 ? (
            <div className="no-results">NO STORES MATCH</div>
          ) : (
            stores.map((store) => {
              const done = isDone(store);
              return (
                <button
                  key={store.site_number}
                  className={`store-card ${done ? 'done-card' : 'todo'}`}
                  onClick={() => onStoreClick(store)}
                  type="button"
                >
                  <div className={`store-badge ${done ? 'done-b' : 'todo-b'}`}>
                    {done ? '✓' : 'GO'}
                  </div>
                  <div className="store-info">
                    <div className="store-name">
                      Circle K #{store.site_number}
                      {store.closing ? ' · CLOSING' : ''}
                    </div>
                    <div className="store-addr">
                      {store.address}, {store.city}, {store.state}
                    </div>
                    <div className="store-meta">
                      POG {store.pog_set || '—'}
                      {store.business_unit
                        ? ` · ${String(store.business_unit).split(' - ').pop()}`
                        : ''}
                    </div>
                  </div>
                  <div className={`store-status ${done ? 's-done' : 's-todo'}`}>
                    {done ? 'DONE' : 'TO DO'}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function Pill({ on, cls, children, onClick }) {
  return (
    <button type="button" className={`pill ${on ? cls || 'on' : ''}`} onClick={onClick}>
      {children}
    </button>
  );
}

function YesNo({ value, onChange, yesLabel = 'Yes', noLabel = 'No' }) {
  return (
    <div className="pills grid2">
      <Pill on={value === 'yes'} cls="on-good" onClick={() => onChange(value === 'yes' ? null : 'yes')}>
        {yesLabel}
      </Pill>
      <Pill on={value === 'no'} cls="on-warn" onClick={() => onChange(value === 'no' ? null : 'no')}>
        {noLabel}
      </Pill>
    </div>
  );
}

function Stepper({ label, value, onChange }) {
  return (
    <div className="stepper">
      <div className="stepper-label">{label}</div>
      <div className="stepper-controls">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))}>
          −
        </button>
        <span>{value}</span>
        <button type="button" onClick={() => onChange(Math.min(99, value + 1))}>
          +
        </button>
      </div>
    </div>
  );
}

function PhaseHead({ phase, status }) {
  const chip =
    status === 'done'
      ? 'DONE'
      : status === 'part'
        ? 'IN PROGRESS'
        : status === 'skip'
          ? 'SKIPPED'
          : 'TO DO';
  return (
    <div className="phase-head">
      <div>
        <div className="phase-eyebrow">
          {phase.num} / {phase.name.toUpperCase()}
        </div>
        <div className="phase-name">{phase.name}</div>
      </div>
      <span className={`status-chip ${status}`}>{chip}</span>
    </div>
  );
}

function PhotoCapture({ id, label, photo, onCapture, onClear }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const compressed = await compressImageFile(file);
      onCapture(id, compressed);
    } catch (err) {
      alert(err.message || 'Photo failed');
    } finally {
      setBusy(false);
    }
  };

  if (photo?.dataUrl) {
    return (
      <div className="photo-slot captured has-img">
        <img src={photo.dataUrl} alt={label} />
        <button type="button" className="retake" onClick={() => onClear(id)}>
          RETAKE
        </button>
        <span className="slot-label">{label}</span>
        <span className="stamp">
          {new Date(photo.capturedAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="photo-slot"
      disabled={busy}
      onClick={() => inputRef.current?.click()}
    >
      <span className="cam">{busy ? '…' : '📷'}</span>
      <span className="slot-label">{label}</span>
      <span className="req">REQUIRED · CAMERA</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={onFile}
      />
    </button>
  );
}

function CheckView({
  v,
  setV,
  activeStore,
  validate,
  onSubmit,
  onRetryGps,
  onBack,
  loading,
  toast,
}) {
  const [showEscape, setShowEscape] = useState(false);

  const setF = (field, val) => {
    setV((prev) => {
      const next = { ...prev, [field]: prev[field] === val ? null : val };
      if (field === 'present') {
        next.shelfPos = null;
        next.shelf = null;
        next.backstock = null;
        next.replenished = null;
        next.fixes = { faced: false, shrink: false, placement: false, none: false };
        next.unc = null;
        next.uncNote = '';
        next.photos = {
          ...next.photos,
          p2: null,
          p3: null,
          p4: null,
          p7: null,
        };
      }
      if (field === 'shelf') {
        if (next.shelf === 'well') {
          next.backstock = null;
          next.replenished = 'notneeded';
        } else if (prev.shelf === 'well' && next.shelf !== 'well') {
          next.replenished = null;
        }
      }
      if (field === 'usesPouches' && val !== 'no') next.pouchInfo = null;
      if (field === 'priceVisible' && val !== 'yes') next.priceOk = null;
      return next;
    });
  };

  const setException = (type) => {
    setV((prev) => ({
      ...prev,
      exception: prev.exception === type ? null : type,
    }));
  };

  const toggleFix = (key) => {
    setV((prev) => {
      const fixes = { ...prev.fixes };
      if (key === 'none') {
        const on = !fixes.none;
        return {
          ...prev,
          fixes: { faced: false, shrink: false, placement: false, none: on },
        };
      }
      fixes[key] = !fixes[key];
      fixes.none = false;
      return { ...prev, fixes };
    });
  };

  const toggleExt = (key) => {
    setV((prev) => {
      const extPos = { ...prev.extPos };
      if (key === 'none') {
        const on = !extPos.none;
        return {
          ...prev,
          extPos: { sign: false, strike: false, bollards: false, other: false, none: on },
        };
      }
      extPos[key] = !extPos[key];
      extPos.none = false;
      return { ...prev, extPos };
    });
  };

  const setPos = (id, val) => {
    setV((prev) => ({
      ...prev,
      pos: {
        ...prev.pos,
        [id]: prev.pos[id] === val ? null : val,
      },
    }));
  };

  const flags = visitFlags(v);
  const validationError = validate();
  const phaseStatuses = PHASES.map((p) => ({ ...p, status: p.st(v) }));
  const isExceptionPath = !!v.exception;

  return (
    <div className="check-view">
      <Toast toast={toast} />
      <div className="check-header">
        <button className="back-btn" type="button" onClick={onBack}>
          ‹
        </button>
        <div className="check-header-main">
          <h1>Merch Visit</h1>
          <p className="check-subtitle">
            CK #{activeStore?.site_number} · {activeStore?.city}, {activeStore?.state}
          </p>
        </div>
        <button
          type="button"
          className={`escape-btn ${showEscape || isExceptionPath ? 'on' : ''}`}
          onClick={() => setShowEscape((s) => !s)}
        >
          Can&apos;t complete
        </button>
      </div>

      {(showEscape || isExceptionPath) && (
        <div className="escape-panel">
          <div className="q">
            Store closed, inaccessible, or refused the visit?
            <small>Documents an exception (V0c) or refusal (V0d). Skips the full survey.</small>
          </div>
          <div className="pills">
            <Pill
              on={v.exception === 'closed'}
              cls="on-warn"
              onClick={() => setException('closed')}
            >
              Store closed
            </Pill>
            <Pill
              on={v.exception === 'inaccessible'}
              cls="on-warn"
              onClick={() => setException('inaccessible')}
            >
              Inaccessible
            </Pill>
            <Pill
              on={v.exception === 'refused'}
              cls="on-warn"
              onClick={() => setException('refused')}
            >
              Refused visit
            </Pill>
          </div>
          {v.exception ? (
            <textarea
              className={
                v.exception === 'refused' && v.exceptionNote.trim() === '' ? 'needed' : ''
              }
              placeholder={
                v.exception === 'refused'
                  ? 'Clerk name / role and why (required)'
                  : 'Optional note (hours, gate, construction…)'
              }
              value={v.exceptionNote}
              onChange={(e) => setV((p) => ({ ...p, exceptionNote: e.target.value }))}
            />
          ) : null}
          {v.exception ? (
            <button
              type="button"
              className="escape-clear"
              onClick={() => setV((p) => ({ ...p, exception: null, exceptionNote: '' }))}
            >
              Clear and continue full visit
            </button>
          ) : null}
        </div>
      )}

      {!isExceptionPath ? (
        <div className="phase-track">
          {phaseStatuses.map((p) => (
            <div key={p.key} className={`phase-dot ${p.status}`} title={p.name} />
          ))}
        </div>
      ) : null}

      <LocationBanner v={v} onRetry={onRetryGps} />

      {isExceptionPath ? (
        <div className="visit-content">
          <div className="phase-card">
            <div className="phase-eyebrow">EXCEPTION / REFUSAL</div>
            <div className="phase-name">
              {v.exception === 'refused'
                ? 'Visit refused'
                : v.exception === 'closed'
                  ? 'Store closed'
                  : 'Store inaccessible'}
            </div>
            <p className="escape-summary">
              Submit to log this store with the appropriate flag. You can reopen later if
              needed after review rules allow it.
            </p>
          </div>
        </div>
      ) : (
      <div className="visit-content">
        <div className="meta-row">
          <span className="meta-chip">POG {activeStore?.pog_set || '—'}</span>
          <span className="meta-chip">
            {activeStore?.reset_date
              ? `Reset ${activeStore.reset_date}`
              : activeStore?.reset_note || 'Reset n/a'}
          </span>
          {activeStore?.closing ? (
            <span className="meta-chip warn">Store closing</span>
          ) : null}
        </div>

        {/* 01 Check in */}
        <div className="phase-card">
          <PhaseHead phase={PHASES[0]} status={PHASES[0].st(v)} />
          <div className="q">
            Introduce yourself, then ask these questions.
            <small>Do this before you touch the shelf.</small>
          </div>
          <div className="q">Are customers asking for JOEY?</div>
          <div className="pills">
            <Pill on={v.asking === 'yes'} cls="on-good" onClick={() => setF('asking', 'yes')}>
              Yes
            </Pill>
            <Pill on={v.asking === 'no'} cls="on-warn" onClick={() => setF('asking', 'no')}>
              No
            </Pill>
            <Pill on={v.asking === 'na'} cls="on" onClick={() => setF('asking', 'na')}>
              Could not ask
            </Pill>
          </div>
          <div className="q">Has JOEY been selling well?</div>
          <div className="pills">
            <Pill on={v.selling === 'yes'} cls="on-good" onClick={() => setF('selling', 'yes')}>
              Yes
            </Pill>
            <Pill on={v.selling === 'no'} cls="on-warn" onClick={() => setF('selling', 'no')}>
              No
            </Pill>
            <Pill on={v.selling === 'na'} cls="on" onClick={() => setF('selling', 'na')}>
              Could not ask
            </Pill>
          </div>
          <div className="q">Does the clerk use pouches?</div>
          <YesNo value={v.usesPouches} onChange={(val) => setF('usesPouches', val)} />
          {v.usesPouches === 'no' ? (
            <>
              <div className="q">How does the clerk hear about pouches?</div>
              <div className="pills grid2">
                {[
                  ['customers', 'Customers'],
                  ['friends', 'Friends and family'],
                  ['coworkers', 'Co-workers'],
                  ['other', 'Other'],
                ].map(([val, label]) => (
                  <Pill
                    key={val}
                    on={v.pouchInfo === val}
                    cls="on"
                    onClick={() => setF('pouchInfo', val)}
                  >
                    {label}
                  </Pill>
                ))}
              </div>
            </>
          ) : null}
        </div>

        {/* 02 Find it */}
        <div className="phase-card">
          <PhaseHead phase={PHASES[1]} status={PHASES[1].st(v)} />
          <div className="q">Has the store been reset?</div>
          <YesNo value={v.reset} onChange={(val) => setF('reset', val)} />
          <div className="q">
            Is JOEY present in the nicotine set?
            <small>Compare to POG set {activeStore?.pog_set}</small>
          </div>
          <YesNo value={v.present} onChange={(val) => setF('present', val)} />
          {v.present === 'yes' ? (
            <>
              <div className="q">JOEY facings and out of stock</div>
              <div className="stepper-row">
                <Stepper
                  label="JOEY facings"
                  value={v.facings}
                  onChange={(n) => setV((p) => ({ ...p, facings: n }))}
                />
                <Stepper
                  label="Out of stock"
                  value={v.oos}
                  onChange={(n) => setV((p) => ({ ...p, oos: n }))}
                />
              </div>
              {v.oos > v.facings ? (
                <div className="st-err">OUT OF STOCK CANNOT EXCEED FACINGS</div>
              ) : null}
              <div className="q">Where does JOEY sit on the shelf?</div>
              <div className="pills">
                {[
                  ['top', 'Top third'],
                  ['middle', 'Middle third'],
                  ['bottom', 'Bottom third'],
                ].map(([val, label]) => (
                  <Pill
                    key={val}
                    on={v.shelfPos === val}
                    cls="on"
                    onClick={() => setF('shelfPos', val)}
                  >
                    {label}
                  </Pill>
                ))}
              </div>
            </>
          ) : null}
          {v.present === 'no' ? (
            <div className="skip-note">
              JOEY missing from the set. Stock and fixes are skipped; grab the backbar
              photo and flag follow-up.
            </div>
          ) : null}
        </div>

        {/* 03 Stock */}
        {v.present === 'no' ? (
          <div className="phase-card skipped">
            <PhaseHead phase={PHASES[2]} status="skip" />
            <div className="skip-note">Skipped, JOEY not in set.</div>
          </div>
        ) : (
          <div className="phase-card">
            <PhaseHead phase={PHASES[2]} status={PHASES[2].st(v)} />
            {v.present !== 'yes' ? (
              <div className="skip-note">Answer Find it first to unlock stock checks.</div>
            ) : (
              <>
            <div className="q">How stocked is the JOEY shelf?</div>
            <div className="pills">
              <Pill on={v.shelf === 'well'} cls="on-good" onClick={() => setF('shelf', 'well')}>
                Well stocked
              </Pill>
              <Pill on={v.shelf === 'low'} cls="on-warn" onClick={() => setF('shelf', 'low')}>
                Low
              </Pill>
              <Pill on={v.shelf === 'out'} cls="on-warn" onClick={() => setF('shelf', 'out')}>
                Out
              </Pill>
            </div>
            {v.shelf === 'low' || v.shelf === 'out' ? (
              <>
                <div className="q">
                  Is there JOEY backstock in the store?
                  <small>Ask store personnel</small>
                </div>
                <div className="pills">
                  <Pill
                    on={v.backstock === 'yes'}
                    cls="on-good"
                    onClick={() => setF('backstock', 'yes')}
                  >
                    Yes
                  </Pill>
                  <Pill
                    on={v.backstock === 'no'}
                    cls="on-warn"
                    onClick={() => setF('backstock', 'no')}
                  >
                    No
                  </Pill>
                  <Pill on={v.backstock === 'na'} cls="on" onClick={() => setF('backstock', 'na')}>
                    Could not ask
                  </Pill>
                </div>
              </>
            ) : null}
            {v.shelf != null ? (
              <>
                <div className="q">Did you replenish the shelf during your visit?</div>
                <div className="pills">
                  <Pill
                    on={v.replenished === 'yes'}
                    cls="on-good"
                    onClick={() => setF('replenished', 'yes')}
                  >
                    Yes
                  </Pill>
                  <Pill
                    on={v.replenished === 'no'}
                    cls="on-warn"
                    onClick={() => setF('replenished', 'no')}
                  >
                    No
                  </Pill>
                  <Pill
                    on={v.replenished === 'notneeded'}
                    cls="on"
                    onClick={() => setF('replenished', 'notneeded')}
                  >
                    Not needed
                  </Pill>
                </div>
              </>
            ) : null}
              </>
            )}
          </div>
        )}

        {/* 04 Fix */}
        {v.present === 'no' ? (
          <div className="phase-card skipped">
            <PhaseHead phase={PHASES[3]} status="skip" />
            <div className="skip-note">Skipped, JOEY not in set.</div>
          </div>
        ) : (
          <div className="phase-card">
            <PhaseHead phase={PHASES[3]} status={PHASES[3].st(v)} />
            {v.present !== 'yes' ? (
              <div className="skip-note">Answer Find it first to unlock fixes.</div>
            ) : (
              <>
            <div className="q">
              What did you fix?<small>Tap all that apply</small>
            </div>
            <div className="pills">
              <Pill on={v.fixes.faced} cls="on-good" onClick={() => toggleFix('faced')}>
                Faced and straightened
              </Pill>
              <Pill on={v.fixes.shrink} cls="on-good" onClick={() => toggleFix('shrink')}>
                Removed shrink wrap
              </Pill>
              <Pill on={v.fixes.placement} cls="on-good" onClick={() => toggleFix('placement')}>
                Fixed placement
              </Pill>
              <Pill on={v.fixes.none} cls="on" onClick={() => toggleFix('none')}>
                Nothing needed
              </Pill>
            </div>
            <div className="q">Was there anything you could not fix?</div>
            <YesNo value={v.unc} onChange={(val) => setF('unc', val)} />
            {v.unc === 'yes' ? (
              <textarea
                className={v.uncNote.trim() === '' ? 'needed' : ''}
                placeholder="Describe the issue (required)"
                value={v.uncNote}
                onChange={(e) => setV((p) => ({ ...p, uncNote: e.target.value }))}
              />
            ) : null}
              </>
            )}
          </div>
        )}

        {/* 05 POS */}
        <div className="phase-card">
          <PhaseHead phase={PHASES[4]} status={PHASES[4].st(v)} />
          <div className="q">What happened with each POS item?</div>
          {POS_ITEMS.map((item) => (
            <div className="pos-item" key={item.id}>
              <span className="pi-name">{item.name}</span>
              <span className="pi-size">{item.size}</span>
              <div className="pills grid2">
                {POS_OPTS.map((o) => (
                  <Pill
                    key={o.val}
                    on={v.pos[item.id] === o.val}
                    cls={
                      o.val === 'installed' ? 'on-good' : o.val === 'declined' ? 'on-warn' : 'on'
                    }
                    onClick={() => setPos(item.id, o.val)}
                  >
                    {o.label}
                  </Pill>
                ))}
              </div>
            </div>
          ))}
          <div className="q">
            What exterior POS is on the store?
            <small>Tap all that apply</small>
          </div>
          <div className="pills">
            {[
              ['sign', 'Door sign'],
              ['strike', 'Door strike'],
              ['bollards', 'Bollards'],
              ['other', 'Other'],
              ['none', 'None'],
            ].map(([key, label]) => (
              <Pill
                key={key}
                on={v.extPos[key]}
                cls={key === 'none' ? 'on' : 'on-good'}
                onClick={() => toggleExt(key)}
              >
                {label}
              </Pill>
            ))}
          </div>
        </div>

        {/* 06 Educate */}
        <div className="phase-card">
          <PhaseHead phase={PHASES[5]} status={PHASES[5].st(v)} />
          <div className="q">Did you educate the manager or clerk on JOEY?</div>
          <YesNo value={v.educated} onChange={(val) => setF('educated', val)} />
          <div className="q">Did you leave a leave-behind sheet?</div>
          <div className="pills">
            <Pill
              on={v.leaveBehind === 'yes'}
              cls="on-good"
              onClick={() => setF('leaveBehind', 'yes')}
            >
              Yes
            </Pill>
            <Pill
              on={v.leaveBehind === 'no'}
              cls="on-warn"
              onClick={() => setF('leaveBehind', 'no')}
            >
              No
            </Pill>
            <Pill
              on={v.leaveBehind === 'notprovided'}
              cls="on"
              onClick={() => setF('leaveBehind', 'notprovided')}
            >
              Not provided
            </Pill>
          </div>
          <div className="q">Did you apply reorder tags?</div>
          <div className="pills">
            <Pill
              on={v.reorderTags === 'yes'}
              cls="on-good"
              onClick={() => setF('reorderTags', 'yes')}
            >
              Yes
            </Pill>
            <Pill
              on={v.reorderTags === 'notneeded'}
              cls="on"
              onClick={() => setF('reorderTags', 'notneeded')}
            >
              Not needed
            </Pill>
            <Pill
              on={v.reorderTags === 'notprovided'}
              cls="on"
              onClick={() => setF('reorderTags', 'notprovided')}
            >
              Not provided
            </Pill>
          </div>
          <div className="q">Is the shelf price visible?</div>
          <YesNo value={v.priceVisible} onChange={(val) => setF('priceVisible', val)} />
          {v.priceVisible === 'yes' ? (
            <>
              <div className="q">
                Is the promo price showing correctly?
                <small>Mix or Match, $20 off a roll or 5 cans</small>
              </div>
              <div className="pills">
                <Pill
                  on={v.priceOk === 'yes'}
                  cls="on-good"
                  onClick={() => setF('priceOk', 'yes')}
                >
                  Yes
                </Pill>
                <Pill on={v.priceOk === 'no'} cls="on-warn" onClick={() => setF('priceOk', 'no')}>
                  No
                </Pill>
                <Pill on={v.priceOk === 'unsure'} cls="on" onClick={() => setF('priceOk', 'unsure')}>
                  Unsure
                </Pill>
              </div>
            </>
          ) : null}
        </div>

        {/* 07 Photos */}
        <div className="phase-card">
          <PhaseHead phase={PHASES[6]} status={PHASES[6].st(v)} />
          <div className="q">
            Required photos
            <small>
              {v.present === 'yes'
                ? 'Shoot after facing, removing plastic, and filling from backstock. In-app camera only.'
                : 'Computed from your answers. In-app camera only.'}
            </small>
          </div>
          {requiredPhotoGroups(v).map((g) => (
            <div key={g.name}>
              <div className="photo-group">{g.name.toUpperCase()}</div>
              <div className="photo-row">
                {g.defs.map((d) => (
                  <PhotoCapture
                    key={d.id}
                    id={d.id}
                    label={d.label}
                    photo={v.photos[d.id]}
                    onCapture={(id, photo) =>
                      setV((p) => ({ ...p, photos: { ...p.photos, [id]: photo } }))
                    }
                    onClear={(id) =>
                      setV((p) => ({ ...p, photos: { ...p.photos, [id]: null } }))
                    }
                  />
                ))}
              </div>
            </div>
          ))}
          <div className="q">Do they need an order?</div>
          <YesNo value={v.orderPlaced} onChange={(val) => setF('orderPlaced', val)} />
          {flags.length > 0 ? (
            <>
              <div className="q">
                Follow-up for JOEY<small>Auto-set from your answers</small>
              </div>
              <div className="flag-row">
                {flags.map((f) => (
                  <span className="flag-chip" key={f}>
                    {f.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
              <textarea
                className={v.followNote.trim() === '' ? 'needed' : ''}
                placeholder="Short note on what needs follow-up (required)"
                value={v.followNote}
                onChange={(e) => setV((p) => ({ ...p, followNote: e.target.value }))}
              />
            </>
          ) : (
            <>
              <div className="q">
                Is follow-up required?
                <small>Anything JOEY or Circle K needs to act on</small>
              </div>
              <div className="pills grid2">
                <Pill
                  on={v.followReq === 'yes'}
                  cls="on-warn"
                  onClick={() => setF('followReq', 'yes')}
                >
                  Yes
                </Pill>
                <Pill
                  on={v.followReq === 'no'}
                  cls="on-good"
                  onClick={() => setF('followReq', 'no')}
                >
                  No
                </Pill>
              </div>
              {v.followReq === 'yes' ? (
                <textarea
                  className={v.followNote.trim() === '' ? 'needed' : ''}
                  placeholder="Short note on what needs follow-up (required)"
                  value={v.followNote}
                  onChange={(e) => setV((p) => ({ ...p, followNote: e.target.value }))}
                />
              ) : (
                <>
                  <div className="q">
                    Notes<small>Optional</small>
                  </div>
                  <textarea
                    placeholder="Anything else JOEY should know"
                    value={v.followNote}
                    onChange={(e) => setV((p) => ({ ...p, followNote: e.target.value }))}
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>

      )}

      <div className="submit-bar">
        <button
          className="submit-btn"
          type="button"
          disabled={!!validationError || loading}
          onClick={onSubmit}
        >
          {loading
            ? 'Submitting...'
            : isExceptionPath
              ? 'Submit exception'
              : 'Submit visit'}
        </button>
        <div className="submit-hint">{validationError || 'Ready to submit'}</div>
      </div>
    </div>
  );
}

function AdminDashboard({
  mode = 'admin',
  visits,
  stores,
  cycleKey,
  dataSource,
  onLogout,
  onBackToRoute,
  selectedVisit,
  setSelectedVisit,
  followOnly,
  setFollowOnly,
  search,
  setSearch,
  toast,
  showToast,
  bootLoading,
  onRefresh,
}) {
  const isClient = mode === 'client';
  const doneSites = useMemo(() => {
    const set = new Set();
    visits.forEach((v) => {
      if (
        (v.cycle_key || currentCycleKey(new Date(v.visit_date || v.created_at))) ===
          cycleKey &&
        ['submitted', 'qualified', 'in_review', 'pending_sync', 'exception'].includes(
          v.status || 'submitted'
        )
      ) {
        set.add(String(v.store_number));
      }
    });
    return set;
  }, [visits, cycleKey]);

  const completed = doneSites.size;
  const total = stores.length;
  const followups = visits.filter((v) => v.followup).length;
  const pct = total ? Math.round((100 * completed) / total) : 0;

  const filteredVisits = useMemo(() => {
    const q = search.trim().toLowerCase();
    return visits.filter((v) => {
      if (followOnly && !v.followup) return false;
      if (!q) return true;
      return (
        String(v.store_number).includes(q) ||
        (v.store_city || '').toLowerCase().includes(q) ||
        (v.rep_name || '').toLowerCase().includes(q) ||
        (v.submitted_by || '').toLowerCase().includes(q)
      );
    });
  }, [visits, followOnly, search]);

  const downloadCsv = () => {
    const csv = exportVisitsCsv(stores, visits);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isClient
      ? `joey-client-export-${cycleKey}.csv`
      : `joey-circlek-${cycleKey}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV downloaded');
  };

  if (selectedVisit) {
    const sd = selectedVisit.survey_data || {};
    const photos = selectedVisit.photo_urls || {};
    return (
      <div className="admin-view">
        <Toast toast={toast} />
        <div className="admin-header">
          <div>
            <button type="button" className="linkish" onClick={() => setSelectedVisit(null)}>
              ← Back to list
            </button>
            <h1>CK #{selectedVisit.store_number}</h1>
            <p className="admin-sub">
              {selectedVisit.store_address}, {selectedVisit.store_city}{' '}
              {selectedVisit.store_state} · {selectedVisit.rep_name}
              {isClient ? ' · Client portal (read-only)' : ''}
            </p>
          </div>
          <button type="button" onClick={onLogout}>
            Sign out
          </button>
        </div>
        <div className="detail-grid">
          <div className="detail-card">
            <h3>Visit survey</h3>
            <ul className="detail-list">
              <li>Present: {sd.present ?? '—'}</li>
              <li>Reset: {sd.reset ?? '—'}</li>
              <li>
                Facings / OOS: {sd.facings ?? '—'} / {sd.oos ?? '—'}
              </li>
              <li>Shelf: {sd.shelf ?? '—'}</li>
              <li>Replenished: {sd.replenished ?? '—'}</li>
              <li>Educated: {sd.educated ?? '—'}</li>
              <li>
                Price: {sd.priceVisible ?? '—'} / {sd.priceOk ?? '—'}
              </li>
              <li>Follow-up: {selectedVisit.followup ? 'Yes' : 'No'}</li>
              <li>Flags: {(selectedVisit.flags || []).join(', ') || '—'}</li>
              <li>
                GPS:{' '}
                {selectedVisit.gps?.lat != null
                  ? `${Number(selectedVisit.gps.lat).toFixed(5)}, ${Number(
                      selectedVisit.gps.lng
                    ).toFixed(5)}${
                      selectedVisit.gps.accuracy != null
                        ? ` (±${Math.round(selectedVisit.gps.accuracy)}m)`
                        : ''
                    }${
                      selectedVisit.gps.distanceM != null
                        ? ` · ${selectedVisit.gps.distanceM}m from store`
                        : ''
                    }`
                  : sd.gpsStatus || 'unavailable'}
              </li>
              <li>Note: {sd.followNote || '—'}</li>
            </ul>
          </div>
          <div className="detail-card">
            <h3>Photos</h3>
            <p className="muted" style={{ marginBottom: 10, fontSize: 12 }}>
              Shown with this visit — export includes photo links.
            </p>
            <div className="admin-photos">
              {Object.keys(photos).length === 0 ? (
                <p className="muted">No photos</p>
              ) : (
                Object.entries(photos).map(([k, src]) => (
                  <a key={k} href={src} target="_blank" rel="noreferrer" className="admin-photo">
                    <img src={src} alt={k} />
                    <span>{k}</span>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-view">
      <Toast toast={toast} />
      <div className="admin-header">
        <div>
          <h1>{isClient ? 'JOEY Client Portal' : 'JOEY Circle K Review'}</h1>
          <p className="admin-sub">
            {isClient
              ? `${cycleKey} · Visits with survey + photos · Export ready`
              : `${cycleKey} · ${dataSource || 'data'} · store-matched deliverable`}
          </p>
        </div>
        <div className="header-buttons">
          {!isClient ? (
            <button type="button" className="admin-btn" onClick={onBackToRoute}>
              Route
            </button>
          ) : null}
          <button type="button" className="admin-btn" onClick={onRefresh}>
            Refresh
          </button>
          <button type="button" className="admin-btn solid" onClick={downloadCsv}>
            Export CSV
          </button>
          <button type="button" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </div>

      <div className="admin-grid">
        <div className="stat-card">
          <div className="stat-value">{completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{Math.max(0, total - completed)}</div>
          <div className="stat-label">Not completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{pct}%</div>
          <div className="stat-label">Completion</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{followups}</div>
          <div className="stat-label">Follow-ups</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{total}</div>
          <div className="stat-label">{isClient ? 'Program stores' : 'Assigned stores'}</div>
        </div>
      </div>

      <div className="admin-toolbar">
        <input
          className="search-input"
          type="search"
          placeholder="Search site, city, or rep"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          className={`filter-tab ${followOnly ? 'active' : ''}`}
          onClick={() => setFollowOnly(!followOnly)}
        >
          Follow-up only
        </button>
      </div>

      <div className="recent-visits">
        <h2>Submissions ({filteredVisits.length})</h2>
        {bootLoading ? <div className="no-results">Loading…</div> : null}
        {filteredVisits.length === 0 ? (
          <div className="no-results">No submissions yet</div>
        ) : (
          filteredVisits.map((v) => (
            <button
              type="button"
              key={v.id || `${v.store_number}-${v.created_at}`}
              className="visit-row clickable"
              onClick={() => setSelectedVisit(v)}
            >
              <span>CK #{v.store_number}</span>
              <span>{v.rep_name}</span>
              <span>{v.followup ? 'FOLLOW-UP' : 'OK'}</span>
              <span>
                {v.visit_date || v.created_at
                  ? new Date(v.visit_date || v.created_at).toLocaleDateString()
                  : '—'}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
