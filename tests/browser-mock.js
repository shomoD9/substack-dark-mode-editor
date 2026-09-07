// Local fixture only. Production never loads this file or uses page storage.
(() => {
  const listeners = new Set();
  const data = { local:JSON.parse(localStorage.getItem('test-comments-local') || '{}'), sync:JSON.parse(localStorage.getItem('test-comments-sync') || '{}') };
  function area(name) {
    return {
      get(query, callback) {
        const all = structuredClone(data[name]);
        const result = query && !Array.isArray(query) && typeof query === 'object' ? {...query,...all} : all;
        if (callback) queueMicrotask(() => callback(result));
        return Promise.resolve(result);
      },
      async set(values, callback) {
        const changes = {};
        for (const [key,value] of Object.entries(values)) {
          if (JSON.stringify(data[name][key]) !== JSON.stringify(value)) changes[key] = { oldValue:data[name][key], newValue:value };
          data[name][key] = structuredClone(value);
        }
        localStorage.setItem('test-comments-' + name,JSON.stringify(data[name]));
        if (Object.keys(changes).length) queueMicrotask(() => listeners.forEach(fn => fn(changes,name)));
        callback?.();
      },
      async remove(keys) {
        for (const key of keys) delete data[name][key];
        localStorage.setItem('test-comments-' + name,JSON.stringify(data[name]));
      }
    };
  }
  let handler;
  window.chrome = { runtime: {
    onMessage:{addListener(fn) { handler = fn; }},
    sendMessage(message) { return new Promise(resolve => handler(message,{},resolve)); }
  }, storage:{local:area('local'),sync:area('sync'),onChanged:{addListener(fn){listeners.add(fn);},removeListener(fn){listeners.delete(fn);}}}};
})();
