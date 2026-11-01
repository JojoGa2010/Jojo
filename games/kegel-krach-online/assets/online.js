/* Kegel-Krach: authenticated WordPress room relay. No third-party account required. */
(() => {
  'use strict';
  let attempts = 0;
  const ready = setInterval(() => {
    attempts++;
    if (!document.querySelector('#home #bMk') || typeof names !== 'function' || typeof beginGame !== 'function') {
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

    async function api(body) {
      const abort = new AbortController();
      const timeout = setTimeout(() => abort.abort(), 15000);
      try {
        const response = await fetch(config.api + 'rooms', {
          method: 'POST',
          credentials: 'omit',
          cache: 'no-store',
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
          throw error;
        }
        return result;
      } catch (error) {
        if (error.name === 'AbortError') throw new Error('Der Spielserver antwortet nicht. Bitte noch einmal versuchen.');
        throw error;
      } finally { clearTimeout(timeout); }
    }

    function fail(error) {
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
          const result = await api({ op: 'poll', code: this.code, token: this.token, after: this.seq });
          if (this.closed) return;
          this.failures = 0;
          for (const event of result.events) {
            if (event.seq <= this.seq) continue;
            for (const callback of this.handlers.get(event.type) || []) {
              callback({ data: event.data, isMe: event.uid === me.uid });
            }
            this.seq = event.seq;
          }
        } catch (error) {
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
          return api({ op: 'emit', code: this.code, token: this.token, type, data });
        });
        // Legacy game calls emit without awaiting. Handle rejection here as well.
        this.queue = send.catch(error => { this.close(); fail(error); });
        return send;
      }
      close() { this.closed = true; clearTimeout(this.timer); }
    }

    // The existing host validates legal turns, rolls dice and runs bots. Other
    // clients can send only their own actions; only the host can publish results.
    wire = function () {
      const connection = R;
      connection.on('lobby', message => {
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
      });
      connection.on('act', message => {
        if (!isHost || !H || !message.data) return;
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
      if (R && R.close) R.close();
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
          button.textContent = '🎳 ' + item.n + ' · ' + item.c + '/4 · beitreten';
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
        while (players.length < 4) players.push({ n: BN[players.length - 1] || 'Bot', skin: rnd(4), bot: 1, uid: 'B' + players.length });
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
