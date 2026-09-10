export const POS_ITEMS = [
  { id: 'sign', name: 'Door Sign', size: '22.5 x 22.5' },
  { id: 'strike', name: 'Door Strike', size: '22.5 x 6' },
  { id: 'strip', name: 'Shelf / Channel Strip', size: '22.5 x 2 or 11 x 2' },
];

export const POS_OPTS = [
  { val: 'installed', label: 'Installed' },
  { val: 'present', label: 'Already there' },
  { val: 'declined', label: 'Store declined' },
  { val: 'notprovided', label: 'Not provided' },
];

export function freshVisit() {
  return {
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
    photos: {
      p1: null,
      p2: null,
      p3: null,
      p4: null,
      p5: null,
      p6: null,
      p7: null,
      p8: null,
      p9: null,
    },
    followReq: null,
    followNote: '',
    exception: null,
    exceptionNote: '',
    startedAt: new Date().toISOString(),
    gps: null,
    gpsStatus: 'pending',
    gpsUnavailable: false,
    locationMismatch: false,
    gpsDistanceM: null,
    gpsError: null,
  };
}

export function visitFlags(v) {
  const f = [];
  if (v.exception === 'closed') f.push('STORE_CLOSED');
  if (v.exception === 'inaccessible') f.push('STORE_INACCESSIBLE');
  if (v.exception === 'refused') f.push('VISIT_REFUSED');
  if (v.present === 'no') f.push('NOT_SET');
  if (v.present === 'yes' && v.shelf && v.shelf !== 'well' && v.backstock === 'no') {
    f.push('OOS_NO_INVENTORY');
  }
  if (v.backstock === 'yes' && v.replenished === 'no') f.push('NOT_REPLENISHED');
  if (v.unc === 'yes') f.push('UNCORRECTED');
  if (['sign', 'strike', 'strip'].some((k) => v.pos[k] === 'declined')) {
    f.push('POS_DECLINED');
  }
  if (v.priceVisible === 'no') f.push('PRICE_NOT_VISIBLE');
  if (v.priceOk === 'no') f.push('PRICING');
  // Missing GPS ≠ mismatch. Only flag mismatch when proximity check failed.
  if (v.locationMismatch) f.push('LOCATION_MISMATCH');
  else if (
    v.gpsUnavailable ||
    (!v.gps && v.gpsStatus && v.gpsStatus !== 'pending' && v.gpsStatus !== 'ok')
  ) {
    f.push('GPS_UNAVAILABLE');
  }
  return f;
}

export function requiredPhotoGroups(v) {
  const groups = [];
  const shelf = [
    { id: 'p1', label: v.present === 'no' ? 'Backbar, JOEY absent' : 'Full backbar' },
  ];
  if (v.present === 'yes') {
    shelf.push({ id: 'p2', label: 'Zoom shelf 1' });
    shelf.push({ id: 'p3', label: 'Zoom shelf 2' });
    shelf.push({ id: 'p4', label: 'Full set close up, after fixes and fill' });
  }
  groups.push({ name: 'Shelf', defs: shelf });

  const pos = [];
  if (v.pos.sign === 'installed' || v.pos.sign === 'present') {
    pos.push({ id: 'p8', label: 'Door sign' });
  }
  if (v.pos.strike === 'installed' || v.pos.strike === 'present') {
    pos.push({ id: 'p5', label: 'Door strike' });
  }
  if (v.pos.strip === 'installed' || v.pos.strip === 'present') {
    pos.push({ id: 'p6', label: 'Shelf / channel strip, pricing visible' });
  }
  if (pos.length > 0) groups.push({ name: 'POS', defs: pos });

  groups.push({
    name: 'Exterior',
    defs: [{ id: 'p9', label: 'Exterior, showing outside POS' }],
  });

  if (v.unc === 'yes') {
    groups.push({ name: 'Issue', defs: [{ id: 'p7', label: 'Documented issue' }] });
  }
  return groups;
}

export function requiredPhotoDefs(v) {
  return requiredPhotoGroups(v).reduce((acc, g) => acc.concat(g.defs), []);
}

function phaseCheckin(v) {
  const answered = [v.asking, v.selling, v.usesPouches].filter((x) => x !== null).length;
  if (answered === 0) return 'todo';
  if (answered < 3) return 'part';
  if (v.usesPouches === 'no' && v.pouchInfo === null) return 'part';
  return 'done';
}

function phaseFind(v) {
  if (v.reset === null && v.present === null) return 'todo';
  if (v.reset === null || v.present === null) return 'part';
  if (v.present === 'yes' && (v.facings < 1 || v.oos > v.facings || v.shelfPos === null)) {
    return 'part';
  }
  return 'done';
}

function phaseStock(v) {
  if (v.present === 'no') return 'skip';
  if (v.present !== 'yes') return 'todo';
  if (v.shelf === null && v.replenished === null) return 'todo';
  if (v.shelf === null) return 'part';
  const needBack = v.shelf === 'low' || v.shelf === 'out';
  if (needBack && v.backstock === null) return 'part';
  if (v.replenished === null) return 'part';
  return 'done';
}

function phaseFix(v) {
  if (v.present === 'no') return 'skip';
  if (v.present !== 'yes') return 'todo';
  const any = v.fixes.faced || v.fixes.shrink || v.fixes.placement || v.fixes.none;
  if (!any && v.unc === null) return 'todo';
  if (!any || v.unc === null) return 'part';
  if (v.unc === 'yes' && v.uncNote.trim() === '') return 'part';
  return 'done';
}

function phasePos(v) {
  const vals = [v.pos.sign, v.pos.strike, v.pos.strip];
  const answered = vals.filter((x) => x !== null).length;
  const extAny =
    v.extPos.sign ||
    v.extPos.strike ||
    v.extPos.bollards ||
    v.extPos.other ||
    v.extPos.none;
  if (answered === 0 && !extAny) return 'todo';
  if (answered < 3 || !extAny) return 'part';
  return 'done';
}

function phaseEdu(v) {
  const vals = [v.educated, v.leaveBehind, v.reorderTags, v.priceVisible];
  const answered = vals.filter((x) => x !== null).length;
  if (answered === 0) return 'todo';
  if (answered < 4) return 'part';
  if (v.priceVisible === 'yes' && v.priceOk === null) return 'part';
  return 'done';
}

function phasePhoto(v) {
  const defs = requiredPhotoDefs(v);
  const got = defs.filter((d) => v.photos[d.id]).length;
  if (v.orderPlaced === null) return got === 0 ? 'todo' : 'part';
  const hasFlags = visitFlags(v).length > 0;
  const followAnswered = hasFlags || v.followReq !== null;
  const noteNeeded = hasFlags || v.followReq === 'yes';
  const noteOk = !noteNeeded || v.followNote.trim() !== '';
  if (got === defs.length && followAnswered && noteOk) return 'done';
  if (got === 0 && !hasFlags && v.followReq === null) return 'todo';
  return 'part';
}

export const PHASES = [
  { key: 'checkin', num: '01', name: 'Check in', st: phaseCheckin },
  { key: 'find', num: '02', name: 'Find it', st: phaseFind },
  { key: 'stock', num: '03', name: 'Check and fill', st: phaseStock },
  { key: 'fix', num: '04', name: 'Fix it', st: phaseFix },
  { key: 'pos', num: '05', name: 'POS it', st: phasePos },
  { key: 'edu', num: '06', name: 'Educate and price', st: phaseEdu },
  { key: 'photo', num: '07', name: 'Photo it', st: phasePhoto },
];

export function validateVisit(v) {
  if (v.exception === 'closed' || v.exception === 'inaccessible' || v.exception === 'refused') {
    if (v.exception === 'refused' && v.exceptionNote.trim() === '') {
      return 'Refusal: add a short note (clerk / reason)';
    }
    return null;
  }
  for (const p of PHASES) {
    const st = p.st(v);
    if (st === 'todo' || st === 'part') {
      return `${p.name}: complete required answers`;
    }
  }
  return null;
}

export function currentCycleKey(date = new Date()) {
  const y = date.getFullYear();
  const q = Math.floor(date.getMonth() / 3) + 1;
  return `${y}-Q${q}`;
}

export function compressImageFile(file, maxSide = 1280, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read photo'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image'));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve({
          dataUrl: canvas.toDataURL('image/jpeg', quality),
          capturedAt: new Date().toISOString(),
          width: w,
          height: h,
        });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
