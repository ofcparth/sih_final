import os
import json
import redis
import logging

logger = logging.getLogger("krishivision.cache")

class RedisCacheService:
    def __init__(self, host: str = None, port: int = None, db: int = 0):
        self.host = host or os.getenv("REDIS_HOST", "localhost")
        self.port = int(port or os.getenv("REDIS_PORT", 6379))
        self.db = int(db or os.getenv("REDIS_DB", 0))
        self.enabled = os.getenv("REDIS_ENABLED", "true").lower() == "true"
        self.client = None

        if self.enabled:
            try:
                self.client = redis.Redis(
                    host=self.host,
                    port=self.port,
                    db=self.db,
                    socket_connect_timeout=1,
                    decode_responses=True
                )
                self.client.ping()
                logger.info(f"✅ Connected to Redis cache server at {self.host}:{self.port}")
            except Exception as e:
                logger.warning(f"⚠️ Redis connection unfulfilled ({e}). Operating in memory-fallback mode.")
                self.client = None

    def get(self, key: str):
        if not self.client:
            return None
        try:
            data = self.client.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            logger.error(f"Redis GET error for key '{key}': {e}")
            return None

    def set(self, key: str, value: any, ttl_seconds: int = 300):
        if not self.client:
            return False
        try:
            serialized = json.dumps(value)
            return self.client.setex(key, ttl_seconds, serialized)
        except Exception as e:
            logger.error(f"Redis SET error for key '{key}': {e}")
            return False

    def delete(self, key: str):
        if not self.client:
            return False
        try:
            return self.client.delete(key) > 0
        except Exception as e:
            logger.error(f"Redis DELETE error for key '{key}': {e}")
            return False

redis_service = RedisCacheService()
