import express from 'express';
import { createServer } from 'http';
import { createRequire } from 'module';
import { Server } from 'socket.io';

import { Redis } from '@upstash/redis';
import {
    buildRivalsMatchSnapshot,
    buildRivalsPlayerPool,
    IPL_2026_MATCHES,
    RIVALS_MAX_OVERSEAS,
    RIVALS_MAX_SQUAD_SIZE,
    RIVALS_PURSE,
    RIVALS_TIMER_SECONDS,
} from '../shared/rivalsSchedule.mjs';
import { verifyAdminCredentials } from '../shared/adminAuth.mjs';

const require = createRequire(import.meta.url);
const ALL_PLAYERS = require('../boom/app/data/Players.json');

const app = express();
app.use((req, res, next) => {
    const origin = req.headers.origin || '*';
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Admin-Username, X-Admin-Password');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    return next();
});
app.use(express.json());

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || "https://close-condor-71996.upstash.io",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "gQAAAAAAARk8AAIncDI3M2E4OGIwNzQ5NTU0YWU5YmU4OWEzYjJlMGYzYmU3NXAyNzE5OTY"
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "https://bidwicket.onrender.com"],
        methods: ["GET", "POST"]
    },
    // Faster disconnect detection:
    // pingInterval 15s + pingTimeout 10s = server knows within ~25s when a tab closes.
    // Previously 25s+20s=45s, during which ghost rooms stayed visible in the public list.
    pingTimeout: 10000,
    pingInterval: 15000,
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
function getOverseasLimitForSquad(squadLimit) {
    const limit = Number(squadLimit) || 15;
    if (limit >= 25) return 8;
    if (limit >= 20) return 7;
    return 6;
}

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

const TEAM_IDS = TEAMS.map((team) => team.id);

function getActiveTeamIds(room) {
    return Array.isArray(room?.activeTeamIds) && room.activeTeamIds.length
        ? room.activeTeamIds
        : TEAM_IDS;
}

function getTeamLimit(room) {
    return room?.roomType === 'rivals' ? getActiveTeamIds(room).length : TEAMS.length;
}

function getRoomPlayerLimit(room) {
    return room?.roomType === 'rivals' ? 2 : 10;
}

function getVisiblePlayers(room) {
    return Object.values(room?.players || {}).filter(player => !player.offline);
}

function getActivePlayers(room) {
    return Object.values(room?.players || {}).filter(player => !player.isSpectator && !player.offline);
}

function getParticipantPlayers(room) {
    return Object.values(room?.players || {}).filter(player => !player.isSpectator);
}

function getClaimedTeamIds(room) {
    return new Set(
        getParticipantPlayers(room)
            .map((player) => player.teamId)
            .filter(Boolean)
    );
}

function getAvailableTeamIds(room) {
    return getActiveTeamIds(room).filter((teamId) => !getClaimedTeamIds(room).has(teamId));
}

function getRoomParticipantSummary(room) {
    return Object.values(room?.players || {})
        .filter(player => !player.isSpectator)
        .map(player => ({
            id: player.id,
            name: player.name,
            teamId: player.teamId || null,
            isHost: !!player.isHost,
        }));
}

function getLobbyStatePayload(room) {
    return {
        players: Object.values(room.players).map(player => ({ ...player, socketId: undefined })),
        auctionMode: room.auctionMode,
        squadLimit: room.squadLimit,
        hostId: room.hostId,
        roomType: room.roomType || 'standard',
        activeTeamIds: getActiveTeamIds(room),
        rivalsMatch: room.rivalsMatch || null,
        roomName: room.name,
    };
}

function getCurrentMatchStatus(matchKey, now = new Date()) {
    return buildRivalsMatchSnapshot(matchKey, now);
}

async function findOpenRivalsRoom(matchKey) {
    const publicCodes = await redis.smembers('public_rooms');
    for (const code of publicCodes) {
        const room = await getRoom(code);
        if (!room || room.roomType !== 'rivals' || room.rivalsMatch?.key !== matchKey || isRoomOver(room)) continue;
        if (getActivePlayers(room).length < getRoomPlayerLimit(room)) {
            return room;
        }
    }
    return null;
}

function startRivalsAuction(room) {
    const playerQueue = buildRivalsPlayerPool(ALL_PLAYERS, room.rivalsMatch);
    room.started = true;
    room.status = 'active';
    room.auctionMode = 'rivals';
    room.squadLimit = RIVALS_MAX_SQUAD_SIZE;
    room.gameState = createGameState(playerQueue, {
        purse: RIVALS_PURSE,
        timerDuration: RIVALS_TIMER_SECONDS,
        squadLimit: RIVALS_MAX_SQUAD_SIZE,
    });
    markRoomDirty(room);
}

function isRoomOver(room) {
    return room?.status === 'finished'
        || room?.gameState?.phase === 'finished';
}

const FINISHED_ROOM_TTL_SECONDS = 60 * 60 * 48;
const FINISHED_ROOM_SET_KEY = 'finished_public_rooms';

// ─── Room & History Storage ─────────────────────────────────────────────────
const rooms = new Map();
const finishedGames = [];
// Grace period timers: Map<playerId, timeoutId>
const disconnectTimers = new Map();
const pendingPersistTimers = new Map();
let publicRoomsCache = null;
const PUBLIC_ROOMS_CACHE_MS = 2500;

function getDefaultSquadLimit(auctionMode) {
    const normalized = String(auctionMode || '').toLowerCase();
    if (normalized === 'rivals') return RIVALS_MAX_SQUAD_SIZE;
    return 15;
}

function markRoomDirty(room) {
    if (!room) return 0;
    publicRoomsCache = null;
    room.revision = (room.revision || 0) + 1;
    room.updatedAt = Date.now();
    return room.revision;
}

function isAdminRequest(req) {
    return verifyAdminCredentials(
        req.header('x-admin-username') || '',
        req.header('x-admin-password') || ''
    );
}

function requireAdmin(req, res) {
    if (isAdminRequest(req)) return true;
    res.status(401).json({ error: 'Unauthorized' });
    return false;
}

function getHostName(room) {
    return room?.players?.[room?.hostId]?.name || 'Unknown';
}

function summarizeRoom(room, { source = 'active' } = {}) {
    const visiblePlayers = getVisiblePlayers(room);
    const activePlayers = getActivePlayers(room);

    return {
        code: room.code,
        name: room.name,
        source,
        status: isRoomOver(room) ? 'finished' : room.status,
        mode: room.auctionMode || 'mega',
        isPrivate: !!room.isPrivate,
        roomType: room.roomType || 'standard',
        activeTeamIds: getActiveTeamIds(room),
        rivalsMatch: room.rivalsMatch || null,
        host: getHostName(room),
        playerCount: activePlayers.length,
        spectatorCount: visiblePlayers.filter(player => player.isSpectator).length,
        visiblePlayerCount: visiblePlayers.length,
        started: !!room.started,
        finishedAt: room.finishedAt || null,
        updatedAt: room.updatedAt || null,
        squadLimit: room.squadLimit || getDefaultSquadLimit(room.auctionMode),
        currentPhase: room.gameState?.phase || null,
        currentPlayer: room.gameState?.playerQueue?.[room.gameState?.currentIdx]?.name || null,
        participants: getRoomParticipantSummary(room),
    };
}

// ─── REST endpoints ─────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.send('🏏 IPL Auction Server is running!');
});

// GET /api/rooms — returns all active public rooms (from Redis index)
app.get('/api/rooms', async (req, res) => {
    try {
        res.setHeader('Cache-Control', 'no-store');
        res.json(await getPublicRoomsPayload());
    } catch (e) {
        console.error("[REST] Room Fetch Error:", e);
        res.status(500).json({ error: "Failed to fetch rooms" });
    }
});

app.get('/api/completed-rooms/:code', async (req, res) => {
    const snapshot = await getFinishedRoomSnapshot(req.params.code?.toUpperCase());
    if (!snapshot) return res.status(404).json({ error: 'Completed room not found' });
    res.setHeader('Cache-Control', 'no-store');
    res.json(snapshot);
});

app.get('/api/rivals/matches', async (req, res) => {
    try {
        res.setHeader('Cache-Control', 'no-store');
        const now = new Date();
        res.json({
            now: now.toISOString(),
            matches: IPL_2026_MATCHES.map(match => buildRivalsMatchSnapshot(match, now)),
        });
    } catch (e) {
        console.error('[REST] Rivals matches fetch error:', e);
        res.status(500).json({ error: 'Failed to fetch Rivals schedule' });
    }
});

// GET /api/rooms/:code — room details
app.get('/api/rooms/:code', async (req, res) => {
    const room = await getRoom(req.params.code?.toUpperCase());
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json({
        code: room.code,
        name: room.name,
        status: isRoomOver(room) ? 'finished' : room.status,
        mode: room.auctionMode,
        roomType: room.roomType || 'standard',
        activeTeamIds: getActiveTeamIds(room),
        rivalsMatch: room.rivalsMatch || null,
        playerCount: Object.values(room.players).filter(p => !p.isSpectator).length,
    });
});

app.get('/api/admin/rooms', async (req, res) => {
    if (!requireAdmin(req, res)) return;

    try {
        res.setHeader('Cache-Control', 'no-store');

        const activeCodes = new Set([
            ...Array.from(rooms.keys()),
            ...await redis.smembers('public_rooms'),
        ]);

        const activeRooms = [];
        for (const code of activeCodes) {
            const room = await getRoom(code);
            if (!room) continue;
            activeRooms.push(summarizeRoom(room, { source: 'active' }));
        }

        const finishedSnapshots = await getFinishedRooms();
        const finishedRooms = finishedSnapshots.map((snapshot) => ({
            code: snapshot.code,
            name: snapshot.name,
            source: 'finished',
            status: 'finished',
            mode: snapshot.mode || 'mega',
            isPrivate: !!snapshot.isPrivate,
            roomType: snapshot.roomType || 'standard',
            activeTeamIds: snapshot.activeTeamIds || TEAM_IDS,
            rivalsMatch: snapshot.rivalsMatch || null,
            host: snapshot.host || 'Unknown',
            playerCount: snapshot.players || 0,
            spectatorCount: snapshot.spectators || 0,
            visiblePlayerCount: (snapshot.players || 0) + (snapshot.spectators || 0),
            started: true,
            finishedAt: snapshot.finishedAt || null,
            updatedAt: snapshot.finishedAt || null,
            squadLimit: snapshot.squadLimit || getDefaultSquadLimit(snapshot.mode),
            currentPhase: snapshot.gameState?.phase || 'finished',
            currentPlayer: null,
            participants: snapshot.participants || [],
        }));

        activeRooms.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

        res.json({
            active: activeRooms,
            finished: finishedRooms,
        });
    } catch (e) {
        console.error('[ADMIN] Room list error:', e);
        res.status(500).json({ error: 'Failed to fetch admin rooms' });
    }
});

app.delete('/api/admin/rooms/:code', async (req, res) => {
    if (!requireAdmin(req, res)) return;

    const code = req.params.code?.toUpperCase();
    if (!code) {
        return res.status(400).json({ error: 'Missing room code' });
    }

    try {
        const room = await getRoom(code);
        let removedActive = false;
        let removedFinished = false;

        if (room) {
            if (room.timerInterval) {
                clearInterval(room.timerInterval);
                room.timerInterval = null;
            }
            clearScheduledPersist(code);
            rooms.delete(code);
            await redis.del(`room:${code}`);
            await removeFromPublicIndex(code);
            removedActive = true;
        }

        const finishedSnapshot = await getFinishedRoomSnapshot(code);
        if (finishedSnapshot) {
            await deleteFinishedRoomSnapshot(code);
            removedFinished = true;
        }

        if (!removedActive && !removedFinished) {
            return res.status(404).json({ error: 'Room not found' });
        }

        res.json({
            ok: true,
            code,
            removedActive,
            removedFinished,
        });
    } catch (e) {
        console.error('[ADMIN] Room delete error:', e);
        res.status(500).json({ error: 'Failed to delete room' });
    }
});

// ─── Persistence ────────────────────────────────────────────────────────────

// Helper to keep track of public rooms in a central index
async function addToPublicIndex(code) {
    publicRoomsCache = null;
    try { await redis.sadd('public_rooms', code); } catch(e) {}
}
async function removeFromPublicIndex(code) {
    publicRoomsCache = null;
    try { await redis.srem('public_rooms', code); } catch(e) {}
}
async function addToFinishedIndex(code) {
    publicRoomsCache = null;
    try { await redis.sadd(FINISHED_ROOM_SET_KEY, code); } catch(e) {}
}
async function removeFromFinishedIndex(code) {
    publicRoomsCache = null;
    try { await redis.srem(FINISHED_ROOM_SET_KEY, code); } catch(e) {}
}

async function removeRoom(code) {
    if (!code) return;
    clearScheduledPersist(code);
    rooms.delete(code.toUpperCase());
    await redis.del(`room:${code.toUpperCase()}`);
    await removeFromPublicIndex(code.toUpperCase());
    console.log(`[ROOM] ${code} fully removed from memory and Redis`);
}

function clearScheduledPersist(code) {
    if (!code) return;
    const ucCode = code.toUpperCase();
    const pending = pendingPersistTimers.get(ucCode);
    if (pending) {
        clearTimeout(pending);
        pendingPersistTimers.delete(ucCode);
    }
}

function schedulePersistRoom(room, delayMs = 200) {
    if (!room?.code) return;
    const code = room.code.toUpperCase();
    clearScheduledPersist(code);
    const timerId = setTimeout(async () => {
        pendingPersistTimers.delete(code);
        await persistRoom(room);
    }, delayMs);
    pendingPersistTimers.set(code, timerId);
}

async function getFinishedRoomSnapshot(code) {
    if (!code) return null;
    try {
        const data = await redis.get(`finished_room:${code.toUpperCase()}`);
        if (!data) return null;
        return typeof data === 'string' ? JSON.parse(data) : data;
    } catch (e) {
        console.error("[REDIS] Finished room load error:", e);
        return null;
    }
}

async function getFinishedRooms() {
    try {
        const codes = await redis.smembers(FINISHED_ROOM_SET_KEY);
        const loaded = await Promise.all(codes.map(async (code) => {
            const snapshot = await getFinishedRoomSnapshot(code);
            if (!snapshot) {
                await removeFromFinishedIndex(code);
                return null;
            }
            return snapshot;
        }));
        const snapshots = loaded.filter(Boolean);

        snapshots.sort((a, b) => (b.finishedAt || 0) - (a.finishedAt || 0));
        return snapshots;
    } catch (e) {
        console.error("[REDIS] Finished rooms fetch error:", e);
        return [];
    }
}

async function deleteFinishedRoomSnapshot(code) {
    if (!code) return;
    const ucCode = code.toUpperCase();
    try {
        await redis.del(`finished_room:${ucCode}`);
        await removeFromFinishedIndex(ucCode);
    } catch (e) {
        console.error('[REDIS] Finished room delete error:', e);
    }
}

function mapPublicRoom(room) {
    return {
        code: room.code,
        name: room.name,
        host: room.players[room.hostId]?.name || 'Unknown',
        players: Object.values(room.players).filter(p => !p.isSpectator && !p.offline).length,
        spectators: Object.values(room.players).filter(p => p.isSpectator && !p.offline).length,
        status: room.status,
        mode: room.auctionMode,
        roomType: room.roomType || 'standard',
        activeTeamIds: getActiveTeamIds(room),
        rivalsMatch: room.rivalsMatch || null,
        currentPlayer: room.gameState?.playerQueue?.[room.gameState?.currentIdx]?.name || null
    };
}

function mapFinishedRoom(room) {
    return {
        code: room.code,
        name: room.name,
        host: room.host,
        players: room.players,
        spectators: room.spectators,
        status: 'finished',
        mode: room.mode,
        roomType: room.roomType || 'standard',
        activeTeamIds: room.activeTeamIds || TEAM_IDS,
        rivalsMatch: room.rivalsMatch || null,
        participants: room.participants || [],
        finishedAt: room.finishedAt,
        totalSold: room.totalSold,
        topBuy: room.topBuy || null
    };
}

async function getPublicRoomsPayload() {
    const now = Date.now();
    if (publicRoomsCache && now - publicRoomsCache.createdAt < PUBLIC_ROOMS_CACHE_MS) {
        return publicRoomsCache.payload;
    }

    const publicCodes = await redis.smembers('public_rooms');
    const loadedRooms = await Promise.all(publicCodes.map((code) => getRoom(code)));
    const activeRooms = loadedRooms
        .filter(r => r && !r.isPrivate && !isRoomOver(r))
        .map(mapPublicRoom);

    const totalPlayers = activeRooms.reduce((sum, r) => sum + r.players, 0);
    const completedRooms = (await getFinishedRooms())
        .filter(room => !room.isPrivate)
        .map(mapFinishedRoom);

    const payload = {
        active: activeRooms,
        completed: completedRooms,
        totalRooms: activeRooms.length,
        totalPlayers,
    };
    publicRoomsCache = { createdAt: now, payload };
    return payload;
}

async function persistRoom(room) {
    if (!room) return;
    try {
        const roomKey = `room:${room.code}`;
        const localRevision = room.revision || 0;
        const existing = await redis.get(roomKey);
        if (existing) {
            const existingData = typeof existing === 'string' ? JSON.parse(existing) : existing;
            const existingRevision = existingData?.revision || 0;
            if (existingRevision > localRevision) {
                console.warn(`[REDIS] Skip stale persist for room ${room.code}: local revision ${localRevision}, remote revision ${existingRevision}`);
                return;
            }
        }

        const data = {
            code: room.code,
            name: room.name,
            hostId: room.hostId,
            status: room.status, 
            isPrivate: room.isPrivate || false,
            auctionMode: room.auctionMode || 'mega',
            squadLimit: room.squadLimit || getDefaultSquadLimit(room.auctionMode),
            roomType: room.roomType || 'standard',
            activeTeamIds: getActiveTeamIds(room),
            rivalsMatch: room.rivalsMatch || null,
            chatLog: room.chatLog || [],
            players: room.players,
            gameState: room.gameState,
            started: room.started || false,
            finishedAt: room.finishedAt || null,
            endReason: room.endReason || null,
            revision: localRevision,
            updatedAt: room.updatedAt || Date.now()
        };
        // Save room with 24-hour expiry
        await redis.set(roomKey, JSON.stringify(data), { ex: 3600 * 24 });
        
        // Keep rooms discoverable only while someone is online.
        if (!data.isPrivate && !isRoomOver(data) && getVisiblePlayers(data).length > 0) {
            await addToPublicIndex(room.code);
        } else {
            await removeFromPublicIndex(room.code);
        }
    } catch(e) { console.error("[REDIS] Save Error:", e); }
}

async function getRoom(code) {
    if (!code) return null;
    const ucCode = code.toUpperCase();
    let room = rooms.get(ucCode);
    if (!room) {
        try {
            const data = await redis.get(`room:${ucCode}`);
            if (data) {
                const rData = typeof data === 'string' ? JSON.parse(data) : data;
                room = {
                    ...rData,
                    timerInterval: null 
                };
                room.revision = room.revision || 0;
                room.updatedAt = room.updatedAt || Date.now();
                room.roomType = room.roomType || 'standard';
                room.squadLimit = room.squadLimit || getDefaultSquadLimit(room.auctionMode);
                room.activeTeamIds = Array.isArray(room.activeTeamIds) && room.activeTeamIds.length ? room.activeTeamIds : TEAM_IDS;
                room.rivalsMatch = room.rivalsMatch || null;
                if (isRoomOver(room)) {
                    room.status = 'finished';
                    if (room.gameState) room.gameState.phase = 'finished';
                }
                rooms.set(ucCode, room);
                console.log(`[REDIS] Restored Room: ${ucCode}`);
                if (room.status === 'active' && room.gameState && !room.timerInterval && !isRoomOver(room)) {
                   startGameTick(room); 
                }
            }
        } catch(e) { console.error("[REDIS] Load Error:", e); }
    }
    return room;
}

// ─── Game State helpers ──────────────────────────────────────────────────────
function createGameState(playerQueue, options = {}) {
    const purse = options.purse || 120;
    const timerDuration = options.timerDuration || 10;
    const squadLimit = options.squadLimit || 15;
    return {
        playerQueue,
        currentIdx: 0,
        currentBid: playerQueue[0]?.base || 2,
        currentBidder: null,
        timer: timerDuration,
        timerDuration,
        phase: "bidding",
        currentSetName: playerQueue[0]?.setName || "",
        squadLimit,
        purses: Object.fromEntries(TEAMS.map(t => [t.id, purse])),
        squads: Object.fromEntries(TEAMS.map(t => [t.id, []])),
        playingXI: Object.fromEntries(TEAMS.map(t => [t.id, []])),
        selections: Object.fromEntries(TEAMS.map(t => [t.id, false])),
        bidLog: [],
        auctionLog: [],
        isPaused: false,
    };
}

function getClientState(room, options = {}) {
    const gs = room.gameState;
    if (!gs) return null;
    const includePlayerQueue = options.includePlayerQueue !== false;
    const includeSelectionState = options.includeSelectionState !== false;

    const payload = {
        currentIdx: gs.currentIdx,
        currentBid: gs.currentBid,
        currentBidder: gs.currentBidder,
        timer: gs.timer,
        timerDuration: gs.timerDuration || 10,
        isPaused: gs.isPaused || false,
        phase: gs.phase,
        currentSetName: gs.currentSetName,
        squadLimit: gs.squadLimit || room.squadLimit || getDefaultSquadLimit(room.auctionMode),
        purses: gs.purses,
        squads: gs.squads,
        bidLog: gs.bidLog,
        auctionLog: gs.auctionLog.slice(0, 20),
        auctionMode: room.auctionMode || 'mega',
        totalPlayers: gs.playerQueue?.length || 0,
        roomCode: room.code,
        roomType: room.roomType || 'standard',
        activeTeamIds: getActiveTeamIds(room),
        rivalsMatch: room.rivalsMatch || null,
        roomName: room.name,
    };

    if (includePlayerQueue) {
        payload.playerQueue = gs.playerQueue;
    }
    if (includeSelectionState) {
        payload.playingXI = gs.playingXI;
        payload.selections = gs.selections;
    }

    return payload;
}

function getLobbyState(room) {
    return getLobbyStatePayload(room);
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

    markRoomDirty(room);
    io.to(room.code).emit('game-state', getClientState(room));
    schedulePersistRoom(room, 50);
    setTimeout(() => advanceToNext(room), 2500);
}

function advanceToNext(room) {
    const gs = room.gameState;
    if (!gs) return;

    const nextIdx = gs.currentIdx + 1;
    if (nextIdx >= gs.playerQueue.length) {
        startSelectionPhase(room, { reason: 'completed' });
        io.to(room.code).emit('game-state', getClientState(room));
        schedulePersistRoom(room, 50);
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

    markRoomDirty(room);
    io.to(room.code).emit('game-state', getClientState(room));
    schedulePersistRoom(room, 50);
}

function autoPickPlayingXI(squad = [], limit = 11) {
    return [...(squad || [])]
        .sort((a, b) => (b.soldFor || 0) - (a.soldFor || 0))
        .slice(0, limit);
}

function startSelectionPhase(room, { reason = 'completed' } = {}) {
    const gs = room?.gameState;
    if (!gs || gs.phase === 'selection' || gs.phase === 'finished') return false;

    if (!gs.playingXI) gs.playingXI = Object.fromEntries(TEAMS.map(t => [t.id, []]));
    if (!gs.selections) gs.selections = Object.fromEntries(TEAMS.map(t => [t.id, false]));

    const humanTeamIds = new Set(
        Object.values(room.players || {})
            .filter(player => !player.isSpectator && player.teamId)
            .map(player => player.teamId)
    );

    TEAMS.forEach((team) => {
        if (!Array.isArray(gs.playingXI[team.id])) gs.playingXI[team.id] = [];
        if (!humanTeamIds.has(team.id)) {
            gs.playingXI[team.id] = autoPickPlayingXI(gs.squads?.[team.id] || []);
            gs.selections[team.id] = true;
        }
    });

    gs.phase = 'selection';
    gs.currentBidder = null;
    gs.bidLog = [];
    gs.timer = 0;
    room.status = 'active';
    room.endReason = room.endReason || reason;
    pushSystemMessage(room, 'Auction complete. Final Playing XI selection is now open.');
    markRoomDirty(room);
    return true;
}

function finalizeSelection(room, { reason = 'completed' } = {}) {
    const gs = room?.gameState;
    if (!gs) return false;

    TEAMS.forEach((team) => {
        if (!Array.isArray(gs.playingXI?.[team.id]) || gs.playingXI[team.id].length === 0) {
            gs.playingXI[team.id] = autoPickPlayingXI(gs.squads?.[team.id] || []);
        }
        gs.selections[team.id] = true;
    });

    return finalizeRoom(room, { reason });
}

function saveFinishedGame(room, gs) {
    const existingIdx = finishedGames.findIndex(game => game.id === room.code);
    if (existingIdx !== -1) finishedGames.splice(existingIdx, 1);
    finishedGames.unshift({
        id: room.code,
        name: room.name,
        mode: room.auctionMode,
        roomType: room.roomType || 'standard',
        activeTeamIds: getActiveTeamIds(room),
        rivalsMatch: room.rivalsMatch || null,
        squadLimit: room.squadLimit || gs.squadLimit || getDefaultSquadLimit(room.auctionMode),
        participants: getRoomParticipantSummary(room),
        date: new Date().toISOString(),
        finishedAt: room.finishedAt || Date.now(),
        host: room.players[room.hostId]?.name || "Unknown",
        players: Object.values(room.players || {}).filter(p => !p.isSpectator).length,
        spectators: Object.values(room.players || {}).filter(p => p.isSpectator).length,
        totalSold: gs.auctionLog.filter(l => l.sold).length,
        topBuy: gs.auctionLog.filter(l => l.sold).sort((a, b) => b.price - a.price)[0] || null
    });
    if (finishedGames.length > 20) finishedGames.pop();

    const roomCode = room.code?.toUpperCase();
    if (!roomCode) return;

    const snapshot = {
        code: roomCode,
        name: room.name,
        host: room.players[room.hostId]?.name || "Unknown",
        mode: room.auctionMode || 'mega',
        isPrivate: !!room.isPrivate,
        roomType: room.roomType || 'standard',
        activeTeamIds: getActiveTeamIds(room),
        rivalsMatch: room.rivalsMatch || null,
        squadLimit: room.squadLimit || gs.squadLimit || getDefaultSquadLimit(room.auctionMode),
        participants: getRoomParticipantSummary(room),
        status: 'finished',
        finishedAt: room.finishedAt || Date.now(),
        endReason: room.endReason || 'completed',
        players: Object.values(room.players || {}).filter(p => !p.isSpectator).length,
        spectators: Object.values(room.players || {}).filter(p => p.isSpectator).length,
        totalSold: gs.auctionLog.filter(l => l.sold).length,
        topBuy: gs.auctionLog.filter(l => l.sold).sort((a, b) => b.price - a.price)[0] || null,
        gameState: gs
    };

    redis.set(`finished_room:${roomCode}`, JSON.stringify(snapshot), { ex: FINISHED_ROOM_TTL_SECONDS })
        .then(() => addToFinishedIndex(roomCode))
        .catch(e => console.error("[REDIS] Finished room save error:", e));
}

function finalizeRoom(room, { reason = 'completed' } = {}) {
    const gs = room.gameState;
    if (!gs) return false;

    if (!gs.playingXI) {
        gs.playingXI = Object.fromEntries(TEAMS.map(t => [t.id, []]));
    }
    if (!gs.selections) {
        gs.selections = Object.fromEntries(TEAMS.map(t => [t.id, false]));
    }

    TEAMS.forEach(t => {
        if (!Array.isArray(gs.playingXI[t.id])) gs.playingXI[t.id] = [];
        gs.selections[t.id] = true;
    });

    gs.phase = "finished";
    room.status = "finished";
    room.finishedAt = room.finishedAt || Date.now();
    room.endReason = room.endReason || reason;

    saveFinishedGame(room, gs);

    if (room.timerInterval) {
        clearInterval(room.timerInterval);
        room.timerInterval = null;
    }

    markRoomDirty(room);
    return true;
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
    markRoomDirty(room);
}

function getBroadcastChatLog(room) {
    return (room.chatLog || [])
        .filter(message => message?.type === 'text' || message?.type === 'gif')
        .slice(-80);
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
    publicRoomsCache = null;
    io.emit('public-rooms-updated');
}

// ─── Socket.IO ───────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
    console.log(`[+] ${socket.id} connected`);
    let currentRoom = null;
    let currentPlayerId = null;

    // ── Create Room ──
    socket.on('create-room', async ({ playerName, isPrivate, roomName, playerId, roomType, matchKey }, cb) => {
        if (!playerId) return cb?.({ ok: false, error: 'Missing Player ID' });

        // Cancel any pending disconnect timer for this player
        if (disconnectTimers.has(playerId)) {
            clearTimeout(disconnectTimers.get(playerId));
            disconnectTimers.delete(playerId);
        }

        const code = genCode();
        const isRivalsRoom = roomType === 'rivals';
        let match = null;

        if (isRivalsRoom) {
            match = getCurrentMatchStatus(matchKey, new Date());
            if (!match) return cb?.({ ok: false, error: 'Match not found' });
            if (!match.status.isJoinable) {
                const state = match.status.state;
                const error = state === 'scheduled'
                    ? 'This auction opens automatically on match day.'
                    : state === 'locked'
                        ? 'This auction is locked because the IPL match has already started.'
                        : 'This auction has already closed.';
                return cb?.({ ok: false, error });
            }
        }

        const teamOrder = isRivalsRoom ? shuffle([match.homeTeam, match.awayTeam]) : TEAM_IDS;
        const room = {
            code,
            name: roomName || (isRivalsRoom ? `${match.homeTeam} vs ${match.awayTeam} Rivals` : `${playerName}'s Room`),
            isPrivate: !!isPrivate,
            status: 'lobby',
            roomType: isRivalsRoom ? 'rivals' : 'standard',
            activeTeamIds: teamOrder,
            rivalsMatch: match,
            hostId: playerId,
            players: {
                [playerId]: {
                    id: playerId,
                    socketId: socket.id,
                    name: playerName || (isRivalsRoom ? 'Rival 1' : 'Player 1'),
                    teamId: isRivalsRoom ? teamOrder[0] : null,
                    isHost: true,
                    isSpectator: false,
                    offline: false
                }
            },
            auctionMode: isRivalsRoom ? 'rivals' : null,
            squadLimit: isRivalsRoom ? RIVALS_MAX_SQUAD_SIZE : getDefaultSquadLimit('mega'),
            gameState: null,
            timerInterval: null,
            started: false,
            chatLog: [],
            revision: 1,
            updatedAt: Date.now(),
        };
        rooms.set(code, room);
        socket.join(code);
        currentRoom = code;
        currentPlayerId = playerId;
        console.log(`[ROOM] ${code} (${room.isPrivate ? 'PVT' : 'PUB'}) created by ${playerName}`);

        const state = getLobbyState(room);
        cb?.({
            ok: true,
            code,
            players: state.players,
            squadLimit: room.squadLimit,
            roomType: room.roomType,
            activeTeamIds: room.activeTeamIds,
            rivalsMatch: room.rivalsMatch,
        });

        await persistRoom(room);
        if (!room.isPrivate) broadcastRoomList();
    });

    // ── Rivals Matchmaking ──
    socket.on('join-rivals-match', async ({ matchKey, playerName, playerId }, cb) => {
        if (!playerId) return cb?.({ ok: false, error: 'Missing Player ID' });

        const match = getCurrentMatchStatus(matchKey, new Date());
        if (!match) return cb?.({ ok: false, error: 'Match not found' });
        if (!match.status.isJoinable) {
            const state = match.status.state;
            const error = state === 'scheduled'
                ? 'This auction opens automatically on match day.'
                : state === 'locked'
                    ? 'This auction is locked because the IPL match has already started.'
                    : 'This auction has already closed.';
            return cb?.({ ok: false, error });
        }

        if (disconnectTimers.has(playerId)) {
            clearTimeout(disconnectTimers.get(playerId));
            disconnectTimers.delete(playerId);
        }

        let room = await findOpenRivalsRoom(match.key);
        let createdRoom = false;

        if (!room) {
            const code = genCode();
            const teamOrder = shuffle([match.homeTeam, match.awayTeam]);
            room = {
                code,
                name: `${match.homeTeam} vs ${match.awayTeam} Rivals`,
                isPrivate: false,
                status: 'lobby',
                roomType: 'rivals',
                activeTeamIds: teamOrder,
                rivalsMatch: match,
                hostId: playerId,
                players: {
                    [playerId]: {
                        id: playerId,
                        socketId: socket.id,
                        name: playerName || 'Rival 1',
                        teamId: teamOrder[0],
                        isHost: true,
                        isSpectator: false,
                        offline: false,
                    }
                },
                auctionMode: 'rivals',
                squadLimit: RIVALS_MAX_SQUAD_SIZE,
                gameState: null,
                timerInterval: null,
                started: false,
                chatLog: [],
                revision: 1,
                updatedAt: Date.now(),
            };
            rooms.set(code, room);
            createdRoom = true;
        }

        const roomCode = room.code;

        if (room.players[playerId]) {
            room.players[playerId].socketId = socket.id;
            room.players[playerId].offline = false;
            room.players[playerId].name = playerName || room.players[playerId].name;
            markRoomDirty(room);
            socket.join(roomCode);
            currentRoom = roomCode;
            currentPlayerId = playerId;
            const state = getLobbyState(room);
            io.to(roomCode).emit('lobby-update', state);
            await persistRoom(room);
            if (!room.isPrivate) broadcastRoomList();
            return cb?.({
                ok: true,
                code: roomCode,
                players: state.players,
                roomStatus: room.status,
                hostId: room.hostId,
                auctionMode: room.auctionMode,
                squadLimit: room.squadLimit,
                roomType: room.roomType,
                activeTeamIds: getActiveTeamIds(room),
                rivalsMatch: room.rivalsMatch,
                assignedTeamId: room.players[playerId].teamId || null,
                isSpectator: !!room.players[playerId].isSpectator,
                gameState: room.status === 'active' ? getClientState(room) : null,
                createdRoom,
            });
        }

        const activePlayers = getActivePlayers(room);
        if (activePlayers.length >= getRoomPlayerLimit(room)) {
            return cb?.({ ok: false, error: 'This Rivals auction already has two players.' });
        }

        const assignedTeamId = getActiveTeamIds(room).find(teamId => !activePlayers.some(player => player.teamId === teamId)) || getActiveTeamIds(room)[0];
        room.players[playerId] = {
            id: playerId,
            socketId: socket.id,
            name: playerName || `Rival ${activePlayers.length + 1}`,
            teamId: assignedTeamId,
            isHost: false,
            isSpectator: false,
            offline: false,
        };
        markRoomDirty(room);

        socket.join(roomCode);
        currentRoom = roomCode;
        currentPlayerId = playerId;

        const state = getLobbyState(room);
        io.to(roomCode).emit('lobby-update', state);
        pushSystemMessage(room, `${playerName || 'Rival'} joined the duel`);

        const joinedPlayers = getActivePlayers(room);
        if (joinedPlayers.length >= getRoomPlayerLimit(room)) {
            room.rivalsMatch = getCurrentMatchStatus(room.rivalsMatch?.key || match.key, new Date()) || room.rivalsMatch;
            startRivalsAuction(room);
            io.to(roomCode).emit('game-started', getClientState(room));
            startGameTick(room);
        }

        await persistRoom(room);
        broadcastRoomList();

        cb?.({
            ok: true,
            code: roomCode,
            players: state.players,
            roomStatus: room.status,
            hostId: room.hostId,
            auctionMode: room.auctionMode,
            squadLimit: room.squadLimit,
            roomType: room.roomType,
            activeTeamIds: getActiveTeamIds(room),
            rivalsMatch: room.rivalsMatch,
            assignedTeamId,
            isSpectator: false,
            gameState: room.status === 'active' ? getClientState(room) : null,
            createdRoom,
        });
    });

    // ── Join Room ──
    socket.on('join-room', async ({ code, playerName, playerId, preferredRole }, cb) => {
        if (!playerId) return cb?.({ ok: false, error: 'Missing Player ID' });

        const room = await getRoom(code);
        if (!room) return cb?.({ ok: false, error: 'Room not found' });

        // Cancel any pending disconnect timer
        if (disconnectTimers.has(playerId)) {
            clearTimeout(disconnectTimers.get(playerId));
            disconnectTimers.delete(playerId);
        }

        // ── Rejoin ──
        if (room.players[playerId]) {
            if (isRoomOver(room)) {
                finalizeRoom(room, { reason: room.endReason || 'completed' });
            }
            room.players[playerId].socketId = socket.id;
            room.players[playerId].offline = false;
            room.players[playerId].name = playerName || room.players[playerId].name;
            markRoomDirty(room);
            socket.join(code);
            currentRoom = code;
            currentPlayerId = playerId;
            console.log(`[ROOM] ${playerName} (${playerId}) REJOINED ${code}`);

            const state = getLobbyState(room);
            io.to(code).emit('lobby-update', state);
            pushSystemMessage(room, `${playerName} rejoined`);
            
            await persistRoom(room);
            return cb?.({
                ok: true,
                code,
                players: state.players,
                roomStatus: isRoomOver(room) ? 'finished' : room.status,
                hostId: room.hostId,
                auctionMode: room.auctionMode,
                squadLimit: room.squadLimit,
                roomType: room.roomType || 'standard',
                activeTeamIds: getActiveTeamIds(room),
                availableTeamIds: getAvailableTeamIds(room),
                rivalsMatch: room.rivalsMatch || null,
                isSpectator: room.players[playerId].isSpectator,
                gameState: room.status !== 'lobby' ? getClientState(room) : null
            });
        }

        if (isRoomOver(room)) {
            finalizeRoom(room, { reason: room.endReason || 'completed' });
            socket.join(code);
            currentRoom = code;
            currentPlayerId = playerId;
            await persistRoom(room);
            return cb?.({
                ok: true,
                code,
                players: Object.values(room.players).map(p => ({ ...p, socketId: undefined })),
                roomStatus: 'finished',
                hostId: room.hostId,
                auctionMode: room.auctionMode,
                squadLimit: room.squadLimit,
                roomType: room.roomType || 'standard',
                activeTeamIds: getActiveTeamIds(room),
                availableTeamIds: [],
                rivalsMatch: room.rivalsMatch || null,
                isSpectator: true,
                gameState: getClientState(room)
            });
        }

        // ── Game active: check for slots ──
        if (room.started && room.status === 'active') {
            if (room.roomType === 'rivals') {
                room.players[playerId] = {
                    id: playerId,
                    socketId: socket.id,
                    name: playerName || 'Spectator',
                    teamId: null,
                    isHost: false,
                    isSpectator: true,
                    offline: false,
                };
                markRoomDirty(room);
                socket.join(code);
                currentRoom = code;
                currentPlayerId = playerId;

                const state = getLobbyState(room);
                io.to(code).emit('lobby-update', state);
                pushSystemMessage(room, `${playerName || 'Spectator'} joined as spectator`);
                await persistRoom(room);
                return cb?.({
                    ok: true,
                    code,
                    players: state.players,
                    roomStatus: room.status,
                    hostId: room.hostId,
                    auctionMode: room.auctionMode,
                    squadLimit: room.squadLimit,
                    roomType: room.roomType || 'standard',
                    activeTeamIds: getActiveTeamIds(room),
                    availableTeamIds: [],
                    rivalsMatch: room.rivalsMatch || null,
                    isSpectator: true,
                    gameState: getClientState(room)
                });
            }

            const wantsSpectator = preferredRole === 'spectator';
            const availableTeamIds = getAvailableTeamIds(room);
            const participantCount = getParticipantPlayers(room).length;

            // If there's an available team and the user wants to play, let them join and choose a team.
            if (!wantsSpectator && availableTeamIds.length > 0 && participantCount < getRoomPlayerLimit(room)) {
                room.players[playerId] = {
                    id: playerId,
                    socketId: socket.id,
                    name: playerName || `Player ${Object.keys(room.players).length + 1}`,
                    teamId: null, // They'll have to select one in the lobby first
                    isHost: false,
                    isSpectator: false,
                    offline: false,
                };
                markRoomDirty(room);
                socket.join(code);
                currentRoom = code;
                currentPlayerId = playerId;
                
                const state = getLobbyState(room);
                io.to(code).emit('lobby-update', state);
                pushSystemMessage(room, `${playerName || 'Player'} joined (Game in progress)`);
                await persistRoom(room);
                return cb?.({
                    ok: true,
                    code,
                    players: state.players,
                    roomStatus: room.status,
                    hostId: room.hostId,
                    auctionMode: room.auctionMode,
                    squadLimit: room.squadLimit,
                    roomType: room.roomType || 'standard',
                    activeTeamIds: getActiveTeamIds(room),
                    availableTeamIds,
                    rivalsMatch: room.rivalsMatch || null,
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
                markRoomDirty(room);
                socket.join(code);
                currentRoom = code;
                currentPlayerId = playerId;
                console.log(`[SPECTATOR] ${playerName} joined ${code} as spectator (ongoing)`);

                const state = getLobbyState(room);
                io.to(code).emit('lobby-update', state);
                pushSystemMessage(room, `${playerName || 'Spectator'} joined as spectator`);
                await persistRoom(room);
                return cb?.({
                    ok: true,
                    code,
                    players: state.players,
                    roomStatus: room.status,
                    hostId: room.hostId,
                    auctionMode: room.auctionMode,
                    roomType: room.roomType || 'standard',
                    activeTeamIds: getActiveTeamIds(room),
                    availableTeamIds,
                    rivalsMatch: room.rivalsMatch || null,
                    isSpectator: true,
                    gameState: getClientState(room)
                });
            }
        }

        // ── Full room fallback ──
        const wantsSpectator = preferredRole === 'spectator';
        const participantCount = getParticipantPlayers(room).length;
        const isFull = participantCount >= getRoomPlayerLimit(room);

        if (room.roomType === 'rivals' && !isFull) {
            const assignedTeamId = getActiveTeamIds(room).find(teamId =>
                !Object.values(room.players).some(player => player.teamId === teamId && !player.offline && !player.isSpectator)
            ) || getActiveTeamIds(room)[0];

            room.players[playerId] = {
                id: playerId,
                socketId: socket.id,
                name: playerName || `Rival ${Object.keys(room.players).length + 1}`,
                teamId: assignedTeamId,
                isHost: false,
                isSpectator: false,
                offline: false
            };
            markRoomDirty(room);
            socket.join(code);
            currentRoom = code;
            currentPlayerId = playerId;

            const state = getLobbyState(room);
            io.to(code).emit('lobby-update', state);
            pushSystemMessage(room, `${playerName || 'Rival'} joined the duel`);

            if (getActivePlayers(room).length >= getRoomPlayerLimit(room)) {
                room.rivalsMatch = getCurrentMatchStatus(room.rivalsMatch?.key, new Date()) || room.rivalsMatch;
                startRivalsAuction(room);
                io.to(code).emit('game-started', getClientState(room));
                startGameTick(room);
            }

            await persistRoom(room);
            if (!room.isPrivate) broadcastRoomList();
            return cb?.({
                ok: true,
                code,
                players: state.players,
                roomStatus: room.status,
                hostId: room.hostId,
                auctionMode: room.auctionMode,
                squadLimit: room.squadLimit,
                roomType: room.roomType || 'standard',
                activeTeamIds: getActiveTeamIds(room),
                availableTeamIds: getAvailableTeamIds(room),
                rivalsMatch: room.rivalsMatch || null,
                assignedTeamId,
                isSpectator: false,
                gameState: room.status === 'active' ? getClientState(room) : null,
            });
        }

        // ── New Join ──
        room.players[playerId] = {
            id: playerId,
            socketId: socket.id,
            name: playerName || `Player ${Object.keys(room.players).length + 1}`,
            teamId: null,
            isHost: false,
            isSpectator: wantsSpectator || isFull,
            offline: false
        };
        markRoomDirty(room);
        socket.join(code);
        currentRoom = code;
        currentPlayerId = playerId;
        console.log(`[ROOM] ${playerName || 'Player'} (${playerId}) joined ${code}${wantsSpectator || isFull ? ' AS SPECTATOR' : ''}`);

        const state = getLobbyState(room);
        io.to(code).emit('lobby-update', state);
        pushSystemMessage(room, `${playerName || 'Player'} joined${wantsSpectator || isFull ? ' as spectator' : ''}`);
        cb?.({
            ok: true,
            code,
            players: state.players,
            roomStatus: room.status,
            hostId: room.hostId,
            auctionMode: room.auctionMode,
            squadLimit: room.squadLimit,
            roomType: room.roomType || 'standard',
            activeTeamIds: getActiveTeamIds(room),
            availableTeamIds: getAvailableTeamIds(room),
            rivalsMatch: room.rivalsMatch || null,
            isSpectator: wantsSpectator || isFull
        });

        await persistRoom(room);
        if (!room.isPrivate) broadcastRoomList();
    });

    // ── Select Team ──
    socket.on('select-team', async ({ teamId }, cb) => {
        if (!currentRoom || !currentPlayerId) return cb?.({ ok: false });
        const room = await getRoom(currentRoom);
        if (!room) return cb?.({ ok: false });
        if (room.roomType === 'rivals') return cb?.({ ok: false, error: 'Rivals teams are assigned automatically' });

        const player = room.players[currentPlayerId];
        if (!player || player.isSpectator) return cb?.({ ok: false, error: 'Spectators cannot select teams' });

        const taken = Object.values(room.players).some(p => p.teamId === teamId && p.id !== currentPlayerId && !p.isSpectator);
        if (taken) return cb?.({ ok: false, error: 'Team already taken' });

        player.teamId = teamId;
        markRoomDirty(room);
        const state = getLobbyState(room);
        io.to(currentRoom).emit('lobby-update', state);
        cb?.({ ok: true });
        await persistRoom(room);
    });

    socket.on('kick-player', async ({ targetPlayerId }, cb) => {
        if (!currentRoom || !currentPlayerId || !targetPlayerId) return cb?.({ ok: false, error: 'Missing player to kick' });
        const room = await getRoom(currentRoom);
        if (!room) return cb?.({ ok: false, error: 'Room not found' });
        if (currentPlayerId !== room.hostId) return cb?.({ ok: false, error: 'Only the host can kick players' });
        if (targetPlayerId === room.hostId) return cb?.({ ok: false, error: 'The host cannot kick themselves' });
        if (room.roomType === 'rivals' && room.status === 'active') {
            return cb?.({ ok: false, error: 'Active Rivals players cannot be kicked mid-match' });
        }

        const target = room.players[targetPlayerId];
        if (!target) return cb?.({ ok: false, error: 'Player not found in this room' });

        if (disconnectTimers.has(targetPlayerId)) {
            clearTimeout(disconnectTimers.get(targetPlayerId));
            disconnectTimers.delete(targetPlayerId);
        }

        const kickedName = target.name || 'Player';
        const kickedSocket = target.socketId ? io.sockets.sockets.get(target.socketId) : null;

        delete room.players[targetPlayerId];
        markRoomDirty(room);
        pushSystemMessage(room, `${kickedName} was removed by the host`);

        const visiblePlayers = getVisiblePlayers(room);
        if (visiblePlayers.length === 0 && room.status === 'lobby') {
            if (room.timerInterval) {
                clearInterval(room.timerInterval);
                room.timerInterval = null;
            }
            await removeRoom(currentRoom);
            if (!room.isPrivate) broadcastRoomList();
            cb?.({ ok: true, kickedPlayerId: targetPlayerId });
            if (kickedSocket) {
                kickedSocket.emit('room-kicked', { code: currentRoom, message: 'You were removed from the room by the host.' });
                setTimeout(() => kickedSocket.disconnect(true), 50);
            }
            return;
        }

        const state = getLobbyState(room);
        io.to(currentRoom).emit('lobby-update', state);
        if (room.gameState) {
            io.to(currentRoom).emit('game-state', getClientState(room, { includePlayerQueue: false, includeSelectionState: room.gameState.phase === 'selection' }));
        }
        await persistRoom(room);
        if (!room.isPrivate) broadcastRoomList();

        if (kickedSocket) {
            kickedSocket.emit('room-kicked', { code: currentRoom, message: 'You were removed from the room by the host.' });
            setTimeout(() => kickedSocket.disconnect(true), 50);
        }

        cb?.({ ok: true, kickedPlayerId: targetPlayerId });
    });

    // ── Set Auction Mode ──
    socket.on('set-auction-mode', async ({ mode }) => {
        if (!currentRoom || !currentPlayerId) return;
        const room = await getRoom(currentRoom);
        if (!room || currentPlayerId !== room.hostId) return;
        if (room.roomType === 'rivals') return;
        room.auctionMode = mode;
        room.squadLimit = getDefaultSquadLimit(mode);
        markRoomDirty(room);
        const state = getLobbyState(room);
        io.to(currentRoom).emit('lobby-update', state);
        await persistRoom(room);
    });

    socket.on('set-squad-limit', async ({ squadLimit }, cb) => {
        if (!currentRoom || !currentPlayerId) return cb?.({ ok: false });
        const room = await getRoom(currentRoom);
        if (!room || currentPlayerId !== room.hostId || room.roomType === 'rivals') return cb?.({ ok: false, error: 'Only the host can change the squad limit' });
        const nextLimit = [15, 20, 25].includes(Number(squadLimit)) ? Number(squadLimit) : null;
        if (!nextLimit) return cb?.({ ok: false, error: 'Invalid squad limit' });

        room.squadLimit = nextLimit;
        if (room.gameState) {
            room.gameState.squadLimit = nextLimit;
        }
        markRoomDirty(room);

        const state = getLobbyState(room);
        io.to(currentRoom).emit('lobby-update', state);
        if (room.gameState) {
            io.to(currentRoom).emit('game-state', getClientState(room, { includePlayerQueue: false, includeSelectionState: room.gameState.phase === 'selection' }));
        }
        await persistRoom(room);
        cb?.({ ok: true, squadLimit: nextLimit });
    });

    // ── Start Game ──
    socket.on('start-game', async ({ playerQueue }, cb) => {
        if (!currentRoom || !currentPlayerId) return cb?.({ ok: false });
        const room = await getRoom(currentRoom);
        if (!room || currentPlayerId !== room.hostId) return cb?.({ ok: false, error: 'Not host' });
        if (room.roomType === 'rivals') return cb?.({ ok: false, error: 'Rivals auctions start automatically when both players join' });
        if (room.status === 'active' && room.started && room.gameState && !isRoomOver(room)) {
            return cb?.({
                ok: true,
                alreadyStarted: true,
                gameState: getClientState(room),
            });
        }

        // Only check non-spectator players for team selection
        const activePlayers = Object.values(room.players).filter(p => !p.isSpectator && !p.offline);
        if (activePlayers.length < 1) {
            return cb?.({ ok: false, error: 'At least 1 active player must join before starting the auction' });
        }
        const noTeam = activePlayers.find(p => !p.teamId);
        if (noTeam) return cb?.({ ok: false, error: `${noTeam.name} hasn't selected a team` });

        room.started = true;
        room.status = 'active';
        room.squadLimit = room.squadLimit || getDefaultSquadLimit(room.auctionMode);
        room.gameState = createGameState(playerQueue, {
            timerDuration: 10,
            squadLimit: room.squadLimit,
        });
        markRoomDirty(room);

        io.to(currentRoom).emit('game-started', getClientState(room));
        startGameTick(room);
        cb?.({ ok: true });

        await persistRoom(room);
        if (!room.isPrivate) broadcastRoomList();
    });

    // ── Host Controls ──
    socket.on('pause-game', async () => {
        if (!currentRoom || !currentPlayerId) return;
        const room = await getRoom(currentRoom);
        if (!room || currentPlayerId !== room.hostId || !room.gameState) return;
        room.gameState.isPaused = true;
        markRoomDirty(room);
        io.to(currentRoom).emit('game-state', getClientState(room, { includePlayerQueue: false, includeSelectionState: false }));
        await persistRoom(room);
    });

    socket.on('resume-game', async () => {
        if (!currentRoom || !currentPlayerId) return;
        const room = await getRoom(currentRoom);
        if (!room || currentPlayerId !== room.hostId || !room.gameState) return;
        room.gameState.isPaused = false;
        markRoomDirty(room);
        io.to(currentRoom).emit('game-state', getClientState(room, { includePlayerQueue: false, includeSelectionState: false }));
        await persistRoom(room);
    });

    socket.on('end-game', async () => {
        if (!currentRoom || !currentPlayerId) return;
        const room = await getRoom(currentRoom);
        if (!room || currentPlayerId !== room.hostId || !room.gameState) return;
        pushSystemMessage(room, `Auction ended early by ${room.players[currentPlayerId]?.name || 'the host'}`);
        startSelectionPhase(room, { reason: 'host-ended-early' });
        io.to(currentRoom).emit('game-state', getClientState(room));
        await persistRoom(room);
        if (!room.isPrivate) broadcastRoomList();
    });

    socket.on('set-timer-duration', async ({ duration }) => {
        if (!currentRoom || !currentPlayerId) return;
        const room = await getRoom(currentRoom);
        if (!room || currentPlayerId !== room.hostId || !room.gameState) return;
        // Only guard valid range
        const newD = Math.max(5, Math.min(60, parseInt(duration) || 10));
        // ✅ Only update timerDuration — never reset the live timer mid-countdown.
        // Resetting gs.timer here would race with the running setInterval tick and
        // could cause timer = 0 → finishCurrent() → startSelectionPhase() mid-auction.
        // The new duration takes effect automatically on the next player.
        room.gameState.timerDuration = newD;
        markRoomDirty(room);
        // Broadcast only the configuration change (no phase/selection state needed)
        io.to(currentRoom).emit('game-state', getClientState(room, { includePlayerQueue: false, includeSelectionState: false }));
        schedulePersistRoom(room, 500);
    });

    // ── Chat ──
    socket.on('send-chat', async (payload) => {
        if (!currentRoom || !currentPlayerId) return;
        const room = await getRoom(currentRoom);
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
        markRoomDirty(room);
        io.to(currentRoom).emit('chat-update', getBroadcastChatLog(room));
        schedulePersistRoom(room, 250);
    });

    // ── Get Rooms (socket) ── pull from Redis
    socket.on('get-rooms', async (cb) => {
        try {
            cb?.(await getPublicRoomsPayload());
        } catch(e) { console.error("[SOCKET] Room Fetch Error:", e); cb?.({ active: [], completed: [] }); }
    });

    // ── Place Bid ── (optimized for minimum latency)
    socket.on('place-bid', async (_, cb) => {
        if (!currentRoom || !currentPlayerId) return cb?.({ ok: false });
        const room = await getRoom(currentRoom);
        if (!room || !room.gameState) return cb?.({ ok: false });

        const gs = room.gameState;
        if (gs.phase !== "bidding" || gs.isPaused) return cb?.({ ok: false, error: 'Not in bidding phase' });

        const player = room.players[currentPlayerId];
        if (!player || !player.teamId || player.isSpectator) return cb?.({ ok: false, error: 'Spectators cannot bid' });

        const teamId = player.teamId;
        if (gs.currentBidder === teamId) return cb?.({ ok: false, error: 'Already leading bid' });

        const nb = gs.currentBidder === null ? gs.currentBid : nextBid(gs.currentBid);
        if (gs.purses[teamId] < nb) return cb?.({ ok: false, error: 'Insufficient purse' });

        const isRivals = room.roomType === 'rivals' || room.auctionMode === 'rivals';
        const maxSquadSize = isRivals ? RIVALS_MAX_SQUAD_SIZE : (gs.squadLimit || room.squadLimit || getDefaultSquadLimit(room.auctionMode));
        const maxOverseas = isRivals ? RIVALS_MAX_OVERSEAS : getOverseasLimitForSquad(maxSquadSize);

        if (gs.squads[teamId].length >= maxSquadSize) return cb?.({ ok: false, error: 'Squad full (' + maxSquadSize + ' max)' });

        const playerOnAuction = gs.playerQueue[gs.currentIdx];
        const osCount = gs.squads[teamId].filter(p => p.overseas).length;
        if (playerOnAuction?.overseas && osCount >= maxOverseas) return cb?.({ ok: false, error: 'Max ' + maxOverseas + ' overseas players' });

        // Apply state immediately
        gs.currentBid = nb;
        gs.currentBidder = teamId;
        gs.timer = gs.timerDuration || 10;
        gs.bidLog = [{ teamId, bid: nb, playerName: player.name }, ...gs.bidLog].slice(0, 7);
        markRoomDirty(room);

        // Broadcast immediately — no setTimeout, no debounce
        io.to(currentRoom).emit('game-state', getClientState(room, { includePlayerQueue: false, includeSelectionState: false }));
        cb?.({ ok: true, newBid: nb });
        
        // Increased debounce from 200ms → 500ms to reduce Redis write storms
        // during fast bidding rounds, which caused intermittent 10-15s hangs.
        schedulePersistRoom(room, 500);
    });

    // ── Submit XI ──
    socket.on('submit-xi', async ({ players }, cb) => {
        if (!currentRoom || !currentPlayerId) return cb?.({ ok: false });
        const room = await getRoom(currentRoom);
        if (!room || !room.gameState) return cb?.({ ok: false });

        const gs = room.gameState;
        if (gs.phase !== "selection") return cb?.({ ok: false, error: "Not in selection phase" });

        const player = room.players[currentPlayerId];
        if (!player || !player.teamId || player.isSpectator) return cb?.({ ok: false });

        const teamId = player.teamId;
        const requiredSquadSize = gs.squadLimit || room.squadLimit || getDefaultSquadLimit(room.auctionMode);
        const squadSize = gs.squads?.[teamId]?.length || 0;
        if (squadSize < requiredSquadSize) {
            return cb?.({ ok: false, error: `You need to buy ${requiredSquadSize} players before submitting your XI` });
        }
        if (players.length !== 11) return cb?.({ ok: false, error: "Must select exactly 11 players" });

        gs.playingXI[teamId] = players;
        gs.selections[teamId] = true;
        markRoomDirty(room);

        // Check if all non-spectator players have submitted
        const humanTeamIds = Object.values(room.players)
            .filter(p => !p.isSpectator && p.teamId)
            .map(p => p.teamId);

        const allSubmitted = humanTeamIds.every(tid => gs.selections[tid]);

        if (allSubmitted) {
            finalizeSelection(room, { reason: room.endReason || 'completed' });
            io.to(currentRoom).emit('game-over', getClientState(room));
            if (!room.isPrivate) broadcastRoomList();
            await persistRoom(room);
        } else {
            io.to(currentRoom).emit('game-state', getClientState(room));
            await persistRoom(room);
        }

        cb?.({ ok: true });
    });

    socket.on('finalize-selection', async (cb) => {
        if (!currentRoom || !currentPlayerId) return cb?.({ ok: false });
        const room = await getRoom(currentRoom);
        if (!room || currentPlayerId !== room.hostId || !room.gameState) return cb?.({ ok: false, error: 'Only the host can finalize results' });
        if (room.gameState.phase !== 'selection') return cb?.({ ok: false, error: 'Selection phase is not active' });

        pushSystemMessage(room, `Results were finalized by ${room.players[currentPlayerId]?.name || 'the host'}`);
        finalizeSelection(room, { reason: room.endReason || 'completed' });
        io.to(currentRoom).emit('game-over', getClientState(room));
        await persistRoom(room);
        if (!room.isPrivate) broadcastRoomList();
        cb?.({ ok: true });
    });

    // ── Leave Lobby (explicit navigation away) ────────────────────────────────
    // The client fires this when the user navigates away from the lobby screen
    // (pagehide / beforeunload / route change). This lets us immediately hide
    // the room from the public list rather than waiting up to 25 s for the
    // ping-timeout to fire.
    socket.on('leave-lobby', async () => {
        if (!currentRoom || !currentPlayerId) return;
        const room = await getRoom(currentRoom);
        if (!room || !room.players[currentPlayerId]) return;

        // Only act while the room is still in lobby (not started).
        if (room.status !== 'lobby') return;

        const player = room.players[currentPlayerId];
        player.offline = true;
        markRoomDirty(room);

        const onlinePlayers = Object.values(room.players).filter(p => !p.offline);
        if (onlinePlayers.length === 0) {
            // Room is now empty — hide from public list immediately.
            // We keep it in Redis (with a short 5-min TTL) so a fast
            // network-recovery rejoin still works, but nobody new can
            // discover it.
            await persistRoom(room);          // removes from public index
            await redis.expire(`room:${room.code}`, 300); // 5-min TTL for orphaned lobby
            broadcastRoomList();
            console.log(`[ROOM] ${currentRoom} hidden from public list (owner left lobby)`);
        } else {
            // Others are still here — update the lobby view.
            const state = getLobbyState(room);
            io.to(currentRoom).emit('lobby-update', state);
            await persistRoom(room);
            if (!room.isPrivate) broadcastRoomList();
        }
    });

    // ── Disconnect ──
    socket.on('disconnect', async () => {
        console.log(`[-] ${socket.id} (Player: ${currentPlayerId || 'Unknown'}) disconnected`);
        if (!currentRoom || !currentPlayerId) return;
        const room = await getRoom(currentRoom);
        if (!room || !room.players[currentPlayerId]) return;

        const player = room.players[currentPlayerId];
        player.offline = true;
        pushSystemMessage(room, `${player.name} went offline`);

        const activePlayers = Object.values(room.players).filter(p => !p.offline);

        if (activePlayers.length === 0) {
            if (room.timerInterval) clearInterval(room.timerInterval);
            if (isRoomOver(room)) {
                await persistRoom(room);
                rooms.delete(currentRoom.toUpperCase());
                console.log(`[ROOM] ${currentRoom} unloaded from memory and kept in Redis for replay`);
                return;
            }

            // Empty lobby — immediately remove from public discovery so no
            // one stumbles into a ghost room.  Keep in Redis for 60 s so a
            // fast-reconnecting owner can still rejoin.
            await persistRoom(room);           // removes from public index
            if (room.status === 'lobby') {
                await redis.expire(`room:${room.code}`, 300); // 5-min safety TTL
            }
            rooms.delete(currentRoom.toUpperCase());
            console.log(`[ROOM] ${currentRoom} has no online players; hidden from public list`);
            if (!room.isPrivate) broadcastRoomList();
            return;
        }

        // Transfer host if needed
        if (room.hostId === currentPlayerId) {
            const newHost = activePlayers.find(p => !p.isSpectator) || activePlayers[0];
            if (newHost) {
                room.hostId = newHost.id;
                if (room.players[newHost.id]) room.players[newHost.id].isHost = true;
                if (room.players[currentPlayerId]) room.players[currentPlayerId].isHost = false;
                markRoomDirty(room);
                console.log(`[ROOM] Host transferred to ${newHost.name}`);
            }
        }

        // Notify room of the change
        const state = getLobbyState(room);
        io.to(currentRoom).emit('lobby-update', state);
        if (!room.isPrivate) broadcastRoomList();
        await persistRoom(room);

        // Schedule team-slot release after a 60s grace period (up from 30s).
        // 60s gives enough headroom for a brief network drop or page refresh
        // without falsely evicting the player.
        const gracePeriodId = setTimeout(async () => {
            disconnectTimers.delete(currentPlayerId);
            const r = await getRoom(currentRoom);
            if (!r || !r.players[currentPlayerId]) return;

            const p = r.players[currentPlayerId];
            if (!p.offline) return; // They reconnected

            if (r.status === 'lobby') {
                delete r.players[currentPlayerId];
                markRoomDirty(r);
                console.log(`[ROOM] ${currentPlayerId} removed from ${currentRoom} after 60s grace`);

                const remaining = Object.values(r.players).filter(p2 => !p2.offline);
                if (remaining.length === 0) {
                    if (r.timerInterval) clearInterval(r.timerInterval);
                    await removeRoom(currentRoom);
                } else {
                    const st = getLobbyState(r);
                    io.to(currentRoom).emit('lobby-update', st);
                    await persistRoom(r);
                }
                if (!r.isPrivate) broadcastRoomList();
            }
        }, 60_000);

        disconnectTimers.set(currentPlayerId, gracePeriodId);
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`\n  🏏 IPL Auction Server running on http://localhost:${PORT}\n`);
});
