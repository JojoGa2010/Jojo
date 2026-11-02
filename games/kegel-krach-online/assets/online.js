/* Kegel-Krach: authenticated WordPress room relay. No third-party account required. */
(() => {
  'use strict';
  let attempts = 0;
  const ready = setInterval(() => {
    attempts++;
    if (!document.querySelector('#home #bMk') || typeof names !== 'function' || typeof beginGame !== 'function' || document.documentElement.dataset.kkPlayers !== '6') {
      if (attempts > 600) clearInterval(ready);
      return;
    }
    clearInterval(ready);
    install();
  }, 500);

  function install() {
    if (document.documentElement.dataset.kkOnline) return;
    document.documentElement.dataset.kkOnline = '1';
    const config = window.KKOnlineConfig;
    if (!config || !config.api) return;
    let joining = false;
    let listing = false;
    let lobbySignature = null;
    const originalDrawLobby = drawL;
    drawL = function () {
      const signature = JSON.stringify([L, isHost, pubRoomFlag]);
      if (signature === lobbySignature) return;
      lobbySignature = signature;
      originalDrawLobby();
      if (!isHost) return;
      const slots = document.querySelectorAll('#lp .sl');
      L.forEach((person, index) => {
        if (person.uid === me.uid || !slots[index]) return;
        const button = document.createElement('button');
        button.className = 'g'; button.textContent = 'Aus Lobby entfernen';
        button.setAttribute('aria-label', person.n + ' aus Lobby entfernen');
        button.onclick = async () => {
          const connection = R;
          if (!connection || connection.closed || !isHost || G) return;
          button.disabled = true;
          try {
            await connection.queue;
            const result = await api({ op: 'kick', code: connection.code, token: connection.token, uid: person.uid });
            applyStatus(connection, result.status);
          } catch (error) { document.querySelector('#lw').textContent = error.message; }
          finally { button.disabled = false; }
        };
        slots[index].append(button);
      });
    };
    let lastInput = Date.now();
    for (const name of ['pointerdown', 'pointermove', 'keydown', 'touchstart']) {
      document.addEventListener(name, event => { if (event.isTrusted) lastInput = Date.now(); }, { passive: true });
    }
    const back = document.createElement('button');
    back.id = 'kk-lobby-back'; back.className = 'g'; back.textContent = '← Zurück';
    document.querySelector('#lobby .wrap').prepend(back);
    const transfer = document.createElement('div');
    transfer.id = 'kk-admin-dialog'; transfer.hidden = true;
    transfer.setAttribute('role', 'dialog'); transfer.setAttribute('aria-modal', 'true');
    transfer.setAttribute('aria-label', 'Admin hat das Spiel verlassen');
    transfer.style.cssText = 'position:fixed;inset:0;z-index:100020;background:#000b;display:grid;place-items:center;padding:20px;color:white';
    const panel = document.createElement('div');
    panel.style.cssText = 'background:#2d1b69;padding:24px;border-radius:20px;max-width:440px;display:grid;gap:16px;text-align:center';
    const title = document.createElement('strong'); title.textContent = 'Admin hat das Spiel verlassen';
    const homeLink = document.createElement('a'); homeLink.href = config.game || '/spiel/'; homeLink.dataset.kkHome = '1';
    const homeMark=document.createElement('img');homeMark.src=(config.assets||'/')+'logo.svg';homeMark.alt='';homeMark.width=28;homeMark.height=28;
    homeLink.append(homeMark,document.createTextNode('Kegel-Krach · Start-Lobby'));homeLink.style.cssText='color:#ffd60a;text-decoration:none;padding:10px;display:flex;align-items:center;justify-content:center;gap:8px';
    const explanation = document.createElement('p'); explanation.setAttribute('aria-live', 'polite');
    const yes = document.createElement('button'); yes.textContent = 'Ja, ich übernehme';
    const no = document.createElement('button'); no.className = 'g'; no.textContent = 'Nein, danke';
    const exit = document.createElement('button'); exit.className = 'g'; exit.textContent = '← Zurück zum Menü';
    panel.append(homeLink, title, explanation, yes, no, exit); transfer.append(panel); document.body.append(transfer);
    // Explicitly override Elementor styles while preserving the hidden attribute.
    const style = document.createElement('style');
    style.textContent = '#kk-admin-dialog[hidden],#kk-admin-dialog button[hidden]{display:none!important}#lobby .sl.em{animation:none!important}';
    document.head.append(style);

    async function leaveLobby() {
      if (back.disabled) return;
      back.disabled = true;
      const connection = R;
      try {
        if (connection && !connection.closed) {
          await connection.queue;
          await api({ op: 'leave', code: connection.code, token: connection.token });
        }
        if (connection) connection.close();
        R = null; H = null; G = null; L = []; hl = []; busy = false; isHost = false; stamp++;
        clearInterval(hi); clearInterval(pubT); clearInterval(olT);
        transfer.hidden = true; show('home'); document.querySelector('#bBk').onclick();
        return true;
      } catch (error) { document.querySelector('#lw').textContent = error.message; return false; }
      finally { back.disabled = false; }
    }
    back.onclick = leaveLobby; exit.onclick = leaveLobby;
    window.KKOnlineLeave = leaveLobby;
    async function answer(accept) {
      if (!R) return;
      yes.disabled = no.disabled = true;
      try {
        const result = await api({ op: 'answer', code: R.code, token: R.token, accept });
        lastInput = Date.now();
        applyStatus(R, result.status);
      } catch (error) { explanation.textContent = error.message; }
      finally { yes.disabled = no.disabled = false; }
    }
    yes.onclick = () => answer(true); no.onclick = () => answer(false);

    function applyStatus(connection, status) {
      if (!status || connection.closed || R !== connection) return;
      connection.hasStatus = true;
      const changed = status.epoch !== connection.epoch;
      connection.epoch = status.epoch;
      connection.paused = !status.host_uid;
      isHost = status.host_uid === me.uid;
      L = status.L;
      pubRoomFlag = status.public;
      document.querySelector('#bSt').hidden = !isHost || connection.paused;
      document.querySelector('#fl').hidden = !isHost || connection.paused;
      document.querySelector('#lw').textContent = isHost ? 'Du bist Admin.' : connection.paused ? 'Ein neuer Admin wird gesucht…' : 'Warte auf den Admin…';
      if (!G) drawL();
      transfer.hidden = !connection.paused;
      if (connection.paused) {
        const mine = status.offer && status.offer.uid === me.uid;
        yes.hidden = no.hidden = !mine;
        explanation.textContent = mine ? 'Möchtest du Admin sein? Du hast 20 Sekunden zum Antworten.' : status.offer ? 'Ein zufällig ausgewählter Mitspieler wird gefragt, ob er Admin sein möchte.' : 'Niemand hat übernommen. Du kannst zum Menü zurückkehren.';
      }
      if (changed) {
        stamp++; busy = true; H = null; hl = [];
        document.querySelector('#dpop').classList.remove('on');
        evq = evq.then(() => {
          if (connection.closed || R !== connection || connection.epoch !== status.epoch) return;
          if (status.state) {
            G = cl(status.state); H = isHost ? cl(status.state) : null;
            ov = ov2 = null; tl = 0; cam = { x:330, y:330, z:1, sh:0 };
            show('game'); fit(); setTurn();
          }
          busy = connection.paused;
          if (!connection.paused && G && G.win == null) {
            ui(); if (isHost) setTimeout(after, 250);
            say('Ein neuer Admin hat übernommen. Weiter geht’s!');
          }
        }).catch(fail);
      }
    }

    async function api(body) {
      const abort = new AbortController();
      const timeout = setTimeout(() => abort.abort(), 15000);
      try {
        const response = await fetch(config.api + 'rooms', {
          method: 'POST',
          credentials: 'omit',
          cache: 'no-store',
          keepalive: body.op === 'leave',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: abort.signal
        });
        let result;
        try { result = await response.json(); } catch (_) {
          throw new Error('WordPress hat keine gültige Antwort gesendet. Bitte Cache und Zugriff auf die REST-API prüfen.');
        }
        if (!response.ok) {
          const error = new Error(result.message || 'Verbindung zur Lobby fehlgeschlagen.');
          error.status = response.status;
          error.code = result.code;
          throw error;
        }
        return result;
      } catch (error) {
        if (error.name === 'AbortError') throw new Error('Der Spielserver antwortet nicht. Bitte noch einmal versuchen.');
        throw error;
      } finally { clearTimeout(timeout); }
    }

    function fail(error) {
      if (error.code === 'kk_kicked') {
        if (R && R.close) R.close();
        R=null;G=null;H=null;L=[];hl=[];busy=false;isHost=false;stamp++;
        clearInterval(hi);clearInterval(pubT);clearInterval(olT);
        transfer.hidden=true;
        document.querySelector('#dpop').classList.remove('on');
        document.querySelector('#pop').classList.remove('on');
        show('home');document.querySelector('#bBk').onclick();
        let notice=document.querySelector('#kk-kick-notice');
        if(!notice){
          notice=document.createElement('section');notice.id='kk-kick-notice';notice.className='card';notice.setAttribute('role','alert');
          const text=document.createElement('p');text.textContent='Du wurdest vom Admin aus der Gruppe entfernt. Du bist nicht mehr in dieser Lobby.';
          const dismiss=document.createElement('button');dismiss.textContent='Verstanden';dismiss.onclick=()=>{notice.hidden=true;};
          notice.append(text,dismiss);document.querySelector('#home .wrap').prepend(notice);
        }
        notice.hidden=false;
        return;
      }
      const message = error.message || 'Verbindung unterbrochen.';
      const notice = document.querySelector('#oe');
      if (notice) notice.textContent = message;
      const lobbyNotice = document.querySelector('#lw');
      if (lobbyNotice) lobbyNotice.textContent = message;
      if (G) {
        busy = true;
        hl = [];
        H = null;
        document.querySelector('#dpop').classList.remove('on');
        pop('Verbindung unterbrochen', message + ' Bitte die Seite neu laden und eine neue Lobby öffnen.');
      }
    }

    class Relay {
      constructor(session) {
        this.code = session.code;
        this.token = session.token;
        this.seq = session.seq;
        this.epoch = session.epoch || 1;
        this.paused = false;
        this.handlers = new Map();
        this.queue = Promise.resolve();
        this.closed = false;
        this.failures = 0;
        this.timer = setTimeout(() => this.poll(), 0);
      }
      on(type, callback) {
        if (!this.handlers.has(type)) this.handlers.set(type, []);
        this.handlers.get(type).push(callback);
      }
      async poll() {
        if (this.closed) return;
        try {
          const result = await api({ op: 'poll', code: this.code, token: this.token, after: this.seq, activityAge: Math.floor((Date.now() - lastInput) / 1000) });
          if (this.closed) return;
          if (result.removed) {
            this.close(); fail(new Error('Du warst eine Minute inaktiv oder offline. Du hast das Spiel als Admin verlassen.')); return;
          }
          applyStatus(this, result.status);
          this.failures = 0;
          for (const event of result.events) {
            if (event.seq <= this.seq) continue;
            if ((event.epoch || 1) !== this.epoch) { this.seq = event.seq; continue; }
            for (const callback of this.handlers.get(event.type) || []) {
              callback({ data: event.data, isMe: event.uid === me.uid });
            }
            this.seq = event.seq;
          }
        } catch (error) {
          if (this.closed || R !== this) return;
          this.failures++;
          if ([400, 403, 404, 409].includes(error.status) || this.failures >= 6) {
            this.close(); fail(error); return;
          }
        }
        if (!this.closed) this.timer = setTimeout(() => this.poll(), Math.min(5000, 1000 + this.failures * 1000));
      }
      emit(type, data) {
        const send = this.queue.then(() => {
          if (this.closed) throw new Error('Die Lobby-Verbindung ist geschlossen.');
          return api({ op: 'emit', code: this.code, token: this.token, type, data, epoch: this.epoch });
        });
        send.then(result => { if (result.paused) applyStatus(this, result.status); }).catch(() => {});
        // Legacy game calls emit without awaiting. Handle rejection here as well.
        this.queue = send.catch(error => { if(this.closed || R !== this)return; this.close(); fail(error); });
        return send;
      }
      close() { this.closed = true; clearTimeout(this.timer); }
    }

    // The existing host validates legal turns, rolls dice and runs bots. Other
    // clients can send only their own actions; only the host can publish results.
    wire = function () {
      const connection = R;
      connection.on('lobby', message => {
        // Poll status is newer than historical lobby events in the same batch.
        if (connection.hasStatus) return;
        if (G || !message.data || !message.data.L) return;
        L = message.data.L;
        pubRoomFlag = !!message.data.pub;
        document.querySelector('#lt').textContent = pubRoomFlag ? '🌍 Offenes Spiel' : '🔒 Private Lobby';
        drawL();
        clearInterval(hi);
      });
      connection.on('chat', message => {
        if (message.isMe || !G || !message.data) return;
        const k = G.pl.findIndex(p => p.uid === message.data.u);
        if (k >= 0) bubble(k, String(message.data.t).slice(0, 40));
        if (isHost && window.KKBotChat) window.KKBotChat.respond(message.data.u,message.data.t);
      });
      connection.on('bot_chat', message => {
        if(!message.isMe&&message.data&&window.KKBotChat)window.KKBotChat.showReply(message.data.u,String(message.data.t).slice(0,160));
      });
      connection.on('act', message => {
        if (!isHost || connection.paused || !H || !message.data) return;
        const k = H.pl.findIndex(p => p.uid === message.data.uid);
        if (k >= 0) handle(k, message.data.a);
      });
      connection.on('game', message => {
        if (!isHost && !G) beginGame(message.data.G);
      });
      connection.on('ev', message => {
        if (isHost) return;
        evq = evq.then(async () => {
          if (connection.closed) return;
          for (const event of message.data.evs) await play(event);
          if (!connection.closed) ui();
        }).catch(error => { connection.close(); fail(error); });
      });
    };

    function player() { return { uid: me.uid, n: me.n, skin: me.skin }; }
    function resetConnection() {
      const kickNotice=document.querySelector('#kk-kick-notice');if(kickNotice)kickNotice.hidden=true;
      lobbySignature = null;
      if (R && R.close) R.close();
      G = null; H = null; hl = []; busy = false; stamp++;
      transfer.hidden = true;
      lastInput = Date.now();
      clearInterval(hi);
      clearInterval(pubT);
      document.querySelector('#oe').textContent = '';
    }

    mkLobby = async function (publicRoom) {
      if (joining) return;
      joining = true;
      try {
        names(); resetConnection();
        const session = await api({ op: 'create', public: !!publicRoom, ...player() });
        R = new Relay(session);
        isHost = true;
        L = [player()];
        pubRoomFlag = !!publicRoom;
        wire(); lobbyView(session.code);
      } catch (error) { fail(error); }
      finally { joining = false; }
    };

    joinCode = async function (code) {
      if (joining) return;
      code = String(code || '').trim().toUpperCase();
      if (!/^[A-Z]{4}$/.test(code)) { document.querySelector('#oe').textContent = 'Bitte den vierstelligen Lobby-Code eingeben.'; return; }
      joining = true;
      try {
        names(); resetConnection();
        const session = await api({ op: 'join', code, ...player() });
        R = new Relay(session);
        isHost = false;
        L = [];
        pubRoomFlag = false;
        wire(); lobbyView(code);
        await R.emit('hello', player());
      } catch (error) { fail(error); }
      finally { joining = false; }
    };

    pubJoin = async function () { return null; };
    drawOpen = async function () {
      const target = document.querySelector('#ol');
      if (!target || listing || document.querySelector('#cOn').hidden) return;
      listing = true;
      try {
        const result = await api({ op: 'list' });
        opens = {};
        target.textContent = '';
        for (const item of result.rooms) {
          opens[item.code] = { ...item, t: Date.now() };
          const button = document.createElement('button');
          button.className = 'g';
          button.textContent = '🎳 ' + item.n + ' · ' + item.c + '/6 · beitreten';
          button.onclick = () => joinCode(item.code);
          target.append(button);
        }
        if (!result.rooms.length) target.textContent = 'Gerade wartet niemand – erstelle ein offenes Spiel!';
      } catch (error) { target.textContent = error.message; }
      finally { listing = false; }
    };

    quick = async function () {
      try {
        const result = await api({ op: 'list' });
        if (result.rooms.length) await joinCode(result.rooms[0].code);
        else await mkLobby(true);
      } catch (error) { fail(error); }
    };

    document.querySelector('#bMk').onclick = () => mkLobby(false);
    document.querySelector('#bMk2').onclick = () => mkLobby(true);
    document.querySelector('#bJn').onclick = () => joinCode(document.querySelector('#cd').value);
    document.querySelector('#bQk').onclick = () => quick();
    document.querySelector('#bSt').onclick = async () => {
      const button = document.querySelector('#bSt');
      if (!isHost || !R || button.disabled) return;
      const players = L.map(p => ({ ...p }));
      if (document.querySelector('#fill').checked) {
        while (players.length < Math.max(L.length, Number(document.querySelector('#kk-fill-count').value))) players.push({ n: BN[players.length - 1] || 'Bot', skin: rnd(SKN.length), bot: 1, uid: 'B' + players.length });
      }
      if (players.length < 2) { document.querySelector('#lw').textContent = 'Mindestens zwei Spieler: Bots aktivieren oder auf Freunde warten.'; return; }
      button.disabled = true;
      try {
        const state = mk(players);
        await R.emit('game', { G: state });
        beginGame(state);
      } catch (_) { /* Relay already displays the connection error. */ }
      finally { button.disabled = false; }
    };

    // Prevent unhandled rejections in unchanged, fire-and-forget chat/turn calls.
    const originalEmit = Relay.prototype.emit;
    Relay.prototype.emit = function (type, data) {
      const promise = originalEmit.call(this, type, data);
      promise.catch(() => {});
      return promise;
    };
    document.querySelector('#oe').textContent = '✓ Online-Verbindung über deine Website bereit';
  }
})();
