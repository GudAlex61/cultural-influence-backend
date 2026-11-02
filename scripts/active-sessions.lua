-- KEYS contains session keys discovered by SCAN in show-sessions.ts.
-- Each row is: session key, user ID, remaining lifetime in seconds.
local sessions = {}
for _, key in ipairs(KEYS) do
    if redis.call('TYPE', key).ok == 'string' then
        local user_id = redis.call('GET', key)
        local ttl = redis.call('TTL', key)
        if user_id and ttl > 0 then
            table.insert(sessions, {key, user_id, tostring(ttl)})
        end
    end
end
return sessions
