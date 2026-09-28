// Test yardımcısı: react-dom/client için en küçük sahte DOM (ekran akışı testleri; jsdom bağımlılığı yok).
class Node {
  constructor(type, name) { this.nodeType = type; this.nodeName = name; this.childNodes = []; this.parentNode = null; this.ownerDocument = globalThis.document; this.attrs = {}; this.style = new Proxy({}, { get: (t, k) => (k === 'setProperty' ? (a, b) => { t[a] = b } : k === 'removeProperty' ? (a) => { delete t[a] } : t[k] ?? ''), set: (t, k, v) => { t[k] = v; return true } }); this.listeners = {}; this._text = '' }
  get firstChild() { return this.childNodes[0] ?? null }
  get lastChild() { return this.childNodes.at(-1) ?? null }
  get nextSibling() { const p = this.parentNode; if (!p) return null; const i = p.childNodes.indexOf(this); return p.childNodes[i + 1] ?? null }
  appendChild(c) { if (c.parentNode) c.parentNode.removeChild(c); c.parentNode = this; this.childNodes.push(c); return c }
  insertBefore(c, ref) { if (!ref) return this.appendChild(c); if (c.parentNode) c.parentNode.removeChild(c); c.parentNode = this; this.childNodes.splice(this.childNodes.indexOf(ref), 0, c); return c }
  removeChild(c) { const i = this.childNodes.indexOf(c); if (i >= 0) this.childNodes.splice(i, 1); c.parentNode = null; return c }
  setAttribute(k, v) { this.attrs[k] = String(v) }
  setAttributeNS(ns, k, v) { this.attrs[k] = String(v) }
  getAttribute(k) { return this.attrs[k] ?? null }
  removeAttribute(k) { delete this.attrs[k] }
  hasAttribute(k) { return k in this.attrs }
  addEventListener(t, fn) { (this.listeners[t] ||= []).push(fn) }
  removeEventListener() {}
  get textContent() { return this.nodeType === 3 ? this._text : this.childNodes.map((c) => c.textContent).join('') }
  set textContent(v) { if (this.nodeType === 3) this._text = String(v); else { this.childNodes = []; if (v !== '' && v != null) this.appendChild(globalThis.document.createTextNode(String(v))) } }
  get nodeValue() { return this._text }
  set nodeValue(v) { this._text = String(v) }
  get data() { return this._text }
  set data(v) { this._text = String(v) }
  get className() { return this.attrs.class ?? '' }
  set className(v) { this.attrs.class = v }
  get tagName() { return this.nodeName }
  get namespaceURI() { return this._ns ?? 'http://www.w3.org/1999/xhtml' }
  get localName() { return this.nodeName.toLowerCase() }
  focus() {}
  blur() {}
  click() { let n = this; const ev = { type: 'click', target: this, bubbles: true, defaultPrevented: false, preventDefault() { this.defaultPrevented = true }, stopPropagation() {}, timeStamp: Date.now() }; while (n) { for (const fn of n.listeners.click ?? []) fn(ev); n = n.parentNode } }
  querySelectorAll(pred) { const out = []; const walk = (x) => { for (const c of x.childNodes) { if (c.nodeType === 1 && pred(c)) out.push(c); walk(c) } }; walk(this); return out }
}
const doc = new Node(9, '#document')
doc.createElement = (t) => new Node(1, t.toUpperCase())
doc.createElementNS = (ns, t) => { const n = new Node(1, t); n._ns = ns; return n }
doc.createTextNode = (s) => { const n = new Node(3, '#text'); n._text = String(s); return n }
doc.createComment = (s) => new Node(8, '#comment')
doc.documentElement = new Node(1, 'HTML')
doc.body = new Node(1, 'BODY')
doc.head = new Node(1, 'HEAD')
doc.activeElement = doc.body
doc.defaultView = globalThis
globalThis.document = doc
globalThis.window = globalThis
globalThis.HTMLElement = Node
globalThis.HTMLIFrameElement = class {}
globalThis.navigator ??= { userAgent: 'node' }
globalThis.addEventListener ??= () => {}
globalThis.removeEventListener ??= () => {}
export { Node }
