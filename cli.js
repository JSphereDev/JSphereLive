// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

var LogLevels;
(function(LogLevels1) {
    LogLevels1[LogLevels1["NOTSET"] = 0] = "NOTSET";
    LogLevels1[LogLevels1["DEBUG"] = 10] = "DEBUG";
    LogLevels1[LogLevels1["INFO"] = 20] = "INFO";
    LogLevels1[LogLevels1["WARNING"] = 30] = "WARNING";
    LogLevels1[LogLevels1["ERROR"] = 40] = "ERROR";
    LogLevels1[LogLevels1["CRITICAL"] = 50] = "CRITICAL";
})(LogLevels || (LogLevels = {}));
Object.keys(LogLevels).filter((key)=>isNaN(Number(key)));
const byLevel = {
    [String(LogLevels.NOTSET)]: "NOTSET",
    [String(LogLevels.DEBUG)]: "DEBUG",
    [String(LogLevels.INFO)]: "INFO",
    [String(LogLevels.WARNING)]: "WARNING",
    [String(LogLevels.ERROR)]: "ERROR",
    [String(LogLevels.CRITICAL)]: "CRITICAL"
};
function getLevelByName(name) {
    switch(name){
        case "NOTSET":
            return LogLevels.NOTSET;
        case "DEBUG":
            return LogLevels.DEBUG;
        case "INFO":
            return LogLevels.INFO;
        case "WARNING":
            return LogLevels.WARNING;
        case "ERROR":
            return LogLevels.ERROR;
        case "CRITICAL":
            return LogLevels.CRITICAL;
        default:
            throw new Error(`no log level found for "${name}"`);
    }
}
function getLevelName(level) {
    const levelName = byLevel[level];
    if (levelName) {
        return levelName;
    }
    throw new Error(`no level name found for level: ${level}`);
}
class LogRecord {
    msg;
    #args;
    #datetime;
    level;
    levelName;
    loggerName;
    constructor(options){
        this.msg = options.msg;
        this.#args = [
            ...options.args
        ];
        this.level = options.level;
        this.loggerName = options.loggerName;
        this.#datetime = new Date();
        this.levelName = getLevelName(options.level);
    }
    get args() {
        return [
            ...this.#args
        ];
    }
    get datetime() {
        return new Date(this.#datetime.getTime());
    }
}
class Logger {
    #level;
    #handlers;
    #loggerName;
    constructor(loggerName, levelName, options = {}){
        this.#loggerName = loggerName;
        this.#level = getLevelByName(levelName);
        this.#handlers = options.handlers || [];
    }
    get level() {
        return this.#level;
    }
    set level(level) {
        this.#level = level;
    }
    get levelName() {
        return getLevelName(this.#level);
    }
    set levelName(levelName) {
        this.#level = getLevelByName(levelName);
    }
    get loggerName() {
        return this.#loggerName;
    }
    set handlers(hndls) {
        this.#handlers = hndls;
    }
    get handlers() {
        return this.#handlers;
    }
     #_log(level, msg, ...args) {
        if (this.level > level) {
            return msg instanceof Function ? undefined : msg;
        }
        let fnResult;
        let logMessage;
        if (msg instanceof Function) {
            fnResult = msg();
            logMessage = this.asString(fnResult);
        } else {
            logMessage = this.asString(msg);
        }
        const record = new LogRecord({
            msg: logMessage,
            args: args,
            level: level,
            loggerName: this.loggerName
        });
        this.#handlers.forEach((handler)=>{
            handler.handle(record);
        });
        return msg instanceof Function ? fnResult : msg;
    }
    asString(data) {
        if (typeof data === "string") {
            return data;
        } else if (data === null || typeof data === "number" || typeof data === "bigint" || typeof data === "boolean" || typeof data === "undefined" || typeof data === "symbol") {
            return String(data);
        } else if (data instanceof Error) {
            return data.stack;
        } else if (typeof data === "object") {
            return JSON.stringify(data);
        }
        return "undefined";
    }
    debug(msg1, ...args1) {
        return this.#_log(LogLevels.DEBUG, msg1, ...args1);
    }
    info(msg2, ...args2) {
        return this.#_log(LogLevels.INFO, msg2, ...args2);
    }
    warning(msg3, ...args3) {
        return this.#_log(LogLevels.WARNING, msg3, ...args3);
    }
    error(msg4, ...args4) {
        return this.#_log(LogLevels.ERROR, msg4, ...args4);
    }
    critical(msg5, ...args5) {
        return this.#_log(LogLevels.CRITICAL, msg5, ...args5);
    }
}
const { Deno: Deno1  } = globalThis;
const noColor = typeof Deno1?.noColor === "boolean" ? Deno1.noColor : true;
let enabled = !noColor;
function code(open, close) {
    return {
        open: `\x1b[${open.join(";")}m`,
        close: `\x1b[${close}m`,
        regexp: new RegExp(`\\x1b\\[${close}m`, "g")
    };
}
function run(str, code1) {
    return enabled ? `${code1.open}${str.replace(code1.regexp, code1.open)}${code1.close}` : str;
}
function bold(str) {
    return run(str, code([
        1
    ], 22));
}
function red(str) {
    return run(str, code([
        31
    ], 39));
}
function yellow(str) {
    return run(str, code([
        33
    ], 39));
}
function blue(str) {
    return run(str, code([
        34
    ], 39));
}
new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))", 
].join("|"), "g");
class DenoStdInternalError extends Error {
    constructor(message){
        super(message);
        this.name = "DenoStdInternalError";
    }
}
function assert(expr, msg6 = "") {
    if (!expr) {
        throw new DenoStdInternalError(msg6);
    }
}
function copy(src, dst, off = 0) {
    off = Math.max(0, Math.min(off, dst.byteLength));
    const dstBytesAvailable = dst.byteLength - off;
    if (src.byteLength > dstBytesAvailable) {
        src = src.subarray(0, dstBytesAvailable);
    }
    dst.set(src, off);
    return src.byteLength;
}
const MIN_BUF_SIZE = 16;
const CR = "\r".charCodeAt(0);
const LF = "\n".charCodeAt(0);
class BufferFullError extends Error {
    name;
    constructor(partial){
        super("Buffer full");
        this.partial = partial;
        this.name = "BufferFullError";
    }
    partial;
}
class PartialReadError extends Error {
    name = "PartialReadError";
    partial;
    constructor(){
        super("Encountered UnexpectedEof, data only partially read");
    }
}
class BufReader {
    #buf;
    #rd;
    #r = 0;
    #w = 0;
    #eof = false;
    static create(r, size = 4096) {
        return r instanceof BufReader ? r : new BufReader(r, size);
    }
    constructor(rd, size = 4096){
        if (size < 16) {
            size = MIN_BUF_SIZE;
        }
        this.#reset(new Uint8Array(size), rd);
    }
    size() {
        return this.#buf.byteLength;
    }
    buffered() {
        return this.#w - this.#r;
    }
    #fill = async ()=>{
        if (this.#r > 0) {
            this.#buf.copyWithin(0, this.#r, this.#w);
            this.#w -= this.#r;
            this.#r = 0;
        }
        if (this.#w >= this.#buf.byteLength) {
            throw Error("bufio: tried to fill full buffer");
        }
        for(let i = 100; i > 0; i--){
            const rr = await this.#rd.read(this.#buf.subarray(this.#w));
            if (rr === null) {
                this.#eof = true;
                return;
            }
            assert(rr >= 0, "negative read");
            this.#w += rr;
            if (rr > 0) {
                return;
            }
        }
        throw new Error(`No progress after ${100} read() calls`);
    };
    reset(r) {
        this.#reset(this.#buf, r);
    }
    #reset = (buf, rd)=>{
        this.#buf = buf;
        this.#rd = rd;
        this.#eof = false;
    };
    async read(p) {
        let rr = p.byteLength;
        if (p.byteLength === 0) return rr;
        if (this.#r === this.#w) {
            if (p.byteLength >= this.#buf.byteLength) {
                const rr = await this.#rd.read(p);
                const nread = rr ?? 0;
                assert(nread >= 0, "negative read");
                return rr;
            }
            this.#r = 0;
            this.#w = 0;
            rr = await this.#rd.read(this.#buf);
            if (rr === 0 || rr === null) return rr;
            assert(rr >= 0, "negative read");
            this.#w += rr;
        }
        const copied = copy(this.#buf.subarray(this.#r, this.#w), p, 0);
        this.#r += copied;
        return copied;
    }
    async readFull(p) {
        let bytesRead = 0;
        while(bytesRead < p.length){
            try {
                const rr = await this.read(p.subarray(bytesRead));
                if (rr === null) {
                    if (bytesRead === 0) {
                        return null;
                    } else {
                        throw new PartialReadError();
                    }
                }
                bytesRead += rr;
            } catch (err) {
                if (err instanceof PartialReadError) {
                    err.partial = p.subarray(0, bytesRead);
                } else if (err instanceof Error) {
                    const e = new PartialReadError();
                    e.partial = p.subarray(0, bytesRead);
                    e.stack = err.stack;
                    e.message = err.message;
                    e.cause = err.cause;
                    throw err;
                }
                throw err;
            }
        }
        return p;
    }
    async readByte() {
        while(this.#r === this.#w){
            if (this.#eof) return null;
            await this.#fill();
        }
        const c = this.#buf[this.#r];
        this.#r++;
        return c;
    }
    async readString(delim) {
        if (delim.length !== 1) {
            throw new Error("Delimiter should be a single character");
        }
        const buffer = await this.readSlice(delim.charCodeAt(0));
        if (buffer === null) return null;
        return new TextDecoder().decode(buffer);
    }
    async readLine() {
        let line = null;
        try {
            line = await this.readSlice(LF);
        } catch (err) {
            if (err instanceof Deno.errors.BadResource) {
                throw err;
            }
            let partial;
            if (err instanceof PartialReadError) {
                partial = err.partial;
                assert(partial instanceof Uint8Array, "bufio: caught error from `readSlice()` without `partial` property");
            }
            if (!(err instanceof BufferFullError)) {
                throw err;
            }
            partial = err.partial;
            if (!this.#eof && partial && partial.byteLength > 0 && partial[partial.byteLength - 1] === CR) {
                assert(this.#r > 0, "bufio: tried to rewind past start of buffer");
                this.#r--;
                partial = partial.subarray(0, partial.byteLength - 1);
            }
            if (partial) {
                return {
                    line: partial,
                    more: !this.#eof
                };
            }
        }
        if (line === null) {
            return null;
        }
        if (line.byteLength === 0) {
            return {
                line,
                more: false
            };
        }
        if (line[line.byteLength - 1] == LF) {
            let drop = 1;
            if (line.byteLength > 1 && line[line.byteLength - 2] === CR) {
                drop = 2;
            }
            line = line.subarray(0, line.byteLength - drop);
        }
        return {
            line,
            more: false
        };
    }
    async readSlice(delim) {
        let s = 0;
        let slice;
        while(true){
            let i = this.#buf.subarray(this.#r + s, this.#w).indexOf(delim);
            if (i >= 0) {
                i += s;
                slice = this.#buf.subarray(this.#r, this.#r + i + 1);
                this.#r += i + 1;
                break;
            }
            if (this.#eof) {
                if (this.#r === this.#w) {
                    return null;
                }
                slice = this.#buf.subarray(this.#r, this.#w);
                this.#r = this.#w;
                break;
            }
            if (this.buffered() >= this.#buf.byteLength) {
                this.#r = this.#w;
                const oldbuf = this.#buf;
                const newbuf = this.#buf.slice(0);
                this.#buf = newbuf;
                throw new BufferFullError(oldbuf);
            }
            s = this.#w - this.#r;
            try {
                await this.#fill();
            } catch (err) {
                if (err instanceof PartialReadError) {
                    err.partial = slice;
                } else if (err instanceof Error) {
                    const e = new PartialReadError();
                    e.partial = slice;
                    e.stack = err.stack;
                    e.message = err.message;
                    e.cause = err.cause;
                    throw err;
                }
                throw err;
            }
        }
        return slice;
    }
    async peek(n6) {
        if (n6 < 0) {
            throw Error("negative count");
        }
        let avail = this.#w - this.#r;
        while(avail < n6 && avail < this.#buf.byteLength && !this.#eof){
            try {
                await this.#fill();
            } catch (err) {
                if (err instanceof PartialReadError) {
                    err.partial = this.#buf.subarray(this.#r, this.#w);
                } else if (err instanceof Error) {
                    const e = new PartialReadError();
                    e.partial = this.#buf.subarray(this.#r, this.#w);
                    e.stack = err.stack;
                    e.message = err.message;
                    e.cause = err.cause;
                    throw err;
                }
                throw err;
            }
            avail = this.#w - this.#r;
        }
        if (avail === 0 && this.#eof) {
            return null;
        } else if (avail < n6 && this.#eof) {
            return this.#buf.subarray(this.#r, this.#r + avail);
        } else if (avail < n6) {
            throw new BufferFullError(this.#buf.subarray(this.#r, this.#w));
        }
        return this.#buf.subarray(this.#r, this.#r + n6);
    }
}
class AbstractBufBase {
    buf;
    usedBufferBytes = 0;
    err = null;
    constructor(buf){
        this.buf = buf;
    }
    size() {
        return this.buf.byteLength;
    }
    available() {
        return this.buf.byteLength - this.usedBufferBytes;
    }
    buffered() {
        return this.usedBufferBytes;
    }
}
class BufWriter extends AbstractBufBase {
    #writer;
    static create(writer, size = 4096) {
        return writer instanceof BufWriter ? writer : new BufWriter(writer, size);
    }
    constructor(writer, size = 4096){
        super(new Uint8Array(size <= 0 ? 4096 : size));
        this.#writer = writer;
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.#writer = w;
    }
    async flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            const p = this.buf.subarray(0, this.usedBufferBytes);
            let nwritten = 0;
            while(nwritten < p.length){
                nwritten += await this.#writer.write(p.subarray(nwritten));
            }
        } catch (e) {
            if (e instanceof Error) {
                this.err = e;
            }
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    async write(data) {
        if (this.err !== null) throw this.err;
        if (data.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = await this.#writer.write(data);
                } catch (e) {
                    if (e instanceof Error) {
                        this.err = e;
                    }
                    throw e;
                }
            } else {
                numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                await this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data = data.subarray(numBytesWritten);
        }
        numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
class BufWriterSync extends AbstractBufBase {
    #writer;
    static create(writer, size = 4096) {
        return writer instanceof BufWriterSync ? writer : new BufWriterSync(writer, size);
    }
    constructor(writer, size = 4096){
        super(new Uint8Array(size <= 0 ? 4096 : size));
        this.#writer = writer;
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.#writer = w;
    }
    flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            const p = this.buf.subarray(0, this.usedBufferBytes);
            let nwritten = 0;
            while(nwritten < p.length){
                nwritten += this.#writer.writeSync(p.subarray(nwritten));
            }
        } catch (e) {
            if (e instanceof Error) {
                this.err = e;
            }
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    writeSync(data) {
        if (this.err !== null) throw this.err;
        if (data.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = this.#writer.writeSync(data);
                } catch (e) {
                    if (e instanceof Error) {
                        this.err = e;
                    }
                    throw e;
                }
            } else {
                numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data = data.subarray(numBytesWritten);
        }
        numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
const DEFAULT_FORMATTER = "{levelName} {msg}";
class BaseHandler {
    level;
    levelName;
    formatter;
    constructor(levelName, options = {}){
        this.level = getLevelByName(levelName);
        this.levelName = levelName;
        this.formatter = options.formatter || DEFAULT_FORMATTER;
    }
    handle(logRecord) {
        if (this.level > logRecord.level) return;
        const msg7 = this.format(logRecord);
        return this.log(msg7);
    }
    format(logRecord) {
        if (this.formatter instanceof Function) {
            return this.formatter(logRecord);
        }
        return this.formatter.replace(/{([^\s}]+)}/g, (match, p1)=>{
            const value = logRecord[p1];
            if (value == null) {
                return match;
            }
            return String(value);
        });
    }
    log(_msg) {}
    async setup() {}
    async destroy() {}
}
class ConsoleHandler extends BaseHandler {
    format(logRecord) {
        let msg8 = super.format(logRecord);
        switch(logRecord.level){
            case LogLevels.INFO:
                msg8 = blue(msg8);
                break;
            case LogLevels.WARNING:
                msg8 = yellow(msg8);
                break;
            case LogLevels.ERROR:
                msg8 = red(msg8);
                break;
            case LogLevels.CRITICAL:
                msg8 = bold(red(msg8));
                break;
            default:
                break;
        }
        return msg8;
    }
    log(msg9) {
        console.log(msg9);
    }
}
const DEFAULT_LEVEL = "INFO";
const DEFAULT_CONFIG = {
    handlers: {
        default: new ConsoleHandler(DEFAULT_LEVEL)
    },
    loggers: {
        default: {
            level: DEFAULT_LEVEL,
            handlers: [
                "default"
            ]
        }
    }
};
const state = {
    handlers: new Map(),
    loggers: new Map(),
    config: DEFAULT_CONFIG
};
function getLogger(name) {
    if (!name) {
        const d = state.loggers.get("default");
        assert(d != null, `"default" logger must be set for getting logger without name`);
        return d;
    }
    const result = state.loggers.get(name);
    if (!result) {
        const logger = new Logger(name, "NOTSET", {
            handlers: []
        });
        state.loggers.set(name, logger);
        return logger;
    }
    return result;
}
function info(msg10, ...args6) {
    if (msg10 instanceof Function) {
        return getLogger("default").info(msg10, ...args6);
    }
    return getLogger("default").info(msg10, ...args6);
}
function error(msg11, ...args7) {
    if (msg11 instanceof Function) {
        return getLogger("default").error(msg11, ...args7);
    }
    return getLogger("default").error(msg11, ...args7);
}
function critical(msg12, ...args8) {
    if (msg12 instanceof Function) {
        return getLogger("default").critical(msg12, ...args8);
    }
    return getLogger("default").critical(msg12, ...args8);
}
async function setup(config1) {
    state.config = {
        handlers: {
            ...DEFAULT_CONFIG.handlers,
            ...config1.handlers
        },
        loggers: {
            ...DEFAULT_CONFIG.loggers,
            ...config1.loggers
        }
    };
    state.handlers.forEach((handler)=>{
        handler.destroy();
    });
    state.handlers.clear();
    const handlers1 = state.config.handlers || {};
    for(const handlerName1 in handlers1){
        const handler = handlers1[handlerName1];
        await handler.setup();
        state.handlers.set(handlerName1, handler);
    }
    state.loggers.clear();
    const loggers = state.config.loggers || {};
    for(const loggerName in loggers){
        const loggerConfig = loggers[loggerName];
        const handlerNames = loggerConfig.handlers || [];
        const handlers2 = [];
        handlerNames.forEach((handlerName)=>{
            const handler = state.handlers.get(handlerName);
            if (handler) {
                handlers2.push(handler);
            }
        });
        const levelName = loggerConfig.level || DEFAULT_LEVEL;
        const logger = new Logger(loggerName, levelName, {
            handlers: handlers2
        });
        state.loggers.set(loggerName, logger);
    }
}
await setup(DEFAULT_CONFIG);
function removeEmptyValues(obj) {
    return Object.fromEntries(Object.entries(obj).filter(([, value])=>{
        if (value === null) return false;
        if (value === undefined) return false;
        if (value === "") return false;
        return true;
    }));
}
function difference(arrA, arrB) {
    return arrA.filter((a)=>arrB.indexOf(a) < 0);
}
function parse(rawDotenv) {
    const env = {};
    for (const line of rawDotenv.split("\n")){
        if (!isVariableStart(line)) continue;
        const key = line.slice(0, line.indexOf("=")).trim();
        let value = line.slice(line.indexOf("=") + 1).trim();
        if (hasSingleQuotes(value)) {
            value = value.slice(1, -1);
        } else if (hasDoubleQuotes(value)) {
            value = value.slice(1, -1);
            value = expandNewlines(value);
        } else value = value.trim();
        env[key] = value;
    }
    return env;
}
const defaultConfigOptions = {
    path: `.env`,
    export: false,
    safe: false,
    example: `.env.example`,
    allowEmptyValues: false,
    defaults: `.env.defaults`
};
async function config(options = {}) {
    const o = {
        ...defaultConfigOptions,
        ...options
    };
    const conf = await parseFileAsync(o.path);
    if (o.defaults) {
        const confDefaults = await parseFileAsync(o.defaults);
        for(const key in confDefaults){
            if (!(key in conf)) {
                conf[key] = confDefaults[key];
            }
        }
    }
    if (o.safe) {
        const confExample = await parseFileAsync(o.example);
        assertSafe(conf, confExample, o.allowEmptyValues);
    }
    if (o.export) {
        for(const key in conf){
            if (Deno.env.get(key) !== undefined) continue;
            Deno.env.set(key, conf[key]);
        }
    }
    return conf;
}
async function parseFileAsync(filepath) {
    try {
        return parse(new TextDecoder("utf-8").decode(await Deno.readFile(filepath)));
    } catch (e) {
        if (e instanceof Deno.errors.NotFound) return {};
        throw e;
    }
}
function isVariableStart(str) {
    return /^\s*[a-zA-Z_][a-zA-Z_0-9 ]*\s*=/.test(str);
}
function hasSingleQuotes(str) {
    return /^'([\s\S]*)'$/.test(str);
}
function hasDoubleQuotes(str) {
    return /^"([\s\S]*)"$/.test(str);
}
function expandNewlines(str) {
    return str.replaceAll("\\n", "\n");
}
function assertSafe(conf, confExample, allowEmptyValues) {
    const currentEnv = Deno.env.toObject();
    const confWithEnv = Object.assign({}, currentEnv, conf);
    const missing = difference(Object.keys(confExample), Object.keys(allowEmptyValues ? confWithEnv : removeEmptyValues(confWithEnv)));
    if (missing.length > 0) {
        const errorMessages = [
            `The following variables were defined in the example file but are not present in the environment:\n  ${missing.join(", ")}`,
            `Make sure to add them to your env file.`,
            !allowEmptyValues && `If you expect any of these variables to be empty, you can set the allowEmptyValues option to true.`, 
        ];
        throw new MissingEnvVarsError(errorMessages.filter(Boolean).join("\n\n"));
    }
}
class MissingEnvVarsError extends Error {
    constructor(message){
        super(message);
        this.name = "MissingEnvVarsError";
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
const { hasOwn  } = Object;
function get(obj, key) {
    if (hasOwn(obj, key)) {
        return obj[key];
    }
}
function getForce(obj, key) {
    const v = get(obj, key);
    assert(v != null);
    return v;
}
function isNumber(x) {
    if (typeof x === "number") return true;
    if (/^0x[0-9a-f]+$/i.test(String(x))) return true;
    return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(String(x));
}
function hasKey(obj, keys) {
    let o = obj;
    keys.slice(0, -1).forEach((key)=>{
        o = get(o, key) ?? {};
    });
    const key1 = keys[keys.length - 1];
    return key1 in o;
}
function parse1(args9, { "--": doubleDash = false , alias: alias3 = {} , boolean: __boolean = false , default: defaults = {} , stopEarly =false , string =[] , collect: collect1 = [] , unknown =(i)=>i  } = {}) {
    const flags = {
        bools: {},
        strings: {},
        unknownFn: unknown,
        allBools: false,
        collect: {}
    };
    if (__boolean !== undefined) {
        if (typeof __boolean === "boolean") {
            flags.allBools = !!__boolean;
        } else {
            const booleanArgs = typeof __boolean === "string" ? [
                __boolean
            ] : __boolean;
            for (const key of booleanArgs.filter(Boolean)){
                flags.bools[key] = true;
            }
        }
    }
    const aliases = {};
    if (alias3 !== undefined) {
        for(const key in alias3){
            const val = getForce(alias3, key);
            if (typeof val === "string") {
                aliases[key] = [
                    val
                ];
            } else {
                aliases[key] = val;
            }
            for (const alias1 of getForce(aliases, key)){
                aliases[alias1] = [
                    key
                ].concat(aliases[key].filter((y)=>alias1 !== y));
            }
        }
    }
    if (string !== undefined) {
        const stringArgs = typeof string === "string" ? [
            string
        ] : string;
        for (const key of stringArgs.filter(Boolean)){
            flags.strings[key] = true;
            const alias = get(aliases, key);
            if (alias) {
                for (const al of alias){
                    flags.strings[al] = true;
                }
            }
        }
    }
    if (collect1 !== undefined) {
        const collectArgs = typeof collect1 === "string" ? [
            collect1
        ] : collect1;
        for (const key of collectArgs.filter(Boolean)){
            flags.collect[key] = true;
            const alias = get(aliases, key);
            if (alias) {
                for (const al of alias){
                    flags.collect[al] = true;
                }
            }
        }
    }
    const argv = {
        _: []
    };
    function argDefined(key, arg) {
        return flags.allBools && /^--[^=]+$/.test(arg) || get(flags.bools, key) || !!get(flags.strings, key) || !!get(aliases, key);
    }
    function setKey(obj, name, value, collect = true) {
        let o = obj;
        const keys = name.split(".");
        keys.slice(0, -1).forEach(function(key) {
            if (get(o, key) === undefined) {
                o[key] = {};
            }
            o = get(o, key);
        });
        const key5 = keys[keys.length - 1];
        const collectable = collect && !!get(flags.collect, name);
        if (!collectable) {
            o[key5] = value;
        } else if (get(o, key5) === undefined) {
            o[key5] = [
                value
            ];
        } else if (Array.isArray(get(o, key5))) {
            o[key5].push(value);
        } else {
            o[key5] = [
                get(o, key5),
                value
            ];
        }
    }
    function setArg(key, val, arg = undefined, collect) {
        if (arg && flags.unknownFn && !argDefined(key, arg)) {
            if (flags.unknownFn(arg, key, val) === false) return;
        }
        const value = !get(flags.strings, key) && isNumber(val) ? Number(val) : val;
        setKey(argv, key, value, collect);
        const alias = get(aliases, key);
        if (alias) {
            for (const x of alias){
                setKey(argv, x, value, collect);
            }
        }
    }
    function aliasIsBoolean(key) {
        return getForce(aliases, key).some((x)=>typeof get(flags.bools, x) === "boolean");
    }
    let notFlags = [];
    if (args9.includes("--")) {
        notFlags = args9.slice(args9.indexOf("--") + 1);
        args9 = args9.slice(0, args9.indexOf("--"));
    }
    for(let i = 0; i < args9.length; i++){
        const arg = args9[i];
        if (/^--.+=/.test(arg)) {
            const m = arg.match(/^--([^=]+)=(.*)$/s);
            assert(m != null);
            const [, key, value] = m;
            if (flags.bools[key]) {
                const booleanValue = value !== "false";
                setArg(key, booleanValue, arg);
            } else {
                setArg(key, value, arg);
            }
        } else if (/^--no-.+/.test(arg)) {
            const m = arg.match(/^--no-(.+)/);
            assert(m != null);
            setArg(m[1], false, arg, false);
        } else if (/^--.+/.test(arg)) {
            const m = arg.match(/^--(.+)/);
            assert(m != null);
            const [, key] = m;
            const next = args9[i + 1];
            if (next !== undefined && !/^-/.test(next) && !get(flags.bools, key) && !flags.allBools && (get(aliases, key) ? !aliasIsBoolean(key) : true)) {
                setArg(key, next, arg);
                i++;
            } else if (/^(true|false)$/.test(next)) {
                setArg(key, next === "true", arg);
                i++;
            } else {
                setArg(key, get(flags.strings, key) ? "" : true, arg);
            }
        } else if (/^-[^-]+/.test(arg)) {
            const letters = arg.slice(1, -1).split("");
            let broken = false;
            for(let j = 0; j < letters.length; j++){
                const next = arg.slice(j + 2);
                if (next === "-") {
                    setArg(letters[j], next, arg);
                    continue;
                }
                if (/[A-Za-z]/.test(letters[j]) && /=/.test(next)) {
                    setArg(letters[j], next.split(/=(.+)/)[1], arg);
                    broken = true;
                    break;
                }
                if (/[A-Za-z]/.test(letters[j]) && /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
                    setArg(letters[j], next, arg);
                    broken = true;
                    break;
                }
                if (letters[j + 1] && letters[j + 1].match(/\W/)) {
                    setArg(letters[j], arg.slice(j + 2), arg);
                    broken = true;
                    break;
                } else {
                    setArg(letters[j], get(flags.strings, letters[j]) ? "" : true, arg);
                }
            }
            const [key] = arg.slice(-1);
            if (!broken && key !== "-") {
                if (args9[i + 1] && !/^(-|--)[^-]/.test(args9[i + 1]) && !get(flags.bools, key) && (get(aliases, key) ? !aliasIsBoolean(key) : true)) {
                    setArg(key, args9[i + 1], arg);
                    i++;
                } else if (args9[i + 1] && /^(true|false)$/.test(args9[i + 1])) {
                    setArg(key, args9[i + 1] === "true", arg);
                    i++;
                } else {
                    setArg(key, get(flags.strings, key) ? "" : true, arg);
                }
            }
        } else {
            if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
                argv._.push(flags.strings["_"] ?? !isNumber(arg) ? arg : Number(arg));
            }
            if (stopEarly) {
                argv._.push(...args9.slice(i + 1));
                break;
            }
        }
    }
    for (const [key4, value1] of Object.entries(defaults)){
        if (!hasKey(argv, key4.split("."))) {
            setKey(argv, key4, value1);
            if (aliases[key4]) {
                for (const x of aliases[key4]){
                    setKey(argv, x, value1);
                }
            }
        }
    }
    for (const key2 of Object.keys(flags.bools)){
        if (!hasKey(argv, key2.split("."))) {
            const value = get(flags.collect, key2) ? [] : false;
            setKey(argv, key2, value, false);
        }
    }
    for (const key3 of Object.keys(flags.strings)){
        if (!hasKey(argv, key3.split(".")) && get(flags.collect, key3)) {
            setKey(argv, key3, [], false);
        }
    }
    if (doubleDash) {
        argv["--"] = [];
        for (const key of notFlags){
            argv["--"].push(key);
        }
    } else {
        for (const key of notFlags){
            argv._.push(key);
        }
    }
    return argv;
}
const hexTable = new TextEncoder().encode("0123456789abcdef");
function errInvalidByte(__byte) {
    return new TypeError(`Invalid byte '${String.fromCharCode(__byte)}'`);
}
function errLength() {
    return new RangeError("Odd length hex string");
}
function fromHexChar(__byte) {
    if (48 <= __byte && __byte <= 57) return __byte - 48;
    if (97 <= __byte && __byte <= 102) return __byte - 97 + 10;
    if (65 <= __byte && __byte <= 70) return __byte - 65 + 10;
    throw errInvalidByte(__byte);
}
function encode(src) {
    const dst = new Uint8Array(src.length * 2);
    for(let i = 0; i < dst.length; i++){
        const v = src[i];
        dst[i * 2] = hexTable[v >> 4];
        dst[i * 2 + 1] = hexTable[v & 0x0f];
    }
    return dst;
}
function decode(src) {
    const dst = new Uint8Array(src.length / 2);
    for(let i = 0; i < dst.length; i++){
        const a = fromHexChar(src[i * 2]);
        const b = fromHexChar(src[i * 2 + 1]);
        dst[i] = a << 4 | b;
    }
    if (src.length % 2 == 1) {
        fromHexChar(src[dst.length * 2]);
        throw errLength();
    }
    return dst;
}
const rootName = Deno.cwd().replaceAll('\\', '/').split('/').pop();
if (rootName != 'JSphereProjects') {
    error('The JSphere CLI will only run within a JSphereProjects directory.');
    Deno.exit(0);
}
const cliConfig = {
    currentProject: '',
    currentConfig: {}
};
let cmdLine;
let promptText = 'JSPHERE>';
while(cmdLine = prompt(promptText)){
    const cmdArgs = parse1(cmdLine.split(' '));
    try {
        switch(cmdArgs._[0]){
            case 'checkout':
                await processCheckoutCmd(cmdArgs);
                break;
            case 'create':
                await processCreateCmd(cmdArgs);
                break;
            case 'crypto':
                await processCryptoCmd(cmdArgs);
                break;
            case 'quit':
                processQuitCmd();
                break;
            case 'reset':
                await processResetCmd(cmdArgs);
                break;
            case 'run':
                await processRunCmd();
                break;
            case 'test':
                await processTestCmd(cmdArgs);
                break;
            case 'use':
                await processUseCmd(cmdArgs);
                break;
            default:
                error(`Command '${cmdArgs._[0] || ""}' not recognized.`);
        }
    } catch (e) {
        critical(e.message);
    }
}
async function processCheckoutCmd(cmdArgs) {
    try {
        if (cliConfig.currentProject) {
            let repo = cliConfig.currentConfig.REMOTE_CONFIG;
            const project = cliConfig.currentProject;
            const provider = cliConfig.currentConfig.REMOTE_HOST;
            const owner = cliConfig.currentConfig.REMOTE_ROOT;
            const accessToken = cliConfig.currentConfig.REMOTE_AUTH;
            const checkout = cmdArgs._[1].toString();
            if (checkout.startsWith('.')) {
                if (checkout != '.') repo = checkout;
                await cloneRepo({
                    project,
                    provider,
                    owner,
                    accessToken,
                    repo
                });
            } else {
                const parts = checkout.split('/');
                const appName = parts[0];
                const appPackage = parts[1];
                const appFile = await Deno.readFile(`${cliConfig.currentProject}/${repo}/.applications/${appName}.json`);
                const appConfig = JSON.parse(new TextDecoder().decode(appFile));
                if (appConfig.packages) {
                    for(const key in appConfig.packages){
                        if (appPackage == '*' || appPackage == key) {
                            await cloneRepo({
                                project,
                                provider: appConfig.host.name,
                                owner: appConfig.host.root,
                                accessToken: appConfig.host.auth,
                                repo: key
                            });
                        }
                    }
                } else {
                    error(`The application '${appName}' does not have the package '${appPackage}' registered.`);
                }
            }
        } else error('This command is only valid within a project.');
    } catch (e) {
        critical(e.message);
    }
}
async function processCreateCmd(cmdArgs) {
    switch(cmdArgs._[1]){
        case 'package':
            await processCreatePackageCmd(cmdArgs);
            break;
        case 'project':
            await processCreateProjectCmd(cmdArgs);
            break;
    }
}
async function processCreatePackageCmd(cmdArgs) {
    const packageName = cmdArgs._[2];
    if (cliConfig.currentProject) {
        if (packageName) {
            await Deno.mkdir(`${cliConfig.currentProject}/${packageName}/client`, {
                recursive: true
            });
            await Deno.mkdir(`${cliConfig.currentProject}/${packageName}/server`, {
                recursive: true
            });
            await initRepo({
                project: cliConfig.currentProject,
                repo: packageName
            });
        } else error(`Please provide a package name.`);
    } else error('This command is only valid within a project.');
}
async function processCreateProjectCmd(cmdArgs) {
    const projectName = cmdArgs._[2].toString();
    if (projectName) {
        await Deno.mkdir(`${projectName}`, {
            recursive: true
        });
        const envSettings = {
            useLocalConfig: 'true',
            localRoot: projectName,
            localConfig: '.jsphere'
        };
        await Deno.writeFile(`${projectName}/.env`, (new TextEncoder).encode(getEnvContent(envSettings)));
        await Deno.writeFile(`${projectName}/DockerFile`, (new TextEncoder).encode(getDockerFileContent(projectName)));
        if (cmdArgs.init) {
            await Deno.mkdir(`${projectName}/.jsphere`, {
                recursive: true
            });
            await Deno.writeFile(`${projectName}/.jsphere/server.json`, (new TextEncoder).encode('{}'));
            await Deno.mkdir(`${projectName}/.jsphere/.tenants`, {
                recursive: true
            });
            await Deno.writeFile(`${projectName}/.jsphere/.tenants/localhost.json`, (new TextEncoder).encode(getTenantContent()));
            await Deno.mkdir(`${projectName}/.jsphere/.applications`, {
                recursive: true
            });
            await Deno.writeFile(`${projectName}/.jsphere/.applications/app.json`, (new TextEncoder).encode(getApplicationContent(projectName)));
            await Deno.mkdir(`${projectName}/app/client`, {
                recursive: true
            });
            await Deno.writeFile(`${projectName}/app/client/index.html`, (new TextEncoder).encode(getClientIndexContent()));
            await Deno.mkdir(`${projectName}/app/server`, {
                recursive: true
            });
            await Deno.writeFile(`${projectName}/app/server/index.ts`, (new TextEncoder).encode(getServerIndexContent()));
            await initRepo({
                project: projectName,
                repo: '.jsphere'
            });
            await initRepo({
                project: projectName,
                repo: 'app'
            });
        }
        await processUseCmd({
            _: [
                'use',
                projectName
            ]
        });
    } else error(`Please provide a project name.`);
}
async function processCryptoCmd(cmdArgs) {
    switch(cmdArgs._[1]){
        case 'decrypt':
            await processCryptoDecryptCmd(cmdArgs);
            break;
        case 'encrypt':
            await processCryptoEncryptCmd(cmdArgs);
            break;
        case 'keys':
            await processCryptoKeysCmd();
            break;
    }
}
async function processCryptoDecryptCmd(cmdArgs) {
    const keyData = decode(new TextEncoder().encode(cliConfig.currentConfig.CRYPTO_PRIVATE_KEY));
    const privateKey = await crypto.subtle.importKey('pkcs8', keyData, {
        name: "RSA-OAEP",
        hash: "SHA-512"
    }, true, [
        'decrypt'
    ]);
    const decBuffer = await crypto.subtle.decrypt({
        name: "RSA-OAEP"
    }, privateKey, decode(new TextEncoder().encode(cliConfig.currentConfig[cmdArgs._[2].toString()])));
    const decData = new Uint8Array(decBuffer);
    const decString = new TextDecoder().decode(decData);
    info(`DECRYPTED DATA: ${decString}\n`);
}
async function processCryptoEncryptCmd(cmdArgs) {
    const keyData = decode(new TextEncoder().encode(cliConfig.currentConfig.CRYPTO_PUBLIC_KEY));
    const publicKey = await crypto.subtle.importKey('spki', keyData, {
        name: "RSA-OAEP",
        hash: "SHA-512"
    }, true, [
        'encrypt'
    ]);
    const encBuffer = await crypto.subtle.encrypt({
        name: "RSA-OAEP"
    }, publicKey, new TextEncoder().encode(cliConfig.currentConfig[cmdArgs._[2].toString()]));
    const encData = new Uint8Array(encBuffer);
    const encString = new TextDecoder().decode(encode(encData));
    info(`ENCRYPTED DATA: ${encString}\n`);
}
async function processCryptoKeysCmd() {
    const keyPair = await crypto.subtle.generateKey({
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([
            1,
            0,
            1
        ]),
        hash: "SHA-512"
    }, true, [
        "encrypt",
        "decrypt"
    ]);
    const exportedPublicKeyBuffer = await crypto.subtle.exportKey("spki", keyPair.publicKey);
    const exportedPrivateKeyBuffer = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
    const publicKeyHex = new TextDecoder().decode(encode(new Uint8Array(exportedPublicKeyBuffer)));
    const privateKeyHex = new TextDecoder().decode(encode(new Uint8Array(exportedPrivateKeyBuffer)));
    info(`PUBLIC KEY: ${publicKeyHex}\n`);
    info(`PRIVATE KEY: ${privateKeyHex}\n`);
}
function processQuitCmd() {
    Deno.exit(0);
}
async function processResetCmd(cmdArgs) {
    const tenant = cmdArgs._[1];
    if (tenant) {
        const response = await fetch(`http://${tenant}/~/resettenant`);
        const result = await response.text();
        info(result);
    } else {
        error(`Please provide a tenant domain.`);
    }
}
async function processRunCmd() {
    const process = Deno.run({
        cmd: [
            'deno',
            'run',
            '--allow-all',
            '--no-check',
            '--reload',
            '--inspect=0.0.0.0:9229',
            'C:\\_GreenAntSolutions\\Repositories\\JSphereServer\\jsphere\\server.ts',
            `${cliConfig.currentProject}`
        ]
    });
    await process.status();
    process.close();
}
async function processTestCmd(cmdArgs) {}
async function processUseCmd(cmdArgs) {
    if (cmdArgs._[1] === undefined) {
        cliConfig.currentProject = '';
        promptText = `JSPHERE>`;
        return;
    }
    const projectName = cmdArgs._[1].toString().toLowerCase();
    const dirEntries = Deno.readDirSync(Deno.cwd());
    let found = false;
    for (const entry of dirEntries){
        if (entry.isDirectory && entry.name.toLowerCase() == projectName) {
            cliConfig.currentProject = entry.name;
            cliConfig.currentConfig = await config({
                path: `./${projectName}/.env`
            });
            promptText = `JSPHERE:${entry.name}>`;
            found = true;
        }
    }
    if (!found) {
        error(`The project '${cmdArgs._[1]}' does not exist.`);
    }
}
async function cloneRepo(config1) {
    let process;
    const path = `./${config1.project}/${config1.repo}`;
    if (config1.accessToken) {
        process = Deno.run({
            cmd: [
                'git',
                'clone',
                `https://${config1.owner}:${config1.accessToken}@github.com/${config1.owner}/${config1.repo}.git`,
                path
            ]
        });
    } else {
        process = Deno.run({
            cmd: [
                'git',
                'clone',
                `https://github.com/${config1.owner}/${config1.repo}.git`,
                path
            ]
        });
    }
    await process.status();
    process.close();
}
async function initRepo(config2) {
    const path = `./${config2.project}/${config2.repo}`;
    const process = Deno.run({
        cmd: [
            'git',
            'init',
            path,
            '-b',
            'main'
        ]
    });
    await process.status();
    process.close();
}
function getEnvContent(envSettings) {
    const content = `USE_LOCAL_CONFIG=${envSettings.useLocalConfig || ''}

LOCAL_CONFIG=${envSettings.localConfig || ''}
LOCAL_ROOT=${envSettings.localRoot || ''}
    
REMOTE_HOST=${envSettings.remoteHost || ''}
REMOTE_CONFIG=${envSettings.remoteConfig || ''}
REMOTE_ROOT=${envSettings.remoteRoot || ''}
REMOTE_AUTH=${envSettings.remoteAuth || ''}

SERVER_HTTP_PORT=80
`;
    return content;
}
function getTenantContent() {
    const content = `{
    "application": "app",
    "settings": {
    },
    "contextExtensions": {
    }
}
`;
    return content;
}
function getApplicationContent(projectName) {
    const content = `{
    "host": {
        "name": "FileSystem",
        "root": "${projectName}",
        "auth": ""
    },
    "packages": {
        "app": {
        }
    },
    "routeMappings": [
    ],
    "settings": {
    }
}
`;
    return content;
}
function getClientIndexContent() {
    const content = `<html>
    <head>
        <script>
            fetch('/app/server/index')
                .then((response) => response.text())
                .then((data) => document.body.innerHTML = data)
        </script>
    </head>
    <body>
    </body>
</html>
`;
    return content;
}
function getServerIndexContent() {
    const content = `export async function GET(ctx: any) : Promise<any> {
    return ctx.response.text('Hello JSphere');
}
`;
    return content;
}
function getDockerFileContent(projectName) {
    const content = `FROM --platform=linux/amd64 ubuntu
FROM denoland/deno:ubuntu
WORKDIR /${projectName}
COPY . .
WORKDIR /
RUN deno cache https://deno.land/x/jsphere/server.js
EXPOSE 80
EXPOSE 9229
ENTRYPOINT ["deno", "run", "--allow-all", "--inspect=0.0.0.0:9229", "--no-check", "https://deno.land/x/jsphere/server.js", "${projectName}"]
`;
    return content;
}
