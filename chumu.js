// 除目：跟 ../除目.py 一字不差（test/比.js 对全部挑法）。网页只管画。
var LEAVE = 0.9, NBX = 0.8, RATE = 0.32;
var DT = { '跑': 1, '走': 2, '慢': 3, '站': 3 };
var PEOPLE = [
  ['客', '隔壁来的那位客人', 4.5, '堂上靠门', '源六'],
  ['表叔', '乡下来的表叔', 7.0, '大门槛上', '老门客'],
  ['源六', '旧门客源六', 5.5, '窗边', '藤五'],
  ['藤五', '旧门客藤五', 5.5, '火盆边，打着盹', '表叔'],
  ['老门客', '老门客', 99, '火盆另一边', null],
  ['夫人', '夫人', 99, '帘子后头', null],
  ['老爷', '老爷', 99, '堂上正中', null]
];
var NAME = {}, THR = {}, NB = {};
PEOPLE.forEach(function (p) { NAME[p[0]] = p[1]; THR[p[0]] = p[2]; NB[p[0]] = p[4]; });
var STEPS = { '客': '一阵木屐声，往隔壁那边去了。', '源六': '有人在门口咳了两声，走远了。',
  '藤五': '有人打着哈欠出去，鞋底拖在地上。', '表叔': '脚步很重，像是草鞋，往城外那头去了。' };
var GUESTS = ['客', '表叔', '源六', '藤五'];
var KEYS = ['客', '表叔', '源六', '藤五', '老门客', '夫人', '老爷'];
var START = { '客': 2.0, '表叔': 0.0, '源六': 2.0, '藤五': 1.0, '老门客': 3.0, '夫人': 1.0, '老爷': 0.0 };

function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
function sky(t) {
  if (t <= 2) return '天还黑着';
  if (t <= 5) return '天发灰了';
  if (t <= 8) return '窗纸白了';
  return '太阳照到墙头了';
}
function newState() {
  var s = { step: 0, t: 0, road: '前', d: {}, awake: {}, gone: {}, met: [], why: {}, hope: false, hat: false,
    cross: {}, walk: [], look: null, said: null, fuu: false, end: false, kitchen: false };
  KEYS.forEach(function (k) { s.d[k] = START[k]; s.awake[k] = (k !== '藤五'); s.why[k] = {}; });
  return s;
}
function thr(w) { return GUESTS.indexOf(w) >= 0 ? THR[w] : 7.0; }
function setd(s, w, v, src) {
  if (has(s.gone, w)) return;
  if (s.d[w] < thr(w) && thr(w) <= v) s.cross[w] = src;
  s.d[w] = v; s.why[w][src] = (s.why[w][src] || 0) + 10;
}
function add(s, w, x, src) {
  if (has(s.gone, w)) return;
  var b = s.d[w];
  if (w === '藤五' && !s.awake['藤五']) {
    if (src !== '屋里有人起身走了' && src !== '坐他旁边的人走了') return;
  }
  s.d[w] += x;
  if (x > 0) s.why[w][src] = (s.why[w][src] || 0) + x;
  if (b < thr(w) && thr(w) <= s.d[w]) s.cross[w] = src;
  if (w === '藤五' && s.d[w] >= 2) s.awake['藤五'] = true;
}
function everyone(s, x, src, but) {
  but = but || [];
  KEYS.forEach(function (k) { if (but.indexOf(k) < 0) add(s, k, x, src); });
}
function leaves(s, out, onRoad) {
  var moved = true;
  while (moved) {
    moved = false;
    for (var i = 0; i < GUESTS.length; i++) {
      var k = GUESTS[i];
      if (has(s.gone, k) || s.d[k] < THR[k]) continue;
      var why = has(s.cross, k) ? s.cross[k] : '等得太久';
      s.gone[k] = [s.t, why];
      if (onRoad && s.road === '前' && s.step >= 3) {
        s.met.push(k);
        out.push('大门里出来一个人，是' + NAME[k] + '。他跟你走了个对脸，看了你一眼，没问，侧过身子过去了。');
      } else if (onRoad && s.road === '前' && s.step === 2) {
        out.push('拐角那边，老爷家的大门响了一声。' + STEPS[k]);
      } else if (onRoad && s.road === '后') {
        out.push('墙那边，大门吱的响了一声。' + STEPS[k]);
      } else {
        out.push(NAME[k] + '站起来，说"天亮了，家里还有点事"，出去了。');
      }
      everyone(s, LEAVE, '屋里有人起身走了', [k]);
      if (NB[k]) add(s, NB[k], NBX, '坐他旁边的人走了');
      moved = true;
    }
  }
}
function wait(s, dt, rate) {
  if (rate === undefined) rate = RATE;
  for (var i = 0; i < dt; i++) {
    s.t += 1;
    KEYS.forEach(function (k) { if (s.awake[k]) add(s, k, rate, '等得太久'); });
  }
}
function hallView(s) {
  var out = [];
  PEOPLE.forEach(function (p) {
    var k = p[0], name = p[1];
    if (has(s.gone, k)) return;
    var d = s.d[k];
    if (k === '老爷') {
      var a = s.hat ? '戴着官帽站在堂上' : '坐在堂上正中';
      out.push(name + a + '，' + (d < 4 ? '脸上没动静。' : '手搁在膝盖上，没动。')); return;
    }
    if (k === '夫人') { out.push('帘子后头有人影，' + (d < 3 ? '在笑着跟谁说话。' : '一直没动。')); return; }
    if (k === '老门客') { out.push('老门客在火盆边，' + (d >= 6 ? '手指头在膝盖上一个一个地按。' : '烤着手。')); return; }
    if (k === '藤五' && !s.awake['藤五']) { out.push(name + '还在火盆边打盹。'); return; }
    var f = d < 2 ? '笑着跟人说话' : d < 4 ? '端着杯子，没喝' : '看着门口';
    out.push(name + f + '。');
  });
  return out;
}
function roadText(s) {
  var st = s.step, out = ['—— ' + sky(s.t) + ' ——'];
  if (st === 0) {
    out.push('你在衙门外头的墙上看完了榜。从头看到尾看了两遍，没有老爷的名字。',
      '昨天夜里家里就来了一屋子人，旧门客、乡下的亲戚，吃了一夜喝了一夜，等着你回去敲门。',
      '你往回走。');
  } else if (st === 1) {
    out.push('路过一条巷子，有个人从你身边跑过去，一边跑一边喊"得了！得了！"。那家的门哐的一声开了，屋里一片叫好。');
  } else if (st === 2) {
    out.push('再拐过一个路口，就是老爷家那条街。从这儿往前，门槛上坐着的人看得见你。',
      '旁边有一条后巷，绕过去从后门进，也到得了，慢一点。');
  } else if (st === 3) {
    if (s.road === '前') {
      if (s.t >= 3) out.push('你看见大门了。门槛上坐着一个人，是表叔，他也看见你了。');
      else out.push('天黑，你看得见大门口的灯笼，门槛上像是坐着个人。');
    } else out.push('后巷里没人。墙那边是老爷家，听得见里头有人说话，听不清说什么。');
  }
  return out;
}
function roadMenu(s) {
  var o = ['1. 跑回去', '2. 照常走', '3. 慢慢走', '4. 在路边站一会儿'];
  if (s.step === 2) o.push('5. 拐进后巷');
  return o;
}
function sight(s, mode, out) {
  if (s.road !== '前' || has(s.gone, '表叔')) { }
  else if (s.step >= 3 || (s.step === 2 && s.t >= 3)) {
    if (mode === '跑') {
      if (!s.hope) {
        s.hope = true; s.hat = true;
        out.push('门槛上的表叔一下站起来，冲着里头喊："跑着来的！跑着来的！"');
        out.push('里头哄的一声。有人去拿酒，有人去给老爷取官帽。');
        KEYS.forEach(function (k) { s.d[k] = Math.max(-2.0, s.d[k] - 3.0); });
      }
    } else if (mode === '走') {
      add(s, '表叔', 0.6, '你没跑');
    } else if (mode === '慢') {
      add(s, '表叔', 2.0, '你走得慢');
      out.push('表叔伸着脖子看你，回头冲里头说了一句什么。');
      everyone(s, 0.8, '表叔说你走得慢', ['表叔']);
    } else if (mode === '站') {
      add(s, '表叔', 3.0, '你在路边站住了');
      out.push('表叔站起来看着你。你站着，他也站着。');
      everyone(s, 1.2, '表叔说你站住了', ['表叔']);
    }
  }
  if (s.road === '前' && s.step >= 3 && s.t >= 3 && !has(s.gone, '源六') && (mode === '慢' || mode === '站'))
    add(s, '源六', 1.5, mode === '慢' ? '你走得慢' : '你在路边站住了');
}
function stepRoad(s, c, out) {
  var o = roadMenu(s);
  if (!(c >= 1 && c <= o.length)) return false;
  var mode, dt;
  if (c === 5) { s.road = '后'; mode = '走'; dt = 3; }
  else { mode = ['跑', '走', '慢', '站'][c - 1]; dt = DT[mode]; }
  s.walk.push(c === 5 ? '拐进后巷' : mode);
  out.push(c !== 5 ? { '跑': '你跑起来。', '走': '你照常走。', '慢': '你放慢了步子。', '站': '你在路边站了一会儿，看着天。' }[mode] : '你拐进了后巷。');
  for (var i = 0; i < dt; i++) { wait(s, 1); leaves(s, out, true); }
  sight(s, mode, out);
  leaves(s, out, true);
  s.step += 1;
  return true;
}
function arriveText(s) {
  var out = ['—— ' + sky(s.t) + ' ——'];
  var gone = GUESTS.filter(function (k) { return has(s.gone, k) && s.met.indexOf(k) < 0; });
  if (s.road === '后') {
    out.push('你从后门进去，是灶房。夫人在灶边热酒，一回头看见了你。');
    out.push('她手里的酒壶没放下。她看着你，没出声。');
    setd(s, '夫人', 10, '你从后门进来'); s.fuu = true;
    return out;
  }
  out.push('你进了大门，上了堂。');
  if (s.hope) out.push('堂上的人全站着，有人端着酒，都看着你。');
  if (gone.length) out.push('屋里比你走的时候空了。' + gone.map(function (k) { return NAME[k]; }).join('、') + '的席子上，杯子还搁着。');
  return out.concat(hallView(s));
}
function arriveMenu(s) {
  if (s.road === '后') return ['1. 跟她说', '2. 什么都不说，只看着她', '3. 越过她，自己上堂去'];
  return ['1. 先看老爷', '2. 先看帘子后头的夫人', '3. 先看火盆边的老门客', '4. 看着地上'];
}
function stepArrive(s, c, out) {
  if (!(c >= 1 && c <= arriveMenu(s).length)) return false;
  if (s.road === '后') {
    if (c === 1 || c === 2) {
      s.look = '夫人(灶房)'; s.kitchen = true;
      out.push(c === 1 ? '她把酒壶搁下，说："你在这儿烤火，别进去了。"' : '她点了一下头，把酒壶塞到你手里又拿回去，说："你在这儿烤火。"');
      out.push('她端着酒进去了。你在灶边坐下，隔着一道墙听堂上。');
      out.push('堂上她的声音比别人都高，在说今年冬天冷得早。');
      everyone(s, 0.5, '夫人说话声音太高', ['夫人']);
      add(s, '老爷', 3.0, '夫人给他斟酒');
      s.step = 6;
      leaves(s, out, false);
      return true;
    }
    s.road = '前(从后门)';
    out.push('你越过她，从灶房上了堂。');
    everyone(s, 1.0, '你从里头出来，不是从大门进的', ['夫人']);
    hallView(s).forEach(function (l) { out.push(l); });
    s.step = 5;
    return 'again';
  }
  var who = ['老爷', '夫人', '老门客', '地上'][c - 1];
  s.look = who;
  if (who === '老爷') {
    out.push('你先看了老爷。' + (GUESTS.some(function (k) { return !has(s.gone, k); }) ? '屋里的人都跟着你的眼睛去看他。' : ''));
    setd(s, '老爷', 10, '你进门先看了他');
    everyone(s, 3.0, '你进门先看了老爷', ['老爷']);
    out.push(s.hat ? '老爷把官帽摘下来，搁在膝盖上。' : '老爷看着你，嘴动了一下，没说出来。');
  } else if (who === '夫人') {
    out.push('你先看了帘子后头。夫人从帘子里出来，给老爷斟了一杯，又挨个给客人斟，一边斟一边说今年冬天冷得早。');
    setd(s, '夫人', 10, '你进门先看了她');
    everyone(s, 0.5, '夫人说话声音太高', ['夫人', '老爷']);
    add(s, '老爷', 2.0, '夫人给他斟酒');
  } else if (who === '老门客') {
    out.push('你先看了老门客。他把手从火盆上拿下来，低着头，手指头在膝盖上一个一个地按："明年……播磨，但马……"');
    setd(s, '老门客', 10, '你进门先看了他');
    everyone(s, 3.0, '老门客掰手指头', ['老门客']);
  } else {
    out.push('你看着地上，看着自己的脚。');
    everyone(s, 2.0, '你进门看着地上');
  }
  leaves(s, out, false);
  s.step = 6;
  return true;
}
function askMenu(s) {
  if (s.kitchen) return ['1. 就在灶边坐着', '2. 还是上堂去，自己说'];
  if (!has(s.gone, '客')) return ['1. 照实说："榜上没有老爷。"', '2. 说："是某某国的前任。"', '3. 不答'];
  return ['1. 开口说："榜上没有老爷。"', '2. 什么都不说，去灶下烤火', '3. 站着，等老爷问'];
}
function askText(s) {
  if (s.kitchen) return ['你在灶边坐着。墙那边，有人在挪席子。'];
  if (!has(s.gone, '客')) return ['隔壁来的那位客人放下杯子，大声问你："老爷得了个什么？"', '屋里没人看你。都在看自己的杯子。'];
  return ['没有人问你。', '谁都没问。'];
}
function stepAsk(s, c, out) {
  if (!(c >= 1 && c <= askMenu(s).length)) return false;
  if (s.kitchen) {
    if (c === 1) {
      s.said = '在灶边坐着';
      for (var i = 0; i < 3; i++) { wait(s, 1, 0.8); leaves(s, out, false); }
      out.push('你听见堂上的人一个一个起身。没有人进灶房来。');
    } else {
      s.said = '从灶房上堂，自己说的';
      out.push('你上了堂，说："榜上没有老爷。"夫人站在老爷身边，看了你一眼。');
      KEYS.forEach(function (k) { setd(s, k, 10, '你说了'); });
    }
  } else if (!has(s.gone, '客')) {
    if (c === 1) {
      s.said = '照实说了';
      out.push('你说："榜上没有老爷。"那位客人"哦"了一声，把杯子里的酒喝了。');
      KEYS.forEach(function (k) { setd(s, k, 10, '你说了'); });
    } else if (c === 2) {
      s.said = '说了"某某国的前任"';
      out.push('你说："是某某国的前任。"');
      out.push('那位客人愣了愣："前任……那是好，还是不好？"没人答他。他又给自己倒了一杯。');
      KEYS.forEach(function (k) { if (k !== '客') setd(s, k, 10, '你说了"前任"'); });
      s.d['客'] = -5;
    } else {
      s.said = '没答';
      out.push('你没答。那位客人又问了一遍："到底得了没有？"');
      out.push('老爷说："没有。"');
      setd(s, '老爷', 10, '他自己说出口');
      KEYS.forEach(function (k) { if (k !== '老爷') setd(s, k, 10, '老爷自己说的'); });
    }
  } else {
    if (c === 1) {
      s.said = '开口说了';
      out.push('你说："榜上没有老爷。"屋里的人都像早就听过一样，没人抬头。');
      KEYS.forEach(function (k) { setd(s, k, 10, '你说了'); });
    } else if (c === 2) {
      s.said = '没说，去了灶下';
      out.push('你什么都没说，退出去，去灶下烤火。');
      everyone(s, 2.0, '你什么都没说就退出去了');
      add(s, '老爷', 3.0, '你什么都没说就退出去了');
    } else {
      s.said = '站着等老爷问';
      out.push('你站着。老爷看了你很久。');
      out.push('他没问。');
      everyone(s, 2.0, '你站着，老爷没问', ['老爷']);
      add(s, '老爷', 6.0, '你站着等他问，他没问');
    }
  }
  leaves(s, out, false);
  s.step = 7;
  return true;
}
function finish(s, out) {
  while (s.t < 10) { wait(s, 1, 0.6); leaves(s, out, false); }
  var qian = s.said === '说了"某某国的前任"';
  GUESTS.forEach(function (k) {
    if (has(s.gone, k)) return;
    var why = has(s.cross, k) ? s.cross[k] : '天亮了';
    if (k === '客' && qian) why = '没人答他';
    s.gone[k] = [s.t, why];
    if (k === '客' && qian) out.push('那位客人是最后一个走的。走的时候拱了拱手，说："明年，明年一定。"');
    else out.push(NAME[k] + '也走了。');
  });
  out.push('');
  out.push('—— 太阳上来了 ——');
  out.push('这一夜，你路上：' + s.walk.join('、') + '。' + '你到家的时候，' + (s.arrive_sky || '') + '。');
  out.push('');
  GUESTS.forEach(function (k) {
    var t = s.gone[k][0], why = s.gone[k][1];
    var m = s.met.indexOf(k) >= 0 ? '，在大门口跟你走了个对脸' : (t < s.arrive_t ? '，你还没到家' : '');
    out.push('  ' + NAME[k] + '：' + sky(t) + '走的' + m + '。让他起身的是：' + why + '。');
  });
  var lm = has(s.cross, '老爷') ? s.cross['老爷'] : '等得太久';
  out.push('  老爷：让他知道的是：' + lm + '。');
  out.push('  夫人：让她知道的是：' + (has(s.cross, '夫人') ? s.cross['夫人'] : '等得太久') + '。');
  out.push('');
  if (s.hat) out.push('那顶官帽，是有人跑去取来、给他戴上的。后来是他自己摘的。');
  out.push('老门客没走。他的铺盖卷就搁在廊下。他坐在火盆边，掰着手指头数明年哪几国有缺，数一个，按下一个指头。');
  s.end = true;
}
function screen(s) {
  var st = s.step;
  if (s.end) return [];
  if (st <= 3) return roadText(s).concat([''], roadMenu(s));
  if (st === 4) { s.arrive_sky = sky(s.t); s.arrive_t = s.t; return arriveText(s).concat([''], arriveMenu(s)); }
  if (st === 5) return arriveMenu(s);
  if (st === 6) return askText(s).concat([''], askMenu(s));
  return [];
}
// 跟 除目.py 的 main() 一样：返回这一下印出来的全部行
function start(s) { return screen(s); }
function step(s, c) {
  var out = [], st = s.step, ok;
  if (st <= 3) ok = stepRoad(s, c, out);
  else if (st === 4 || st === 5) ok = stepArrive(s, c, out);
  else if (st === 6) ok = stepAsk(s, c, out);
  else ok = false;
  if (!ok) return null;
  if (ok === 'again') { s.road = '前'; s.step = 5; out = out.concat([''], ['你先看谁？'], arriveMenu(s)); }
  else if (s.step === 7) finish(s, out);
  else out = out.concat([''], screen(s));
  return out;
}
if (typeof module !== 'undefined') module.exports = { newState: newState, start: start, step: step };
