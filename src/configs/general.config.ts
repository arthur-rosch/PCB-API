const ONE_DAY = 24 * 60 * 60;

const hashRoundString = process.env.BCRYPT_HASH_ROUND || '10';

export const TOKEN_EXPIRATION = ONE_DAY;
export const BCRYPT_HASH_ROUND = parseInt(hashRoundString, 10);
export const PORT = process.env.PORT || 3000;
export const BOT_ENABLE = parseInt(process.env.BOT_ENABLE, 10);
export const {
  SECRET_KEY,
  CLIENT_ID,
  CLIENT_SECRET,
  VALUE_SCHEDULING,
  VALUE_SCHEDULING_CNH,
  SECRET_BOT_KEY,
  USERNAME_WEBHOOK,
  PASSWORD_WEBHOOK,
  SECRET_KEY_WEBHOOK,
} = process.env;
