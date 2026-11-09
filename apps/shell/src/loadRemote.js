/* global __webpack_init_sharing__, __webpack_share_scopes__ */
const scripts = new Map();
const initialized = new WeakMap();
let configPromise;
export function readConfig() {
  return (configPromise ||= fetch("/remotes.json", { cache: "no-store" })
    .then((r) => {
      if (!r.ok) throw new Error("Không đọc được remotes.json");
      return r.json();
    })
    .catch((error) => {
      configPromise = undefined;
      throw error;
    }));
}
export async function loadRemote(name) {
  const config = await readConfig();
  const entry = config[name];
  if (!entry || entry.scope !== name)
    throw new Error("Remote config không hợp lệ: " + name);
  const url = new URL(entry.url, location.href);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("Remote protocol không hợp lệ");
  // Production: only trusted, operator-controlled URLs belong in this manifest.
  if (!scripts.has(url.href)) {
    scripts.set(
      url.href,
      new Promise((resolve, reject) => {
        const script = document.createElement("script");
        const timer = setTimeout(() => fail(), 10000);
        const fail = () => {
          clearTimeout(timer);
          script.remove();
          scripts.delete(url.href);
          reject(new Error("Không tải được remote " + name));
        };
        script.src = url.href;
        script.async = true;
        script.onload = () => {
          clearTimeout(timer);
          resolve();
        };
        script.onerror = fail;
        document.head.appendChild(script);
      }),
    );
  }
  await scripts.get(url.href);
  await __webpack_init_sharing__("default");
  const container = window[entry.scope];
  if (!container) throw new Error("Không tìm thấy container " + entry.scope);
  if (!initialized.has(container))
    initialized.set(
      container,
      container.init(__webpack_share_scopes__.default),
    );
  await initialized.get(container);
  const factory = await container.get("./App");
  return factory();
}
