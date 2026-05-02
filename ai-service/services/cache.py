import hashlib

# In-memory store
cache_store = {}

# Counters
HIT_KEY = 0
MISS_KEY = 0


def generate_key(text):
    return hashlib.sha256(text.encode()).hexdigest()


def get_cached(text):
    global HIT_KEY, MISS_KEY

    key = generate_key(text)

    if key in cache_store:
        HIT_KEY += 1
        print(f"✅ CACHE HIT: {key}")
        return cache_store[key]

    MISS_KEY += 1
    print(f"❌ CACHE MISS: {key}")
    return None


def set_cache(text, value):
    key = generate_key(text)
    cache_store[key] = value
    print(f"💾 STORED IN CACHE: {key}")


def get_stats():
    return {
        "hits": HIT_KEY,
        "misses": MISS_KEY
    }