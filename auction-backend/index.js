import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ["https://bidwicket.vercel.app", "http://localhost:5173"],
        methods: ["GET", "POST"]
    }
});

// ─── Helpers ───
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

// ─── Room & History Storage ───
const rooms = new Map();
app.get('/', (req, res) => {
    res.send('🏏 IPL Auction Server is running globally!');
});

// Store finished games
const finishedGames = []; // Stores recent completed public games

// ─── Build player queue (imported inline to avoid ESM issues with shared data) ───
function buildMegaQueue() {
    // We'll receive the queue from the host client to avoid duplicating 500+ player data
    return [];
}

function createGameState(playerQueue) {
    return {
        playerQueue,
        currentIdx: 0,
        currentBid: playerQueue[0]?.base || 2,
        currentBidder: null,
        timer: 10,
        timerDuration: 10, // Default duration to reset to
        phase: "bidding",
        currentSetName: playerQueue[0]?.setName || "",
        purses: Object.fromEntries(TEAMS.map(t => [t.id, 120])),
        squads: Object.fromEntries(TEAMS.map(t => [t.id, []])),
        bidLog: [],
        bidLog: [],
        auctionLog: [],
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
    } else {
        gs.auctionLog = [{ player, bidder: null, price: 0, sold: false }, ...gs.auctionLog];
    }

    io.to(room.code).emit('game-state', getClientState(room));

    // After 2.5s, advance to next
    setTimeout(() => advanceToNext(room), 2500);
}

function advanceToNext(room) {
    const gs = room.gameState;
    if (!gs) return;

    const nextIdx = gs.currentIdx + 1;
    if (nextIdx >= gs.playerQueue.length) {
        gs.phase = "finished";
        room.status = "finished";

        // Save to history if public
        if (!room.isPrivate) {
            finishedGames.unshift({
                id: room.code,
                name: room.name,
                mode: room.auctionMode,
                date: new Date().toISOString(),
                host: room.players[room.hostId]?.name || "Unknown",
                totalSold: gs.auctionLog.filter(l => l.sold).length,
                topBuy: gs.auctionLog.filter(l => l.sold).sort((a, b) => b.price - a.price)[0] || null
            });
            if (finishedGames.length > 20) finishedGames.pop(); // Keep last 20
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
        bidLog: gs.bidLog,
        auctionLog: gs.auctionLog.slice(0, 20),
        totalPlayers: gs.playerQueue.length,
    };
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
            io.to(room.code).emit('game-state', getClientState(room));
        }
    }, 1000);
}

// ─── Socket.IO ───
io.on('connection', (socket) => {
    console.log(`[+] ${socket.id} connected`);
    let currentRoom = null;
    let currentPlayerId = null;

    socket.on('create-room', ({ playerName, isPrivate, roomName, playerId }, cb) => {
        if (!playerId) return cb({ ok: false, error: 'Missing Player ID' });

        const code = genCode();
        const room = {
            code,
            name: roomName || `${playerName}'s Room`,
            isPrivate: !!isPrivate,
            status: 'lobby', // lobby, active, finished
            hostId: playerId, // Use playerId as host
            players: {
                [playerId]: { id: playerId, socketId: socket.id, name: playerName || 'Player 1', teamId: null, isHost: true, offline: false }
            },
            auctionMode: null,
            gameState: null,
            timerInterval: null,
            started: false,
        };
        rooms.set(code, room);
        socket.join(code);
        currentRoom = code;
        currentPlayerId = playerId;
        console.log(`[ROOM] ${code} (${room.isPrivate ? 'PVT' : 'PUB'}) created by ${playerName} (${playerId})`);

        // Return without socketId to frontend for privacy
        const safePlayers = Object.values(room.players).map(p => ({ ...p, socketId: undefined }));
        cb({ ok: true, code, players: safePlayers });

        // Broadcast to browsers
        if (!room.isPrivate) io.emit('public-rooms-updated');
    });

    socket.on('join-room', ({ code, playerName, playerId }, cb) => {
        if (!playerId) return cb({ ok: false, error: 'Missing Player ID' });

        const room = rooms.get(code);
        if (!room) return cb({ ok: false, error: 'Room not found' });

        // Rejoin Logic
        if (room.players[playerId]) {
            room.players[playerId].socketId = socket.id;
            room.players[playerId].offline = false;
            room.players[playerId].name = playerName; // Update name just in case
            socket.join(code);
            currentRoom = code;
            currentPlayerId = playerId;
            console.log(`[ROOM] ${playerName} (${playerId}) REJOINED ${code}`);

            const safePlayers = Object.values(room.players).map(p => ({ ...p, socketId: undefined }));
            io.to(code).emit('lobby-update', { players: safePlayers });
            return cb({
                ok: true,
                code,
                players: safePlayers,
                roomStatus: room.status,
                hostId: room.hostId,
                auctionMode: room.auctionMode,
                gameState: room.status !== 'lobby' ? getClientState(room) : null
            });
        }

        if (room.started && room.status !== 'finished') return cb({ ok: false, error: 'Game already active' });
        if (Object.keys(room.players).length >= 10) return cb({ ok: false, error: 'Room is full' });

        // New Join Logic
        room.players[playerId] = { id: playerId, socketId: socket.id, name: playerName || `Player ${Object.keys(room.players).length + 1}`, teamId: null, isHost: false, offline: false };
        socket.join(code);
        currentRoom = code;
        currentPlayerId = playerId;
        console.log(`[ROOM] ${playerName} (${playerId}) joined ${code}`);

        const safePlayers = Object.values(room.players).map(p => ({ ...p, socketId: undefined }));
        io.to(code).emit('lobby-update', { players: safePlayers });
        cb({ ok: true, code, players: safePlayers });
    });

    socket.on('select-team', ({ teamId }, cb) => {
        if (!currentRoom || !currentPlayerId) return cb?.({ ok: false });
        const room = rooms.get(currentRoom);
        if (!room) return cb?.({ ok: false });

        // Check if team is already taken by another player
        const taken = Object.values(room.players).some(p => p.teamId === teamId && p.id !== currentPlayerId);
        if (taken) return cb?.({ ok: false, error: 'Team already taken' });

        room.players[currentPlayerId].teamId = teamId;
        const safePlayers = Object.values(room.players).map(p => ({ ...p, socketId: undefined }));
        io.to(currentRoom).emit('lobby-update', { players: safePlayers });
        cb?.({ ok: true });
    });

    socket.on('set-auction-mode', ({ mode }) => {
        if (!currentRoom || !currentPlayerId) return;
        const room = rooms.get(currentRoom);
        if (!room || currentPlayerId !== room.hostId) return;
        room.auctionMode = mode;
        const safePlayers = Object.values(room.players).map(p => ({ ...p, socketId: undefined }));
        io.to(currentRoom).emit('lobby-update', { players: safePlayers, auctionMode: mode });
    });

    socket.on('start-game', ({ playerQueue }, cb) => {
        if (!currentRoom || !currentPlayerId) return cb?.({ ok: false });
        const room = rooms.get(currentRoom);
        if (!room || currentPlayerId !== room.hostId) return cb?.({ ok: false, error: 'Not host' });

        // Validate all players have a team
        const noTeam = Object.values(room.players).find(p => !p.teamId);
        if (noTeam) return cb?.({ ok: false, error: `${noTeam.name} hasn't selected a team` });

        room.started = true;
        room.status = 'active';
        room.gameState = createGameState(playerQueue);
        room.gameState.isPaused = false;

        io.to(currentRoom).emit('game-started', getClientState(room));
        startGameTick(room);
        cb?.({ ok: true });
        if (!room.isPrivate) io.emit('public-rooms-updated');
    });

    // ─── Host Controls ───
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

        room.gameState.currentIdx = room.gameState.playerQueue.length - 1; // force to end
        advanceToNext(room);
        if (!room.isPrivate) io.emit('public-rooms-updated');
    });

    socket.on('set-timer-duration', ({ duration }) => {
        if (!currentRoom || !currentPlayerId) return;
        const room = rooms.get(currentRoom);
        if (!room || currentPlayerId !== room.hostId || !room.gameState) return;

        const newD = Math.max(5, Math.min(60, parseInt(duration) || 10));
        room.gameState.timerDuration = newD;
        room.gameState.timer = newD; // immediately jump timer up or down to new max

        io.to(currentRoom).emit('game-state', getClientState(room));
    });

    // ─── Server Browser Events ───
    socket.on('get-rooms', (cb) => {
        const activeRooms = [];
        rooms.forEach((r) => {
            if (!r.isPrivate && r.status !== 'finished') {
                activeRooms.push({
                    code: r.code,
                    name: r.name,
                    host: r.players[r.hostId]?.name || "Unknown",
                    players: Object.keys(r.players).length,
                    status: r.status,
                    mode: r.auctionMode
                });
            }
        });
        cb?.({ active: activeRooms, history: finishedGames });
    });

    socket.on('place-bid', (_, cb) => {
        if (!currentRoom || !currentPlayerId) return cb?.({ ok: false });
        const room = rooms.get(currentRoom);
        if (!room || !room.gameState) return cb?.({ ok: false });

        const gs = room.gameState;
        if (gs.phase !== "bidding") return cb?.({ ok: false });

        const player = room.players[currentPlayerId];
        if (!player || !player.teamId) return cb?.({ ok: false });

        const teamId = player.teamId;
        if (gs.currentBidder === teamId) return cb?.({ ok: false, error: 'Already leading' });

        const nb = nextBid(gs.currentBid);
        if (gs.purses[teamId] < nb) return cb?.({ ok: false, error: 'Insufficient funds' });
        if (gs.squads[teamId].length >= 25) return cb?.({ ok: false, error: 'Squad full' });

        gs.currentBid = nb;
        gs.currentBidder = teamId;
        gs.timer = gs.timerDuration || 10;
        gs.bidLog = [{ teamId, bid: nb, playerName: player.name }, ...gs.bidLog].slice(0, 7);

        // Broadcast immediately for instant feel
        io.to(currentRoom).emit('game-state', getClientState(room));
        cb?.({ ok: true });
    });

    socket.on('disconnect', () => {
        console.log(`[-] ${socket.id} (Player: ${currentPlayerId || 'Unknown'}) disconnected`);
        if (!currentRoom || !currentPlayerId) return;
        const room = rooms.get(currentRoom);
        if (!room || !room.players[currentPlayerId]) return;

        // Mark as offline instead of deleting!
        room.players[currentPlayerId].offline = true;

        const activePlayers = Object.values(room.players).filter(p => !p.offline);

        if (activePlayers.length === 0) {
            clearInterval(room.timerInterval);
            rooms.delete(currentRoom);
            console.log(`[ROOM] ${currentRoom} deleted (all players offline)`);
            if (!room.isPrivate) io.emit('public-rooms-updated');
        } else {
            // If host left, transfer to next active player
            if (room.hostId === currentPlayerId) {
                const newHost = activePlayers[0];
                if (newHost) {
                    room.hostId = newHost.id;
                    room.players[newHost.id].isHost = true;
                }
            }
            const safePlayers = Object.values(room.players).map(p => ({ ...p, socketId: undefined }));
            io.to(currentRoom).emit('lobby-update', { players: safePlayers });
            if (!room.isPrivate) io.emit('public-rooms-updated');
        }
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`\n  🏏 IPL Auction Server running on http://localhost:${PORT}\n`);
});
