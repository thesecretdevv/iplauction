import crypto from 'crypto';

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'auction-admin';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'RoomCtrl_2026!';
export const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'ipl-auction-admin-session-secret-2026';

function toBuffer(value) {
    return Buffer.from(String(value ?? ''), 'utf8');
}

export function safeEqual(left, right) {
    const leftBuffer = toBuffer(left);
    const rightBuffer = toBuffer(right);

    if (leftBuffer.length !== rightBuffer.length) return false;
    return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyAdminCredentials(username, password) {
    return safeEqual(username, ADMIN_USERNAME) && safeEqual(password, ADMIN_PASSWORD);
}

export function createAdminSessionToken() {
    return crypto
        .createHash('sha256')
        .update(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}:${ADMIN_SESSION_SECRET}`)
        .digest('hex');
}

export function verifyAdminSessionToken(token) {
    return safeEqual(token, createAdminSessionToken());
}
