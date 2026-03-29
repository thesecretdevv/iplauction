import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    // Optimize for low latency
    pingTimeout: 20000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
    upgradeTimeout: 10000,
});

// ─── Helpers ───────────────────────────────────────────────────────────────────
const genCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let c = ''; for (let i = 0; i < 6; i++) c += chars[Math.random() * chars.length | 0];
    return c;
};
const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; };
const fmt = c => c >= 1 ? `₹${c.toFixed(2)} Cr` : `₹${Math.round(c * 100)} L`;
const getIncrement = p => p < 2 ? 0.10 : p < 5 ? 0.20 : p < 10 ? 0.25 : 0.50;
const nextBid = c => +(c + getIncrement(c)).toFixed(2);

const TEAMS = [
    { id: "CSK", name: "Chennai Super Kings", short: "CSK", color: "#F9CA24" },
    { id: "MI", name: "Mumbai Indians", short: "MI", color: "#4FC3F7" },
    { id: "RCB", name: "Royal Challengers Bengaluru", short: "RCB", color: "#FF5252" },
    { id: "KKR", name: "Kolkata Knight Riders", short: "KKR", color: "#CE93D8" },
    { id: "SRH", name: "Sunrisers Hyderabad", short: "SRH", color: "#FF8A65" },
    { id: "DC", name: "Delhi Capitals", short: "DC", color: "#64B5F6" },
    { id: "PBKS", name: "Punjab Kings", short: "PBKS", color: "#EF9A9A" },
    { id: "RR", name: "Rajasthan Royals", short: "RR", color: "#F48FB1" },
    { id: "GT", name: "Gujarat Titans", short: "GT", color: "#4DD0E1" },
    { id: "LSG", name: "Lucknow Super Giants", short: "LSG", color: "#81D4FA" },
];

// ─── Room & History Storage ─────────────────────────────────────────────────
const rooms = new Map();
const finishedGames = [];
// Grace period timers: Map<playerId, timeoutId>
const disconnectTimers = new Map();

// ─── REST endpoints ─────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.send('🏏 IPL Auction Server is running!');
});

// GET /api/rooms — returns all active public rooms (for initial page load without socket)
app.get('/api/rooms', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const activeRooms = [];
    rooms.forEach((r) => {
        if (!r.isPrivate && r.status !== 'finished') {
            activeRooms.push({
                code: r.code,
                name: r.name,
                host: r.players[r.hostId]?.name || 'Unknown',
                players: Object.values(r.players).filter(p => !p.isSpectator && !p.offline).length,
                spectators: Object.values(r.players).filter(p => p.isSpectator).length,
                status: r.status,
                mode: r.auctionMode,
            });
        }
    });

    const totalPlayers = activeRooms.reduce((sum, r) => sum + r.players, 0);
    res.json({ active: activeRooms, totalRooms: activeRooms.length, totalPlayers });
});

// GET /api/rooms/:code — room details
app.get('/api/rooms/:code', (req, res) => {
    const room = rooms.get(req.params.code?.toUpperCase());
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json({
        code: room.code,
        name: room.name,
        status: room.status,
        mode: room.auctionMode,
        playerCount: Object.values(room.players).filter(p => !p.isSpectator).length,
    });
});

// ─── Game State helpers ──────────────────────────────────────────────────────
function createGameState(playerQueue) {
    return {
        playerQueue,
        currentIdx: 0,
        currentBid: playerQueue[0]?.base || 2,
        currentBidder: null,
        timer: 10,
        timerDuration: 10,
        phase: "bidding",
        currentSetName: playerQueue[0]?.setName || "",
        purses: Object.fromEntries(TEAMS.map(t => [t.id, 120])),
        squads: Object.fromEntries(TEAMS.map(t => [t.id, []])),
        playingXI: Object.fromEntries(TEAMS.map(t => [t.id, []])),
        selections: Object.fromEntries(TEAMS.map(t => [t.id, false])),
        bidLog: [],
        auctionLog: [],
        isPaused: false,
    };
}

function getClientState(room) {
    const gs = room.gameState;
    if (!gs) return null;
    return {
        playerQueue: gs.playerQueue,
        currentIdx: gs.currentIdx,
        currentBid: gs.currentBid,
        currentBidder: gs.currentBidder,
        timer: gs.timer,
        timerDuration: gs.timerDuration || 10,
        isPaused: gs.isPaused || false,
        phase: gs.phase,
        currentSetName: gs.currentSetName,
        purses: gs.purses,
        squads: gs.squads,
        playingXI: gs.playingXI,
        selections: gs.selections,
        bidLog: gs.bidLog,
        auctionLog: gs.auctionLog.slice(0, 20),
        totalPlayers: gs.playerQueue.length,
    };
}

function getLobbyState(room) {
    return {
        players: Object.values(room.players).map(p => ({ ...p, socketId: undefined })),
        auctionMode: room.auctionMode,
        hostId: room.hostId,
    };
}

function finishCurrent(room) {
    const gs = room.gameState;
    if (!gs || gs.phase !== "bidding") return;

    gs.phase = gs.currentBidder ? "sold" : "unsold";
    const player = gs.playerQueue[gs.currentIdx];

    if (gs.currentBidder) {
        const price = gs.currentBid;
        const bidder = gs.currentBidder;
        gs.purses[bidder] = +(gs.purses[bidder] - price).toFixed(2);
        gs.squads[bidder] = [...gs.squads[bidder], { ...player, soldFor: price }];
        gs.auctionLog = [{ player, bidder, price, sold: true }, ...gs.auctionLog];
        pushSystemMessage(room, `${player.name} SOLD to ${TEAMS.find(t=>t.id===bidder)?.short || bidder} for ${fmt(price)}`);
    } else {
        gs.auctionLog = [{ player, bidder: null, price: 0, sold: false }, ...gs.auctionLog];
        pushSystemMessage(room, `${player.name} was UNSOLD`);
    }

    io.to(room.code).emit('game-state', getClientState(room));
    setTimeout(() => advanceToNext(room), 2500);
}

function advanceToNext(room) {
    const gs = room.gameState;
    if (!gs) return;

    const nextIdx = gs.currentIdx + 1;
    if (nextIdx >= gs.playerQueue.length) {
        gs.phase = "selection";
        room.status = "active";

        if (!room.isPrivate) {
            saveFinishedGame(room, gs);
        }

        io.to(room.code).emit('game-over', getClientState(room));
        clearInterval(room.timerInterval);
        return;
    }

    gs.currentIdx = nextIdx;
    const np = gs.playerQueue[nextIdx];
    gs.currentBid = np.base;
    gs.currentBidder = null;
    gs.timer = gs.timerDuration || 10;
    gs.phase = "bidding";
    gs.bidLog = [];
    gs.currentSetName = np.setName;

    io.to(room.code).emit('game-state', getClientState(room));
}

function saveFinishedGame(room, gs) {
    finishedGames.unshift({
        id: room.code,
        name: room.name,
        mode: room.auctionMode,
        date: new Date().toISOString(),
        host: room.players[room.hostId]?.name || "Unknown",
        totalSold: gs.auctionLog.filter(l => l.sold).length,
        topBuy: gs.auctionLog.filter(l => l.sold).sort((a, b) => b.price - a.price)[0] || null
    });
    if (finishedGames.length > 20) finishedGames.pop();
}

function pushSystemMessage(room, text) {
    if (!room.chatLog) room.chatLog = [];
    room.chatLog.push({
        id: Math.random().toString(36).substr(2, 9),
        type: 'system',
        text,
        timestamp: Date.now()
    });
    if (room.chatLog.length > 200) room.chatLog.shift();
    io.to(room.code).emit('chat-update', room.chatLog);
}

function startGameTick(room) {
    if (room.timerInterval) clearInterval(room.timerInterval);

    room.timerInterval = setInterval(() => {
        const gs = room.gameState;
        if (!gs || gs.phase !== "bidding" || gs.isPaused) return;

        gs.timer--;

        if (gs.timer <= 0) {
            finishCurrent(room);
        } else {
            // Only broadcast state every second — no extra delay
            io.to(room.code).emit('timer-tick', { timer: gs.timer });
        }
    }, 1000);
}

function broadcastRoomList() {
    // Emit to all connected sockets that public rooms changed
    io.emit('public-rooms-updated');
}

// ─── Socket.IO ───────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
    console.log(`[+] ${socket.id} connected`);
    let currentRoom = null;
    let currentPlayerId = null;

    // ── Create Room ──
    socket.on('create-room', ({ playerName, isPrivate, roomName, playerId }, cb) => {
        if (!playerId) return cb({ ok: false, error: 'Missing Player ID' });

        // Cancel any pending disconnect timer for this player
        if (disconnectTimers.has(playerId)) {
            clearTimeout(disconnectTimers.get(playerId));
            disconnectTimers.delete(playerId);
        }

        const code = genCode();
        const room = {
            code,
            name: roomName || `${playerName}'s Room`,
            isPrivate: !!isPrivate,
            status: 'lobby',
            hostId: playerId,
            players: {
                [playerId]: {
                    id: playerId,
                    socketId: socket.id,
                    name: playerName || 'Player 1',
                    teamId: null,
                    isHost: true,
                    isSpectator: false,
                    offline: false
                }
            },
            auctionMode: null,
            gameState: null,
            timerInterval: null,
            started: false,
            chatLog: [],
        };
        rooms.set(code, room);
        socket.join(code);
        currentRoom = code;
        currentPlayerId = playerId;
        console.log(`[ROOM] ${code} (${room.isPrivate ? 'PVT' : 'PUB'}) created by ${playerName}`);

        const state = getLobbyState(room);
        cb({ ok: true, code, players: state.players });

        if (!room.isPrivate) broadcastRoomList();
    });

    // ── Join Room ──
    socket.on('join-room', ({ code, playerName, playerId }, cb) => {
        if (!playerId) return cb({ ok: false, error: 'Missing Player ID' });

        const room = rooms.get(code);
        if (!room) return cb({ ok: false, error: 'Room not found' });

        // Cancel any pending disconnect timer
        if (disconnectTimers.has(playerId)) {
            clearTimeout(disconnectTimers.get(playerId));
            disconnectTimers.delete(playerId);
        }

        // ── Rejoin ──
        if (room.players[playerId]) {
            room.players[playerId].socketId = socket.id;
            room.players[playerId].offline = false;
            room.players[playerId].name = playerName;
            socket.join(code);
            currentRoom = code;
            currentPlayerId = playerId;
            console.log(`[ROOM] ${playerName} (${playerId}) REJOINED ${code}`);

            const state = getLobbyState(room);
            io.to(code).emit('lobby-update', state);
            pushSystemMessage(room, `${playerName} rejoined`);
            return cb({
                ok: true,
                code,
                players: state.players,
                roomStatus: room.status,
                hostId: room.hostId,
                auctionMode: room.auctionMode,
                isSpectator: room.players[playerId].isSpectator,
                gameState: room.status !== 'lobby' ? getClientState(room) : null
            });
        }

        // ── Game active: check for slots ──
        if (room.started && room.status === 'active') {
            const takenTeams = new Set(Object.values(room.players).map(p => p.teamId).filter(Boolean));
            const availableTeams = TEAMS.filter(t => !takenTeams.has(t.id));
            const activeHumanPlayers = Object.values(room.players).filter(p => !p.isSpectator && !p.offline);

            // If there's an available team AND room isn't full (10 players)
            if (availableTeams.length > 0 && activeHumanPlayers.length < 10) {
                room.players[playerId] = {
                    id: playerId,
                    socketId: socket.id,
                    name: playerName || `Player ${Object.keys(room.players).length + 1}`,
                    teamId: null, // They'll have to select one in the lobby first
                    isHost: false,
                    isSpectator: false,
                    offline: false,
                };
                socket.join(code);
                currentRoom = code;
                currentPlayerId = playerId;
                
                const state = getLobbyState(room);
                io.to(code).emit('lobby-update', state);
                pushSystemMessage(room, `${playerName || 'Player'} joined`);
                return cb({
                    ok: true,
                    code,
                    players: state.players,
                    roomStatus: room.status,
                    hostId: room.hostId,
                    auctionMode: room.auctionMode,
                    isSpectator: false,
                    gameState: getClientState(room)
                });
            } else {
                // Join as spectator
                room.players[playerId] = {
                    id: playerId,
                    socketId: socket.id,
                    name: playerName || 'Spectator',
                    teamId: null,
                    isHost: false,
                    isSpectator: true,
                    offline: false,
                };
                socket.join(code);
                currentRoom = code;
                currentPlayerId = playerId;
                console.log(`[SPECTATOR] ${playerName} joined ${code} as spectator (ongoing)`);

                const state = getLobbyState(room);
                io.to(code).emit('lobby-update', state);
                pushSystemMessage(room, `${playerName || 'Spectator'} joined as spectator`);
                return cb({
                    ok: true,
                    code,
                    players: state.players,
                    roomStatus: room.status,
                    hostId: room.hostId,
                    auctionMode: room.auctionMode,
                    isSpectator: true,
                    gameState: getClientState(room)
                });
            }
        }

        // ── Room finished: spectator ──
        if (room.status === 'finished') {
            socket.join(code);
            currentRoom = code;
            currentPlayerId = playerId;
            return cb({
                ok: true,
                code,
                players: Object.values(room.players).map(p => ({ ...p, socketId: undefined })),
                roomStatus: 'finished',
                hostId: room.hostId,
                auctionMode: room.auctionMode,
                isSpectator: true,
                gameState: getClientState(room)
            });
        }

        // ── Full room check ──
        const activePlayers = Object.values(room.players).filter(p => !p.isSpectator);
        if (activePlayers.length >= 10) return cb({ ok: false, error: 'Room is full (10 players max)' });

        // ── New Join ──
        room.players[playerId] = {
            id: playerId,
            socketId: socket.id,
            name: playerName || `Player ${Object.keys(room.players).length + 1}`,
            teamId: null,
            isHost: false,
            isSpectator: false,
            offline: false
        };
        socket.join(code);
        currentRoom = code;
        currentPlayerId = playerId;
        console.log(`[ROOM] ${playerName} (${playerId}) joined ${code}`);

        const state = getLobbyState(room);
        io.to(code).emit('lobby-update', state);
        pushSystemMessage(room, `${playerName || 'Player'} joined`);
        cb({ ok: true, code, players: state.players, roomStatus: room.status, hostId: room.hostId, auctionMode: room.auctionMode, isSpectator: false });

        if (!room.isPrivate) broadcastRoomList();
    });

    // ── Select Team ──
    socket.on('select-team', ({ teamId }, cb) => {
        if (!currentRoom || !currentPlayerId) return cb?.({ ok: false });
        const room = rooms.get(currentRoom);
        if (!room) return cb?.({ ok: false });

        const player = room.players[currentPlayerId];
        if (!player || player.isSpectator) return cb?.({ ok: false, error: 'Spectators cannot select teams' });

        const taken = Object.values(room.players).some(p => p.teamId === teamId && p.id !== currentPlayerId && !p.offline);
        if (taken) return cb?.({ ok: false, error: 'Team already taken' });

        player.teamId = teamId;
        const state = getLobbyState(room);
        io.to(currentRoom).emit('lobby-update', state);
        cb?.({ ok: true });
    });

    // ── Set Auction Mode ──
    socket.on('set-auction-mode', ({ mode }) => {
        if (!currentRoom || !currentPlayerId) return;
        const room = rooms.get(currentRoom);
        if (!room || currentPlayerId !== room.hostId) return;
        room.auctionMode = mode;
        const state = getLobbyState(room);
        io.to(currentRoom).emit('lobby-update', state);
    });

    // ── Start Game ──
    socket.on('start-game', ({ playerQueue }, cb) => {
        if (!currentRoom || !currentPlayerId) return cb?.({ ok: false });
        const room = rooms.get(currentRoom);
        if (!room || currentPlayerId !== room.hostId) return cb?.({ ok: false, error: 'Not host' });

        // Only check non-spectator players for team selection
        const activePlayers = Object.values(room.players).filter(p => !p.isSpectator && !p.offline);
        const noTeam = activePlayers.find(p => !p.teamId);
        if (noTeam) return cb?.({ ok: false, error: `${noTeam.name} hasn't selected a team` });

        room.started = true;
        room.status = 'active';
        room.gameState = createGameState(playerQueue);

        io.to(currentRoom).emit('game-started', getClientState(room));
        startGameTick(room);
        cb?.({ ok: true });

        if (!room.isPrivate) broadcastRoomList();
    });

    // ── Host Controls ──
    socket.on('pause-game', () => {
        if (!currentRoom || !currentPlayerId) return;
        const room = rooms.get(currentRoom);
        if (!room || currentPlayerId !== room.hostId || !room.gameState) return;
        room.gameState.isPaused = true;
        io.to(currentRoom).emit('game-state', getClientState(room));
    });

    socket.on('resume-game', () => {
        if (!currentRoom || !currentPlayerId) return;
        const room = rooms.get(currentRoom);
        if (!room || currentPlayerId !== room.hostId || !room.gameState) return;
        room.gameState.isPaused = false;
        io.to(currentRoom).emit('game-state', getClientState(room));
    });

    socket.on('end-game', () => {
        if (!currentRoom || !currentPlayerId) return;
        const room = rooms.get(currentRoom);
        if (!room || currentPlayerId !== room.hostId || !room.gameState) return;
        room.gameState.currentIdx = room.gameState.playerQueue.length - 1;
        advanceToNext(room);
        if (!room.isPrivate) broadcastRoomList();
    });

    socket.on('set-timer-duration', ({ duration }) => {
        if (!currentRoom || !currentPlayerId) return;
        const room = rooms.get(currentRoom);
        if (!room || currentPlayerId !== room.hostId || !room.gameState) return;
        const newD = Math.max(5, Math.min(60, parseInt(duration) || 10));
        room.gameState.timerDuration = newD;
        room.gameState.timer = newD;
        io.to(currentRoom).emit('game-state', getClientState(room));
    });

    // ── Chat ──
    socket.on('send-chat', (payload) => {
        if (!currentRoom || !currentPlayerId) return;
        const room = rooms.get(currentRoom);
        if (!room) return;
        const player = room.players[currentPlayerId];
        if (!room.chatLog) room.chatLog = [];
        room.chatLog.push({
            id: Math.random().toString(36).substr(2, 9),
            type: payload.isGif ? 'gif' : 'text',
            text: payload.text,
            senderId: currentPlayerId,
            senderName: player?.name || "Unknown",
            senderTeam: player?.teamId || null,
            timestamp: Date.now()
        });
        if (room.chatLog.length > 200) room.chatLog.shift();
        io.to(currentRoom).emit('chat-update', room.chatLog);
    });

    // ── Get Rooms (socket) ──
    socket.on('get-rooms', (cb) => {
        const activeRooms = [];
        rooms.forEach((r) => {
            if (!r.isPrivate && r.status !== 'finished') {
                activeRooms.push({
                    code: r.code,
                    name: r.name,
                    host: r.players[r.hostId]?.name || 'Unknown',
                    players: Object.values(r.players).filter(p => !p.isSpectator && !p.offline).length,
                    spectators: Object.values(r.players).filter(p => p.isSpectator && !p.offline).length,
                    status: r.status,
                    mode: r.auctionMode,
                });
            }
        });
        const totalPlayers = activeRooms.reduce((sum, r) => sum + r.players, 0);
        cb?.({ active: activeRooms, totalRooms: activeRooms.length, totalPlayers });
    });

    // ── Place Bid ── (optimized for minimum latency)
    socket.on('place-bid', (_, cb) => {
        if (!currentRoom || !currentPlayerId) return cb?.({ ok: false });
        const room = rooms.get(currentRoom);
        if (!room || !room.gameState) return cb?.({ ok: false });

        const gs = room.gameState;
        if (gs.phase !== "bidding" || gs.isPaused) return cb?.({ ok: false, error: 'Not in bidding phase' });

        const player = room.players[currentPlayerId];
        if (!player || !player.teamId || player.isSpectator) return cb?.({ ok: false, error: 'Spectators cannot bid' });

        const teamId = player.teamId;
        if (gs.currentBidder === teamId) return cb?.({ ok: false, error: 'Already leading bid' });

        const nb = gs.currentBidder === null ? gs.currentBid : nextBid(gs.currentBid);
        if (gs.purses[teamId] < nb) return cb?.({ ok: false, error: 'Insufficient purse' });

        const maxSquadSize = (gs.playerQueue?.length || 0) <= 200 ? 15 : 25;
        if (gs.squads[teamId].length >= maxSquadSize) return cb?.({ ok: false, error: 'Squad full' });

        const playerOnAuction = gs.playerQueue[gs.currentIdx];
        const osCount = gs.squads[teamId].filter(p => p.overseas).length;
        if (playerOnAuction?.overseas && osCount >= 8) return cb?.({ ok: false, error: 'Max 8 overseas players reached' });

        // Apply state immediately
        gs.currentBid = nb;
        gs.currentBidder = teamId;
        gs.timer = gs.timerDuration || 10;
        gs.bidLog = [{ teamId, bid: nb, playerName: player.name }, ...gs.bidLog].slice(0, 7);

        pushSystemMessage(room, `${player.name} (${TEAMS.find(t=>t.id===teamId)?.short || teamId}) bidded ${fmt(nb)}`);

        // Broadcast immediately — no setTimeout, no debounce
        io.to(currentRoom).emit('game-state', getClientState(room));
        cb?.({ ok: true, newBid: nb });
    });

    // ── Submit XI ──
    socket.on('submit-xi', ({ players }, cb) => {
        if (!currentRoom || !currentPlayerId) return cb?.({ ok: false });
        const room = rooms.get(currentRoom);
        if (!room || !room.gameState) return cb?.({ ok: false });

        const gs = room.gameState;
        if (gs.phase !== "selection") return cb?.({ ok: false, error: "Not in selection phase" });

        const player = room.players[currentPlayerId];
        if (!player || !player.teamId || player.isSpectator) return cb?.({ ok: false });

        const teamId = player.teamId;
        if (players.length !== 11) return cb?.({ ok: false, error: "Must select exactly 11 players" });

        gs.playingXI[teamId] = players;
        gs.selections[teamId] = true;

        // Check if all non-spectator players have submitted
        const humanTeamIds = Object.values(room.players)
            .filter(p => !p.isSpectator && p.teamId)
            .map(p => p.teamId);

        const allSubmitted = humanTeamIds.every(tid => gs.selections[tid]);

        if (allSubmitted) {
            // Auto-fill XI for AI/unowned teams
            TEAMS.forEach(t => {
                if (!gs.selections[t.id]) {
                    gs.playingXI[t.id] = [...gs.squads[t.id]]
                        .sort((a, b) => (b.soldFor || 0) - (a.soldFor || 0))
                        .slice(0, 11);
                    gs.selections[t.id] = true;
                }
            });

            gs.phase = "finished";
            room.status = "finished";

            if (!room.isPrivate) saveFinishedGame(room, gs);

            io.to(currentRoom).emit('game-over', getClientState(room));
            clearInterval(room.timerInterval);
            if (!room.isPrivate) broadcastRoomList();
        } else {
            io.to(currentRoom).emit('game-state', getClientState(room));
        }

        cb?.({ ok: true });
    });

    // ── Disconnect ──
    socket.on('disconnect', () => {
        console.log(`[-] ${socket.id} (Player: ${currentPlayerId || 'Unknown'}) disconnected`);
        if (!currentRoom || !currentPlayerId) return;
        const room = rooms.get(currentRoom);
        if (!room || !room.players[currentPlayerId]) return;

        const player = room.players[currentPlayerId];
        player.offline = true;
        pushSystemMessage(room, `${player.name} went offline`);

        const activePlayers = Object.values(room.players).filter(p => !p.offline);

        if (activePlayers.length === 0) {
            // Immediate cleanup if nobody is left
            clearInterval(room.timerInterval);
            rooms.delete(currentRoom);
            console.log(`[ROOM] ${currentRoom} deleted (empty)`);
            if (!room.isPrivate) broadcastRoomList();
            return;
        }

        // Transfer host if needed
        if (room.hostId === currentPlayerId) {
            const newHost = activePlayers.find(p => !p.isSpectator) || activePlayers[0];
            if (newHost) {
                room.hostId = newHost.id;
                room.players[newHost.id].isHost = true;
                room.players[currentPlayerId].isHost = false;
                console.log(`[ROOM] Host transferred to ${newHost.name}`);
            }
        }

        // Notify room of the change
        const state = getLobbyState(room);
        io.to(currentRoom).emit('lobby-update', state);
        if (!room.isPrivate) broadcastRoomList();

        // Schedule team-slot release after a 30s grace period
        // (so refreshes don't permanently free the slot)
        const gracePeriodId = setTimeout(() => {
            disconnectTimers.delete(currentPlayerId);
            const r = rooms.get(currentRoom);
            if (!r || !r.players[currentPlayerId]) return;

            const p = r.players[currentPlayerId];
            if (!p.offline) return; // They reconnected — skip

            if (r.status === 'lobby') {
                // Free team slot and remove player from room
                delete r.players[currentPlayerId];
                console.log(`[ROOM] ${currentPlayerId} removed after grace period from ${currentRoom}`);

                const remaining = Object.values(r.players).filter(p2 => !p2.offline);
                if (remaining.length === 0) {
                    clearInterval(r.timerInterval);
                    rooms.delete(currentRoom);
                    console.log(`[ROOM] ${currentRoom} deleted (all expired)`);
                } else {
                    const st = getLobbyState(r);
                    io.to(currentRoom).emit('lobby-update', st);
                }
                if (!r.isPrivate) broadcastRoomList();
            }
            // In active games, keep the player record but they stay offline
        }, 30_000);

        disconnectTimers.set(currentPlayerId, gracePeriodId);
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`\n  🏏 IPL Auction Server running on http://localhost:${PORT}\n`);
});
