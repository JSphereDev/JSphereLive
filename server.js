// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

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
    const env1 = {};
    for (const line of rawDotenv.split("\n")){
        if (!isVariableStart(line)) continue;
        const key1 = line.slice(0, line.indexOf("=")).trim();
        let value = line.slice(line.indexOf("=") + 1).trim();
        if (hasSingleQuotes(value)) {
            value = value.slice(1, -1);
        } else if (hasDoubleQuotes(value)) {
            value = value.slice(1, -1);
            value = expandNewlines(value);
        } else value = value.trim();
        env1[key1] = value;
    }
    return env1;
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
        for(const key2 in confDefaults){
            if (!(key2 in conf)) {
                conf[key2] = confDefaults[key2];
            }
        }
    }
    if (o.safe) {
        const confExample = await parseFileAsync(o.example);
        assertSafe(conf, confExample, o.allowEmptyValues);
    }
    if (o.export) {
        for(const key3 in conf){
            if (Deno.env.get(key3) !== undefined) continue;
            Deno.env.set(key3, conf[key3]);
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
var LogLevels;
(function(LogLevels1) {
    LogLevels1[LogLevels1["NOTSET"] = 0] = "NOTSET";
    LogLevels1[LogLevels1["DEBUG"] = 10] = "DEBUG";
    LogLevels1[LogLevels1["INFO"] = 20] = "INFO";
    LogLevels1[LogLevels1["WARNING"] = 30] = "WARNING";
    LogLevels1[LogLevels1["ERROR"] = 40] = "ERROR";
    LogLevels1[LogLevels1["CRITICAL"] = 50] = "CRITICAL";
})(LogLevels || (LogLevels = {}));
Object.keys(LogLevels).filter((key4)=>isNaN(Number(key4)));
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
function warning(msg11, ...args7) {
    if (msg11 instanceof Function) {
        return getLogger("default").warning(msg11, ...args7);
    }
    return getLogger("default").warning(msg11, ...args7);
}
function error(msg12, ...args8) {
    if (msg12 instanceof Function) {
        return getLogger("default").error(msg12, ...args8);
    }
    return getLogger("default").error(msg12, ...args8);
}
async function setup(config3) {
    state.config = {
        handlers: {
            ...DEFAULT_CONFIG.handlers,
            ...config3.handlers
        },
        loggers: {
            ...DEFAULT_CONFIG.loggers,
            ...config3.loggers
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
const { hasOwn  } = Object;
function get(obj, key5) {
    if (hasOwn(obj, key5)) {
        return obj[key5];
    }
}
function getForce(obj, key6) {
    const v = get(obj, key6);
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
    keys.slice(0, -1).forEach((key7)=>{
        o = get(o, key7) ?? {};
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
            for (const key8 of booleanArgs.filter(Boolean)){
                flags.bools[key8] = true;
            }
        }
    }
    const aliases = {};
    if (alias3 !== undefined) {
        for(const key9 in alias3){
            const val = getForce(alias3, key9);
            if (typeof val === "string") {
                aliases[key9] = [
                    val
                ];
            } else {
                aliases[key9] = val;
            }
            for (const alias1 of getForce(aliases, key9)){
                aliases[alias1] = [
                    key9
                ].concat(aliases[key9].filter((y)=>alias1 !== y));
            }
        }
    }
    if (string !== undefined) {
        const stringArgs = typeof string === "string" ? [
            string
        ] : string;
        for (const key10 of stringArgs.filter(Boolean)){
            flags.strings[key10] = true;
            const alias = get(aliases, key10);
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
        for (const key11 of collectArgs.filter(Boolean)){
            flags.collect[key11] = true;
            const alias = get(aliases, key11);
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
    function argDefined(key12, arg) {
        return flags.allBools && /^--[^=]+$/.test(arg) || get(flags.bools, key12) || !!get(flags.strings, key12) || !!get(aliases, key12);
    }
    function setKey(obj, name, value, collect = true) {
        let o = obj;
        const keys = name.split(".");
        keys.slice(0, -1).forEach(function(key13) {
            if (get(o, key13) === undefined) {
                o[key13] = {};
            }
            o = get(o, key13);
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
    function setArg(key14, val, arg = undefined, collect) {
        if (arg && flags.unknownFn && !argDefined(key14, arg)) {
            if (flags.unknownFn(arg, key14, val) === false) return;
        }
        const value = !get(flags.strings, key14) && isNumber(val) ? Number(val) : val;
        setKey(argv, key14, value, collect);
        const alias = get(aliases, key14);
        if (alias) {
            for (const x of alias){
                setKey(argv, x, value, collect);
            }
        }
    }
    function aliasIsBoolean(key15) {
        return getForce(aliases, key15).some((x)=>typeof get(flags.bools, x) === "boolean");
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
            const [, key16, value] = m;
            if (flags.bools[key16]) {
                const booleanValue = value !== "false";
                setArg(key16, booleanValue, arg);
            } else {
                setArg(key16, value, arg);
            }
        } else if (/^--no-.+/.test(arg)) {
            const m = arg.match(/^--no-(.+)/);
            assert(m != null);
            setArg(m[1], false, arg, false);
        } else if (/^--.+/.test(arg)) {
            const m = arg.match(/^--(.+)/);
            assert(m != null);
            const [, key17] = m;
            const next = args9[i + 1];
            if (next !== undefined && !/^-/.test(next) && !get(flags.bools, key17) && !flags.allBools && (get(aliases, key17) ? !aliasIsBoolean(key17) : true)) {
                setArg(key17, next, arg);
                i++;
            } else if (/^(true|false)$/.test(next)) {
                setArg(key17, next === "true", arg);
                i++;
            } else {
                setArg(key17, get(flags.strings, key17) ? "" : true, arg);
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
            const [key18] = arg.slice(-1);
            if (!broken && key18 !== "-") {
                if (args9[i + 1] && !/^(-|--)[^-]/.test(args9[i + 1]) && !get(flags.bools, key18) && (get(aliases, key18) ? !aliasIsBoolean(key18) : true)) {
                    setArg(key18, args9[i + 1], arg);
                    i++;
                } else if (args9[i + 1] && /^(true|false)$/.test(args9[i + 1])) {
                    setArg(key18, args9[i + 1] === "true", arg);
                    i++;
                } else {
                    setArg(key18, get(flags.strings, key18) ? "" : true, arg);
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
        for (const key19 of notFlags){
            argv["--"].push(key19);
        }
    } else {
        for (const key20 of notFlags){
            argv._.push(key20);
        }
    }
    return argv;
}
function exclude() {
    var excludes = [].slice.call(arguments);
    function excludeProps(res, obj) {
        Object.keys(obj).forEach(function(key21) {
            if (!~excludes.indexOf(key21)) res[key21] = obj[key21];
        });
    }
    return function extendExclude() {
        var args10 = [].slice.call(arguments), i = 0, res = {};
        for(; i < args10.length; i++){
            excludeProps(res, args10[i]);
        }
        return res;
    };
}
var assertionError = AssertionError;
function AssertionError(message, _props, ssf) {
    var extend = exclude("name", "message", "stack", "constructor", "toJSON"), props = extend(_props || {});
    this.message = message || "Unspecified AssertionError";
    this.showDiff = false;
    for(var key22 in props){
        this[key22] = props[key22];
    }
    ssf = ssf || AssertionError;
    if (Error.captureStackTrace) {
        Error.captureStackTrace(this, ssf);
    } else {
        try {
            throw new Error();
        } catch (e) {
            this.stack = e.stack;
        }
    }
}
AssertionError.prototype = Object.create(Error.prototype);
AssertionError.prototype.name = "AssertionError";
AssertionError.prototype.constructor = AssertionError;
AssertionError.prototype.toJSON = function(stack) {
    var extend = exclude("constructor", "toJSON", "stack"), props = extend({
        name: this.name
    }, this);
    if (stack !== false && this.stack) {
        props.stack = this.stack;
    }
    return props;
};
function hasProperty(obj, name) {
    if (typeof obj === "undefined" || obj === null) {
        return false;
    }
    return name in Object(obj);
}
function parsePath(path5) {
    var str = path5.replace(/([^\\])\[/g, "$1.[");
    var parts = str.match(/(\\\.|[^.]+?)+/g);
    return parts.map(function mapMatches(value) {
        if (value === "constructor" || value === "__proto__" || value === "prototype") {
            return {};
        }
        var regexp = /^\[(\d+)\]$/;
        var mArr = regexp.exec(value);
        var parsed = null;
        if (mArr) {
            parsed = {
                i: parseFloat(mArr[1])
            };
        } else {
            parsed = {
                p: value.replace(/\\([.[\]])/g, "$1")
            };
        }
        return parsed;
    });
}
function internalGetPathValue(obj, parsed, pathDepth) {
    var temporaryValue = obj;
    var res = null;
    pathDepth = typeof pathDepth === "undefined" ? parsed.length : pathDepth;
    for(var i = 0; i < pathDepth; i++){
        var part = parsed[i];
        if (temporaryValue) {
            if (typeof part.p === "undefined") {
                temporaryValue = temporaryValue[part.i];
            } else {
                temporaryValue = temporaryValue[part.p];
            }
            if (i === pathDepth - 1) {
                res = temporaryValue;
            }
        }
    }
    return res;
}
function internalSetPathValue(obj, val, parsed) {
    var tempObj = obj;
    var pathDepth = parsed.length;
    var part = null;
    for(var i = 0; i < pathDepth; i++){
        var propName = null;
        var propVal = null;
        part = parsed[i];
        if (i === pathDepth - 1) {
            propName = typeof part.p === "undefined" ? part.i : part.p;
            tempObj[propName] = val;
        } else if (typeof part.p !== "undefined" && tempObj[part.p]) {
            tempObj = tempObj[part.p];
        } else if (typeof part.i !== "undefined" && tempObj[part.i]) {
            tempObj = tempObj[part.i];
        } else {
            var next = parsed[i + 1];
            propName = typeof part.p === "undefined" ? part.i : part.p;
            propVal = typeof next.p === "undefined" ? [] : {};
            tempObj[propName] = propVal;
            tempObj = tempObj[propName];
        }
    }
}
function getPathInfo(obj, path6) {
    var parsed = parsePath(path6);
    var last = parsed[parsed.length - 1];
    var info1 = {
        parent: parsed.length > 1 ? internalGetPathValue(obj, parsed, parsed.length - 1) : obj,
        name: last.p || last.i,
        value: internalGetPathValue(obj, parsed)
    };
    info1.exists = hasProperty(info1.parent, info1.name);
    return info1;
}
function getPathValue(obj, path7) {
    var info2 = getPathInfo(obj, path7);
    return info2.value;
}
function setPathValue(obj, path8, val) {
    var parsed = parsePath(path8);
    internalSetPathValue(obj, val, parsed);
    return obj;
}
var pathval = {
    hasProperty,
    getPathInfo,
    getPathValue,
    setPathValue
};
pathval.getPathInfo;
pathval.getPathValue;
pathval.hasProperty;
pathval.setPathValue;
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function createCommonjsModule(fn, basedir, module) {
    return module = {
        path: basedir,
        exports: {},
        require: function(path9, base) {
            return commonjsRequire(path9, base === void 0 || base === null ? module.path : base);
        }
    }, fn(module, module.exports), module.exports;
}
function commonjsRequire() {
    throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}
var typeDetect = createCommonjsModule(function(module, exports) {
    (function(global2, factory) {
        module.exports = factory();
    })(commonjsGlobal, function() {
        var promiseExists = typeof Promise === "function";
        var globalObject = typeof self === "object" ? self : commonjsGlobal;
        var symbolExists = typeof Symbol !== "undefined";
        var mapExists = typeof Map !== "undefined";
        var setExists = typeof Set !== "undefined";
        var weakMapExists = typeof WeakMap !== "undefined";
        var weakSetExists = typeof WeakSet !== "undefined";
        var dataViewExists = typeof DataView !== "undefined";
        var symbolIteratorExists = symbolExists && typeof Symbol.iterator !== "undefined";
        var symbolToStringTagExists = symbolExists && typeof Symbol.toStringTag !== "undefined";
        var setEntriesExists = setExists && typeof Set.prototype.entries === "function";
        var mapEntriesExists = mapExists && typeof Map.prototype.entries === "function";
        var setIteratorPrototype = setEntriesExists && Object.getPrototypeOf(new Set().entries());
        var mapIteratorPrototype = mapEntriesExists && Object.getPrototypeOf(new Map().entries());
        var arrayIteratorExists = symbolIteratorExists && typeof Array.prototype[Symbol.iterator] === "function";
        var arrayIteratorPrototype = arrayIteratorExists && Object.getPrototypeOf([][Symbol.iterator]());
        var stringIteratorExists = symbolIteratorExists && typeof String.prototype[Symbol.iterator] === "function";
        var stringIteratorPrototype = stringIteratorExists && Object.getPrototypeOf(""[Symbol.iterator]());
        var toStringLeftSliceLength = 8;
        var toStringRightSliceLength = -1;
        function typeDetect2(obj) {
            var typeofObj = typeof obj;
            if (typeofObj !== "object") {
                return typeofObj;
            }
            if (obj === null) {
                return "null";
            }
            if (obj === globalObject) {
                return "global";
            }
            if (Array.isArray(obj) && (symbolToStringTagExists === false || !(Symbol.toStringTag in obj))) {
                return "Array";
            }
            if (typeof window === "object" && window !== null) {
                if (typeof window.location === "object" && obj === window.location) {
                    return "Location";
                }
                if (typeof window.document === "object" && obj === window.document) {
                    return "Document";
                }
                if (typeof window.navigator === "object") {
                    if (typeof window.navigator.mimeTypes === "object" && obj === window.navigator.mimeTypes) {
                        return "MimeTypeArray";
                    }
                    if (typeof window.navigator.plugins === "object" && obj === window.navigator.plugins) {
                        return "PluginArray";
                    }
                }
                if ((typeof window.HTMLElement === "function" || typeof window.HTMLElement === "object") && obj instanceof window.HTMLElement) {
                    if (obj.tagName === "BLOCKQUOTE") {
                        return "HTMLQuoteElement";
                    }
                    if (obj.tagName === "TD") {
                        return "HTMLTableDataCellElement";
                    }
                    if (obj.tagName === "TH") {
                        return "HTMLTableHeaderCellElement";
                    }
                }
            }
            var stringTag = symbolToStringTagExists && obj[Symbol.toStringTag];
            if (typeof stringTag === "string") {
                return stringTag;
            }
            var objPrototype = Object.getPrototypeOf(obj);
            if (objPrototype === RegExp.prototype) {
                return "RegExp";
            }
            if (objPrototype === Date.prototype) {
                return "Date";
            }
            if (promiseExists && objPrototype === Promise.prototype) {
                return "Promise";
            }
            if (setExists && objPrototype === Set.prototype) {
                return "Set";
            }
            if (mapExists && objPrototype === Map.prototype) {
                return "Map";
            }
            if (weakSetExists && objPrototype === WeakSet.prototype) {
                return "WeakSet";
            }
            if (weakMapExists && objPrototype === WeakMap.prototype) {
                return "WeakMap";
            }
            if (dataViewExists && objPrototype === DataView.prototype) {
                return "DataView";
            }
            if (mapExists && objPrototype === mapIteratorPrototype) {
                return "Map Iterator";
            }
            if (setExists && objPrototype === setIteratorPrototype) {
                return "Set Iterator";
            }
            if (arrayIteratorExists && objPrototype === arrayIteratorPrototype) {
                return "Array Iterator";
            }
            if (stringIteratorExists && objPrototype === stringIteratorPrototype) {
                return "String Iterator";
            }
            if (objPrototype === null) {
                return "Object";
            }
            return Object.prototype.toString.call(obj).slice(toStringLeftSliceLength, toStringRightSliceLength);
        }
        return typeDetect2;
    });
});
var toString = Function.prototype.toString;
var functionNameMatch = /\s*function(?:\s|\s*\/\*[^(?:*\/)]+\*\/\s*)*([^\s\(\/]+)/;
function getFuncName(aFunc) {
    if (typeof aFunc !== "function") {
        return null;
    }
    var name = "";
    if (typeof Function.prototype.name === "undefined" && typeof aFunc.name === "undefined") {
        var match = toString.call(aFunc).match(functionNameMatch);
        if (match) {
            name = match[1];
        }
    } else {
        name = aFunc.name;
    }
    return name;
}
var getFuncName_1 = getFuncName;
function FakeMap() {
    this._key = "chai/deep-eql__" + Math.random() + Date.now();
}
FakeMap.prototype = {
    get: function getMap(key23) {
        return key23[this._key];
    },
    set: function setMap(key24, value) {
        if (Object.isExtensible(key24)) {
            Object.defineProperty(key24, this._key, {
                value,
                configurable: true
            });
        }
    }
};
var MemoizeMap = typeof WeakMap === "function" ? WeakMap : FakeMap;
function memoizeCompare(leftHandOperand, rightHandOperand, memoizeMap) {
    if (!memoizeMap || isPrimitive(leftHandOperand) || isPrimitive(rightHandOperand)) {
        return null;
    }
    var leftHandMap = memoizeMap.get(leftHandOperand);
    if (leftHandMap) {
        var result = leftHandMap.get(rightHandOperand);
        if (typeof result === "boolean") {
            return result;
        }
    }
    return null;
}
function memoizeSet(leftHandOperand, rightHandOperand, memoizeMap, result) {
    if (!memoizeMap || isPrimitive(leftHandOperand) || isPrimitive(rightHandOperand)) {
        return;
    }
    var leftHandMap = memoizeMap.get(leftHandOperand);
    if (leftHandMap) {
        leftHandMap.set(rightHandOperand, result);
    } else {
        leftHandMap = new MemoizeMap();
        leftHandMap.set(rightHandOperand, result);
        memoizeMap.set(leftHandOperand, leftHandMap);
    }
}
var deepEql = deepEqual;
var MemoizeMap_1 = MemoizeMap;
function deepEqual(leftHandOperand, rightHandOperand, options) {
    if (options && options.comparator) {
        return extensiveDeepEqual(leftHandOperand, rightHandOperand, options);
    }
    var simpleResult = simpleEqual(leftHandOperand, rightHandOperand);
    if (simpleResult !== null) {
        return simpleResult;
    }
    return extensiveDeepEqual(leftHandOperand, rightHandOperand, options);
}
function simpleEqual(leftHandOperand, rightHandOperand) {
    if (leftHandOperand === rightHandOperand) {
        return leftHandOperand !== 0 || 1 / leftHandOperand === 1 / rightHandOperand;
    }
    if (leftHandOperand !== leftHandOperand && rightHandOperand !== rightHandOperand) {
        return true;
    }
    if (isPrimitive(leftHandOperand) || isPrimitive(rightHandOperand)) {
        return false;
    }
    return null;
}
function extensiveDeepEqual(leftHandOperand, rightHandOperand, options) {
    options = options || {};
    options.memoize = options.memoize === false ? false : options.memoize || new MemoizeMap();
    var comparator = options && options.comparator;
    var memoizeResultLeft = memoizeCompare(leftHandOperand, rightHandOperand, options.memoize);
    if (memoizeResultLeft !== null) {
        return memoizeResultLeft;
    }
    var memoizeResultRight = memoizeCompare(rightHandOperand, leftHandOperand, options.memoize);
    if (memoizeResultRight !== null) {
        return memoizeResultRight;
    }
    if (comparator) {
        var comparatorResult = comparator(leftHandOperand, rightHandOperand);
        if (comparatorResult === false || comparatorResult === true) {
            memoizeSet(leftHandOperand, rightHandOperand, options.memoize, comparatorResult);
            return comparatorResult;
        }
        var simpleResult = simpleEqual(leftHandOperand, rightHandOperand);
        if (simpleResult !== null) {
            return simpleResult;
        }
    }
    var leftHandType = typeDetect(leftHandOperand);
    if (leftHandType !== typeDetect(rightHandOperand)) {
        memoizeSet(leftHandOperand, rightHandOperand, options.memoize, false);
        return false;
    }
    memoizeSet(leftHandOperand, rightHandOperand, options.memoize, true);
    var result = extensiveDeepEqualByType(leftHandOperand, rightHandOperand, leftHandType, options);
    memoizeSet(leftHandOperand, rightHandOperand, options.memoize, result);
    return result;
}
function extensiveDeepEqualByType(leftHandOperand, rightHandOperand, leftHandType, options) {
    switch(leftHandType){
        case "String":
        case "Number":
        case "Boolean":
        case "Date":
            return deepEqual(leftHandOperand.valueOf(), rightHandOperand.valueOf());
        case "Promise":
        case "Symbol":
        case "function":
        case "WeakMap":
        case "WeakSet":
        case "Error":
            return leftHandOperand === rightHandOperand;
        case "Arguments":
        case "Int8Array":
        case "Uint8Array":
        case "Uint8ClampedArray":
        case "Int16Array":
        case "Uint16Array":
        case "Int32Array":
        case "Uint32Array":
        case "Float32Array":
        case "Float64Array":
        case "Array":
            return iterableEqual(leftHandOperand, rightHandOperand, options);
        case "RegExp":
            return regexpEqual(leftHandOperand, rightHandOperand);
        case "Generator":
            return generatorEqual(leftHandOperand, rightHandOperand, options);
        case "DataView":
            return iterableEqual(new Uint8Array(leftHandOperand.buffer), new Uint8Array(rightHandOperand.buffer), options);
        case "ArrayBuffer":
            return iterableEqual(new Uint8Array(leftHandOperand), new Uint8Array(rightHandOperand), options);
        case "Set":
            return entriesEqual(leftHandOperand, rightHandOperand, options);
        case "Map":
            return entriesEqual(leftHandOperand, rightHandOperand, options);
        default:
            return objectEqual(leftHandOperand, rightHandOperand, options);
    }
}
function regexpEqual(leftHandOperand, rightHandOperand) {
    return leftHandOperand.toString() === rightHandOperand.toString();
}
function entriesEqual(leftHandOperand, rightHandOperand, options) {
    if (leftHandOperand.size !== rightHandOperand.size) {
        return false;
    }
    if (leftHandOperand.size === 0) {
        return true;
    }
    var leftHandItems = [];
    var rightHandItems = [];
    leftHandOperand.forEach(function gatherEntries(key25, value) {
        leftHandItems.push([
            key25,
            value
        ]);
    });
    rightHandOperand.forEach(function gatherEntries(key26, value) {
        rightHandItems.push([
            key26,
            value
        ]);
    });
    return iterableEqual(leftHandItems.sort(), rightHandItems.sort(), options);
}
function iterableEqual(leftHandOperand, rightHandOperand, options) {
    var length = leftHandOperand.length;
    if (length !== rightHandOperand.length) {
        return false;
    }
    if (length === 0) {
        return true;
    }
    var index = -1;
    while(++index < length){
        if (deepEqual(leftHandOperand[index], rightHandOperand[index], options) === false) {
            return false;
        }
    }
    return true;
}
function generatorEqual(leftHandOperand, rightHandOperand, options) {
    return iterableEqual(getGeneratorEntries(leftHandOperand), getGeneratorEntries(rightHandOperand), options);
}
function hasIteratorFunction(target) {
    return typeof Symbol !== "undefined" && typeof target === "object" && typeof Symbol.iterator !== "undefined" && typeof target[Symbol.iterator] === "function";
}
function getIteratorEntries(target) {
    if (hasIteratorFunction(target)) {
        try {
            return getGeneratorEntries(target[Symbol.iterator]());
        } catch (iteratorError) {
            return [];
        }
    }
    return [];
}
function getGeneratorEntries(generator) {
    var generatorResult = generator.next();
    var accumulator = [
        generatorResult.value
    ];
    while(generatorResult.done === false){
        generatorResult = generator.next();
        accumulator.push(generatorResult.value);
    }
    return accumulator;
}
function getEnumerableKeys(target) {
    var keys = [];
    for(var key27 in target){
        keys.push(key27);
    }
    return keys;
}
function keysEqual(leftHandOperand, rightHandOperand, keys, options) {
    var length = keys.length;
    if (length === 0) {
        return true;
    }
    for(var i = 0; i < length; i += 1){
        if (deepEqual(leftHandOperand[keys[i]], rightHandOperand[keys[i]], options) === false) {
            return false;
        }
    }
    return true;
}
function objectEqual(leftHandOperand, rightHandOperand, options) {
    var leftHandKeys = getEnumerableKeys(leftHandOperand);
    var rightHandKeys = getEnumerableKeys(rightHandOperand);
    if (leftHandKeys.length && leftHandKeys.length === rightHandKeys.length) {
        leftHandKeys.sort();
        rightHandKeys.sort();
        if (iterableEqual(leftHandKeys, rightHandKeys) === false) {
            return false;
        }
        return keysEqual(leftHandOperand, rightHandOperand, leftHandKeys, options);
    }
    var leftHandEntries = getIteratorEntries(leftHandOperand);
    var rightHandEntries = getIteratorEntries(rightHandOperand);
    if (leftHandEntries.length && leftHandEntries.length === rightHandEntries.length) {
        leftHandEntries.sort();
        rightHandEntries.sort();
        return iterableEqual(leftHandEntries, rightHandEntries, options);
    }
    if (leftHandKeys.length === 0 && leftHandEntries.length === 0 && rightHandKeys.length === 0 && rightHandEntries.length === 0) {
        return true;
    }
    return false;
}
function isPrimitive(value) {
    return value === null || typeof value !== "object";
}
deepEql.MemoizeMap = MemoizeMap_1;
function compatibleInstance(thrown, errorLike) {
    return errorLike instanceof Error && thrown === errorLike;
}
function compatibleConstructor(thrown, errorLike) {
    if (errorLike instanceof Error) {
        return thrown.constructor === errorLike.constructor || thrown instanceof errorLike.constructor;
    } else if (errorLike.prototype instanceof Error || errorLike === Error) {
        return thrown.constructor === errorLike || thrown instanceof errorLike;
    }
    return false;
}
function compatibleMessage(thrown, errMatcher) {
    var comparisonString = typeof thrown === "string" ? thrown : thrown.message;
    if (errMatcher instanceof RegExp) {
        return errMatcher.test(comparisonString);
    } else if (typeof errMatcher === "string") {
        return comparisonString.indexOf(errMatcher) !== -1;
    }
    return false;
}
var functionNameMatch1 = /\s*function(?:\s|\s*\/\*[^(?:*\/)]+\*\/\s*)*([^\(\/]+)/;
function getFunctionName(constructorFn) {
    var name = "";
    if (typeof constructorFn.name === "undefined") {
        var match = String(constructorFn).match(functionNameMatch1);
        if (match) {
            name = match[1];
        }
    } else {
        name = constructorFn.name;
    }
    return name;
}
function getConstructorName(errorLike) {
    var constructorName = errorLike;
    if (errorLike instanceof Error) {
        constructorName = getFunctionName(errorLike.constructor);
    } else if (typeof errorLike === "function") {
        constructorName = getFunctionName(errorLike).trim() || getFunctionName(new errorLike());
    }
    return constructorName;
}
function getMessage(errorLike) {
    var msg13 = "";
    if (errorLike && errorLike.message) {
        msg13 = errorLike.message;
    } else if (typeof errorLike === "string") {
        msg13 = errorLike;
    }
    return msg13;
}
var checkError = {
    compatibleInstance,
    compatibleConstructor,
    compatibleMessage,
    getMessage,
    getConstructorName
};
checkError.compatibleConstructor;
checkError.compatibleInstance;
checkError.compatibleMessage;
checkError.getConstructorName;
checkError.getMessage;
function createCommonjsModule1(fn, basedir, module) {
    return module = {
        path: basedir,
        exports: {},
        require: function(path10, base) {
            return commonjsRequire1(path10, base === void 0 || base === null ? module.path : base);
        }
    }, fn(module, module.exports), module.exports;
}
function commonjsRequire1() {
    throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}
var flag = function flag2(obj, key28, value) {
    var flags = obj.__flags || (obj.__flags = Object.create(null));
    if (arguments.length === 3) {
        flags[key28] = value;
    } else {
        return flags[key28];
    }
};
var test = function test2(obj, args11) {
    var negate = flag(obj, "negate"), expr = args11[0];
    return negate ? !expr : expr;
};
var expectTypes = function expectTypes2(obj, types1) {
    var flagMsg = flag(obj, "message");
    var ssfi = flag(obj, "ssfi");
    flagMsg = flagMsg ? flagMsg + ": " : "";
    obj = flag(obj, "object");
    types1 = types1.map(function(t) {
        return t.toLowerCase();
    });
    types1.sort();
    var str = types1.map(function(t, index) {
        var art = ~[
            "a",
            "e",
            "i",
            "o",
            "u"
        ].indexOf(t.charAt(0)) ? "an" : "a";
        var or = types1.length > 1 && index === types1.length - 1 ? "or " : "";
        return or + art + " " + t;
    }).join(", ");
    var objType = typeDetect(obj).toLowerCase();
    if (!types1.some(function(expected) {
        return objType === expected;
    })) {
        throw new assertionError(flagMsg + "object tested must be " + str + ", but " + objType + " given", void 0, ssfi);
    }
};
var getActual = function getActual2(obj, args12) {
    return args12.length > 4 ? args12[4] : obj._obj;
};
var getProperties = function getProperties2(object) {
    var result = Object.getOwnPropertyNames(object);
    function addProperty3(property) {
        if (result.indexOf(property) === -1) {
            result.push(property);
        }
    }
    var proto = Object.getPrototypeOf(object);
    while(proto !== null){
        Object.getOwnPropertyNames(proto).forEach(addProperty3);
        proto = Object.getPrototypeOf(proto);
    }
    return result;
};
var getEnumerableProperties = function getEnumerableProperties2(object) {
    var result = [];
    for(var name in object){
        result.push(name);
    }
    return result;
};
var config1 = {
    includeStack: false,
    showDiff: true,
    truncateThreshold: 40,
    useProxy: true,
    proxyExcludedKeys: [
        "then",
        "catch",
        "inspect",
        "toJSON"
    ]
};
var inspect_1 = createCommonjsModule1(function(module, exports) {
    module.exports = inspect2;
    function inspect2(obj, showHidden, depth, colors) {
        var ctx = {
            showHidden,
            seen: [],
            stylize: function(str) {
                return str;
            }
        };
        return formatValue(ctx, obj, typeof depth === "undefined" ? 2 : depth);
    }
    var isDOMElement = function(object) {
        if (typeof HTMLElement === "object") {
            return object instanceof HTMLElement;
        } else {
            return object && typeof object === "object" && "nodeType" in object && object.nodeType === 1 && typeof object.nodeName === "string";
        }
    };
    function formatValue(ctx, value, recurseTimes) {
        if (value && typeof value.inspect === "function" && value.inspect !== exports.inspect && !(value.constructor && value.constructor.prototype === value)) {
            var ret = value.inspect(recurseTimes, ctx);
            if (typeof ret !== "string") {
                ret = formatValue(ctx, ret, recurseTimes);
            }
            return ret;
        }
        var primitive = formatPrimitive(ctx, value);
        if (primitive) {
            return primitive;
        }
        if (isDOMElement(value)) {
            if ("outerHTML" in value) {
                return value.outerHTML;
            } else {
                try {
                    if (document.xmlVersion) {
                        var xmlSerializer = new XMLSerializer();
                        return xmlSerializer.serializeToString(value);
                    } else {
                        var ns = "http://www.w3.org/1999/xhtml";
                        var container = document.createElementNS(ns, "_");
                        container.appendChild(value.cloneNode(false));
                        var html = container.innerHTML.replace("><", ">" + value.innerHTML + "<");
                        container.innerHTML = "";
                        return html;
                    }
                } catch (err) {}
            }
        }
        var visibleKeys = getEnumerableProperties(value);
        var keys = ctx.showHidden ? getProperties(value) : visibleKeys;
        var name, nameSuffix;
        if (keys.length === 0 || isError(value) && (keys.length === 1 && keys[0] === "stack" || keys.length === 2 && keys[0] === "description" && keys[1] === "stack")) {
            if (typeof value === "function") {
                name = getFuncName_1(value);
                nameSuffix = name ? ": " + name : "";
                return ctx.stylize("[Function" + nameSuffix + "]", "special");
            }
            if (isRegExp(value)) {
                return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
            }
            if (isDate(value)) {
                return ctx.stylize(Date.prototype.toUTCString.call(value), "date");
            }
            if (isError(value)) {
                return formatError(value);
            }
        }
        var base = "", array = false, typedArray = false, braces = [
            "{",
            "}"
        ];
        if (isTypedArray(value)) {
            typedArray = true;
            braces = [
                "[",
                "]"
            ];
        }
        if (isArray(value)) {
            array = true;
            braces = [
                "[",
                "]"
            ];
        }
        if (typeof value === "function") {
            name = getFuncName_1(value);
            nameSuffix = name ? ": " + name : "";
            base = " [Function" + nameSuffix + "]";
        }
        if (isRegExp(value)) {
            base = " " + RegExp.prototype.toString.call(value);
        }
        if (isDate(value)) {
            base = " " + Date.prototype.toUTCString.call(value);
        }
        if (isError(value)) {
            return formatError(value);
        }
        if (keys.length === 0 && (!array || value.length == 0)) {
            return braces[0] + base + braces[1];
        }
        if (recurseTimes < 0) {
            if (isRegExp(value)) {
                return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
            } else {
                return ctx.stylize("[Object]", "special");
            }
        }
        ctx.seen.push(value);
        var output;
        if (array) {
            output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
        } else if (typedArray) {
            return formatTypedArray(value);
        } else {
            output = keys.map(function(key29) {
                return formatProperty(ctx, value, recurseTimes, visibleKeys, key29, array);
            });
        }
        ctx.seen.pop();
        return reduceToSingleString(output, base, braces);
    }
    function formatPrimitive(ctx, value) {
        switch(typeof value){
            case "undefined":
                return ctx.stylize("undefined", "undefined");
            case "string":
                var simple = "'" + JSON.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
                return ctx.stylize(simple, "string");
            case "number":
                if (value === 0 && 1 / value === -Infinity) {
                    return ctx.stylize("-0", "number");
                }
                return ctx.stylize("" + value, "number");
            case "boolean":
                return ctx.stylize("" + value, "boolean");
            case "symbol":
                return ctx.stylize(value.toString(), "symbol");
            case "bigint":
                return ctx.stylize(value.toString() + "n", "bigint");
        }
        if (value === null) {
            return ctx.stylize("null", "null");
        }
    }
    function formatError(value) {
        return "[" + Error.prototype.toString.call(value) + "]";
    }
    function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
        var output = [];
        for(var i = 0, l = value.length; i < l; ++i){
            if (Object.prototype.hasOwnProperty.call(value, String(i))) {
                output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true));
            } else {
                output.push("");
            }
        }
        keys.forEach(function(key30) {
            if (!key30.match(/^\d+$/)) {
                output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key30, true));
            }
        });
        return output;
    }
    function formatTypedArray(value) {
        var str = "[ ";
        for(var i = 0; i < value.length; ++i){
            if (str.length >= config1.truncateThreshold - 7) {
                str += "...";
                break;
            }
            str += value[i] + ", ";
        }
        str += " ]";
        if (str.indexOf(",  ]") !== -1) {
            str = str.replace(",  ]", " ]");
        }
        return str;
    }
    function formatProperty(ctx, value, recurseTimes, visibleKeys, key31, array) {
        var name;
        var propDescriptor = Object.getOwnPropertyDescriptor(value, key31);
        var str;
        if (propDescriptor) {
            if (propDescriptor.get) {
                if (propDescriptor.set) {
                    str = ctx.stylize("[Getter/Setter]", "special");
                } else {
                    str = ctx.stylize("[Getter]", "special");
                }
            } else {
                if (propDescriptor.set) {
                    str = ctx.stylize("[Setter]", "special");
                }
            }
        }
        if (visibleKeys.indexOf(key31) < 0) {
            name = "[" + key31 + "]";
        }
        if (!str) {
            if (ctx.seen.indexOf(value[key31]) < 0) {
                if (recurseTimes === null) {
                    str = formatValue(ctx, value[key31], null);
                } else {
                    str = formatValue(ctx, value[key31], recurseTimes - 1);
                }
                if (str.indexOf("\n") > -1) {
                    if (array) {
                        str = str.split("\n").map(function(line) {
                            return "  " + line;
                        }).join("\n").substr(2);
                    } else {
                        str = "\n" + str.split("\n").map(function(line) {
                            return "   " + line;
                        }).join("\n");
                    }
                }
            } else {
                str = ctx.stylize("[Circular]", "special");
            }
        }
        if (typeof name === "undefined") {
            if (array && key31.match(/^\d+$/)) {
                return str;
            }
            name = JSON.stringify("" + key31);
            if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                name = name.substr(1, name.length - 2);
                name = ctx.stylize(name, "name");
            } else {
                name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
                name = ctx.stylize(name, "string");
            }
        }
        return name + ": " + str;
    }
    function reduceToSingleString(output, base, braces) {
        var length = output.reduce(function(prev, cur) {
            return prev + cur.length + 1;
        }, 0);
        if (length > 60) {
            return braces[0] + (base === "" ? "" : base + "\n ") + " " + output.join(",\n  ") + " " + braces[1];
        }
        return braces[0] + base + " " + output.join(", ") + " " + braces[1];
    }
    function isTypedArray(ar) {
        return typeof ar === "object" && /\w+Array]$/.test(objectToString(ar));
    }
    function isArray(ar) {
        return Array.isArray(ar) || typeof ar === "object" && objectToString(ar) === "[object Array]";
    }
    function isRegExp(re) {
        return typeof re === "object" && objectToString(re) === "[object RegExp]";
    }
    function isDate(d) {
        return typeof d === "object" && objectToString(d) === "[object Date]";
    }
    function isError(e) {
        return typeof e === "object" && objectToString(e) === "[object Error]";
    }
    function objectToString(o) {
        return Object.prototype.toString.call(o);
    }
});
var objDisplay = function objDisplay2(obj) {
    var str = inspect_1(obj), type2 = Object.prototype.toString.call(obj);
    if (config1.truncateThreshold && str.length >= config1.truncateThreshold) {
        if (type2 === "[object Function]") {
            return !obj.name || obj.name === "" ? "[Function]" : "[Function: " + obj.name + "]";
        } else if (type2 === "[object Array]") {
            return "[ Array(" + obj.length + ") ]";
        } else if (type2 === "[object Object]") {
            var keys = Object.keys(obj), kstr = keys.length > 2 ? keys.splice(0, 2).join(", ") + ", ..." : keys.join(", ");
            return "{ Object (" + kstr + ") }";
        } else {
            return str;
        }
    } else {
        return str;
    }
};
var getMessage1 = function getMessage2(obj, args13) {
    var negate = flag(obj, "negate"), val = flag(obj, "object"), expected = args13[3], actual = getActual(obj, args13), msg14 = negate ? args13[2] : args13[1], flagMsg = flag(obj, "message");
    if (typeof msg14 === "function") msg14 = msg14();
    msg14 = msg14 || "";
    msg14 = msg14.replace(/#\{this\}/g, function() {
        return objDisplay(val);
    }).replace(/#\{act\}/g, function() {
        return objDisplay(actual);
    }).replace(/#\{exp\}/g, function() {
        return objDisplay(expected);
    });
    return flagMsg ? flagMsg + ": " + msg14 : msg14;
};
var transferFlags = function transferFlags2(assertion2, object, includeAll) {
    var flags = assertion2.__flags || (assertion2.__flags = Object.create(null));
    if (!object.__flags) {
        object.__flags = Object.create(null);
    }
    includeAll = arguments.length === 3 ? includeAll : true;
    for(var flag3 in flags){
        if (includeAll || flag3 !== "object" && flag3 !== "ssfi" && flag3 !== "lockSsfi" && flag3 != "message") {
            object.__flags[flag3] = flags[flag3];
        }
    }
};
var isProxyEnabled = function isProxyEnabled2() {
    return config1.useProxy && typeof Proxy !== "undefined" && typeof Reflect !== "undefined";
};
var addProperty = function addProperty2(ctx, name, getter) {
    getter = getter === void 0 ? function() {} : getter;
    Object.defineProperty(ctx, name, {
        get: function propertyGetter() {
            if (!isProxyEnabled() && !flag(this, "lockSsfi")) {
                flag(this, "ssfi", propertyGetter);
            }
            var result = getter.call(this);
            if (result !== void 0) return result;
            var newAssertion = new chai.Assertion();
            transferFlags(this, newAssertion);
            return newAssertion;
        },
        configurable: true
    });
};
var fnLengthDesc = Object.getOwnPropertyDescriptor(function() {}, "length");
var addLengthGuard = function addLengthGuard2(fn, assertionName, isChainable) {
    if (!fnLengthDesc.configurable) return fn;
    Object.defineProperty(fn, "length", {
        get: function() {
            if (isChainable) {
                throw Error("Invalid Chai property: " + assertionName + '.length. Due to a compatibility issue, "length" cannot directly follow "' + assertionName + '". Use "' + assertionName + '.lengthOf" instead.');
            }
            throw Error("Invalid Chai property: " + assertionName + '.length. See docs for proper usage of "' + assertionName + '".');
        }
    });
    return fn;
};
var builtins = [
    "__flags",
    "__methods",
    "_obj",
    "assert"
];
var proxify = function proxify2(obj, nonChainableMethodName) {
    if (!isProxyEnabled()) return obj;
    return new Proxy(obj, {
        get: function proxyGetter(target, property) {
            if (typeof property === "string" && config1.proxyExcludedKeys.indexOf(property) === -1 && !Reflect.has(target, property)) {
                if (nonChainableMethodName) {
                    throw Error("Invalid Chai property: " + nonChainableMethodName + "." + property + '. See docs for proper usage of "' + nonChainableMethodName + '".');
                }
                var suggestion = null;
                var suggestionDistance = 4;
                getProperties(target).forEach(function(prop) {
                    if (!Object.prototype.hasOwnProperty(prop) && builtins.indexOf(prop) === -1) {
                        var dist = stringDistanceCapped(property, prop, suggestionDistance);
                        if (dist < suggestionDistance) {
                            suggestion = prop;
                            suggestionDistance = dist;
                        }
                    }
                });
                if (suggestion !== null) {
                    throw Error("Invalid Chai property: " + property + '. Did you mean "' + suggestion + '"?');
                } else {
                    throw Error("Invalid Chai property: " + property);
                }
            }
            if (builtins.indexOf(property) === -1 && !flag(target, "lockSsfi")) {
                flag(target, "ssfi", proxyGetter);
            }
            return Reflect.get(target, property);
        }
    });
};
function stringDistanceCapped(strA, strB, cap) {
    if (Math.abs(strA.length - strB.length) >= cap) {
        return cap;
    }
    var memo = [];
    for(var i = 0; i <= strA.length; i++){
        memo[i] = Array(strB.length + 1).fill(0);
        memo[i][0] = i;
    }
    for(var j = 0; j < strB.length; j++){
        memo[0][j] = j;
    }
    for(var i = 1; i <= strA.length; i++){
        var ch = strA.charCodeAt(i - 1);
        for(var j = 1; j <= strB.length; j++){
            if (Math.abs(i - j) >= cap) {
                memo[i][j] = cap;
                continue;
            }
            memo[i][j] = Math.min(memo[i - 1][j] + 1, memo[i][j - 1] + 1, memo[i - 1][j - 1] + (ch === strB.charCodeAt(j - 1) ? 0 : 1));
        }
    }
    return memo[strA.length][strB.length];
}
var addMethod = function addMethod2(ctx, name, method) {
    var methodWrapper = function() {
        if (!flag(this, "lockSsfi")) {
            flag(this, "ssfi", methodWrapper);
        }
        var result = method.apply(this, arguments);
        if (result !== void 0) return result;
        var newAssertion = new chai.Assertion();
        transferFlags(this, newAssertion);
        return newAssertion;
    };
    addLengthGuard(methodWrapper, name, false);
    ctx[name] = proxify(methodWrapper, name);
};
var overwriteProperty = function overwriteProperty2(ctx, name, getter) {
    var _get = Object.getOwnPropertyDescriptor(ctx, name), _super = function() {};
    if (_get && typeof _get.get === "function") _super = _get.get;
    Object.defineProperty(ctx, name, {
        get: function overwritingPropertyGetter() {
            if (!isProxyEnabled() && !flag(this, "lockSsfi")) {
                flag(this, "ssfi", overwritingPropertyGetter);
            }
            var origLockSsfi = flag(this, "lockSsfi");
            flag(this, "lockSsfi", true);
            var result = getter(_super).call(this);
            flag(this, "lockSsfi", origLockSsfi);
            if (result !== void 0) {
                return result;
            }
            var newAssertion = new chai.Assertion();
            transferFlags(this, newAssertion);
            return newAssertion;
        },
        configurable: true
    });
};
var overwriteMethod = function overwriteMethod2(ctx, name, method) {
    var _method = ctx[name], _super = function() {
        throw new Error(name + " is not a function");
    };
    if (_method && typeof _method === "function") _super = _method;
    var overwritingMethodWrapper = function() {
        if (!flag(this, "lockSsfi")) {
            flag(this, "ssfi", overwritingMethodWrapper);
        }
        var origLockSsfi = flag(this, "lockSsfi");
        flag(this, "lockSsfi", true);
        var result = method(_super).apply(this, arguments);
        flag(this, "lockSsfi", origLockSsfi);
        if (result !== void 0) {
            return result;
        }
        var newAssertion = new chai.Assertion();
        transferFlags(this, newAssertion);
        return newAssertion;
    };
    addLengthGuard(overwritingMethodWrapper, name, false);
    ctx[name] = proxify(overwritingMethodWrapper, name);
};
var canSetPrototype = typeof Object.setPrototypeOf === "function";
var testFn = function() {};
var excludeNames = Object.getOwnPropertyNames(testFn).filter(function(name) {
    var propDesc = Object.getOwnPropertyDescriptor(testFn, name);
    if (typeof propDesc !== "object") return true;
    return !propDesc.configurable;
});
var call = Function.prototype.call, apply = Function.prototype.apply;
var addChainableMethod = function addChainableMethod2(ctx, name, method, chainingBehavior) {
    if (typeof chainingBehavior !== "function") {
        chainingBehavior = function() {};
    }
    var chainableBehavior = {
        method,
        chainingBehavior
    };
    if (!ctx.__methods) {
        ctx.__methods = {};
    }
    ctx.__methods[name] = chainableBehavior;
    Object.defineProperty(ctx, name, {
        get: function chainableMethodGetter() {
            chainableBehavior.chainingBehavior.call(this);
            var chainableMethodWrapper = function() {
                if (!flag(this, "lockSsfi")) {
                    flag(this, "ssfi", chainableMethodWrapper);
                }
                var result = chainableBehavior.method.apply(this, arguments);
                if (result !== void 0) {
                    return result;
                }
                var newAssertion = new chai.Assertion();
                transferFlags(this, newAssertion);
                return newAssertion;
            };
            addLengthGuard(chainableMethodWrapper, name, true);
            if (canSetPrototype) {
                var prototype = Object.create(this);
                prototype.call = call;
                prototype.apply = apply;
                Object.setPrototypeOf(chainableMethodWrapper, prototype);
            } else {
                var asserterNames = Object.getOwnPropertyNames(ctx);
                asserterNames.forEach(function(asserterName) {
                    if (excludeNames.indexOf(asserterName) !== -1) {
                        return;
                    }
                    var pd = Object.getOwnPropertyDescriptor(ctx, asserterName);
                    Object.defineProperty(chainableMethodWrapper, asserterName, pd);
                });
            }
            transferFlags(this, chainableMethodWrapper);
            return proxify(chainableMethodWrapper);
        },
        configurable: true
    });
};
var overwriteChainableMethod = function overwriteChainableMethod2(ctx, name, method, chainingBehavior) {
    var chainableBehavior = ctx.__methods[name];
    var _chainingBehavior = chainableBehavior.chainingBehavior;
    chainableBehavior.chainingBehavior = function overwritingChainableMethodGetter() {
        var result = chainingBehavior(_chainingBehavior).call(this);
        if (result !== void 0) {
            return result;
        }
        var newAssertion = new chai.Assertion();
        transferFlags(this, newAssertion);
        return newAssertion;
    };
    var _method = chainableBehavior.method;
    chainableBehavior.method = function overwritingChainableMethodWrapper() {
        var result = method(_method).apply(this, arguments);
        if (result !== void 0) {
            return result;
        }
        var newAssertion = new chai.Assertion();
        transferFlags(this, newAssertion);
        return newAssertion;
    };
};
var compareByInspect = function compareByInspect2(a, b) {
    return inspect_1(a) < inspect_1(b) ? -1 : 1;
};
var getOwnEnumerablePropertySymbols = function getOwnEnumerablePropertySymbols2(obj) {
    if (typeof Object.getOwnPropertySymbols !== "function") return [];
    return Object.getOwnPropertySymbols(obj).filter(function(sym) {
        return Object.getOwnPropertyDescriptor(obj, sym).enumerable;
    });
};
var getOwnEnumerableProperties = function getOwnEnumerableProperties2(obj) {
    return Object.keys(obj).concat(getOwnEnumerablePropertySymbols(obj));
};
function isNaN1(value) {
    return value !== value;
}
var _isNaN = Number.isNaN || isNaN1;
function isObjectType(obj) {
    var objectType = typeDetect(obj);
    var objectTypes = [
        "Array",
        "Object",
        "function"
    ];
    return objectTypes.indexOf(objectType) !== -1;
}
var getOperator = function getOperator2(obj, args14) {
    var operator = flag(obj, "operator");
    var negate = flag(obj, "negate");
    var expected = args14[3];
    var msg15 = negate ? args14[2] : args14[1];
    if (operator) {
        return operator;
    }
    if (typeof msg15 === "function") msg15 = msg15();
    msg15 = msg15 || "";
    if (!msg15) {
        return void 0;
    }
    if (/\shave\s/.test(msg15)) {
        return void 0;
    }
    var isObject = isObjectType(expected);
    if (/\snot\s/.test(msg15)) {
        return isObject ? "notDeepStrictEqual" : "notStrictEqual";
    }
    return isObject ? "deepStrictEqual" : "strictEqual";
};
var test$1 = test;
var type = typeDetect;
var expectTypes$1 = expectTypes;
var getMessage$1 = getMessage1;
var getActual$1 = getActual;
var inspect = inspect_1;
var objDisplay$1 = objDisplay;
var flag$1 = flag;
var transferFlags$1 = transferFlags;
var eql = deepEql;
var getPathInfo1 = pathval.getPathInfo;
var hasProperty1 = pathval.hasProperty;
var getName = getFuncName_1;
var addProperty$1 = addProperty;
var addMethod$1 = addMethod;
var overwriteProperty$1 = overwriteProperty;
var overwriteMethod$1 = overwriteMethod;
var addChainableMethod$1 = addChainableMethod;
var overwriteChainableMethod$1 = overwriteChainableMethod;
var compareByInspect$1 = compareByInspect;
var getOwnEnumerablePropertySymbols$1 = getOwnEnumerablePropertySymbols;
var getOwnEnumerableProperties$1 = getOwnEnumerableProperties;
var checkError1 = checkError;
var proxify$1 = proxify;
var addLengthGuard$1 = addLengthGuard;
var isProxyEnabled$1 = isProxyEnabled;
var _isNaN$1 = _isNaN;
var getOperator$1 = getOperator;
var utils = {
    test: test$1,
    type,
    expectTypes: expectTypes$1,
    getMessage: getMessage$1,
    getActual: getActual$1,
    inspect,
    objDisplay: objDisplay$1,
    flag: flag$1,
    transferFlags: transferFlags$1,
    eql,
    getPathInfo: getPathInfo1,
    hasProperty: hasProperty1,
    getName,
    addProperty: addProperty$1,
    addMethod: addMethod$1,
    overwriteProperty: overwriteProperty$1,
    overwriteMethod: overwriteMethod$1,
    addChainableMethod: addChainableMethod$1,
    overwriteChainableMethod: overwriteChainableMethod$1,
    compareByInspect: compareByInspect$1,
    getOwnEnumerablePropertySymbols: getOwnEnumerablePropertySymbols$1,
    getOwnEnumerableProperties: getOwnEnumerableProperties$1,
    checkError: checkError1,
    proxify: proxify$1,
    addLengthGuard: addLengthGuard$1,
    isProxyEnabled: isProxyEnabled$1,
    isNaN: _isNaN$1,
    getOperator: getOperator$1
};
var assertion = function(_chai, util2) {
    var AssertionError2 = _chai.AssertionError, flag3 = util2.flag;
    _chai.Assertion = Assertion2;
    function Assertion2(obj, msg16, ssfi, lockSsfi) {
        flag3(this, "ssfi", ssfi || Assertion2);
        flag3(this, "lockSsfi", lockSsfi);
        flag3(this, "object", obj);
        flag3(this, "message", msg16);
        return util2.proxify(this);
    }
    Object.defineProperty(Assertion2, "includeStack", {
        get: function() {
            console.warn("Assertion.includeStack is deprecated, use chai.config.includeStack instead.");
            return config1.includeStack;
        },
        set: function(value) {
            console.warn("Assertion.includeStack is deprecated, use chai.config.includeStack instead.");
            config1.includeStack = value;
        }
    });
    Object.defineProperty(Assertion2, "showDiff", {
        get: function() {
            console.warn("Assertion.showDiff is deprecated, use chai.config.showDiff instead.");
            return config1.showDiff;
        },
        set: function(value) {
            console.warn("Assertion.showDiff is deprecated, use chai.config.showDiff instead.");
            config1.showDiff = value;
        }
    });
    Assertion2.addProperty = function(name, fn) {
        util2.addProperty(this.prototype, name, fn);
    };
    Assertion2.addMethod = function(name, fn) {
        util2.addMethod(this.prototype, name, fn);
    };
    Assertion2.addChainableMethod = function(name, fn, chainingBehavior) {
        util2.addChainableMethod(this.prototype, name, fn, chainingBehavior);
    };
    Assertion2.overwriteProperty = function(name, fn) {
        util2.overwriteProperty(this.prototype, name, fn);
    };
    Assertion2.overwriteMethod = function(name, fn) {
        util2.overwriteMethod(this.prototype, name, fn);
    };
    Assertion2.overwriteChainableMethod = function(name, fn, chainingBehavior) {
        util2.overwriteChainableMethod(this.prototype, name, fn, chainingBehavior);
    };
    Assertion2.prototype.assert = function(expr, msg17, negateMsg, expected, _actual, showDiff) {
        var ok = util2.test(this, arguments);
        if (showDiff !== false) showDiff = true;
        if (expected === void 0 && _actual === void 0) showDiff = false;
        if (config1.showDiff !== true) showDiff = false;
        if (!ok) {
            msg17 = util2.getMessage(this, arguments);
            var actual = util2.getActual(this, arguments);
            var assertionErrorObjectProperties = {
                actual,
                expected,
                showDiff
            };
            var operator = util2.getOperator(this, arguments);
            if (operator) {
                assertionErrorObjectProperties.operator = operator;
            }
            throw new AssertionError2(msg17, assertionErrorObjectProperties, config1.includeStack ? this.assert : flag3(this, "ssfi"));
        }
    };
    Object.defineProperty(Assertion2.prototype, "_obj", {
        get: function() {
            return flag3(this, "object");
        },
        set: function(val) {
            flag3(this, "object", val);
        }
    });
};
var assertions = function(chai2, _) {
    var Assertion2 = chai2.Assertion, AssertionError2 = chai2.AssertionError, flag3 = _.flag;
    [
        "to",
        "be",
        "been",
        "is",
        "and",
        "has",
        "have",
        "with",
        "that",
        "which",
        "at",
        "of",
        "same",
        "but",
        "does",
        "still",
        "also"
    ].forEach(function(chain) {
        Assertion2.addProperty(chain);
    });
    Assertion2.addProperty("not", function() {
        flag3(this, "negate", true);
    });
    Assertion2.addProperty("deep", function() {
        flag3(this, "deep", true);
    });
    Assertion2.addProperty("nested", function() {
        flag3(this, "nested", true);
    });
    Assertion2.addProperty("own", function() {
        flag3(this, "own", true);
    });
    Assertion2.addProperty("ordered", function() {
        flag3(this, "ordered", true);
    });
    Assertion2.addProperty("any", function() {
        flag3(this, "any", true);
        flag3(this, "all", false);
    });
    Assertion2.addProperty("all", function() {
        flag3(this, "all", true);
        flag3(this, "any", false);
    });
    function an(type2, msg18) {
        if (msg18) flag3(this, "message", msg18);
        type2 = type2.toLowerCase();
        var obj = flag3(this, "object"), article = ~[
            "a",
            "e",
            "i",
            "o",
            "u"
        ].indexOf(type2.charAt(0)) ? "an " : "a ";
        this.assert(type2 === _.type(obj).toLowerCase(), "expected #{this} to be " + article + type2, "expected #{this} not to be " + article + type2);
    }
    Assertion2.addChainableMethod("an", an);
    Assertion2.addChainableMethod("a", an);
    function SameValueZero(a, b) {
        return _.isNaN(a) && _.isNaN(b) || a === b;
    }
    function includeChainingBehavior() {
        flag3(this, "contains", true);
    }
    function include(val, msg19) {
        if (msg19) flag3(this, "message", msg19);
        var obj = flag3(this, "object"), objType = _.type(obj).toLowerCase(), flagMsg = flag3(this, "message"), negate = flag3(this, "negate"), ssfi = flag3(this, "ssfi"), isDeep = flag3(this, "deep"), descriptor = isDeep ? "deep " : "";
        flagMsg = flagMsg ? flagMsg + ": " : "";
        var included = false;
        switch(objType){
            case "string":
                included = obj.indexOf(val) !== -1;
                break;
            case "weakset":
                if (isDeep) {
                    throw new AssertionError2(flagMsg + "unable to use .deep.include with WeakSet", void 0, ssfi);
                }
                included = obj.has(val);
                break;
            case "map":
                var isEql = isDeep ? _.eql : SameValueZero;
                obj.forEach(function(item) {
                    included = included || isEql(item, val);
                });
                break;
            case "set":
                if (isDeep) {
                    obj.forEach(function(item) {
                        included = included || _.eql(item, val);
                    });
                } else {
                    included = obj.has(val);
                }
                break;
            case "array":
                if (isDeep) {
                    included = obj.some(function(item) {
                        return _.eql(item, val);
                    });
                } else {
                    included = obj.indexOf(val) !== -1;
                }
                break;
            default:
                if (val !== Object(val)) {
                    throw new AssertionError2(flagMsg + "the given combination of arguments (" + objType + " and " + _.type(val).toLowerCase() + ") is invalid for this assertion. You can use an array, a map, an object, a set, a string, or a weakset instead of a " + _.type(val).toLowerCase(), void 0, ssfi);
                }
                var props = Object.keys(val), firstErr = null, numErrs = 0;
                props.forEach(function(prop) {
                    var propAssertion = new Assertion2(obj);
                    _.transferFlags(this, propAssertion, true);
                    flag3(propAssertion, "lockSsfi", true);
                    if (!negate || props.length === 1) {
                        propAssertion.property(prop, val[prop]);
                        return;
                    }
                    try {
                        propAssertion.property(prop, val[prop]);
                    } catch (err) {
                        if (!_.checkError.compatibleConstructor(err, AssertionError2)) {
                            throw err;
                        }
                        if (firstErr === null) firstErr = err;
                        numErrs++;
                    }
                }, this);
                if (negate && props.length > 1 && numErrs === props.length) {
                    throw firstErr;
                }
                return;
        }
        this.assert(included, "expected #{this} to " + descriptor + "include " + _.inspect(val), "expected #{this} to not " + descriptor + "include " + _.inspect(val));
    }
    Assertion2.addChainableMethod("include", include, includeChainingBehavior);
    Assertion2.addChainableMethod("contain", include, includeChainingBehavior);
    Assertion2.addChainableMethod("contains", include, includeChainingBehavior);
    Assertion2.addChainableMethod("includes", include, includeChainingBehavior);
    Assertion2.addProperty("ok", function() {
        this.assert(flag3(this, "object"), "expected #{this} to be truthy", "expected #{this} to be falsy");
    });
    Assertion2.addProperty("true", function() {
        this.assert(flag3(this, "object") === true, "expected #{this} to be true", "expected #{this} to be false", flag3(this, "negate") ? false : true);
    });
    Assertion2.addProperty("false", function() {
        this.assert(flag3(this, "object") === false, "expected #{this} to be false", "expected #{this} to be true", flag3(this, "negate") ? true : false);
    });
    Assertion2.addProperty("null", function() {
        this.assert(flag3(this, "object") === null, "expected #{this} to be null", "expected #{this} not to be null");
    });
    Assertion2.addProperty("undefined", function() {
        this.assert(flag3(this, "object") === void 0, "expected #{this} to be undefined", "expected #{this} not to be undefined");
    });
    Assertion2.addProperty("NaN", function() {
        this.assert(_.isNaN(flag3(this, "object")), "expected #{this} to be NaN", "expected #{this} not to be NaN");
    });
    function assertExist() {
        var val = flag3(this, "object");
        this.assert(val !== null && val !== void 0, "expected #{this} to exist", "expected #{this} to not exist");
    }
    Assertion2.addProperty("exist", assertExist);
    Assertion2.addProperty("exists", assertExist);
    Assertion2.addProperty("empty", function() {
        var val = flag3(this, "object"), ssfi = flag3(this, "ssfi"), flagMsg = flag3(this, "message"), itemsCount;
        flagMsg = flagMsg ? flagMsg + ": " : "";
        switch(_.type(val).toLowerCase()){
            case "array":
            case "string":
                itemsCount = val.length;
                break;
            case "map":
            case "set":
                itemsCount = val.size;
                break;
            case "weakmap":
            case "weakset":
                throw new AssertionError2(flagMsg + ".empty was passed a weak collection", void 0, ssfi);
            case "function":
                var msg20 = flagMsg + ".empty was passed a function " + _.getName(val);
                throw new AssertionError2(msg20.trim(), void 0, ssfi);
            default:
                if (val !== Object(val)) {
                    throw new AssertionError2(flagMsg + ".empty was passed non-string primitive " + _.inspect(val), void 0, ssfi);
                }
                itemsCount = Object.keys(val).length;
        }
        this.assert(itemsCount === 0, "expected #{this} to be empty", "expected #{this} not to be empty");
    });
    function checkArguments() {
        var obj = flag3(this, "object"), type2 = _.type(obj);
        this.assert(type2 === "Arguments", "expected #{this} to be arguments but got " + type2, "expected #{this} to not be arguments");
    }
    Assertion2.addProperty("arguments", checkArguments);
    Assertion2.addProperty("Arguments", checkArguments);
    function assertEqual(val, msg21) {
        if (msg21) flag3(this, "message", msg21);
        var obj = flag3(this, "object");
        if (flag3(this, "deep")) {
            var prevLockSsfi = flag3(this, "lockSsfi");
            flag3(this, "lockSsfi", true);
            this.eql(val);
            flag3(this, "lockSsfi", prevLockSsfi);
        } else {
            this.assert(val === obj, "expected #{this} to equal #{exp}", "expected #{this} to not equal #{exp}", val, this._obj, true);
        }
    }
    Assertion2.addMethod("equal", assertEqual);
    Assertion2.addMethod("equals", assertEqual);
    Assertion2.addMethod("eq", assertEqual);
    function assertEql(obj, msg22) {
        if (msg22) flag3(this, "message", msg22);
        this.assert(_.eql(obj, flag3(this, "object")), "expected #{this} to deeply equal #{exp}", "expected #{this} to not deeply equal #{exp}", obj, this._obj, true);
    }
    Assertion2.addMethod("eql", assertEql);
    Assertion2.addMethod("eqls", assertEql);
    function assertAbove(n, msg23) {
        if (msg23) flag3(this, "message", msg23);
        var obj = flag3(this, "object"), doLength = flag3(this, "doLength"), flagMsg = flag3(this, "message"), msgPrefix = flagMsg ? flagMsg + ": " : "", ssfi = flag3(this, "ssfi"), objType = _.type(obj).toLowerCase(), nType = _.type(n).toLowerCase(), errorMessage, shouldThrow = true;
        if (doLength && objType !== "map" && objType !== "set") {
            new Assertion2(obj, flagMsg, ssfi, true).to.have.property("length");
        }
        if (!doLength && objType === "date" && nType !== "date") {
            errorMessage = msgPrefix + "the argument to above must be a date";
        } else if (nType !== "number" && (doLength || objType === "number")) {
            errorMessage = msgPrefix + "the argument to above must be a number";
        } else if (!doLength && objType !== "date" && objType !== "number") {
            var printObj = objType === "string" ? "'" + obj + "'" : obj;
            errorMessage = msgPrefix + "expected " + printObj + " to be a number or a date";
        } else {
            shouldThrow = false;
        }
        if (shouldThrow) {
            throw new AssertionError2(errorMessage, void 0, ssfi);
        }
        if (doLength) {
            var descriptor = "length", itemsCount;
            if (objType === "map" || objType === "set") {
                descriptor = "size";
                itemsCount = obj.size;
            } else {
                itemsCount = obj.length;
            }
            this.assert(itemsCount > n, "expected #{this} to have a " + descriptor + " above #{exp} but got #{act}", "expected #{this} to not have a " + descriptor + " above #{exp}", n, itemsCount);
        } else {
            this.assert(obj > n, "expected #{this} to be above #{exp}", "expected #{this} to be at most #{exp}", n);
        }
    }
    Assertion2.addMethod("above", assertAbove);
    Assertion2.addMethod("gt", assertAbove);
    Assertion2.addMethod("greaterThan", assertAbove);
    function assertLeast(n, msg24) {
        if (msg24) flag3(this, "message", msg24);
        var obj = flag3(this, "object"), doLength = flag3(this, "doLength"), flagMsg = flag3(this, "message"), msgPrefix = flagMsg ? flagMsg + ": " : "", ssfi = flag3(this, "ssfi"), objType = _.type(obj).toLowerCase(), nType = _.type(n).toLowerCase(), errorMessage, shouldThrow = true;
        if (doLength && objType !== "map" && objType !== "set") {
            new Assertion2(obj, flagMsg, ssfi, true).to.have.property("length");
        }
        if (!doLength && objType === "date" && nType !== "date") {
            errorMessage = msgPrefix + "the argument to least must be a date";
        } else if (nType !== "number" && (doLength || objType === "number")) {
            errorMessage = msgPrefix + "the argument to least must be a number";
        } else if (!doLength && objType !== "date" && objType !== "number") {
            var printObj = objType === "string" ? "'" + obj + "'" : obj;
            errorMessage = msgPrefix + "expected " + printObj + " to be a number or a date";
        } else {
            shouldThrow = false;
        }
        if (shouldThrow) {
            throw new AssertionError2(errorMessage, void 0, ssfi);
        }
        if (doLength) {
            var descriptor = "length", itemsCount;
            if (objType === "map" || objType === "set") {
                descriptor = "size";
                itemsCount = obj.size;
            } else {
                itemsCount = obj.length;
            }
            this.assert(itemsCount >= n, "expected #{this} to have a " + descriptor + " at least #{exp} but got #{act}", "expected #{this} to have a " + descriptor + " below #{exp}", n, itemsCount);
        } else {
            this.assert(obj >= n, "expected #{this} to be at least #{exp}", "expected #{this} to be below #{exp}", n);
        }
    }
    Assertion2.addMethod("least", assertLeast);
    Assertion2.addMethod("gte", assertLeast);
    Assertion2.addMethod("greaterThanOrEqual", assertLeast);
    function assertBelow(n, msg25) {
        if (msg25) flag3(this, "message", msg25);
        var obj = flag3(this, "object"), doLength = flag3(this, "doLength"), flagMsg = flag3(this, "message"), msgPrefix = flagMsg ? flagMsg + ": " : "", ssfi = flag3(this, "ssfi"), objType = _.type(obj).toLowerCase(), nType = _.type(n).toLowerCase(), errorMessage, shouldThrow = true;
        if (doLength && objType !== "map" && objType !== "set") {
            new Assertion2(obj, flagMsg, ssfi, true).to.have.property("length");
        }
        if (!doLength && objType === "date" && nType !== "date") {
            errorMessage = msgPrefix + "the argument to below must be a date";
        } else if (nType !== "number" && (doLength || objType === "number")) {
            errorMessage = msgPrefix + "the argument to below must be a number";
        } else if (!doLength && objType !== "date" && objType !== "number") {
            var printObj = objType === "string" ? "'" + obj + "'" : obj;
            errorMessage = msgPrefix + "expected " + printObj + " to be a number or a date";
        } else {
            shouldThrow = false;
        }
        if (shouldThrow) {
            throw new AssertionError2(errorMessage, void 0, ssfi);
        }
        if (doLength) {
            var descriptor = "length", itemsCount;
            if (objType === "map" || objType === "set") {
                descriptor = "size";
                itemsCount = obj.size;
            } else {
                itemsCount = obj.length;
            }
            this.assert(itemsCount < n, "expected #{this} to have a " + descriptor + " below #{exp} but got #{act}", "expected #{this} to not have a " + descriptor + " below #{exp}", n, itemsCount);
        } else {
            this.assert(obj < n, "expected #{this} to be below #{exp}", "expected #{this} to be at least #{exp}", n);
        }
    }
    Assertion2.addMethod("below", assertBelow);
    Assertion2.addMethod("lt", assertBelow);
    Assertion2.addMethod("lessThan", assertBelow);
    function assertMost(n, msg26) {
        if (msg26) flag3(this, "message", msg26);
        var obj = flag3(this, "object"), doLength = flag3(this, "doLength"), flagMsg = flag3(this, "message"), msgPrefix = flagMsg ? flagMsg + ": " : "", ssfi = flag3(this, "ssfi"), objType = _.type(obj).toLowerCase(), nType = _.type(n).toLowerCase(), errorMessage, shouldThrow = true;
        if (doLength && objType !== "map" && objType !== "set") {
            new Assertion2(obj, flagMsg, ssfi, true).to.have.property("length");
        }
        if (!doLength && objType === "date" && nType !== "date") {
            errorMessage = msgPrefix + "the argument to most must be a date";
        } else if (nType !== "number" && (doLength || objType === "number")) {
            errorMessage = msgPrefix + "the argument to most must be a number";
        } else if (!doLength && objType !== "date" && objType !== "number") {
            var printObj = objType === "string" ? "'" + obj + "'" : obj;
            errorMessage = msgPrefix + "expected " + printObj + " to be a number or a date";
        } else {
            shouldThrow = false;
        }
        if (shouldThrow) {
            throw new AssertionError2(errorMessage, void 0, ssfi);
        }
        if (doLength) {
            var descriptor = "length", itemsCount;
            if (objType === "map" || objType === "set") {
                descriptor = "size";
                itemsCount = obj.size;
            } else {
                itemsCount = obj.length;
            }
            this.assert(itemsCount <= n, "expected #{this} to have a " + descriptor + " at most #{exp} but got #{act}", "expected #{this} to have a " + descriptor + " above #{exp}", n, itemsCount);
        } else {
            this.assert(obj <= n, "expected #{this} to be at most #{exp}", "expected #{this} to be above #{exp}", n);
        }
    }
    Assertion2.addMethod("most", assertMost);
    Assertion2.addMethod("lte", assertMost);
    Assertion2.addMethod("lessThanOrEqual", assertMost);
    Assertion2.addMethod("within", function(start, finish, msg27) {
        if (msg27) flag3(this, "message", msg27);
        var obj = flag3(this, "object"), doLength = flag3(this, "doLength"), flagMsg = flag3(this, "message"), msgPrefix = flagMsg ? flagMsg + ": " : "", ssfi = flag3(this, "ssfi"), objType = _.type(obj).toLowerCase(), startType = _.type(start).toLowerCase(), finishType = _.type(finish).toLowerCase(), errorMessage, shouldThrow = true, range = startType === "date" && finishType === "date" ? start.toUTCString() + ".." + finish.toUTCString() : start + ".." + finish;
        if (doLength && objType !== "map" && objType !== "set") {
            new Assertion2(obj, flagMsg, ssfi, true).to.have.property("length");
        }
        if (!doLength && objType === "date" && (startType !== "date" || finishType !== "date")) {
            errorMessage = msgPrefix + "the arguments to within must be dates";
        } else if ((startType !== "number" || finishType !== "number") && (doLength || objType === "number")) {
            errorMessage = msgPrefix + "the arguments to within must be numbers";
        } else if (!doLength && objType !== "date" && objType !== "number") {
            var printObj = objType === "string" ? "'" + obj + "'" : obj;
            errorMessage = msgPrefix + "expected " + printObj + " to be a number or a date";
        } else {
            shouldThrow = false;
        }
        if (shouldThrow) {
            throw new AssertionError2(errorMessage, void 0, ssfi);
        }
        if (doLength) {
            var descriptor = "length", itemsCount;
            if (objType === "map" || objType === "set") {
                descriptor = "size";
                itemsCount = obj.size;
            } else {
                itemsCount = obj.length;
            }
            this.assert(itemsCount >= start && itemsCount <= finish, "expected #{this} to have a " + descriptor + " within " + range, "expected #{this} to not have a " + descriptor + " within " + range);
        } else {
            this.assert(obj >= start && obj <= finish, "expected #{this} to be within " + range, "expected #{this} to not be within " + range);
        }
    });
    function assertInstanceOf(constructor, msg28) {
        if (msg28) flag3(this, "message", msg28);
        var target = flag3(this, "object");
        var ssfi = flag3(this, "ssfi");
        var flagMsg = flag3(this, "message");
        try {
            var isInstanceOf = target instanceof constructor;
        } catch (err) {
            if (err instanceof TypeError) {
                flagMsg = flagMsg ? flagMsg + ": " : "";
                throw new AssertionError2(flagMsg + "The instanceof assertion needs a constructor but " + _.type(constructor) + " was given.", void 0, ssfi);
            }
            throw err;
        }
        var name = _.getName(constructor);
        if (name === null) {
            name = "an unnamed constructor";
        }
        this.assert(isInstanceOf, "expected #{this} to be an instance of " + name, "expected #{this} to not be an instance of " + name);
    }
    Assertion2.addMethod("instanceof", assertInstanceOf);
    Assertion2.addMethod("instanceOf", assertInstanceOf);
    function assertProperty(name, val, msg29) {
        if (msg29) flag3(this, "message", msg29);
        var isNested = flag3(this, "nested"), isOwn = flag3(this, "own"), flagMsg = flag3(this, "message"), obj = flag3(this, "object"), ssfi = flag3(this, "ssfi"), nameType = typeof name;
        flagMsg = flagMsg ? flagMsg + ": " : "";
        if (isNested) {
            if (nameType !== "string") {
                throw new AssertionError2(flagMsg + "the argument to property must be a string when using nested syntax", void 0, ssfi);
            }
        } else {
            if (nameType !== "string" && nameType !== "number" && nameType !== "symbol") {
                throw new AssertionError2(flagMsg + "the argument to property must be a string, number, or symbol", void 0, ssfi);
            }
        }
        if (isNested && isOwn) {
            throw new AssertionError2(flagMsg + 'The "nested" and "own" flags cannot be combined.', void 0, ssfi);
        }
        if (obj === null || obj === void 0) {
            throw new AssertionError2(flagMsg + "Target cannot be null or undefined.", void 0, ssfi);
        }
        var isDeep = flag3(this, "deep"), negate = flag3(this, "negate"), pathInfo = isNested ? _.getPathInfo(obj, name) : null, value = isNested ? pathInfo.value : obj[name];
        var descriptor = "";
        if (isDeep) descriptor += "deep ";
        if (isOwn) descriptor += "own ";
        if (isNested) descriptor += "nested ";
        descriptor += "property ";
        var hasProperty2;
        if (isOwn) hasProperty2 = Object.prototype.hasOwnProperty.call(obj, name);
        else if (isNested) hasProperty2 = pathInfo.exists;
        else hasProperty2 = _.hasProperty(obj, name);
        if (!negate || arguments.length === 1) {
            this.assert(hasProperty2, "expected #{this} to have " + descriptor + _.inspect(name), "expected #{this} to not have " + descriptor + _.inspect(name));
        }
        if (arguments.length > 1) {
            this.assert(hasProperty2 && (isDeep ? _.eql(val, value) : val === value), "expected #{this} to have " + descriptor + _.inspect(name) + " of #{exp}, but got #{act}", "expected #{this} to not have " + descriptor + _.inspect(name) + " of #{act}", val, value);
        }
        flag3(this, "object", value);
    }
    Assertion2.addMethod("property", assertProperty);
    function assertOwnProperty(name, value, msg) {
        flag3(this, "own", true);
        assertProperty.apply(this, arguments);
    }
    Assertion2.addMethod("ownProperty", assertOwnProperty);
    Assertion2.addMethod("haveOwnProperty", assertOwnProperty);
    function assertOwnPropertyDescriptor(name, descriptor, msg30) {
        if (typeof descriptor === "string") {
            msg30 = descriptor;
            descriptor = null;
        }
        if (msg30) flag3(this, "message", msg30);
        var obj = flag3(this, "object");
        var actualDescriptor = Object.getOwnPropertyDescriptor(Object(obj), name);
        if (actualDescriptor && descriptor) {
            this.assert(_.eql(descriptor, actualDescriptor), "expected the own property descriptor for " + _.inspect(name) + " on #{this} to match " + _.inspect(descriptor) + ", got " + _.inspect(actualDescriptor), "expected the own property descriptor for " + _.inspect(name) + " on #{this} to not match " + _.inspect(descriptor), descriptor, actualDescriptor, true);
        } else {
            this.assert(actualDescriptor, "expected #{this} to have an own property descriptor for " + _.inspect(name), "expected #{this} to not have an own property descriptor for " + _.inspect(name));
        }
        flag3(this, "object", actualDescriptor);
    }
    Assertion2.addMethod("ownPropertyDescriptor", assertOwnPropertyDescriptor);
    Assertion2.addMethod("haveOwnPropertyDescriptor", assertOwnPropertyDescriptor);
    function assertLengthChain() {
        flag3(this, "doLength", true);
    }
    function assertLength(n, msg31) {
        if (msg31) flag3(this, "message", msg31);
        var obj = flag3(this, "object"), objType = _.type(obj).toLowerCase(), flagMsg = flag3(this, "message"), ssfi = flag3(this, "ssfi"), descriptor = "length", itemsCount;
        switch(objType){
            case "map":
            case "set":
                descriptor = "size";
                itemsCount = obj.size;
                break;
            default:
                new Assertion2(obj, flagMsg, ssfi, true).to.have.property("length");
                itemsCount = obj.length;
        }
        this.assert(itemsCount == n, "expected #{this} to have a " + descriptor + " of #{exp} but got #{act}", "expected #{this} to not have a " + descriptor + " of #{act}", n, itemsCount);
    }
    Assertion2.addChainableMethod("length", assertLength, assertLengthChain);
    Assertion2.addChainableMethod("lengthOf", assertLength, assertLengthChain);
    function assertMatch(re, msg32) {
        if (msg32) flag3(this, "message", msg32);
        var obj = flag3(this, "object");
        this.assert(re.exec(obj), "expected #{this} to match " + re, "expected #{this} not to match " + re);
    }
    Assertion2.addMethod("match", assertMatch);
    Assertion2.addMethod("matches", assertMatch);
    Assertion2.addMethod("string", function(str, msg33) {
        if (msg33) flag3(this, "message", msg33);
        var obj = flag3(this, "object"), flagMsg = flag3(this, "message"), ssfi = flag3(this, "ssfi");
        new Assertion2(obj, flagMsg, ssfi, true).is.a("string");
        this.assert(~obj.indexOf(str), "expected #{this} to contain " + _.inspect(str), "expected #{this} to not contain " + _.inspect(str));
    });
    function assertKeys(keys) {
        var obj = flag3(this, "object"), objType = _.type(obj), keysType = _.type(keys), ssfi = flag3(this, "ssfi"), isDeep = flag3(this, "deep"), str, deepStr = "", actual, ok = true, flagMsg = flag3(this, "message");
        flagMsg = flagMsg ? flagMsg + ": " : "";
        var mixedArgsMsg = flagMsg + "when testing keys against an object or an array you must give a single Array|Object|String argument or multiple String arguments";
        if (objType === "Map" || objType === "Set") {
            deepStr = isDeep ? "deeply " : "";
            actual = [];
            obj.forEach(function(val, key32) {
                actual.push(key32);
            });
            if (keysType !== "Array") {
                keys = Array.prototype.slice.call(arguments);
            }
        } else {
            actual = _.getOwnEnumerableProperties(obj);
            switch(keysType){
                case "Array":
                    if (arguments.length > 1) {
                        throw new AssertionError2(mixedArgsMsg, void 0, ssfi);
                    }
                    break;
                case "Object":
                    if (arguments.length > 1) {
                        throw new AssertionError2(mixedArgsMsg, void 0, ssfi);
                    }
                    keys = Object.keys(keys);
                    break;
                default:
                    keys = Array.prototype.slice.call(arguments);
            }
            keys = keys.map(function(val) {
                return typeof val === "symbol" ? val : String(val);
            });
        }
        if (!keys.length) {
            throw new AssertionError2(flagMsg + "keys required", void 0, ssfi);
        }
        var len = keys.length, any = flag3(this, "any"), all = flag3(this, "all"), expected = keys;
        if (!any && !all) {
            all = true;
        }
        if (any) {
            ok = expected.some(function(expectedKey) {
                return actual.some(function(actualKey) {
                    if (isDeep) {
                        return _.eql(expectedKey, actualKey);
                    } else {
                        return expectedKey === actualKey;
                    }
                });
            });
        }
        if (all) {
            ok = expected.every(function(expectedKey) {
                return actual.some(function(actualKey) {
                    if (isDeep) {
                        return _.eql(expectedKey, actualKey);
                    } else {
                        return expectedKey === actualKey;
                    }
                });
            });
            if (!flag3(this, "contains")) {
                ok = ok && keys.length == actual.length;
            }
        }
        if (len > 1) {
            keys = keys.map(function(key33) {
                return _.inspect(key33);
            });
            var last = keys.pop();
            if (all) {
                str = keys.join(", ") + ", and " + last;
            }
            if (any) {
                str = keys.join(", ") + ", or " + last;
            }
        } else {
            str = _.inspect(keys[0]);
        }
        str = (len > 1 ? "keys " : "key ") + str;
        str = (flag3(this, "contains") ? "contain " : "have ") + str;
        this.assert(ok, "expected #{this} to " + deepStr + str, "expected #{this} to not " + deepStr + str, expected.slice(0).sort(_.compareByInspect), actual.sort(_.compareByInspect), true);
    }
    Assertion2.addMethod("keys", assertKeys);
    Assertion2.addMethod("key", assertKeys);
    function assertThrows(errorLike, errMsgMatcher, msg34) {
        if (msg34) flag3(this, "message", msg34);
        var obj = flag3(this, "object"), ssfi = flag3(this, "ssfi"), flagMsg = flag3(this, "message"), negate = flag3(this, "negate") || false;
        new Assertion2(obj, flagMsg, ssfi, true).is.a("function");
        if (errorLike instanceof RegExp || typeof errorLike === "string") {
            errMsgMatcher = errorLike;
            errorLike = null;
        }
        var caughtErr;
        try {
            obj();
        } catch (err) {
            caughtErr = err;
        }
        var everyArgIsUndefined = errorLike === void 0 && errMsgMatcher === void 0;
        var everyArgIsDefined = Boolean(errorLike && errMsgMatcher);
        var errorLikeFail = false;
        var errMsgMatcherFail = false;
        if (everyArgIsUndefined || !everyArgIsUndefined && !negate) {
            var errorLikeString = "an error";
            if (errorLike instanceof Error) {
                errorLikeString = "#{exp}";
            } else if (errorLike) {
                errorLikeString = _.checkError.getConstructorName(errorLike);
            }
            this.assert(caughtErr, "expected #{this} to throw " + errorLikeString, "expected #{this} to not throw an error but #{act} was thrown", errorLike && errorLike.toString(), caughtErr instanceof Error ? caughtErr.toString() : typeof caughtErr === "string" ? caughtErr : caughtErr && _.checkError.getConstructorName(caughtErr));
        }
        if (errorLike && caughtErr) {
            if (errorLike instanceof Error) {
                var isCompatibleInstance = _.checkError.compatibleInstance(caughtErr, errorLike);
                if (isCompatibleInstance === negate) {
                    if (everyArgIsDefined && negate) {
                        errorLikeFail = true;
                    } else {
                        this.assert(negate, "expected #{this} to throw #{exp} but #{act} was thrown", "expected #{this} to not throw #{exp}" + (caughtErr && !negate ? " but #{act} was thrown" : ""), errorLike.toString(), caughtErr.toString());
                    }
                }
            }
            var isCompatibleConstructor = _.checkError.compatibleConstructor(caughtErr, errorLike);
            if (isCompatibleConstructor === negate) {
                if (everyArgIsDefined && negate) {
                    errorLikeFail = true;
                } else {
                    this.assert(negate, "expected #{this} to throw #{exp} but #{act} was thrown", "expected #{this} to not throw #{exp}" + (caughtErr ? " but #{act} was thrown" : ""), errorLike instanceof Error ? errorLike.toString() : errorLike && _.checkError.getConstructorName(errorLike), caughtErr instanceof Error ? caughtErr.toString() : caughtErr && _.checkError.getConstructorName(caughtErr));
                }
            }
        }
        if (caughtErr && errMsgMatcher !== void 0 && errMsgMatcher !== null) {
            var placeholder = "including";
            if (errMsgMatcher instanceof RegExp) {
                placeholder = "matching";
            }
            var isCompatibleMessage = _.checkError.compatibleMessage(caughtErr, errMsgMatcher);
            if (isCompatibleMessage === negate) {
                if (everyArgIsDefined && negate) {
                    errMsgMatcherFail = true;
                } else {
                    this.assert(negate, "expected #{this} to throw error " + placeholder + " #{exp} but got #{act}", "expected #{this} to throw error not " + placeholder + " #{exp}", errMsgMatcher, _.checkError.getMessage(caughtErr));
                }
            }
        }
        if (errorLikeFail && errMsgMatcherFail) {
            this.assert(negate, "expected #{this} to throw #{exp} but #{act} was thrown", "expected #{this} to not throw #{exp}" + (caughtErr ? " but #{act} was thrown" : ""), errorLike instanceof Error ? errorLike.toString() : errorLike && _.checkError.getConstructorName(errorLike), caughtErr instanceof Error ? caughtErr.toString() : caughtErr && _.checkError.getConstructorName(caughtErr));
        }
        flag3(this, "object", caughtErr);
    }
    Assertion2.addMethod("throw", assertThrows);
    Assertion2.addMethod("throws", assertThrows);
    Assertion2.addMethod("Throw", assertThrows);
    function respondTo(method, msg35) {
        if (msg35) flag3(this, "message", msg35);
        var obj = flag3(this, "object"), itself = flag3(this, "itself"), context = typeof obj === "function" && !itself ? obj.prototype[method] : obj[method];
        this.assert(typeof context === "function", "expected #{this} to respond to " + _.inspect(method), "expected #{this} to not respond to " + _.inspect(method));
    }
    Assertion2.addMethod("respondTo", respondTo);
    Assertion2.addMethod("respondsTo", respondTo);
    Assertion2.addProperty("itself", function() {
        flag3(this, "itself", true);
    });
    function satisfy(matcher, msg36) {
        if (msg36) flag3(this, "message", msg36);
        var obj = flag3(this, "object");
        var result = matcher(obj);
        this.assert(result, "expected #{this} to satisfy " + _.objDisplay(matcher), "expected #{this} to not satisfy" + _.objDisplay(matcher), flag3(this, "negate") ? false : true, result);
    }
    Assertion2.addMethod("satisfy", satisfy);
    Assertion2.addMethod("satisfies", satisfy);
    function closeTo(expected, delta, msg37) {
        if (msg37) flag3(this, "message", msg37);
        var obj = flag3(this, "object"), flagMsg = flag3(this, "message"), ssfi = flag3(this, "ssfi");
        new Assertion2(obj, flagMsg, ssfi, true).is.a("number");
        if (typeof expected !== "number" || typeof delta !== "number") {
            flagMsg = flagMsg ? flagMsg + ": " : "";
            var deltaMessage = delta === void 0 ? ", and a delta is required" : "";
            throw new AssertionError2(flagMsg + "the arguments to closeTo or approximately must be numbers" + deltaMessage, void 0, ssfi);
        }
        this.assert(Math.abs(obj - expected) <= delta, "expected #{this} to be close to " + expected + " +/- " + delta, "expected #{this} not to be close to " + expected + " +/- " + delta);
    }
    Assertion2.addMethod("closeTo", closeTo);
    Assertion2.addMethod("approximately", closeTo);
    function isSubsetOf(subset, superset, cmp, contains, ordered) {
        if (!contains) {
            if (subset.length !== superset.length) return false;
            superset = superset.slice();
        }
        return subset.every(function(elem, idx) {
            if (ordered) return cmp ? cmp(elem, superset[idx]) : elem === superset[idx];
            if (!cmp) {
                var matchIdx = superset.indexOf(elem);
                if (matchIdx === -1) return false;
                if (!contains) superset.splice(matchIdx, 1);
                return true;
            }
            return superset.some(function(elem2, matchIdx2) {
                if (!cmp(elem, elem2)) return false;
                if (!contains) superset.splice(matchIdx2, 1);
                return true;
            });
        });
    }
    Assertion2.addMethod("members", function(subset, msg38) {
        if (msg38) flag3(this, "message", msg38);
        var obj = flag3(this, "object"), flagMsg = flag3(this, "message"), ssfi = flag3(this, "ssfi");
        new Assertion2(obj, flagMsg, ssfi, true).to.be.an("array");
        new Assertion2(subset, flagMsg, ssfi, true).to.be.an("array");
        var contains = flag3(this, "contains");
        var ordered = flag3(this, "ordered");
        var subject, failMsg, failNegateMsg;
        if (contains) {
            subject = ordered ? "an ordered superset" : "a superset";
            failMsg = "expected #{this} to be " + subject + " of #{exp}";
            failNegateMsg = "expected #{this} to not be " + subject + " of #{exp}";
        } else {
            subject = ordered ? "ordered members" : "members";
            failMsg = "expected #{this} to have the same " + subject + " as #{exp}";
            failNegateMsg = "expected #{this} to not have the same " + subject + " as #{exp}";
        }
        var cmp = flag3(this, "deep") ? _.eql : void 0;
        this.assert(isSubsetOf(subset, obj, cmp, contains, ordered), failMsg, failNegateMsg, subset, obj, true);
    });
    function oneOf(list, msg39) {
        if (msg39) flag3(this, "message", msg39);
        var expected = flag3(this, "object"), flagMsg = flag3(this, "message"), ssfi = flag3(this, "ssfi"), contains = flag3(this, "contains"), isDeep = flag3(this, "deep");
        new Assertion2(list, flagMsg, ssfi, true).to.be.an("array");
        if (contains) {
            this.assert(list.some(function(possibility) {
                return expected.indexOf(possibility) > -1;
            }), "expected #{this} to contain one of #{exp}", "expected #{this} to not contain one of #{exp}", list, expected);
        } else {
            if (isDeep) {
                this.assert(list.some(function(possibility) {
                    return _.eql(expected, possibility);
                }), "expected #{this} to deeply equal one of #{exp}", "expected #{this} to deeply equal one of #{exp}", list, expected);
            } else {
                this.assert(list.indexOf(expected) > -1, "expected #{this} to be one of #{exp}", "expected #{this} to not be one of #{exp}", list, expected);
            }
        }
    }
    Assertion2.addMethod("oneOf", oneOf);
    function assertChanges(subject, prop, msg40) {
        if (msg40) flag3(this, "message", msg40);
        var fn = flag3(this, "object"), flagMsg = flag3(this, "message"), ssfi = flag3(this, "ssfi");
        new Assertion2(fn, flagMsg, ssfi, true).is.a("function");
        var initial;
        if (!prop) {
            new Assertion2(subject, flagMsg, ssfi, true).is.a("function");
            initial = subject();
        } else {
            new Assertion2(subject, flagMsg, ssfi, true).to.have.property(prop);
            initial = subject[prop];
        }
        fn();
        var __final = prop === void 0 || prop === null ? subject() : subject[prop];
        var msgObj = prop === void 0 || prop === null ? initial : "." + prop;
        flag3(this, "deltaMsgObj", msgObj);
        flag3(this, "initialDeltaValue", initial);
        flag3(this, "finalDeltaValue", __final);
        flag3(this, "deltaBehavior", "change");
        flag3(this, "realDelta", __final !== initial);
        this.assert(initial !== __final, "expected " + msgObj + " to change", "expected " + msgObj + " to not change");
    }
    Assertion2.addMethod("change", assertChanges);
    Assertion2.addMethod("changes", assertChanges);
    function assertIncreases(subject, prop, msg41) {
        if (msg41) flag3(this, "message", msg41);
        var fn = flag3(this, "object"), flagMsg = flag3(this, "message"), ssfi = flag3(this, "ssfi");
        new Assertion2(fn, flagMsg, ssfi, true).is.a("function");
        var initial;
        if (!prop) {
            new Assertion2(subject, flagMsg, ssfi, true).is.a("function");
            initial = subject();
        } else {
            new Assertion2(subject, flagMsg, ssfi, true).to.have.property(prop);
            initial = subject[prop];
        }
        new Assertion2(initial, flagMsg, ssfi, true).is.a("number");
        fn();
        var __final = prop === void 0 || prop === null ? subject() : subject[prop];
        var msgObj = prop === void 0 || prop === null ? initial : "." + prop;
        flag3(this, "deltaMsgObj", msgObj);
        flag3(this, "initialDeltaValue", initial);
        flag3(this, "finalDeltaValue", __final);
        flag3(this, "deltaBehavior", "increase");
        flag3(this, "realDelta", __final - initial);
        this.assert(__final - initial > 0, "expected " + msgObj + " to increase", "expected " + msgObj + " to not increase");
    }
    Assertion2.addMethod("increase", assertIncreases);
    Assertion2.addMethod("increases", assertIncreases);
    function assertDecreases(subject, prop, msg42) {
        if (msg42) flag3(this, "message", msg42);
        var fn = flag3(this, "object"), flagMsg = flag3(this, "message"), ssfi = flag3(this, "ssfi");
        new Assertion2(fn, flagMsg, ssfi, true).is.a("function");
        var initial;
        if (!prop) {
            new Assertion2(subject, flagMsg, ssfi, true).is.a("function");
            initial = subject();
        } else {
            new Assertion2(subject, flagMsg, ssfi, true).to.have.property(prop);
            initial = subject[prop];
        }
        new Assertion2(initial, flagMsg, ssfi, true).is.a("number");
        fn();
        var __final = prop === void 0 || prop === null ? subject() : subject[prop];
        var msgObj = prop === void 0 || prop === null ? initial : "." + prop;
        flag3(this, "deltaMsgObj", msgObj);
        flag3(this, "initialDeltaValue", initial);
        flag3(this, "finalDeltaValue", __final);
        flag3(this, "deltaBehavior", "decrease");
        flag3(this, "realDelta", initial - __final);
        this.assert(__final - initial < 0, "expected " + msgObj + " to decrease", "expected " + msgObj + " to not decrease");
    }
    Assertion2.addMethod("decrease", assertDecreases);
    Assertion2.addMethod("decreases", assertDecreases);
    function assertDelta(delta, msg43) {
        if (msg43) flag3(this, "message", msg43);
        var msgObj = flag3(this, "deltaMsgObj");
        var initial = flag3(this, "initialDeltaValue");
        var __final = flag3(this, "finalDeltaValue");
        var behavior = flag3(this, "deltaBehavior");
        var realDelta = flag3(this, "realDelta");
        var expression;
        if (behavior === "change") {
            expression = Math.abs(__final - initial) === Math.abs(delta);
        } else {
            expression = realDelta === Math.abs(delta);
        }
        this.assert(expression, "expected " + msgObj + " to " + behavior + " by " + delta, "expected " + msgObj + " to not " + behavior + " by " + delta);
    }
    Assertion2.addMethod("by", assertDelta);
    Assertion2.addProperty("extensible", function() {
        var obj = flag3(this, "object");
        var isExtensible = obj === Object(obj) && Object.isExtensible(obj);
        this.assert(isExtensible, "expected #{this} to be extensible", "expected #{this} to not be extensible");
    });
    Assertion2.addProperty("sealed", function() {
        var obj = flag3(this, "object");
        var isSealed = obj === Object(obj) ? Object.isSealed(obj) : true;
        this.assert(isSealed, "expected #{this} to be sealed", "expected #{this} to not be sealed");
    });
    Assertion2.addProperty("frozen", function() {
        var obj = flag3(this, "object");
        var isFrozen = obj === Object(obj) ? Object.isFrozen(obj) : true;
        this.assert(isFrozen, "expected #{this} to be frozen", "expected #{this} to not be frozen");
    });
    Assertion2.addProperty("finite", function(msg) {
        var obj = flag3(this, "object");
        this.assert(typeof obj === "number" && isFinite(obj), "expected #{this} to be a finite number", "expected #{this} to not be a finite number");
    });
};
var expect = function(chai2, util2) {
    chai2.expect = function(val, message) {
        return new chai2.Assertion(val, message);
    };
    chai2.expect.fail = function(actual, expected, message, operator) {
        if (arguments.length < 2) {
            message = actual;
            actual = void 0;
        }
        message = message || "expect.fail()";
        throw new chai2.AssertionError(message, {
            actual,
            expected,
            operator
        }, chai2.expect.fail);
    };
};
var should = function(chai2, util2) {
    var Assertion2 = chai2.Assertion;
    function loadShould() {
        function shouldGetter() {
            if (this instanceof String || this instanceof Number || this instanceof Boolean || typeof Symbol === "function" && this instanceof Symbol || typeof BigInt === "function" && this instanceof BigInt) {
                return new Assertion2(this.valueOf(), null, shouldGetter);
            }
            return new Assertion2(this, null, shouldGetter);
        }
        function shouldSetter(value) {
            Object.defineProperty(this, "should", {
                value,
                enumerable: true,
                configurable: true,
                writable: true
            });
        }
        Object.defineProperty(Object.prototype, "should", {
            set: shouldSetter,
            get: shouldGetter,
            configurable: true
        });
        var should2 = {};
        should2.fail = function(actual, expected, message, operator) {
            if (arguments.length < 2) {
                message = actual;
                actual = void 0;
            }
            message = message || "should.fail()";
            throw new chai2.AssertionError(message, {
                actual,
                expected,
                operator
            }, should2.fail);
        };
        should2.equal = function(val1, val2, msg44) {
            new Assertion2(val1, msg44).to.equal(val2);
        };
        should2.Throw = function(fn, errt, errs, msg45) {
            new Assertion2(fn, msg45).to.Throw(errt, errs);
        };
        should2.exist = function(val, msg46) {
            new Assertion2(val, msg46).to.exist;
        };
        should2.not = {};
        should2.not.equal = function(val1, val2, msg47) {
            new Assertion2(val1, msg47).to.not.equal(val2);
        };
        should2.not.Throw = function(fn, errt, errs, msg48) {
            new Assertion2(fn, msg48).to.not.Throw(errt, errs);
        };
        should2.not.exist = function(val, msg49) {
            new Assertion2(val, msg49).to.not.exist;
        };
        should2["throw"] = should2["Throw"];
        should2.not["throw"] = should2.not["Throw"];
        return should2;
    }
    chai2.should = loadShould;
    chai2.Should = loadShould;
};
var assert1 = function(chai2, util2) {
    var Assertion2 = chai2.Assertion, flag3 = util2.flag;
    var assert2 = chai2.assert = function(express, errmsg) {
        var test3 = new Assertion2(null, null, chai2.assert, true);
        test3.assert(express, errmsg, "[ negation message unavailable ]");
    };
    assert2.fail = function(actual, expected, message, operator) {
        if (arguments.length < 2) {
            message = actual;
            actual = void 0;
        }
        message = message || "assert.fail()";
        throw new chai2.AssertionError(message, {
            actual,
            expected,
            operator
        }, assert2.fail);
    };
    assert2.isOk = function(val, msg50) {
        new Assertion2(val, msg50, assert2.isOk, true).is.ok;
    };
    assert2.isNotOk = function(val, msg51) {
        new Assertion2(val, msg51, assert2.isNotOk, true).is.not.ok;
    };
    assert2.equal = function(act, exp, msg52) {
        var test3 = new Assertion2(act, msg52, assert2.equal, true);
        test3.assert(exp == flag3(test3, "object"), "expected #{this} to equal #{exp}", "expected #{this} to not equal #{act}", exp, act, true);
    };
    assert2.notEqual = function(act, exp, msg53) {
        var test3 = new Assertion2(act, msg53, assert2.notEqual, true);
        test3.assert(exp != flag3(test3, "object"), "expected #{this} to not equal #{exp}", "expected #{this} to equal #{act}", exp, act, true);
    };
    assert2.strictEqual = function(act, exp, msg54) {
        new Assertion2(act, msg54, assert2.strictEqual, true).to.equal(exp);
    };
    assert2.notStrictEqual = function(act, exp, msg55) {
        new Assertion2(act, msg55, assert2.notStrictEqual, true).to.not.equal(exp);
    };
    assert2.deepEqual = assert2.deepStrictEqual = function(act, exp, msg56) {
        new Assertion2(act, msg56, assert2.deepEqual, true).to.eql(exp);
    };
    assert2.notDeepEqual = function(act, exp, msg57) {
        new Assertion2(act, msg57, assert2.notDeepEqual, true).to.not.eql(exp);
    };
    assert2.isAbove = function(val, abv, msg58) {
        new Assertion2(val, msg58, assert2.isAbove, true).to.be.above(abv);
    };
    assert2.isAtLeast = function(val, atlst, msg59) {
        new Assertion2(val, msg59, assert2.isAtLeast, true).to.be.least(atlst);
    };
    assert2.isBelow = function(val, blw, msg60) {
        new Assertion2(val, msg60, assert2.isBelow, true).to.be.below(blw);
    };
    assert2.isAtMost = function(val, atmst, msg61) {
        new Assertion2(val, msg61, assert2.isAtMost, true).to.be.most(atmst);
    };
    assert2.isTrue = function(val, msg62) {
        new Assertion2(val, msg62, assert2.isTrue, true).is["true"];
    };
    assert2.isNotTrue = function(val, msg63) {
        new Assertion2(val, msg63, assert2.isNotTrue, true).to.not.equal(true);
    };
    assert2.isFalse = function(val, msg64) {
        new Assertion2(val, msg64, assert2.isFalse, true).is["false"];
    };
    assert2.isNotFalse = function(val, msg65) {
        new Assertion2(val, msg65, assert2.isNotFalse, true).to.not.equal(false);
    };
    assert2.isNull = function(val, msg66) {
        new Assertion2(val, msg66, assert2.isNull, true).to.equal(null);
    };
    assert2.isNotNull = function(val, msg67) {
        new Assertion2(val, msg67, assert2.isNotNull, true).to.not.equal(null);
    };
    assert2.isNaN = function(val, msg68) {
        new Assertion2(val, msg68, assert2.isNaN, true).to.be.NaN;
    };
    assert2.isNotNaN = function(val, msg69) {
        new Assertion2(val, msg69, assert2.isNotNaN, true).not.to.be.NaN;
    };
    assert2.exists = function(val, msg70) {
        new Assertion2(val, msg70, assert2.exists, true).to.exist;
    };
    assert2.notExists = function(val, msg71) {
        new Assertion2(val, msg71, assert2.notExists, true).to.not.exist;
    };
    assert2.isUndefined = function(val, msg72) {
        new Assertion2(val, msg72, assert2.isUndefined, true).to.equal(void 0);
    };
    assert2.isDefined = function(val, msg73) {
        new Assertion2(val, msg73, assert2.isDefined, true).to.not.equal(void 0);
    };
    assert2.isFunction = function(val, msg74) {
        new Assertion2(val, msg74, assert2.isFunction, true).to.be.a("function");
    };
    assert2.isNotFunction = function(val, msg75) {
        new Assertion2(val, msg75, assert2.isNotFunction, true).to.not.be.a("function");
    };
    assert2.isObject = function(val, msg76) {
        new Assertion2(val, msg76, assert2.isObject, true).to.be.a("object");
    };
    assert2.isNotObject = function(val, msg77) {
        new Assertion2(val, msg77, assert2.isNotObject, true).to.not.be.a("object");
    };
    assert2.isArray = function(val, msg78) {
        new Assertion2(val, msg78, assert2.isArray, true).to.be.an("array");
    };
    assert2.isNotArray = function(val, msg79) {
        new Assertion2(val, msg79, assert2.isNotArray, true).to.not.be.an("array");
    };
    assert2.isString = function(val, msg80) {
        new Assertion2(val, msg80, assert2.isString, true).to.be.a("string");
    };
    assert2.isNotString = function(val, msg81) {
        new Assertion2(val, msg81, assert2.isNotString, true).to.not.be.a("string");
    };
    assert2.isNumber = function(val, msg82) {
        new Assertion2(val, msg82, assert2.isNumber, true).to.be.a("number");
    };
    assert2.isNotNumber = function(val, msg83) {
        new Assertion2(val, msg83, assert2.isNotNumber, true).to.not.be.a("number");
    };
    assert2.isFinite = function(val, msg84) {
        new Assertion2(val, msg84, assert2.isFinite, true).to.be.finite;
    };
    assert2.isBoolean = function(val, msg85) {
        new Assertion2(val, msg85, assert2.isBoolean, true).to.be.a("boolean");
    };
    assert2.isNotBoolean = function(val, msg86) {
        new Assertion2(val, msg86, assert2.isNotBoolean, true).to.not.be.a("boolean");
    };
    assert2.typeOf = function(val, type2, msg87) {
        new Assertion2(val, msg87, assert2.typeOf, true).to.be.a(type2);
    };
    assert2.notTypeOf = function(val, type2, msg88) {
        new Assertion2(val, msg88, assert2.notTypeOf, true).to.not.be.a(type2);
    };
    assert2.instanceOf = function(val, type2, msg89) {
        new Assertion2(val, msg89, assert2.instanceOf, true).to.be.instanceOf(type2);
    };
    assert2.notInstanceOf = function(val, type2, msg90) {
        new Assertion2(val, msg90, assert2.notInstanceOf, true).to.not.be.instanceOf(type2);
    };
    assert2.include = function(exp, inc, msg91) {
        new Assertion2(exp, msg91, assert2.include, true).include(inc);
    };
    assert2.notInclude = function(exp, inc, msg92) {
        new Assertion2(exp, msg92, assert2.notInclude, true).not.include(inc);
    };
    assert2.deepInclude = function(exp, inc, msg93) {
        new Assertion2(exp, msg93, assert2.deepInclude, true).deep.include(inc);
    };
    assert2.notDeepInclude = function(exp, inc, msg94) {
        new Assertion2(exp, msg94, assert2.notDeepInclude, true).not.deep.include(inc);
    };
    assert2.nestedInclude = function(exp, inc, msg95) {
        new Assertion2(exp, msg95, assert2.nestedInclude, true).nested.include(inc);
    };
    assert2.notNestedInclude = function(exp, inc, msg96) {
        new Assertion2(exp, msg96, assert2.notNestedInclude, true).not.nested.include(inc);
    };
    assert2.deepNestedInclude = function(exp, inc, msg97) {
        new Assertion2(exp, msg97, assert2.deepNestedInclude, true).deep.nested.include(inc);
    };
    assert2.notDeepNestedInclude = function(exp, inc, msg98) {
        new Assertion2(exp, msg98, assert2.notDeepNestedInclude, true).not.deep.nested.include(inc);
    };
    assert2.ownInclude = function(exp, inc, msg99) {
        new Assertion2(exp, msg99, assert2.ownInclude, true).own.include(inc);
    };
    assert2.notOwnInclude = function(exp, inc, msg100) {
        new Assertion2(exp, msg100, assert2.notOwnInclude, true).not.own.include(inc);
    };
    assert2.deepOwnInclude = function(exp, inc, msg101) {
        new Assertion2(exp, msg101, assert2.deepOwnInclude, true).deep.own.include(inc);
    };
    assert2.notDeepOwnInclude = function(exp, inc, msg102) {
        new Assertion2(exp, msg102, assert2.notDeepOwnInclude, true).not.deep.own.include(inc);
    };
    assert2.match = function(exp, re, msg103) {
        new Assertion2(exp, msg103, assert2.match, true).to.match(re);
    };
    assert2.notMatch = function(exp, re, msg104) {
        new Assertion2(exp, msg104, assert2.notMatch, true).to.not.match(re);
    };
    assert2.property = function(obj, prop, msg105) {
        new Assertion2(obj, msg105, assert2.property, true).to.have.property(prop);
    };
    assert2.notProperty = function(obj, prop, msg106) {
        new Assertion2(obj, msg106, assert2.notProperty, true).to.not.have.property(prop);
    };
    assert2.propertyVal = function(obj, prop, val, msg107) {
        new Assertion2(obj, msg107, assert2.propertyVal, true).to.have.property(prop, val);
    };
    assert2.notPropertyVal = function(obj, prop, val, msg108) {
        new Assertion2(obj, msg108, assert2.notPropertyVal, true).to.not.have.property(prop, val);
    };
    assert2.deepPropertyVal = function(obj, prop, val, msg109) {
        new Assertion2(obj, msg109, assert2.deepPropertyVal, true).to.have.deep.property(prop, val);
    };
    assert2.notDeepPropertyVal = function(obj, prop, val, msg110) {
        new Assertion2(obj, msg110, assert2.notDeepPropertyVal, true).to.not.have.deep.property(prop, val);
    };
    assert2.ownProperty = function(obj, prop, msg111) {
        new Assertion2(obj, msg111, assert2.ownProperty, true).to.have.own.property(prop);
    };
    assert2.notOwnProperty = function(obj, prop, msg112) {
        new Assertion2(obj, msg112, assert2.notOwnProperty, true).to.not.have.own.property(prop);
    };
    assert2.ownPropertyVal = function(obj, prop, value, msg113) {
        new Assertion2(obj, msg113, assert2.ownPropertyVal, true).to.have.own.property(prop, value);
    };
    assert2.notOwnPropertyVal = function(obj, prop, value, msg114) {
        new Assertion2(obj, msg114, assert2.notOwnPropertyVal, true).to.not.have.own.property(prop, value);
    };
    assert2.deepOwnPropertyVal = function(obj, prop, value, msg115) {
        new Assertion2(obj, msg115, assert2.deepOwnPropertyVal, true).to.have.deep.own.property(prop, value);
    };
    assert2.notDeepOwnPropertyVal = function(obj, prop, value, msg116) {
        new Assertion2(obj, msg116, assert2.notDeepOwnPropertyVal, true).to.not.have.deep.own.property(prop, value);
    };
    assert2.nestedProperty = function(obj, prop, msg117) {
        new Assertion2(obj, msg117, assert2.nestedProperty, true).to.have.nested.property(prop);
    };
    assert2.notNestedProperty = function(obj, prop, msg118) {
        new Assertion2(obj, msg118, assert2.notNestedProperty, true).to.not.have.nested.property(prop);
    };
    assert2.nestedPropertyVal = function(obj, prop, val, msg119) {
        new Assertion2(obj, msg119, assert2.nestedPropertyVal, true).to.have.nested.property(prop, val);
    };
    assert2.notNestedPropertyVal = function(obj, prop, val, msg120) {
        new Assertion2(obj, msg120, assert2.notNestedPropertyVal, true).to.not.have.nested.property(prop, val);
    };
    assert2.deepNestedPropertyVal = function(obj, prop, val, msg121) {
        new Assertion2(obj, msg121, assert2.deepNestedPropertyVal, true).to.have.deep.nested.property(prop, val);
    };
    assert2.notDeepNestedPropertyVal = function(obj, prop, val, msg122) {
        new Assertion2(obj, msg122, assert2.notDeepNestedPropertyVal, true).to.not.have.deep.nested.property(prop, val);
    };
    assert2.lengthOf = function(exp, len, msg123) {
        new Assertion2(exp, msg123, assert2.lengthOf, true).to.have.lengthOf(len);
    };
    assert2.hasAnyKeys = function(obj, keys, msg124) {
        new Assertion2(obj, msg124, assert2.hasAnyKeys, true).to.have.any.keys(keys);
    };
    assert2.hasAllKeys = function(obj, keys, msg125) {
        new Assertion2(obj, msg125, assert2.hasAllKeys, true).to.have.all.keys(keys);
    };
    assert2.containsAllKeys = function(obj, keys, msg126) {
        new Assertion2(obj, msg126, assert2.containsAllKeys, true).to.contain.all.keys(keys);
    };
    assert2.doesNotHaveAnyKeys = function(obj, keys, msg127) {
        new Assertion2(obj, msg127, assert2.doesNotHaveAnyKeys, true).to.not.have.any.keys(keys);
    };
    assert2.doesNotHaveAllKeys = function(obj, keys, msg128) {
        new Assertion2(obj, msg128, assert2.doesNotHaveAllKeys, true).to.not.have.all.keys(keys);
    };
    assert2.hasAnyDeepKeys = function(obj, keys, msg129) {
        new Assertion2(obj, msg129, assert2.hasAnyDeepKeys, true).to.have.any.deep.keys(keys);
    };
    assert2.hasAllDeepKeys = function(obj, keys, msg130) {
        new Assertion2(obj, msg130, assert2.hasAllDeepKeys, true).to.have.all.deep.keys(keys);
    };
    assert2.containsAllDeepKeys = function(obj, keys, msg131) {
        new Assertion2(obj, msg131, assert2.containsAllDeepKeys, true).to.contain.all.deep.keys(keys);
    };
    assert2.doesNotHaveAnyDeepKeys = function(obj, keys, msg132) {
        new Assertion2(obj, msg132, assert2.doesNotHaveAnyDeepKeys, true).to.not.have.any.deep.keys(keys);
    };
    assert2.doesNotHaveAllDeepKeys = function(obj, keys, msg133) {
        new Assertion2(obj, msg133, assert2.doesNotHaveAllDeepKeys, true).to.not.have.all.deep.keys(keys);
    };
    assert2.throws = function(fn, errorLike, errMsgMatcher, msg134) {
        if (typeof errorLike === "string" || errorLike instanceof RegExp) {
            errMsgMatcher = errorLike;
            errorLike = null;
        }
        var assertErr = new Assertion2(fn, msg134, assert2.throws, true).to.throw(errorLike, errMsgMatcher);
        return flag3(assertErr, "object");
    };
    assert2.doesNotThrow = function(fn, errorLike, errMsgMatcher, msg135) {
        if (typeof errorLike === "string" || errorLike instanceof RegExp) {
            errMsgMatcher = errorLike;
            errorLike = null;
        }
        new Assertion2(fn, msg135, assert2.doesNotThrow, true).to.not.throw(errorLike, errMsgMatcher);
    };
    assert2.operator = function(val, operator, val2, msg136) {
        var ok;
        switch(operator){
            case "==":
                ok = val == val2;
                break;
            case "===":
                ok = val === val2;
                break;
            case ">":
                ok = val > val2;
                break;
            case ">=":
                ok = val >= val2;
                break;
            case "<":
                ok = val < val2;
                break;
            case "<=":
                ok = val <= val2;
                break;
            case "!=":
                ok = val != val2;
                break;
            case "!==":
                ok = val !== val2;
                break;
            default:
                msg136 = msg136 ? msg136 + ": " : msg136;
                throw new chai2.AssertionError(msg136 + 'Invalid operator "' + operator + '"', void 0, assert2.operator);
        }
        var test3 = new Assertion2(ok, msg136, assert2.operator, true);
        test3.assert(flag3(test3, "object") === true, "expected " + util2.inspect(val) + " to be " + operator + " " + util2.inspect(val2), "expected " + util2.inspect(val) + " to not be " + operator + " " + util2.inspect(val2));
    };
    assert2.closeTo = function(act, exp, delta, msg137) {
        new Assertion2(act, msg137, assert2.closeTo, true).to.be.closeTo(exp, delta);
    };
    assert2.approximately = function(act, exp, delta, msg138) {
        new Assertion2(act, msg138, assert2.approximately, true).to.be.approximately(exp, delta);
    };
    assert2.sameMembers = function(set1, set2, msg139) {
        new Assertion2(set1, msg139, assert2.sameMembers, true).to.have.same.members(set2);
    };
    assert2.notSameMembers = function(set1, set2, msg140) {
        new Assertion2(set1, msg140, assert2.notSameMembers, true).to.not.have.same.members(set2);
    };
    assert2.sameDeepMembers = function(set1, set2, msg141) {
        new Assertion2(set1, msg141, assert2.sameDeepMembers, true).to.have.same.deep.members(set2);
    };
    assert2.notSameDeepMembers = function(set1, set2, msg142) {
        new Assertion2(set1, msg142, assert2.notSameDeepMembers, true).to.not.have.same.deep.members(set2);
    };
    assert2.sameOrderedMembers = function(set1, set2, msg143) {
        new Assertion2(set1, msg143, assert2.sameOrderedMembers, true).to.have.same.ordered.members(set2);
    };
    assert2.notSameOrderedMembers = function(set1, set2, msg144) {
        new Assertion2(set1, msg144, assert2.notSameOrderedMembers, true).to.not.have.same.ordered.members(set2);
    };
    assert2.sameDeepOrderedMembers = function(set1, set2, msg145) {
        new Assertion2(set1, msg145, assert2.sameDeepOrderedMembers, true).to.have.same.deep.ordered.members(set2);
    };
    assert2.notSameDeepOrderedMembers = function(set1, set2, msg146) {
        new Assertion2(set1, msg146, assert2.notSameDeepOrderedMembers, true).to.not.have.same.deep.ordered.members(set2);
    };
    assert2.includeMembers = function(superset, subset, msg147) {
        new Assertion2(superset, msg147, assert2.includeMembers, true).to.include.members(subset);
    };
    assert2.notIncludeMembers = function(superset, subset, msg148) {
        new Assertion2(superset, msg148, assert2.notIncludeMembers, true).to.not.include.members(subset);
    };
    assert2.includeDeepMembers = function(superset, subset, msg149) {
        new Assertion2(superset, msg149, assert2.includeDeepMembers, true).to.include.deep.members(subset);
    };
    assert2.notIncludeDeepMembers = function(superset, subset, msg150) {
        new Assertion2(superset, msg150, assert2.notIncludeDeepMembers, true).to.not.include.deep.members(subset);
    };
    assert2.includeOrderedMembers = function(superset, subset, msg151) {
        new Assertion2(superset, msg151, assert2.includeOrderedMembers, true).to.include.ordered.members(subset);
    };
    assert2.notIncludeOrderedMembers = function(superset, subset, msg152) {
        new Assertion2(superset, msg152, assert2.notIncludeOrderedMembers, true).to.not.include.ordered.members(subset);
    };
    assert2.includeDeepOrderedMembers = function(superset, subset, msg153) {
        new Assertion2(superset, msg153, assert2.includeDeepOrderedMembers, true).to.include.deep.ordered.members(subset);
    };
    assert2.notIncludeDeepOrderedMembers = function(superset, subset, msg154) {
        new Assertion2(superset, msg154, assert2.notIncludeDeepOrderedMembers, true).to.not.include.deep.ordered.members(subset);
    };
    assert2.oneOf = function(inList, list, msg155) {
        new Assertion2(inList, msg155, assert2.oneOf, true).to.be.oneOf(list);
    };
    assert2.changes = function(fn, obj, prop, msg156) {
        if (arguments.length === 3 && typeof obj === "function") {
            msg156 = prop;
            prop = null;
        }
        new Assertion2(fn, msg156, assert2.changes, true).to.change(obj, prop);
    };
    assert2.changesBy = function(fn, obj, prop, delta, msg157) {
        if (arguments.length === 4 && typeof obj === "function") {
            var tmpMsg = delta;
            delta = prop;
            msg157 = tmpMsg;
        } else if (arguments.length === 3) {
            delta = prop;
            prop = null;
        }
        new Assertion2(fn, msg157, assert2.changesBy, true).to.change(obj, prop).by(delta);
    };
    assert2.doesNotChange = function(fn, obj, prop, msg158) {
        if (arguments.length === 3 && typeof obj === "function") {
            msg158 = prop;
            prop = null;
        }
        return new Assertion2(fn, msg158, assert2.doesNotChange, true).to.not.change(obj, prop);
    };
    assert2.changesButNotBy = function(fn, obj, prop, delta, msg159) {
        if (arguments.length === 4 && typeof obj === "function") {
            var tmpMsg = delta;
            delta = prop;
            msg159 = tmpMsg;
        } else if (arguments.length === 3) {
            delta = prop;
            prop = null;
        }
        new Assertion2(fn, msg159, assert2.changesButNotBy, true).to.change(obj, prop).but.not.by(delta);
    };
    assert2.increases = function(fn, obj, prop, msg160) {
        if (arguments.length === 3 && typeof obj === "function") {
            msg160 = prop;
            prop = null;
        }
        return new Assertion2(fn, msg160, assert2.increases, true).to.increase(obj, prop);
    };
    assert2.increasesBy = function(fn, obj, prop, delta, msg161) {
        if (arguments.length === 4 && typeof obj === "function") {
            var tmpMsg = delta;
            delta = prop;
            msg161 = tmpMsg;
        } else if (arguments.length === 3) {
            delta = prop;
            prop = null;
        }
        new Assertion2(fn, msg161, assert2.increasesBy, true).to.increase(obj, prop).by(delta);
    };
    assert2.doesNotIncrease = function(fn, obj, prop, msg162) {
        if (arguments.length === 3 && typeof obj === "function") {
            msg162 = prop;
            prop = null;
        }
        return new Assertion2(fn, msg162, assert2.doesNotIncrease, true).to.not.increase(obj, prop);
    };
    assert2.increasesButNotBy = function(fn, obj, prop, delta, msg163) {
        if (arguments.length === 4 && typeof obj === "function") {
            var tmpMsg = delta;
            delta = prop;
            msg163 = tmpMsg;
        } else if (arguments.length === 3) {
            delta = prop;
            prop = null;
        }
        new Assertion2(fn, msg163, assert2.increasesButNotBy, true).to.increase(obj, prop).but.not.by(delta);
    };
    assert2.decreases = function(fn, obj, prop, msg164) {
        if (arguments.length === 3 && typeof obj === "function") {
            msg164 = prop;
            prop = null;
        }
        return new Assertion2(fn, msg164, assert2.decreases, true).to.decrease(obj, prop);
    };
    assert2.decreasesBy = function(fn, obj, prop, delta, msg165) {
        if (arguments.length === 4 && typeof obj === "function") {
            var tmpMsg = delta;
            delta = prop;
            msg165 = tmpMsg;
        } else if (arguments.length === 3) {
            delta = prop;
            prop = null;
        }
        new Assertion2(fn, msg165, assert2.decreasesBy, true).to.decrease(obj, prop).by(delta);
    };
    assert2.doesNotDecrease = function(fn, obj, prop, msg166) {
        if (arguments.length === 3 && typeof obj === "function") {
            msg166 = prop;
            prop = null;
        }
        return new Assertion2(fn, msg166, assert2.doesNotDecrease, true).to.not.decrease(obj, prop);
    };
    assert2.doesNotDecreaseBy = function(fn, obj, prop, delta, msg167) {
        if (arguments.length === 4 && typeof obj === "function") {
            var tmpMsg = delta;
            delta = prop;
            msg167 = tmpMsg;
        } else if (arguments.length === 3) {
            delta = prop;
            prop = null;
        }
        return new Assertion2(fn, msg167, assert2.doesNotDecreaseBy, true).to.not.decrease(obj, prop).by(delta);
    };
    assert2.decreasesButNotBy = function(fn, obj, prop, delta, msg168) {
        if (arguments.length === 4 && typeof obj === "function") {
            var tmpMsg = delta;
            delta = prop;
            msg168 = tmpMsg;
        } else if (arguments.length === 3) {
            delta = prop;
            prop = null;
        }
        new Assertion2(fn, msg168, assert2.decreasesButNotBy, true).to.decrease(obj, prop).but.not.by(delta);
    };
    assert2.ifError = function(val) {
        if (val) {
            throw val;
        }
    };
    assert2.isExtensible = function(obj, msg169) {
        new Assertion2(obj, msg169, assert2.isExtensible, true).to.be.extensible;
    };
    assert2.isNotExtensible = function(obj, msg170) {
        new Assertion2(obj, msg170, assert2.isNotExtensible, true).to.not.be.extensible;
    };
    assert2.isSealed = function(obj, msg171) {
        new Assertion2(obj, msg171, assert2.isSealed, true).to.be.sealed;
    };
    assert2.isNotSealed = function(obj, msg172) {
        new Assertion2(obj, msg172, assert2.isNotSealed, true).to.not.be.sealed;
    };
    assert2.isFrozen = function(obj, msg173) {
        new Assertion2(obj, msg173, assert2.isFrozen, true).to.be.frozen;
    };
    assert2.isNotFrozen = function(obj, msg174) {
        new Assertion2(obj, msg174, assert2.isNotFrozen, true).to.not.be.frozen;
    };
    assert2.isEmpty = function(val, msg175) {
        new Assertion2(val, msg175, assert2.isEmpty, true).to.be.empty;
    };
    assert2.isNotEmpty = function(val, msg176) {
        new Assertion2(val, msg176, assert2.isNotEmpty, true).to.not.be.empty;
    };
    (function alias(name, as) {
        assert2[as] = assert2[name];
        return alias;
    })("isOk", "ok")("isNotOk", "notOk")("throws", "throw")("throws", "Throw")("isExtensible", "extensible")("isNotExtensible", "notExtensible")("isSealed", "sealed")("isNotSealed", "notSealed")("isFrozen", "frozen")("isNotFrozen", "notFrozen")("isEmpty", "empty")("isNotEmpty", "notEmpty");
};
var chai = createCommonjsModule1(function(module, exports) {
    var used = [];
    exports.version = "4.3.3";
    exports.AssertionError = assertionError;
    exports.use = function(fn) {
        if (!~used.indexOf(fn)) {
            fn(exports, utils);
            used.push(fn);
        }
        return exports;
    };
    exports.util = utils;
    exports.config = config1;
    exports.use(assertion);
    exports.use(assertions);
    exports.use(expect);
    exports.use(should);
    exports.use(assert1);
});
var chai$1 = chai;
chai$1.expect;
chai$1.version;
chai$1.Assertion;
chai$1.AssertionError;
chai$1.util;
chai$1.config;
chai$1.use;
chai$1.should;
chai$1.assert;
chai$1.core;
const osType = (()=>{
    if (globalThis.Deno != null) {
        return Deno.build.os;
    }
    const navigator = globalThis.navigator;
    if (navigator?.appVersion?.includes?.("Win") ?? false) {
        return "windows";
    }
    return "linux";
})();
const isWindows = osType === "windows";
const CHAR_FORWARD_SLASH = 47;
function assertPath(path11) {
    if (typeof path11 !== "string") {
        throw new TypeError(`Path must be a string. Received ${JSON.stringify(path11)}`);
    }
}
function isPosixPathSeparator(code2) {
    return code2 === 47;
}
function isPathSeparator(code3) {
    return isPosixPathSeparator(code3) || code3 === 92;
}
function isWindowsDeviceRoot(code4) {
    return code4 >= 97 && code4 <= 122 || code4 >= 65 && code4 <= 90;
}
function normalizeString(path12, allowAboveRoot, separator, isPathSeparator1) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code5;
    for(let i = 0, len = path12.length; i <= len; ++i){
        if (i < len) code5 = path12.charCodeAt(i);
        else if (isPathSeparator1(code5)) break;
        else code5 = CHAR_FORWARD_SLASH;
        if (isPathSeparator1(code5)) {
            if (lastSlash === i - 1 || dots === 1) {} else if (lastSlash !== i - 1 && dots === 2) {
                if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
                    if (res.length > 2) {
                        const lastSlashIndex = res.lastIndexOf(separator);
                        if (lastSlashIndex === -1) {
                            res = "";
                            lastSegmentLength = 0;
                        } else {
                            res = res.slice(0, lastSlashIndex);
                            lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                        }
                        lastSlash = i;
                        dots = 0;
                        continue;
                    } else if (res.length === 2 || res.length === 1) {
                        res = "";
                        lastSegmentLength = 0;
                        lastSlash = i;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0) res += `${separator}..`;
                    else res = "..";
                    lastSegmentLength = 2;
                }
            } else {
                if (res.length > 0) res += separator + path12.slice(lastSlash + 1, i);
                else res = path12.slice(lastSlash + 1, i);
                lastSegmentLength = i - lastSlash - 1;
            }
            lastSlash = i;
            dots = 0;
        } else if (code5 === 46 && dots !== -1) {
            ++dots;
        } else {
            dots = -1;
        }
    }
    return res;
}
function _format(sep6, pathObject) {
    const dir = pathObject.dir || pathObject.root;
    const base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
    if (!dir) return base;
    if (dir === pathObject.root) return dir + base;
    return dir + sep6 + base;
}
const WHITESPACE_ENCODINGS = {
    "\u0009": "%09",
    "\u000A": "%0A",
    "\u000B": "%0B",
    "\u000C": "%0C",
    "\u000D": "%0D",
    "\u0020": "%20"
};
function encodeWhitespace(string) {
    return string.replaceAll(/[\s]/g, (c)=>{
        return WHITESPACE_ENCODINGS[c] ?? c;
    });
}
class DenoStdInternalError1 extends Error {
    constructor(message){
        super(message);
        this.name = "DenoStdInternalError";
    }
}
function assert2(expr, msg177 = "") {
    if (!expr) {
        throw new DenoStdInternalError1(msg177);
    }
}
const sep = "\\";
const delimiter = ";";
function resolve(...pathSegments) {
    let resolvedDevice = "";
    let resolvedTail = "";
    let resolvedAbsolute = false;
    for(let i = pathSegments.length - 1; i >= -1; i--){
        let path13;
        if (i >= 0) {
            path13 = pathSegments[i];
        } else if (!resolvedDevice) {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a drive-letter-less path without a CWD.");
            }
            path13 = Deno.cwd();
        } else {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path13 = Deno.env.get(`=${resolvedDevice}`) || Deno.cwd();
            if (path13 === undefined || path13.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
                path13 = `${resolvedDevice}\\`;
            }
        }
        assertPath(path13);
        const len = path13.length;
        if (len === 0) continue;
        let rootEnd = 0;
        let device = "";
        let isAbsolute1 = false;
        const code6 = path13.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator(code6)) {
                isAbsolute1 = true;
                if (isPathSeparator(path13.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for(; j < len; ++j){
                        if (isPathSeparator(path13.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        const firstPart = path13.slice(last, j);
                        last = j;
                        for(; j < len; ++j){
                            if (!isPathSeparator(path13.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for(; j < len; ++j){
                                if (isPathSeparator(path13.charCodeAt(j))) break;
                            }
                            if (j === len) {
                                device = `\\\\${firstPart}\\${path13.slice(last)}`;
                                rootEnd = j;
                            } else if (j !== last) {
                                device = `\\\\${firstPart}\\${path13.slice(last, j)}`;
                                rootEnd = j;
                            }
                        }
                    }
                } else {
                    rootEnd = 1;
                }
            } else if (isWindowsDeviceRoot(code6)) {
                if (path13.charCodeAt(1) === 58) {
                    device = path13.slice(0, 2);
                    rootEnd = 2;
                    if (len > 2) {
                        if (isPathSeparator(path13.charCodeAt(2))) {
                            isAbsolute1 = true;
                            rootEnd = 3;
                        }
                    }
                }
            }
        } else if (isPathSeparator(code6)) {
            rootEnd = 1;
            isAbsolute1 = true;
        }
        if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
            continue;
        }
        if (resolvedDevice.length === 0 && device.length > 0) {
            resolvedDevice = device;
        }
        if (!resolvedAbsolute) {
            resolvedTail = `${path13.slice(rootEnd)}\\${resolvedTail}`;
            resolvedAbsolute = isAbsolute1;
        }
        if (resolvedAbsolute && resolvedDevice.length > 0) break;
    }
    resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator);
    return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
}
function normalize(path14) {
    assertPath(path14);
    const len = path14.length;
    if (len === 0) return ".";
    let rootEnd = 0;
    let device;
    let isAbsolute2 = false;
    const code7 = path14.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code7)) {
            isAbsolute2 = true;
            if (isPathSeparator(path14.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path14.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    const firstPart = path14.slice(last, j);
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path14.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path14.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return `\\\\${firstPart}\\${path14.slice(last)}\\`;
                        } else if (j !== last) {
                            device = `\\\\${firstPart}\\${path14.slice(last, j)}`;
                            rootEnd = j;
                        }
                    }
                }
            } else {
                rootEnd = 1;
            }
        } else if (isWindowsDeviceRoot(code7)) {
            if (path14.charCodeAt(1) === 58) {
                device = path14.slice(0, 2);
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator(path14.charCodeAt(2))) {
                        isAbsolute2 = true;
                        rootEnd = 3;
                    }
                }
            }
        }
    } else if (isPathSeparator(code7)) {
        return "\\";
    }
    let tail;
    if (rootEnd < len) {
        tail = normalizeString(path14.slice(rootEnd), !isAbsolute2, "\\", isPathSeparator);
    } else {
        tail = "";
    }
    if (tail.length === 0 && !isAbsolute2) tail = ".";
    if (tail.length > 0 && isPathSeparator(path14.charCodeAt(len - 1))) {
        tail += "\\";
    }
    if (device === undefined) {
        if (isAbsolute2) {
            if (tail.length > 0) return `\\${tail}`;
            else return "\\";
        } else if (tail.length > 0) {
            return tail;
        } else {
            return "";
        }
    } else if (isAbsolute2) {
        if (tail.length > 0) return `${device}\\${tail}`;
        else return `${device}\\`;
    } else if (tail.length > 0) {
        return device + tail;
    } else {
        return device;
    }
}
function isAbsolute(path15) {
    assertPath(path15);
    const len = path15.length;
    if (len === 0) return false;
    const code8 = path15.charCodeAt(0);
    if (isPathSeparator(code8)) {
        return true;
    } else if (isWindowsDeviceRoot(code8)) {
        if (len > 2 && path15.charCodeAt(1) === 58) {
            if (isPathSeparator(path15.charCodeAt(2))) return true;
        }
    }
    return false;
}
function join(...paths) {
    const pathsCount = paths.length;
    if (pathsCount === 0) return ".";
    let joined;
    let firstPart = null;
    for(let i = 0; i < pathsCount; ++i){
        const path16 = paths[i];
        assertPath(path16);
        if (path16.length > 0) {
            if (joined === undefined) joined = firstPart = path16;
            else joined += `\\${path16}`;
        }
    }
    if (joined === undefined) return ".";
    let needsReplace = true;
    let slashCount = 0;
    assert2(firstPart != null);
    if (isPathSeparator(firstPart.charCodeAt(0))) {
        ++slashCount;
        const firstLen = firstPart.length;
        if (firstLen > 1) {
            if (isPathSeparator(firstPart.charCodeAt(1))) {
                ++slashCount;
                if (firstLen > 2) {
                    if (isPathSeparator(firstPart.charCodeAt(2))) ++slashCount;
                    else {
                        needsReplace = false;
                    }
                }
            }
        }
    }
    if (needsReplace) {
        for(; slashCount < joined.length; ++slashCount){
            if (!isPathSeparator(joined.charCodeAt(slashCount))) break;
        }
        if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
    }
    return normalize(joined);
}
function relative(from, to) {
    assertPath(from);
    assertPath(to);
    if (from === to) return "";
    const fromOrig = resolve(from);
    const toOrig = resolve(to);
    if (fromOrig === toOrig) return "";
    from = fromOrig.toLowerCase();
    to = toOrig.toLowerCase();
    if (from === to) return "";
    let fromStart = 0;
    let fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 92) break;
    }
    for(; fromEnd - 1 > fromStart; --fromEnd){
        if (from.charCodeAt(fromEnd - 1) !== 92) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 0;
    let toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (to.charCodeAt(toStart) !== 92) break;
    }
    for(; toEnd - 1 > toStart; --toEnd){
        if (to.charCodeAt(toEnd - 1) !== 92) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i = 0;
    for(; i <= length; ++i){
        if (i === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i) === 92) {
                    return toOrig.slice(toStart + i + 1);
                } else if (i === 2) {
                    return toOrig.slice(toStart + i);
                }
            }
            if (fromLen > length) {
                if (from.charCodeAt(fromStart + i) === 92) {
                    lastCommonSep = i;
                } else if (i === 2) {
                    lastCommonSep = 3;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i);
        const toCode = to.charCodeAt(toStart + i);
        if (fromCode !== toCode) break;
        else if (fromCode === 92) lastCommonSep = i;
    }
    if (i !== length && lastCommonSep === -1) {
        return toOrig;
    }
    let out = "";
    if (lastCommonSep === -1) lastCommonSep = 0;
    for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
        if (i === fromEnd || from.charCodeAt(i) === 92) {
            if (out.length === 0) out += "..";
            else out += "\\..";
        }
    }
    if (out.length > 0) {
        return out + toOrig.slice(toStart + lastCommonSep, toEnd);
    } else {
        toStart += lastCommonSep;
        if (toOrig.charCodeAt(toStart) === 92) ++toStart;
        return toOrig.slice(toStart, toEnd);
    }
}
function toNamespacedPath(path17) {
    if (typeof path17 !== "string") return path17;
    if (path17.length === 0) return "";
    const resolvedPath = resolve(path17);
    if (resolvedPath.length >= 3) {
        if (resolvedPath.charCodeAt(0) === 92) {
            if (resolvedPath.charCodeAt(1) === 92) {
                const code9 = resolvedPath.charCodeAt(2);
                if (code9 !== 63 && code9 !== 46) {
                    return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
                }
            }
        } else if (isWindowsDeviceRoot(resolvedPath.charCodeAt(0))) {
            if (resolvedPath.charCodeAt(1) === 58 && resolvedPath.charCodeAt(2) === 92) {
                return `\\\\?\\${resolvedPath}`;
            }
        }
    }
    return path17;
}
function dirname(path18) {
    assertPath(path18);
    const len = path18.length;
    if (len === 0) return ".";
    let rootEnd = -1;
    let end = -1;
    let matchedSlash = true;
    let offset = 0;
    const code10 = path18.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code10)) {
            rootEnd = offset = 1;
            if (isPathSeparator(path18.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path18.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path18.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path18.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return path18;
                        }
                        if (j !== last) {
                            rootEnd = offset = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot(code10)) {
            if (path18.charCodeAt(1) === 58) {
                rootEnd = offset = 2;
                if (len > 2) {
                    if (isPathSeparator(path18.charCodeAt(2))) rootEnd = offset = 3;
                }
            }
        }
    } else if (isPathSeparator(code10)) {
        return path18;
    }
    for(let i = len - 1; i >= offset; --i){
        if (isPathSeparator(path18.charCodeAt(i))) {
            if (!matchedSlash) {
                end = i;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) {
        if (rootEnd === -1) return ".";
        else end = rootEnd;
    }
    return path18.slice(0, end);
}
function basename(path19, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath(path19);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i;
    if (path19.length >= 2) {
        const drive = path19.charCodeAt(0);
        if (isWindowsDeviceRoot(drive)) {
            if (path19.charCodeAt(1) === 58) start = 2;
        }
    }
    if (ext !== undefined && ext.length > 0 && ext.length <= path19.length) {
        if (ext.length === path19.length && ext === path19) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i = path19.length - 1; i >= start; --i){
            const code11 = path19.charCodeAt(i);
            if (isPathSeparator(code11)) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i + 1;
                }
                if (extIdx >= 0) {
                    if (code11 === ext.charCodeAt(extIdx)) {
                        if (--extIdx === -1) {
                            end = i;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path19.length;
        return path19.slice(start, end);
    } else {
        for(i = path19.length - 1; i >= start; --i){
            if (isPathSeparator(path19.charCodeAt(i))) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
        }
        if (end === -1) return "";
        return path19.slice(start, end);
    }
}
function extname(path20) {
    assertPath(path20);
    let start = 0;
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    if (path20.length >= 2 && path20.charCodeAt(1) === 58 && isWindowsDeviceRoot(path20.charCodeAt(0))) {
        start = startPart = 2;
    }
    for(let i = path20.length - 1; i >= start; --i){
        const code12 = path20.charCodeAt(i);
        if (isPathSeparator(code12)) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code12 === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path20.slice(startDot, end);
}
function format(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format("\\", pathObject);
}
function parse2(path21) {
    assertPath(path21);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    const len = path21.length;
    if (len === 0) return ret;
    let rootEnd = 0;
    let code13 = path21.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code13)) {
            rootEnd = 1;
            if (isPathSeparator(path21.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path21.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path21.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path21.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            rootEnd = j;
                        } else if (j !== last) {
                            rootEnd = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot(code13)) {
            if (path21.charCodeAt(1) === 58) {
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator(path21.charCodeAt(2))) {
                        if (len === 3) {
                            ret.root = ret.dir = path21;
                            return ret;
                        }
                        rootEnd = 3;
                    }
                } else {
                    ret.root = ret.dir = path21;
                    return ret;
                }
            }
        }
    } else if (isPathSeparator(code13)) {
        ret.root = ret.dir = path21;
        return ret;
    }
    if (rootEnd > 0) ret.root = path21.slice(0, rootEnd);
    let startDot = -1;
    let startPart = rootEnd;
    let end = -1;
    let matchedSlash = true;
    let i = path21.length - 1;
    let preDotState = 0;
    for(; i >= rootEnd; --i){
        code13 = path21.charCodeAt(i);
        if (isPathSeparator(code13)) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code13 === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            ret.base = ret.name = path21.slice(startPart, end);
        }
    } else {
        ret.name = path21.slice(startPart, startDot);
        ret.base = path21.slice(startPart, end);
        ret.ext = path21.slice(startDot, end);
    }
    if (startPart > 0 && startPart !== rootEnd) {
        ret.dir = path21.slice(0, startPart - 1);
    } else ret.dir = ret.root;
    return ret;
}
function fromFileUrl(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    let path22 = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
    if (url.hostname != "") {
        path22 = `\\\\${url.hostname}${path22}`;
    }
    return path22;
}
function toFileUrl(path23) {
    if (!isAbsolute(path23)) {
        throw new TypeError("Must be an absolute path.");
    }
    const [, hostname, pathname] = path23.match(/^(?:[/\\]{2}([^/\\]+)(?=[/\\](?:[^/\\]|$)))?(.*)/);
    const url = new URL("file:///");
    url.pathname = encodeWhitespace(pathname.replace(/%/g, "%25"));
    if (hostname != null && hostname != "localhost") {
        url.hostname = hostname;
        if (!url.hostname) {
            throw new TypeError("Invalid hostname.");
        }
    }
    return url;
}
const mod = {
    sep: sep,
    delimiter: delimiter,
    resolve: resolve,
    normalize: normalize,
    isAbsolute: isAbsolute,
    join: join,
    relative: relative,
    toNamespacedPath: toNamespacedPath,
    dirname: dirname,
    basename: basename,
    extname: extname,
    format: format,
    parse: parse2,
    fromFileUrl: fromFileUrl,
    toFileUrl: toFileUrl
};
const sep1 = "/";
const delimiter1 = ":";
function resolve1(...pathSegments) {
    let resolvedPath = "";
    let resolvedAbsolute = false;
    for(let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--){
        let path24;
        if (i >= 0) path24 = pathSegments[i];
        else {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path24 = Deno.cwd();
        }
        assertPath(path24);
        if (path24.length === 0) {
            continue;
        }
        resolvedPath = `${path24}/${resolvedPath}`;
        resolvedAbsolute = path24.charCodeAt(0) === CHAR_FORWARD_SLASH;
    }
    resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator);
    if (resolvedAbsolute) {
        if (resolvedPath.length > 0) return `/${resolvedPath}`;
        else return "/";
    } else if (resolvedPath.length > 0) return resolvedPath;
    else return ".";
}
function normalize1(path25) {
    assertPath(path25);
    if (path25.length === 0) return ".";
    const isAbsolute1 = path25.charCodeAt(0) === 47;
    const trailingSeparator = path25.charCodeAt(path25.length - 1) === 47;
    path25 = normalizeString(path25, !isAbsolute1, "/", isPosixPathSeparator);
    if (path25.length === 0 && !isAbsolute1) path25 = ".";
    if (path25.length > 0 && trailingSeparator) path25 += "/";
    if (isAbsolute1) return `/${path25}`;
    return path25;
}
function isAbsolute1(path26) {
    assertPath(path26);
    return path26.length > 0 && path26.charCodeAt(0) === 47;
}
function join1(...paths) {
    if (paths.length === 0) return ".";
    let joined;
    for(let i = 0, len = paths.length; i < len; ++i){
        const path27 = paths[i];
        assertPath(path27);
        if (path27.length > 0) {
            if (!joined) joined = path27;
            else joined += `/${path27}`;
        }
    }
    if (!joined) return ".";
    return normalize1(joined);
}
function relative1(from, to) {
    assertPath(from);
    assertPath(to);
    if (from === to) return "";
    from = resolve1(from);
    to = resolve1(to);
    if (from === to) return "";
    let fromStart = 1;
    const fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 47) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 1;
    const toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (to.charCodeAt(toStart) !== 47) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i = 0;
    for(; i <= length; ++i){
        if (i === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i) === 47) {
                    return to.slice(toStart + i + 1);
                } else if (i === 0) {
                    return to.slice(toStart + i);
                }
            } else if (fromLen > length) {
                if (from.charCodeAt(fromStart + i) === 47) {
                    lastCommonSep = i;
                } else if (i === 0) {
                    lastCommonSep = 0;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i);
        const toCode = to.charCodeAt(toStart + i);
        if (fromCode !== toCode) break;
        else if (fromCode === 47) lastCommonSep = i;
    }
    let out = "";
    for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
        if (i === fromEnd || from.charCodeAt(i) === 47) {
            if (out.length === 0) out += "..";
            else out += "/..";
        }
    }
    if (out.length > 0) return out + to.slice(toStart + lastCommonSep);
    else {
        toStart += lastCommonSep;
        if (to.charCodeAt(toStart) === 47) ++toStart;
        return to.slice(toStart);
    }
}
function toNamespacedPath1(path28) {
    return path28;
}
function dirname1(path29) {
    assertPath(path29);
    if (path29.length === 0) return ".";
    const hasRoot = path29.charCodeAt(0) === 47;
    let end = -1;
    let matchedSlash = true;
    for(let i = path29.length - 1; i >= 1; --i){
        if (path29.charCodeAt(i) === 47) {
            if (!matchedSlash) {
                end = i;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) return hasRoot ? "/" : ".";
    if (hasRoot && end === 1) return "//";
    return path29.slice(0, end);
}
function basename1(path30, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath(path30);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i;
    if (ext !== undefined && ext.length > 0 && ext.length <= path30.length) {
        if (ext.length === path30.length && ext === path30) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i = path30.length - 1; i >= 0; --i){
            const code14 = path30.charCodeAt(i);
            if (code14 === 47) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i + 1;
                }
                if (extIdx >= 0) {
                    if (code14 === ext.charCodeAt(extIdx)) {
                        if (--extIdx === -1) {
                            end = i;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path30.length;
        return path30.slice(start, end);
    } else {
        for(i = path30.length - 1; i >= 0; --i){
            if (path30.charCodeAt(i) === 47) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
        }
        if (end === -1) return "";
        return path30.slice(start, end);
    }
}
function extname1(path31) {
    assertPath(path31);
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    for(let i = path31.length - 1; i >= 0; --i){
        const code15 = path31.charCodeAt(i);
        if (code15 === 47) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code15 === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path31.slice(startDot, end);
}
function format1(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format("/", pathObject);
}
function parse3(path32) {
    assertPath(path32);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    if (path32.length === 0) return ret;
    const isAbsolute2 = path32.charCodeAt(0) === 47;
    let start;
    if (isAbsolute2) {
        ret.root = "/";
        start = 1;
    } else {
        start = 0;
    }
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let i = path32.length - 1;
    let preDotState = 0;
    for(; i >= start; --i){
        const code16 = path32.charCodeAt(i);
        if (code16 === 47) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code16 === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            if (startPart === 0 && isAbsolute2) {
                ret.base = ret.name = path32.slice(1, end);
            } else {
                ret.base = ret.name = path32.slice(startPart, end);
            }
        }
    } else {
        if (startPart === 0 && isAbsolute2) {
            ret.name = path32.slice(1, startDot);
            ret.base = path32.slice(1, end);
        } else {
            ret.name = path32.slice(startPart, startDot);
            ret.base = path32.slice(startPart, end);
        }
        ret.ext = path32.slice(startDot, end);
    }
    if (startPart > 0) ret.dir = path32.slice(0, startPart - 1);
    else if (isAbsolute2) ret.dir = "/";
    return ret;
}
function fromFileUrl1(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
function toFileUrl1(path33) {
    if (!isAbsolute1(path33)) {
        throw new TypeError("Must be an absolute path.");
    }
    const url = new URL("file:///");
    url.pathname = encodeWhitespace(path33.replace(/%/g, "%25").replace(/\\/g, "%5C"));
    return url;
}
const mod1 = {
    sep: sep1,
    delimiter: delimiter1,
    resolve: resolve1,
    normalize: normalize1,
    isAbsolute: isAbsolute1,
    join: join1,
    relative: relative1,
    toNamespacedPath: toNamespacedPath1,
    dirname: dirname1,
    basename: basename1,
    extname: extname1,
    format: format1,
    parse: parse3,
    fromFileUrl: fromFileUrl1,
    toFileUrl: toFileUrl1
};
const path = isWindows ? mod : mod1;
const { join: join2 , normalize: normalize2  } = path;
const path1 = isWindows ? mod : mod1;
const { basename: basename2 , delimiter: delimiter2 , dirname: dirname2 , extname: extname2 , format: format2 , fromFileUrl: fromFileUrl2 , isAbsolute: isAbsolute2 , join: join3 , normalize: normalize3 , parse: parse4 , relative: relative2 , resolve: resolve2 , sep: sep2 , toFileUrl: toFileUrl2 , toNamespacedPath: toNamespacedPath2 ,  } = path1;
const MIME_DB_URL = 'https://cdn.jsdelivr.net/gh/jshttp/mime-db@master/db.json';
const db = await (await fetch(MIME_DB_URL)).json();
function lookup(path34) {
    if (!path34 || typeof path34 !== 'string') {
        return false;
    }
    const extension1 = extname2('x.' + path34).toLowerCase().substr(1);
    if (!extension1) {
        return false;
    }
    return types[extension1] || false;
}
function populateMaps(extensions1, types1) {
    const preference = [
        'nginx',
        'apache',
        undefined,
        'iana'
    ];
    Object.keys(db).forEach(function forEachMimeType(type1) {
        const mime = db[type1];
        const exts = mime.extensions;
        if (!exts || !exts.length) {
            return;
        }
        extensions1[type1] = exts;
        for(let i = 0; i < exts.length; i++){
            const extension2 = exts[i];
            if (types1[extension2]) {
                const from = preference.indexOf(db[types1[extension2]].source);
                const to = preference.indexOf(mime.source);
                if (types1[extension2] !== 'application/octet-stream' && (from > to || from === to && types1[extension2].substr(0, 12) === 'application/')) {
                    continue;
                }
            }
            types1[extension2] = type1;
        }
    });
}
const extensions = Object.create(null);
const types = Object.create(null);
populateMaps(extensions, types);
const osType1 = (()=>{
    const { Deno  } = globalThis;
    if (typeof Deno?.build?.os === "string") {
        return Deno.build.os;
    }
    const { navigator  } = globalThis;
    if (navigator?.appVersion?.includes?.("Win")) {
        return "windows";
    }
    return "linux";
})();
const isWindows1 = osType1 === "windows";
const CHAR_FORWARD_SLASH1 = 47;
function assertPath1(path35) {
    if (typeof path35 !== "string") {
        throw new TypeError(`Path must be a string. Received ${JSON.stringify(path35)}`);
    }
}
function isPosixPathSeparator1(code17) {
    return code17 === 47;
}
function isPathSeparator1(code18) {
    return isPosixPathSeparator1(code18) || code18 === 92;
}
function isWindowsDeviceRoot1(code19) {
    return code19 >= 97 && code19 <= 122 || code19 >= 65 && code19 <= 90;
}
function normalizeString1(path36, allowAboveRoot, separator, isPathSeparator11) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code20;
    for(let i = 0, len = path36.length; i <= len; ++i){
        if (i < len) code20 = path36.charCodeAt(i);
        else if (isPathSeparator11(code20)) break;
        else code20 = CHAR_FORWARD_SLASH1;
        if (isPathSeparator11(code20)) {
            if (lastSlash === i - 1 || dots === 1) {} else if (lastSlash !== i - 1 && dots === 2) {
                if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
                    if (res.length > 2) {
                        const lastSlashIndex = res.lastIndexOf(separator);
                        if (lastSlashIndex === -1) {
                            res = "";
                            lastSegmentLength = 0;
                        } else {
                            res = res.slice(0, lastSlashIndex);
                            lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                        }
                        lastSlash = i;
                        dots = 0;
                        continue;
                    } else if (res.length === 2 || res.length === 1) {
                        res = "";
                        lastSegmentLength = 0;
                        lastSlash = i;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0) res += `${separator}..`;
                    else res = "..";
                    lastSegmentLength = 2;
                }
            } else {
                if (res.length > 0) res += separator + path36.slice(lastSlash + 1, i);
                else res = path36.slice(lastSlash + 1, i);
                lastSegmentLength = i - lastSlash - 1;
            }
            lastSlash = i;
            dots = 0;
        } else if (code20 === 46 && dots !== -1) {
            ++dots;
        } else {
            dots = -1;
        }
    }
    return res;
}
function _format1(sep7, pathObject) {
    const dir = pathObject.dir || pathObject.root;
    const base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
    if (!dir) return base;
    if (dir === pathObject.root) return dir + base;
    return dir + sep7 + base;
}
const WHITESPACE_ENCODINGS1 = {
    "\u0009": "%09",
    "\u000A": "%0A",
    "\u000B": "%0B",
    "\u000C": "%0C",
    "\u000D": "%0D",
    "\u0020": "%20"
};
function encodeWhitespace1(string) {
    return string.replaceAll(/[\s]/g, (c)=>{
        return WHITESPACE_ENCODINGS1[c] ?? c;
    });
}
class DenoStdInternalError2 extends Error {
    constructor(message){
        super(message);
        this.name = "DenoStdInternalError";
    }
}
function assert3(expr, msg178 = "") {
    if (!expr) {
        throw new DenoStdInternalError2(msg178);
    }
}
const sep3 = "\\";
const delimiter3 = ";";
function resolve3(...pathSegments) {
    let resolvedDevice = "";
    let resolvedTail = "";
    let resolvedAbsolute = false;
    for(let i = pathSegments.length - 1; i >= -1; i--){
        let path37;
        const { Deno  } = globalThis;
        if (i >= 0) {
            path37 = pathSegments[i];
        } else if (!resolvedDevice) {
            if (typeof Deno?.cwd !== "function") {
                throw new TypeError("Resolved a drive-letter-less path without a CWD.");
            }
            path37 = Deno.cwd();
        } else {
            if (typeof Deno?.env?.get !== "function" || typeof Deno?.cwd !== "function") {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path37 = Deno.cwd();
            if (path37 === undefined || path37.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
                path37 = `${resolvedDevice}\\`;
            }
        }
        assertPath1(path37);
        const len = path37.length;
        if (len === 0) continue;
        let rootEnd = 0;
        let device = "";
        let isAbsolute11 = false;
        const code21 = path37.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator1(code21)) {
                isAbsolute11 = true;
                if (isPathSeparator1(path37.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for(; j < len; ++j){
                        if (isPathSeparator1(path37.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        const firstPart = path37.slice(last, j);
                        last = j;
                        for(; j < len; ++j){
                            if (!isPathSeparator1(path37.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for(; j < len; ++j){
                                if (isPathSeparator1(path37.charCodeAt(j))) break;
                            }
                            if (j === len) {
                                device = `\\\\${firstPart}\\${path37.slice(last)}`;
                                rootEnd = j;
                            } else if (j !== last) {
                                device = `\\\\${firstPart}\\${path37.slice(last, j)}`;
                                rootEnd = j;
                            }
                        }
                    }
                } else {
                    rootEnd = 1;
                }
            } else if (isWindowsDeviceRoot1(code21)) {
                if (path37.charCodeAt(1) === 58) {
                    device = path37.slice(0, 2);
                    rootEnd = 2;
                    if (len > 2) {
                        if (isPathSeparator1(path37.charCodeAt(2))) {
                            isAbsolute11 = true;
                            rootEnd = 3;
                        }
                    }
                }
            }
        } else if (isPathSeparator1(code21)) {
            rootEnd = 1;
            isAbsolute11 = true;
        }
        if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
            continue;
        }
        if (resolvedDevice.length === 0 && device.length > 0) {
            resolvedDevice = device;
        }
        if (!resolvedAbsolute) {
            resolvedTail = `${path37.slice(rootEnd)}\\${resolvedTail}`;
            resolvedAbsolute = isAbsolute11;
        }
        if (resolvedAbsolute && resolvedDevice.length > 0) break;
    }
    resolvedTail = normalizeString1(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator1);
    return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
}
function normalize4(path38) {
    assertPath1(path38);
    const len = path38.length;
    if (len === 0) return ".";
    let rootEnd = 0;
    let device;
    let isAbsolute21 = false;
    const code22 = path38.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator1(code22)) {
            isAbsolute21 = true;
            if (isPathSeparator1(path38.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator1(path38.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    const firstPart = path38.slice(last, j);
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator1(path38.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator1(path38.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return `\\\\${firstPart}\\${path38.slice(last)}\\`;
                        } else if (j !== last) {
                            device = `\\\\${firstPart}\\${path38.slice(last, j)}`;
                            rootEnd = j;
                        }
                    }
                }
            } else {
                rootEnd = 1;
            }
        } else if (isWindowsDeviceRoot1(code22)) {
            if (path38.charCodeAt(1) === 58) {
                device = path38.slice(0, 2);
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator1(path38.charCodeAt(2))) {
                        isAbsolute21 = true;
                        rootEnd = 3;
                    }
                }
            }
        }
    } else if (isPathSeparator1(code22)) {
        return "\\";
    }
    let tail;
    if (rootEnd < len) {
        tail = normalizeString1(path38.slice(rootEnd), !isAbsolute21, "\\", isPathSeparator1);
    } else {
        tail = "";
    }
    if (tail.length === 0 && !isAbsolute21) tail = ".";
    if (tail.length > 0 && isPathSeparator1(path38.charCodeAt(len - 1))) {
        tail += "\\";
    }
    if (device === undefined) {
        if (isAbsolute21) {
            if (tail.length > 0) return `\\${tail}`;
            else return "\\";
        } else if (tail.length > 0) {
            return tail;
        } else {
            return "";
        }
    } else if (isAbsolute21) {
        if (tail.length > 0) return `${device}\\${tail}`;
        else return `${device}\\`;
    } else if (tail.length > 0) {
        return device + tail;
    } else {
        return device;
    }
}
function isAbsolute3(path39) {
    assertPath1(path39);
    const len = path39.length;
    if (len === 0) return false;
    const code23 = path39.charCodeAt(0);
    if (isPathSeparator1(code23)) {
        return true;
    } else if (isWindowsDeviceRoot1(code23)) {
        if (len > 2 && path39.charCodeAt(1) === 58) {
            if (isPathSeparator1(path39.charCodeAt(2))) return true;
        }
    }
    return false;
}
function join4(...paths) {
    const pathsCount = paths.length;
    if (pathsCount === 0) return ".";
    let joined;
    let firstPart = null;
    for(let i = 0; i < pathsCount; ++i){
        const path40 = paths[i];
        assertPath1(path40);
        if (path40.length > 0) {
            if (joined === undefined) joined = firstPart = path40;
            else joined += `\\${path40}`;
        }
    }
    if (joined === undefined) return ".";
    let needsReplace = true;
    let slashCount = 0;
    assert3(firstPart != null);
    if (isPathSeparator1(firstPart.charCodeAt(0))) {
        ++slashCount;
        const firstLen = firstPart.length;
        if (firstLen > 1) {
            if (isPathSeparator1(firstPart.charCodeAt(1))) {
                ++slashCount;
                if (firstLen > 2) {
                    if (isPathSeparator1(firstPart.charCodeAt(2))) ++slashCount;
                    else {
                        needsReplace = false;
                    }
                }
            }
        }
    }
    if (needsReplace) {
        for(; slashCount < joined.length; ++slashCount){
            if (!isPathSeparator1(joined.charCodeAt(slashCount))) break;
        }
        if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
    }
    return normalize4(joined);
}
function relative3(from, to) {
    assertPath1(from);
    assertPath1(to);
    if (from === to) return "";
    const fromOrig = resolve3(from);
    const toOrig = resolve3(to);
    if (fromOrig === toOrig) return "";
    from = fromOrig.toLowerCase();
    to = toOrig.toLowerCase();
    if (from === to) return "";
    let fromStart = 0;
    let fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 92) break;
    }
    for(; fromEnd - 1 > fromStart; --fromEnd){
        if (from.charCodeAt(fromEnd - 1) !== 92) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 0;
    let toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (to.charCodeAt(toStart) !== 92) break;
    }
    for(; toEnd - 1 > toStart; --toEnd){
        if (to.charCodeAt(toEnd - 1) !== 92) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i = 0;
    for(; i <= length; ++i){
        if (i === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i) === 92) {
                    return toOrig.slice(toStart + i + 1);
                } else if (i === 2) {
                    return toOrig.slice(toStart + i);
                }
            }
            if (fromLen > length) {
                if (from.charCodeAt(fromStart + i) === 92) {
                    lastCommonSep = i;
                } else if (i === 2) {
                    lastCommonSep = 3;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i);
        const toCode = to.charCodeAt(toStart + i);
        if (fromCode !== toCode) break;
        else if (fromCode === 92) lastCommonSep = i;
    }
    if (i !== length && lastCommonSep === -1) {
        return toOrig;
    }
    let out = "";
    if (lastCommonSep === -1) lastCommonSep = 0;
    for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
        if (i === fromEnd || from.charCodeAt(i) === 92) {
            if (out.length === 0) out += "..";
            else out += "\\..";
        }
    }
    if (out.length > 0) {
        return out + toOrig.slice(toStart + lastCommonSep, toEnd);
    } else {
        toStart += lastCommonSep;
        if (toOrig.charCodeAt(toStart) === 92) ++toStart;
        return toOrig.slice(toStart, toEnd);
    }
}
function toNamespacedPath3(path41) {
    if (typeof path41 !== "string") return path41;
    if (path41.length === 0) return "";
    const resolvedPath = resolve3(path41);
    if (resolvedPath.length >= 3) {
        if (resolvedPath.charCodeAt(0) === 92) {
            if (resolvedPath.charCodeAt(1) === 92) {
                const code24 = resolvedPath.charCodeAt(2);
                if (code24 !== 63 && code24 !== 46) {
                    return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
                }
            }
        } else if (isWindowsDeviceRoot1(resolvedPath.charCodeAt(0))) {
            if (resolvedPath.charCodeAt(1) === 58 && resolvedPath.charCodeAt(2) === 92) {
                return `\\\\?\\${resolvedPath}`;
            }
        }
    }
    return path41;
}
function dirname3(path42) {
    assertPath1(path42);
    const len = path42.length;
    if (len === 0) return ".";
    let rootEnd = -1;
    let end = -1;
    let matchedSlash = true;
    let offset = 0;
    const code25 = path42.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator1(code25)) {
            rootEnd = offset = 1;
            if (isPathSeparator1(path42.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator1(path42.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator1(path42.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator1(path42.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return path42;
                        }
                        if (j !== last) {
                            rootEnd = offset = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot1(code25)) {
            if (path42.charCodeAt(1) === 58) {
                rootEnd = offset = 2;
                if (len > 2) {
                    if (isPathSeparator1(path42.charCodeAt(2))) rootEnd = offset = 3;
                }
            }
        }
    } else if (isPathSeparator1(code25)) {
        return path42;
    }
    for(let i = len - 1; i >= offset; --i){
        if (isPathSeparator1(path42.charCodeAt(i))) {
            if (!matchedSlash) {
                end = i;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) {
        if (rootEnd === -1) return ".";
        else end = rootEnd;
    }
    return path42.slice(0, end);
}
function basename3(path43, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath1(path43);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i;
    if (path43.length >= 2) {
        const drive = path43.charCodeAt(0);
        if (isWindowsDeviceRoot1(drive)) {
            if (path43.charCodeAt(1) === 58) start = 2;
        }
    }
    if (ext !== undefined && ext.length > 0 && ext.length <= path43.length) {
        if (ext.length === path43.length && ext === path43) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i = path43.length - 1; i >= start; --i){
            const code26 = path43.charCodeAt(i);
            if (isPathSeparator1(code26)) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i + 1;
                }
                if (extIdx >= 0) {
                    if (code26 === ext.charCodeAt(extIdx)) {
                        if (--extIdx === -1) {
                            end = i;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path43.length;
        return path43.slice(start, end);
    } else {
        for(i = path43.length - 1; i >= start; --i){
            if (isPathSeparator1(path43.charCodeAt(i))) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
        }
        if (end === -1) return "";
        return path43.slice(start, end);
    }
}
function extname3(path44) {
    assertPath1(path44);
    let start = 0;
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    if (path44.length >= 2 && path44.charCodeAt(1) === 58 && isWindowsDeviceRoot1(path44.charCodeAt(0))) {
        start = startPart = 2;
    }
    for(let i = path44.length - 1; i >= start; --i){
        const code27 = path44.charCodeAt(i);
        if (isPathSeparator1(code27)) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code27 === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path44.slice(startDot, end);
}
function format3(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format1("\\", pathObject);
}
function parse5(path45) {
    assertPath1(path45);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    const len = path45.length;
    if (len === 0) return ret;
    let rootEnd = 0;
    let code28 = path45.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator1(code28)) {
            rootEnd = 1;
            if (isPathSeparator1(path45.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator1(path45.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator1(path45.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator1(path45.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            rootEnd = j;
                        } else if (j !== last) {
                            rootEnd = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot1(code28)) {
            if (path45.charCodeAt(1) === 58) {
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator1(path45.charCodeAt(2))) {
                        if (len === 3) {
                            ret.root = ret.dir = path45;
                            return ret;
                        }
                        rootEnd = 3;
                    }
                } else {
                    ret.root = ret.dir = path45;
                    return ret;
                }
            }
        }
    } else if (isPathSeparator1(code28)) {
        ret.root = ret.dir = path45;
        return ret;
    }
    if (rootEnd > 0) ret.root = path45.slice(0, rootEnd);
    let startDot = -1;
    let startPart = rootEnd;
    let end = -1;
    let matchedSlash = true;
    let i = path45.length - 1;
    let preDotState = 0;
    for(; i >= rootEnd; --i){
        code28 = path45.charCodeAt(i);
        if (isPathSeparator1(code28)) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code28 === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            ret.base = ret.name = path45.slice(startPart, end);
        }
    } else {
        ret.name = path45.slice(startPart, startDot);
        ret.base = path45.slice(startPart, end);
        ret.ext = path45.slice(startDot, end);
    }
    if (startPart > 0 && startPart !== rootEnd) {
        ret.dir = path45.slice(0, startPart - 1);
    } else ret.dir = ret.root;
    return ret;
}
function fromFileUrl3(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    let path46 = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
    if (url.hostname != "") {
        path46 = `\\\\${url.hostname}${path46}`;
    }
    return path46;
}
function toFileUrl3(path47) {
    if (!isAbsolute3(path47)) {
        throw new TypeError("Must be an absolute path.");
    }
    const [, hostname, pathname] = path47.match(/^(?:[/\\]{2}([^/\\]+)(?=[/\\](?:[^/\\]|$)))?(.*)/);
    const url = new URL("file:///");
    url.pathname = encodeWhitespace1(pathname.replace(/%/g, "%25"));
    if (hostname != null && hostname != "localhost") {
        url.hostname = hostname;
        if (!url.hostname) {
            throw new TypeError("Invalid hostname.");
        }
    }
    return url;
}
const mod2 = {
    sep: sep3,
    delimiter: delimiter3,
    resolve: resolve3,
    normalize: normalize4,
    isAbsolute: isAbsolute3,
    join: join4,
    relative: relative3,
    toNamespacedPath: toNamespacedPath3,
    dirname: dirname3,
    basename: basename3,
    extname: extname3,
    format: format3,
    parse: parse5,
    fromFileUrl: fromFileUrl3,
    toFileUrl: toFileUrl3
};
const sep4 = "/";
const delimiter4 = ":";
function resolve4(...pathSegments) {
    let resolvedPath = "";
    let resolvedAbsolute = false;
    for(let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--){
        let path48;
        if (i >= 0) path48 = pathSegments[i];
        else {
            const { Deno  } = globalThis;
            if (typeof Deno?.cwd !== "function") {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path48 = Deno.cwd();
        }
        assertPath1(path48);
        if (path48.length === 0) {
            continue;
        }
        resolvedPath = `${path48}/${resolvedPath}`;
        resolvedAbsolute = path48.charCodeAt(0) === CHAR_FORWARD_SLASH1;
    }
    resolvedPath = normalizeString1(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator1);
    if (resolvedAbsolute) {
        if (resolvedPath.length > 0) return `/${resolvedPath}`;
        else return "/";
    } else if (resolvedPath.length > 0) return resolvedPath;
    else return ".";
}
function normalize5(path49) {
    assertPath1(path49);
    if (path49.length === 0) return ".";
    const isAbsolute12 = path49.charCodeAt(0) === 47;
    const trailingSeparator = path49.charCodeAt(path49.length - 1) === 47;
    path49 = normalizeString1(path49, !isAbsolute12, "/", isPosixPathSeparator1);
    if (path49.length === 0 && !isAbsolute12) path49 = ".";
    if (path49.length > 0 && trailingSeparator) path49 += "/";
    if (isAbsolute12) return `/${path49}`;
    return path49;
}
function isAbsolute4(path50) {
    assertPath1(path50);
    return path50.length > 0 && path50.charCodeAt(0) === 47;
}
function join5(...paths) {
    if (paths.length === 0) return ".";
    let joined;
    for(let i = 0, len = paths.length; i < len; ++i){
        const path51 = paths[i];
        assertPath1(path51);
        if (path51.length > 0) {
            if (!joined) joined = path51;
            else joined += `/${path51}`;
        }
    }
    if (!joined) return ".";
    return normalize5(joined);
}
function relative4(from, to) {
    assertPath1(from);
    assertPath1(to);
    if (from === to) return "";
    from = resolve4(from);
    to = resolve4(to);
    if (from === to) return "";
    let fromStart = 1;
    const fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 47) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 1;
    const toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (to.charCodeAt(toStart) !== 47) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i = 0;
    for(; i <= length; ++i){
        if (i === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i) === 47) {
                    return to.slice(toStart + i + 1);
                } else if (i === 0) {
                    return to.slice(toStart + i);
                }
            } else if (fromLen > length) {
                if (from.charCodeAt(fromStart + i) === 47) {
                    lastCommonSep = i;
                } else if (i === 0) {
                    lastCommonSep = 0;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i);
        const toCode = to.charCodeAt(toStart + i);
        if (fromCode !== toCode) break;
        else if (fromCode === 47) lastCommonSep = i;
    }
    let out = "";
    for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
        if (i === fromEnd || from.charCodeAt(i) === 47) {
            if (out.length === 0) out += "..";
            else out += "/..";
        }
    }
    if (out.length > 0) return out + to.slice(toStart + lastCommonSep);
    else {
        toStart += lastCommonSep;
        if (to.charCodeAt(toStart) === 47) ++toStart;
        return to.slice(toStart);
    }
}
function toNamespacedPath4(path52) {
    return path52;
}
function dirname4(path53) {
    assertPath1(path53);
    if (path53.length === 0) return ".";
    const hasRoot = path53.charCodeAt(0) === 47;
    let end = -1;
    let matchedSlash = true;
    for(let i = path53.length - 1; i >= 1; --i){
        if (path53.charCodeAt(i) === 47) {
            if (!matchedSlash) {
                end = i;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) return hasRoot ? "/" : ".";
    if (hasRoot && end === 1) return "//";
    return path53.slice(0, end);
}
function basename4(path54, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath1(path54);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i;
    if (ext !== undefined && ext.length > 0 && ext.length <= path54.length) {
        if (ext.length === path54.length && ext === path54) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i = path54.length - 1; i >= 0; --i){
            const code29 = path54.charCodeAt(i);
            if (code29 === 47) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i + 1;
                }
                if (extIdx >= 0) {
                    if (code29 === ext.charCodeAt(extIdx)) {
                        if (--extIdx === -1) {
                            end = i;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path54.length;
        return path54.slice(start, end);
    } else {
        for(i = path54.length - 1; i >= 0; --i){
            if (path54.charCodeAt(i) === 47) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
        }
        if (end === -1) return "";
        return path54.slice(start, end);
    }
}
function extname4(path55) {
    assertPath1(path55);
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    for(let i = path55.length - 1; i >= 0; --i){
        const code30 = path55.charCodeAt(i);
        if (code30 === 47) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code30 === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path55.slice(startDot, end);
}
function format4(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format1("/", pathObject);
}
function parse6(path56) {
    assertPath1(path56);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    if (path56.length === 0) return ret;
    const isAbsolute22 = path56.charCodeAt(0) === 47;
    let start;
    if (isAbsolute22) {
        ret.root = "/";
        start = 1;
    } else {
        start = 0;
    }
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let i = path56.length - 1;
    let preDotState = 0;
    for(; i >= start; --i){
        const code31 = path56.charCodeAt(i);
        if (code31 === 47) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code31 === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            if (startPart === 0 && isAbsolute22) {
                ret.base = ret.name = path56.slice(1, end);
            } else {
                ret.base = ret.name = path56.slice(startPart, end);
            }
        }
    } else {
        if (startPart === 0 && isAbsolute22) {
            ret.name = path56.slice(1, startDot);
            ret.base = path56.slice(1, end);
        } else {
            ret.name = path56.slice(startPart, startDot);
            ret.base = path56.slice(startPart, end);
        }
        ret.ext = path56.slice(startDot, end);
    }
    if (startPart > 0) ret.dir = path56.slice(0, startPart - 1);
    else if (isAbsolute22) ret.dir = "/";
    return ret;
}
function fromFileUrl4(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
function toFileUrl4(path57) {
    if (!isAbsolute4(path57)) {
        throw new TypeError("Must be an absolute path.");
    }
    const url = new URL("file:///");
    url.pathname = encodeWhitespace1(path57.replace(/%/g, "%25").replace(/\\/g, "%5C"));
    return url;
}
const mod3 = {
    sep: sep4,
    delimiter: delimiter4,
    resolve: resolve4,
    normalize: normalize5,
    isAbsolute: isAbsolute4,
    join: join5,
    relative: relative4,
    toNamespacedPath: toNamespacedPath4,
    dirname: dirname4,
    basename: basename4,
    extname: extname4,
    format: format4,
    parse: parse6,
    fromFileUrl: fromFileUrl4,
    toFileUrl: toFileUrl4
};
const path2 = isWindows1 ? mod2 : mod3;
const { join: join6 , normalize: normalize6  } = path2;
const path3 = isWindows1 ? mod2 : mod3;
const { basename: basename5 , delimiter: delimiter5 , dirname: dirname5 , extname: extname5 , format: format5 , fromFileUrl: fromFileUrl5 , isAbsolute: isAbsolute5 , join: join7 , normalize: normalize7 , parse: parse7 , relative: relative5 , resolve: resolve5 , sep: sep5 , toFileUrl: toFileUrl5 , toNamespacedPath: toNamespacedPath5 ,  } = path3;
const hexTable = new TextEncoder().encode("0123456789abcdef");
function encodedLen(n) {
    return n * 2;
}
function encode(src) {
    const dst = new Uint8Array(encodedLen(src.length));
    for(let i = 0; i < dst.length; i++){
        const v = src[i];
        dst[i * 2] = hexTable[v >> 4];
        dst[i * 2 + 1] = hexTable[v & 0x0f];
    }
    return dst;
}
function encodeToString(src) {
    return new TextDecoder().decode(encode(src));
}
function delay(ms, options = {}) {
    const { signal  } = options;
    if (signal?.aborted) {
        return Promise.reject(new DOMException("Delay was aborted.", "AbortError"));
    }
    return new Promise((resolve6, reject)=>{
        const abort = ()=>{
            clearTimeout(i);
            reject(new DOMException("Delay was aborted.", "AbortError"));
        };
        const done = ()=>{
            signal?.removeEventListener("abort", abort);
            resolve6();
        };
        const i = setTimeout(done, ms);
        signal?.addEventListener("abort", abort, {
            once: true
        });
    });
}
const ERROR_SERVER_CLOSED = "Server closed";
const INITIAL_ACCEPT_BACKOFF_DELAY = 5;
const MAX_ACCEPT_BACKOFF_DELAY = 1000;
class Server {
    #port;
    #host;
    #handler;
    #closed = false;
    #listeners = new Set();
    #httpConnections = new Set();
    #onError;
    constructor(serverInit){
        this.#port = serverInit.port;
        this.#host = serverInit.hostname;
        this.#handler = serverInit.handler;
        this.#onError = serverInit.onError ?? function(error1) {
            console.error(error1);
            return new Response("Internal Server Error", {
                status: 500
            });
        };
    }
    async serve(listener1) {
        if (this.#closed) {
            throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
        }
        this.#trackListener(listener1);
        try {
            return await this.#accept(listener1);
        } finally{
            this.#untrackListener(listener1);
            try {
                listener1.close();
            } catch  {}
        }
    }
    async listenAndServe() {
        if (this.#closed) {
            throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
        }
        const listener2 = Deno.listen({
            port: this.#port ?? 80,
            hostname: this.#host ?? "0.0.0.0",
            transport: "tcp"
        });
        return await this.serve(listener2);
    }
    async listenAndServeTls(certFile, keyFile) {
        if (this.#closed) {
            throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
        }
        const listener3 = Deno.listenTls({
            port: this.#port ?? 443,
            hostname: this.#host ?? "0.0.0.0",
            certFile,
            keyFile,
            transport: "tcp"
        });
        return await this.serve(listener3);
    }
    close() {
        if (this.#closed) {
            throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
        }
        this.#closed = true;
        for (const listener4 of this.#listeners){
            try {
                listener4.close();
            } catch  {}
        }
        this.#listeners.clear();
        for (const httpConn of this.#httpConnections){
            this.#closeHttpConn(httpConn);
        }
        this.#httpConnections.clear();
    }
    get closed() {
        return this.#closed;
    }
    get addrs() {
        return Array.from(this.#listeners).map((listener5)=>listener5.addr);
    }
    async #respond(requestEvent, httpConn, connInfo) {
        let response;
        try {
            response = await this.#handler(requestEvent.request, connInfo);
        } catch (error) {
            response = await this.#onError(error);
        }
        try {
            await requestEvent.respondWith(response);
        } catch  {
            return this.#closeHttpConn(httpConn);
        }
    }
    async #serveHttp(httpConn1, connInfo1) {
        while(!this.#closed){
            let requestEvent;
            try {
                requestEvent = await httpConn1.nextRequest();
            } catch  {
                break;
            }
            if (requestEvent === null) {
                break;
            }
            this.#respond(requestEvent, httpConn1, connInfo1);
        }
        this.#closeHttpConn(httpConn1);
    }
    async #accept(listener6) {
        let acceptBackoffDelay;
        while(!this.#closed){
            let conn;
            try {
                conn = await listener6.accept();
            } catch (error) {
                if (error instanceof Deno.errors.BadResource || error instanceof Deno.errors.InvalidData || error instanceof Deno.errors.UnexpectedEof || error instanceof Deno.errors.ConnectionReset || error instanceof Deno.errors.NotConnected) {
                    if (!acceptBackoffDelay) {
                        acceptBackoffDelay = INITIAL_ACCEPT_BACKOFF_DELAY;
                    } else {
                        acceptBackoffDelay *= 2;
                    }
                    if (acceptBackoffDelay >= 1000) {
                        acceptBackoffDelay = MAX_ACCEPT_BACKOFF_DELAY;
                    }
                    await delay(acceptBackoffDelay);
                    continue;
                }
                throw error;
            }
            acceptBackoffDelay = undefined;
            let httpConn;
            try {
                httpConn = Deno.serveHttp(conn);
            } catch  {
                continue;
            }
            this.#trackHttpConnection(httpConn);
            const connInfo = {
                localAddr: conn.localAddr,
                remoteAddr: conn.remoteAddr
            };
            this.#serveHttp(httpConn, connInfo);
        }
    }
     #closeHttpConn(httpConn2) {
        this.#untrackHttpConnection(httpConn2);
        try {
            httpConn2.close();
        } catch  {}
    }
     #trackListener(listener1) {
        this.#listeners.add(listener1);
    }
     #untrackListener(listener2) {
        this.#listeners.delete(listener2);
    }
     #trackHttpConnection(httpConn3) {
        this.#httpConnections.add(httpConn3);
    }
     #untrackHttpConnection(httpConn4) {
        this.#httpConnections.delete(httpConn4);
    }
}
function decode(b64) {
    const binString = atob(b64);
    const size = binString.length;
    const bytes = new Uint8Array(size);
    for(let i = 0; i < size; i++){
        bytes[i] = binString.charCodeAt(i);
    }
    return bytes;
}
const hexTable1 = new TextEncoder().encode("0123456789abcdef");
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
function encode1(src) {
    const dst = new Uint8Array(src.length * 2);
    for(let i = 0; i < dst.length; i++){
        const v = src[i];
        dst[i * 2] = hexTable1[v >> 4];
        dst[i * 2 + 1] = hexTable1[v & 0x0f];
    }
    return dst;
}
function decode1(src) {
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
class DenoStdInternalError3 extends Error {
    constructor(message){
        super(message);
        this.name = "DenoStdInternalError";
    }
}
function assert4(expr, msg179 = "") {
    if (!expr) {
        throw new DenoStdInternalError3(msg179);
    }
}
function createLiteralTestFunction(value) {
    return (string)=>{
        return string.startsWith(value) ? {
            value,
            length: value.length
        } : undefined;
    };
}
function createMatchTestFunction(match) {
    return (string)=>{
        const result = match.exec(string);
        if (result) return {
            value: result,
            length: result[0].length
        };
    };
}
[
    {
        test: createLiteralTestFunction("yyyy"),
        fn: ()=>({
                type: "year",
                value: "numeric"
            })
    },
    {
        test: createLiteralTestFunction("yy"),
        fn: ()=>({
                type: "year",
                value: "2-digit"
            })
    },
    {
        test: createLiteralTestFunction("MM"),
        fn: ()=>({
                type: "month",
                value: "2-digit"
            })
    },
    {
        test: createLiteralTestFunction("M"),
        fn: ()=>({
                type: "month",
                value: "numeric"
            })
    },
    {
        test: createLiteralTestFunction("dd"),
        fn: ()=>({
                type: "day",
                value: "2-digit"
            })
    },
    {
        test: createLiteralTestFunction("d"),
        fn: ()=>({
                type: "day",
                value: "numeric"
            })
    },
    {
        test: createLiteralTestFunction("HH"),
        fn: ()=>({
                type: "hour",
                value: "2-digit"
            })
    },
    {
        test: createLiteralTestFunction("H"),
        fn: ()=>({
                type: "hour",
                value: "numeric"
            })
    },
    {
        test: createLiteralTestFunction("hh"),
        fn: ()=>({
                type: "hour",
                value: "2-digit",
                hour12: true
            })
    },
    {
        test: createLiteralTestFunction("h"),
        fn: ()=>({
                type: "hour",
                value: "numeric",
                hour12: true
            })
    },
    {
        test: createLiteralTestFunction("mm"),
        fn: ()=>({
                type: "minute",
                value: "2-digit"
            })
    },
    {
        test: createLiteralTestFunction("m"),
        fn: ()=>({
                type: "minute",
                value: "numeric"
            })
    },
    {
        test: createLiteralTestFunction("ss"),
        fn: ()=>({
                type: "second",
                value: "2-digit"
            })
    },
    {
        test: createLiteralTestFunction("s"),
        fn: ()=>({
                type: "second",
                value: "numeric"
            })
    },
    {
        test: createLiteralTestFunction("SSS"),
        fn: ()=>({
                type: "fractionalSecond",
                value: 3
            })
    },
    {
        test: createLiteralTestFunction("SS"),
        fn: ()=>({
                type: "fractionalSecond",
                value: 2
            })
    },
    {
        test: createLiteralTestFunction("S"),
        fn: ()=>({
                type: "fractionalSecond",
                value: 1
            })
    },
    {
        test: createLiteralTestFunction("a"),
        fn: (value)=>({
                type: "dayPeriod",
                value: value
            })
    },
    {
        test: createMatchTestFunction(/^(')(?<value>\\.|[^\']*)\1/),
        fn: (match)=>({
                type: "literal",
                value: match.groups.value
            })
    },
    {
        test: createMatchTestFunction(/^.+?\s*/),
        fn: (match)=>({
                type: "literal",
                value: match[0]
            })
    }, 
];
var Day;
(function(Day1) {
    Day1[Day1["Sun"] = 0] = "Sun";
    Day1[Day1["Mon"] = 1] = "Mon";
    Day1[Day1["Tue"] = 2] = "Tue";
    Day1[Day1["Wed"] = 3] = "Wed";
    Day1[Day1["Thu"] = 4] = "Thu";
    Day1[Day1["Fri"] = 5] = "Fri";
    Day1[Day1["Sat"] = 6] = "Sat";
})(Day || (Day = {}));
function toIMF(date) {
    function dtPad(v, lPad = 2) {
        return v.padStart(lPad, "0");
    }
    const d = dtPad(date.getUTCDate().toString());
    const h = dtPad(date.getUTCHours().toString());
    const min = dtPad(date.getUTCMinutes().toString());
    const s = dtPad(date.getUTCSeconds().toString());
    const y = date.getUTCFullYear();
    const days = [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"
    ];
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec", 
    ];
    return `${days[date.getUTCDay()]}, ${d} ${months[date.getUTCMonth()]} ${y} ${h}:${min}:${s} GMT`;
}
const FIELD_CONTENT_REGEXP = /^(?=[\x20-\x7E]*$)[^()@<>,;:\\"\[\]?={}\s]+$/;
function toString1(cookie) {
    if (!cookie.name) {
        return "";
    }
    const out = [];
    validateName(cookie.name);
    validateValue(cookie.name, cookie.value);
    out.push(`${cookie.name}=${cookie.value}`);
    if (cookie.name.startsWith("__Secure")) {
        cookie.secure = true;
    }
    if (cookie.name.startsWith("__Host")) {
        cookie.path = "/";
        cookie.secure = true;
        delete cookie.domain;
    }
    if (cookie.secure) {
        out.push("Secure");
    }
    if (cookie.httpOnly) {
        out.push("HttpOnly");
    }
    if (typeof cookie.maxAge === "number" && Number.isInteger(cookie.maxAge)) {
        assert4(cookie.maxAge >= 0, "Max-Age must be an integer superior or equal to 0");
        out.push(`Max-Age=${cookie.maxAge}`);
    }
    if (cookie.domain) {
        validateDomain(cookie.domain);
        out.push(`Domain=${cookie.domain}`);
    }
    if (cookie.sameSite) {
        out.push(`SameSite=${cookie.sameSite}`);
    }
    if (cookie.path) {
        validatePath(cookie.path);
        out.push(`Path=${cookie.path}`);
    }
    if (cookie.expires) {
        const dateString = toIMF(cookie.expires);
        out.push(`Expires=${dateString}`);
    }
    if (cookie.unparsed) {
        out.push(cookie.unparsed.join("; "));
    }
    return out.join("; ");
}
function validateName(name) {
    if (name && !FIELD_CONTENT_REGEXP.test(name)) {
        throw new TypeError(`Invalid cookie name: "${name}".`);
    }
}
function validatePath(path58) {
    if (path58 == null) {
        return;
    }
    for(let i = 0; i < path58.length; i++){
        const c = path58.charAt(i);
        if (c < String.fromCharCode(0x20) || c > String.fromCharCode(0x7E) || c == ";") {
            throw new Error(path58 + ": Invalid cookie path char '" + c + "'");
        }
    }
}
function validateValue(name, value) {
    if (value == null || name == null) return;
    for(let i = 0; i < value.length; i++){
        const c = value.charAt(i);
        if (c < String.fromCharCode(0x21) || c == String.fromCharCode(0x22) || c == String.fromCharCode(0x2c) || c == String.fromCharCode(0x3b) || c == String.fromCharCode(0x5c) || c == String.fromCharCode(0x7f)) {
            throw new Error("RFC2616 cookie '" + name + "' cannot have '" + c + "' as value");
        }
        if (c > String.fromCharCode(0x80)) {
            throw new Error("RFC2616 cookie '" + name + "' can only have US-ASCII chars as value" + c.charCodeAt(0).toString(16));
        }
    }
}
function validateDomain(domain) {
    if (domain == null) {
        return;
    }
    const char1 = domain.charAt(0);
    const charN = domain.charAt(domain.length - 1);
    if (char1 == "-" || charN == "." || charN == "-") {
        throw new Error("Invalid first/last char in cookie domain: " + domain);
    }
}
function getCookies(headers) {
    const cookie = headers.get("Cookie");
    if (cookie != null) {
        const out = {};
        const c = cookie.split(";");
        for (const kv of c){
            const [cookieKey, ...cookieVal] = kv.split("=");
            assert4(cookieKey != null);
            const key34 = cookieKey.trim();
            out[key34] = cookieVal.join("=");
        }
        return out;
    }
    return {};
}
function setCookie(headers, cookie) {
    const v = toString1(cookie);
    if (v) {
        headers.append("Set-Cookie", v);
    }
}
function deleteCookie(headers, name, attributes) {
    setCookie(headers, {
        name: name,
        value: "",
        expires: new Date(0),
        ...attributes
    });
}
const mod4 = {
    getCookies: getCookies,
    setCookie: setCookie,
    deleteCookie: deleteCookie
};
class Cache {
    cache = {};
    constructor(){}
    get = (key35)=>{
        const item = this.cache[key35];
        if (item && item.expires !== 0 && Date.now() >= item.expires) {
            this.remove(key35);
        }
        return this.cache[key35] ? this.cache[key35].value : null;
    };
    set = (key36, value, expires)=>{
        expires = typeof expires == 'number' && expires > 0 ? Date.now() + expires * 1000 : 0;
        this.cache[key36] = {
            value,
            expires
        };
    };
    setExpires = (key37, expires)=>{
        expires = typeof expires == 'number' && expires > 0 ? Date.now() + expires * 1000 : 0;
        if (this.cache[key37]) this.cache[key37].expires = expires;
    };
    remove = (key38)=>{
        delete this.cache[key38];
    };
}
class Feature {
    featureFlags;
    constructor(ctx){
        this.featureFlags = ctx.request.cookies.featureFlags ? ctx.request.cookies.featureFlags.split(':') : [];
        const appSettingFlags = ctx.settings.featureFlags ? ctx.settings.featureFlags.split(':') : [];
        this.featureFlags.push(...appSettingFlags);
    }
    async flag(obj) {
        for(const prop in obj){
            let found = false;
            const flags = prop.split(':');
            for (const flag1 of flags){
                if (this.featureFlags.includes(flag1) || flag1 == 'default') {
                    await obj[prop]();
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
    }
}
class JSphereTestRunner {
    tags;
    beforeAllTestCasesStack = [];
    afterAllTestCasesStack = [];
    beforeEachTestCaseStack = [];
    afterEachTestCaseStack = [];
    testCaseStack = [];
    testSuiteSummary;
    constructor(name, description, tags){
        this.tags = tags;
        this.testSuiteSummary = {
            name,
            description,
            tests: 0,
            failures: 0,
            time: 0,
            testcases: []
        };
    }
    async runTestSuite() {
        let testSuiteRunTime = 0;
        let testCaseCount = 0;
        let testCaseFailureCount = 0;
        await this.runBeforeAllTestCases();
        for (const testCase of this.testCaseStack){
            if (testCase.tags.length === 0 || testCase.tags.some((tag)=>this.tags.includes(tag))) {
                await this.runBeforeEachTestCase();
                const testCaseSummary = {
                    name: testCase.name,
                    description: testCase.description,
                    failure: {},
                    time: 0
                };
                try {
                    testCaseCount++;
                    performance.mark('start');
                    await testCase.fn();
                    performance.mark('stop');
                } catch (e) {
                    performance.mark('stop');
                    testCaseFailureCount++;
                    testCaseSummary.failure = {};
                    testCaseSummary.failure.type = e.name || 'error';
                    testCaseSummary.failure.message = e.message;
                }
                const testCaseRunTime = Number(performance.measure('runTime', 'start', 'stop').duration.toFixed(3));
                testCaseSummary.time = testCaseRunTime;
                performance.clearMarks();
                testSuiteRunTime += testCaseRunTime;
                this.testSuiteSummary.testcases.push(testCaseSummary);
                await this.runAfterEachTestCase();
            }
        }
        await this.runAfterAllTestCases();
        this.testSuiteSummary.time = testSuiteRunTime;
        this.testSuiteSummary.tests = testCaseCount;
        this.testSuiteSummary.failures = testCaseFailureCount;
    }
    beforeAllTestCasesTask(name, description, tags, fn) {
        this.beforeAllTestCasesStack.push({
            name,
            description,
            tags,
            fn
        });
    }
    afterAllTestCasesTask(name, description, tags, fn) {
        this.afterAllTestCasesStack.push({
            name,
            description,
            tags,
            fn
        });
    }
    beforeEachTestCaseTask(name, description, tags, fn) {
        this.beforeEachTestCaseStack.push({
            name,
            description,
            tags,
            fn
        });
    }
    afterEachTestCaseTask(name, description, tags, fn) {
        this.afterEachTestCaseStack.push({
            name,
            description,
            tags,
            fn
        });
    }
    testCase(name, description, tags, fn) {
        this.testCaseStack.push({
            name,
            description,
            tags,
            fn
        });
    }
    runBeforeAllTestCases = async ()=>{
        for (const task of this.beforeAllTestCasesStack){
            await task.fn();
        }
    };
    runAfterAllTestCases = async ()=>{
        for (const task of this.afterAllTestCasesStack){
            await task.fn();
        }
    };
    runBeforeEachTestCase = async ()=>{
        for (const task of this.beforeEachTestCaseStack){
            await task.fn();
        }
    };
    runAfterEachTestCase = async ()=>{
        for (const task of this.afterEachTestCaseStack){
            await task.fn();
        }
    };
}
class FileSystemProvider {
    config = {};
    constructor(config4){
        this.config = config4;
    }
    async getFile(path59, repo) {
        path59 = `${this.config.root}/${repo}/${path59.split('?')[0]}`;
        try {
            const result = await Deno.readFile(path59);
            return {
                name: path59.split('/').pop(),
                content: result
            };
        } catch (e) {
            error(e.message);
            return null;
        }
    }
    async getConfigFile(path60) {
        path60 = `${this.config.root}/${this.config.repo}/${path60.split('?')[0]}`;
        try {
            const result = await Deno.readFile(path60);
            const content = (new TextDecoder).decode(result);
            return content;
        } catch (e) {
            error(e.message);
            return null;
        }
    }
    get name() {
        return this.config.name;
    }
}
class GitHubProvider {
    config = {};
    constructor(config5){
        this.config = config5;
    }
    async getFile(path61, repo) {
        let url;
        try {
            if (this.config.auth) {
                url = `https://api.github.com/repos/${this.config.root}/${repo}/contents/${path61}`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `token ${this.config.auth}`
                    }
                });
                const result = await response.json();
                if (result.sha) {
                    const content = decode(result.content);
                    result.content = content;
                    return result;
                } else warning(`${url} - ${result.message}`);
            } else {
                const parts = path61.split('?');
                const ref = parts[1] ? parts[1].split('=')[1] : 'main';
                if (parts[1]) path61 = parts[0];
                url = `https://raw.githubusercontent.com/${this.config.root}/${repo}/${ref}/${path61}`;
                const response = await fetch(url, {
                    method: 'GET'
                });
                const result = await response.text();
                return {
                    name: path61.split('/').pop(),
                    content: new TextEncoder().encode(result)
                };
            }
        } catch (e) {
            console.log(e);
        }
        return null;
    }
    async getConfigFile(path62) {
        try {
            let repo = this.config.repo;
            let ref = 'main';
            const parts = repo.split('/');
            if (parts.length === 2) {
                repo = parts[0];
                ref = parts[1];
            }
            if (this.config.auth) {
                const url = `https://api.github.com/repos/${this.config.root}/${repo}/contents/${path62}?ref=${ref}`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `token ${this.config.auth}`
                    }
                });
                const result = await response.json();
                if (result.sha) {
                    const content = (new TextDecoder).decode(decode(result.content));
                    return content;
                } else warning(`${url} - ${result.message}`);
            } else {
                const url = `https://raw.githubusercontent.com/${this.config.root}/${repo}/${ref}/${path62}`;
                const response = await fetch(url, {
                    method: 'GET'
                });
                if (response.ok) {
                    const result = await response.text();
                    return result;
                }
            }
        } catch (e) {
            console.log(e);
        }
        return null;
    }
    get name() {
        return this.config.name;
    }
}
const handlers = [];
async function handleRequest(request) {
    let response = false;
    const url = new URL(request.url);
    if (mod5.isTenantInitialized(url.hostname) === false) {
        response = new Response('Oops.  Your application is initializing. Please wait, then try your request again.', {
            status: 503,
            headers: {
                'content-type': 'text/plain'
            }
        });
    }
    return response;
}
async function handleRequest1(request) {
    let response = false;
    const url = new URL(request.url);
    const isInit = mod5.isTenantInitialized(url.hostname);
    if (!url.pathname.startsWith('/~/') && url.hostname != '127.0.0.1' && !isInit) {
        mod5.initializeTenant(url.hostname, false);
        try {
            let file = await mod5.getProjectHost().getConfigFile(`.tenants/${url.hostname}.json`);
            if (file === null) throw 'Tenant Not Registered';
            const tenantConfig = JSON.parse(file);
            file = await mod5.getProjectHost().getConfigFile(`.applications/${tenantConfig.application}.json`);
            if (file === null) throw 'Tenant Application Not Registered';
            const appConfig = JSON.parse(file);
            const Provider = mod5.getHostProvider(appConfig.host.name);
            if (Provider) {
                const appProvider = new Provider({
                    root: appConfig.host.root,
                    auth: appConfig.host.auth
                });
                mod5.setTenant(url.hostname, {
                    state: {},
                    cache: new Cache(),
                    tenantConfig,
                    appConfig,
                    appProvider,
                    packageItemCacheDTS: Date.now(),
                    packageItemCache: {}
                });
            } else throw `Repo provider '${Provider}' not a registered provider.`;
            mod5.initializeTenant(url.hostname, true);
        } catch (e) {
            mod5.initializeTenant(url.hostname, undefined);
            error(`TenantInitHandler[${url.hostname}]: ${e.message}`);
            response = new Response(`TenantInitHandler[${url.hostname}]`, {
                status: 500
            });
        }
    }
    return response;
}
async function runTestCommand(tenant, request) {
    const url = new URL(request.url);
    const { name , description , testSuites , params  } = await request.HTTPRequest.json();
    const summary = {
        name,
        description,
        tests: 0,
        failures: 0,
        time: 0,
        testSuites: []
    };
    for (const testSuite of testSuites){
        const testRunner = new JSphereTestRunner(testSuite.name, testSuite.description, testSuite.tags);
        const codeContext = {
            run: testRunner,
            assert: chai$1.assert,
            params
        };
        if (tenant.packageItemCache[testSuite.name] !== undefined) {
            const code32 = await import(`http://127.0.0.1${request.routePath}?eTag=${url.hostname}:${tenant.packageItemCacheDTS}`);
            await code32.default(codeContext);
            try {
                await testRunner.runTestSuite();
                summary.time += testRunner.testSuiteSummary.time;
                summary.tests += testRunner.testSuiteSummary.tests;
                summary.failures += testRunner.testSuiteSummary.failures;
                summary.testSuites.push(testRunner.testSuiteSummary);
                continue;
            } catch (e) {
                error(e.message);
            }
        }
        summary.failures++;
        summary.testSuites.push({
            name: testSuite.name,
            description: testSuite.description,
            tests: 0,
            failures: 0,
            time: 0,
            testcases: []
        });
    }
    return summary;
}
async function handleRequest2(request) {
    let response = false;
    const url = new URL(request.url);
    const tenant = mod5.getTenant(url.hostname);
    if (url.pathname == '/~/healthcheck' && request.method == 'GET') {
        return new Response('OK', {
            status: 200
        });
    } else if (url.pathname == '/~/resettenant' && request.method == 'GET' && tenant) {
        try {
            mod5.deleteTenant(url.hostname);
            response = new Response('Tenant application was reset.', {
                status: 200
            });
        } catch (e) {
            response = new Response(e.message, {
                status: 500
            });
        }
    } else if (url.pathname == '/~/runtest' && request.method == 'POST') {
        try {
            const summary = runTestCommand(tenant, request);
            response = new Response(JSON.stringify(summary), {
                status: 200,
                headers: {
                    'content-type': 'application/json'
                }
            });
        } catch (e) {
            response = new Response(e.message, {
                status: 500
            });
        }
    }
    return response;
}
async function handleRequest3(request) {
    let response = false;
    const url = new URL(request.url);
    if (url.hostname == '127.0.0.1' && request.method == 'GET' && request.HTTPRequest.headers.get('user-agent')?.startsWith('Deno')) {
        try {
            const eTag = url.searchParams.get('eTag');
            if (!eTag) return new Response('Not Found', {
                status: 404
            });
            const hostname = eTag.split(':')[0];
            const item = await mod5.getPackageItem(hostname, request.routePath);
            if (item) {
                const content = parseContent(item.content, eTag);
                response = new Response(content, {
                    status: 200,
                    headers: {
                        'content-type': item.contentType || ''
                    }
                });
            } else {
                response = new Response('Not Found', {
                    status: 404
                });
            }
        } catch (e) {
            response = new Response(e.message, {
                status: 500
            });
        }
    }
    return response;
}
async function handleRequest4(request) {
    const url = new URL(request.url);
    const tenant = mod5.getTenant(url.hostname);
    if (tenant.appConfig.routeMappings) {
        for (const entry of tenant.appConfig.routeMappings){
            const mapping = {
                route: entry.route,
                path: entry.path,
                method: entry.method
            };
            const pattern = new URLPattern({
                pathname: mapping.route
            });
            if (pattern.test(url.href)) {
                const folder = mapping.path.split('/')[2];
                if (folder == 'client') {
                    request.routePath = mapping.path;
                    break;
                }
                if (folder == 'server') {
                    request.routeParams = pattern.exec(url.href)?.pathname.groups || {};
                    request.routePath = mapping.path;
                    break;
                }
            }
        }
    }
    return false;
}
async function handleRequest5(request) {
    let response = false;
    const httpRequest = request.HTTPRequest;
    const url = new URL(request.url);
    const folder = request.routePath.split('/')[2];
    if (folder == 'client' && request.method == 'GET') {
        try {
            const item = await mod5.getPackageItem(url.hostname, request.routePath);
            if (item) {
                let eTag = httpRequest.headers.get('if-none-match');
                if (eTag && eTag.startsWith('W/')) eTag = eTag.substring(2);
                if (eTag == item.eTag) {
                    response = new Response(null, {
                        status: 304
                    });
                } else {
                    response = new Response(item.content, {
                        status: 200,
                        headers: {
                            'etag': item.eTag,
                            'content-type': item.contentType || '',
                            'cache-control': item.cacheControl || '',
                            'access-control-allow-origin': item.allowOrigin || ''
                        }
                    });
                }
            } else {
                response = new Response('Not Found', {
                    status: 404
                });
            }
        } catch (e) {
            response = new Response(e.message, {
                status: 500
            });
        }
    }
    return response;
}
async function handleRequest6(request) {
    let response = false;
    const url = new URL(request.url);
    const tenant = mod5.getTenant(url.hostname);
    const folder = request.routePath.split('/')[2];
    if (folder == 'server') {
        let module;
        try {
            module = await import(`http://127.0.0.1${request.routePath}.ts?eTag=${url.hostname}:${tenant.packageItemCacheDTS}`);
        } catch (e) {
            if (e.message.startsWith('Module not found')) {
                return response = new Response('Endpoint Not Found', {
                    status: 404
                });
            } else {
                return response = new Response('Internal Server Error', {
                    status: 500
                });
            }
        }
        const apiContext = await getAPIContext(request.HTTPRequest, request.routeParams);
        const func = module[request.method];
        if (func) {
            response = await func(apiContext);
            if (!response) {
                response = new Response(null, {
                    status: 204
                });
            }
        } else {
            response = new Response('Method Not Allowed', {
                status: 405
            });
        }
    }
    return response;
}
class Utils {
    constructor(){}
    createId = ()=>{
        return crypto.randomUUID();
    };
    createHash = async (value)=>{
        const cryptoData = new TextEncoder().encode(value);
        const hash = encodeToString(new Uint8Array(await crypto.subtle.digest("sha-256", cryptoData)));
        return hash;
    };
    compareWithHash = async (value, hash)=>{
        const cryptoData = new TextEncoder().encode(value);
        const valueHash = encodeToString(new Uint8Array(await crypto.subtle.digest("sha-256", cryptoData)));
        return valueHash === hash;
    };
    decrypt = async (data)=>{
        const keyData = decode1(new TextEncoder().encode(Deno.env.get('CRYPTO_PRIVATE_KEY')));
        const privateKey = await crypto.subtle.importKey('pkcs8', keyData, {
            name: "RSA-OAEP",
            hash: "SHA-512"
        }, true, [
            'decrypt'
        ]);
        const decBuffer = await crypto.subtle.decrypt({
            name: "RSA-OAEP"
        }, privateKey, decode1(new TextEncoder().encode(data)));
        const decData = new Uint8Array(decBuffer);
        const decString = new TextDecoder().decode(decData);
        return decString;
    };
    encrypt = async (data)=>{
        const keyData = decode1(new TextEncoder().encode(Deno.env.get('CRYPTO_PUBLIC_KEY')));
        const publicKey = await crypto.subtle.importKey('spki', keyData, {
            name: "RSA-OAEP",
            hash: "SHA-512"
        }, true, [
            'encrypt'
        ]);
        const encBuffer = await crypto.subtle.encrypt({
            name: "RSA-OAEP"
        }, publicKey, new TextEncoder().encode(data));
        const encData = new Uint8Array(encBuffer);
        const encString = new TextDecoder().decode(encode1(encData));
        return encString;
    };
}
const config2 = {};
const tenants = {};
const hostProviders = {
    FileSystem: FileSystemProvider,
    GitHub: GitHubProvider
};
let host = null;
async function init() {
    setProjectHost();
    await setServerConfig();
    setRequestHandlers();
}
function getHostProvider(provider) {
    return hostProviders[provider];
}
function getProjectHost() {
    return host;
}
function getTenant(hostname) {
    return tenants[hostname];
}
function setTenant(hostname, tenant) {
    tenants[hostname] = tenant;
}
function deleteTenant(hostname) {
    delete tenants[hostname];
}
function isTenantInitialized(hostname) {
    if (tenants[hostname]) return tenants[hostname].initialized;
    else return undefined;
}
function initializeTenant(hostname, value) {
    if (tenants[hostname]) return tenants[hostname].initialized = value;
}
async function handleRequest7(request, connInfo) {
    let response = false;
    let handlerIndex = 0;
    if (handlers.length > 0) {
        const url = new URL(request.url);
        const jsRequest = {
            HTTPRequest: request,
            method: request.method,
            url: request.url,
            routePath: url.pathname,
            routeMethod: '',
            routeParams: {}
        };
        while((response = await handlers[handlerIndex].handleRequest(jsRequest)) === false){
            if (++handlerIndex == handlers.length) break;
        }
    }
    if (response === false) return new Response('Request Handler Not Found.', {
        status: 404
    });
    else return response;
}
async function getPackageItem(hostname, path63) {
    const tenant = tenants[hostname];
    const item = tenant.packageItemCache[path63];
    if (item) return item;
    const packageKey = path63.split('/')[1];
    if (!tenant.appConfig.packages[packageKey]) return null;
    const ref = tenant.appConfig.packages[packageKey].tag || 'main';
    const useLocalRepo = tenant.appConfig.packages[packageKey].useLocalRepo;
    let file;
    if (useLocalRepo === true) {
        file = await host.getFile(path63.substring(packageKey.length + 2) + (ref ? `?ref=${ref}` : ''), packageKey);
    } else {
        file = await tenant.appProvider.getFile(path63.substring(packageKey.length + 2) + (ref ? `?ref=${ref}` : ''), packageKey);
    }
    if (file !== null) {
        const extension = extname5(file.name);
        const contentType = (extension == '.ts' ? 'application/typescript' : lookup(extension) || 'text/plain') + '; charset=utf-8';
        const cryptoData = new TextEncoder().encode(file.content);
        const eTag = file.sha || encodeToString(new Uint8Array(await crypto.subtle.digest("sha-256", cryptoData)));
        const packageItem = {
            contentType,
            content: file.content,
            eTag
        };
        for(let entry in tenant.appConfig.packages[packageKey].packageItemConfig){
            if (path63.startsWith(`/${packageKey}${entry}`)) {
                Object.assign(packageItem, tenant.appConfig.packages[packageKey].packageItemConfig[entry]);
            }
        }
        tenant.packageItemCache[path63] = packageItem;
        return packageItem;
    } else {
        return null;
    }
}
const mod5 = {
    init: init,
    getHostProvider: getHostProvider,
    getProjectHost: getProjectHost,
    getTenant: getTenant,
    setTenant: setTenant,
    deleteTenant: deleteTenant,
    isTenantInitialized: isTenantInitialized,
    initializeTenant: initializeTenant,
    handleRequest: handleRequest7,
    getPackageItem: getPackageItem
};
const mod6 = {
    handleRequest: handleRequest
};
const mod7 = {
    handleRequest: handleRequest1
};
const mod8 = {
    handleRequest: handleRequest2
};
const mod9 = {
    handleRequest: handleRequest3
};
const mod10 = {
    handleRequest: handleRequest4
};
const mod11 = {
    handleRequest: handleRequest5
};
const mod12 = {
    handleRequest: handleRequest6
};
function setProjectHost() {
    let envHostName, envHostRoot, envHostAuth, envServerConfig;
    if (Deno.env.get('USE_LOCAL_CONFIG') === 'true') {
        envHostName = 'FileSystem';
        envHostRoot = `${Deno.cwd().replaceAll('\\', '/')}/${Deno.env.get('LOCAL_ROOT')}`.replaceAll('//', '/');
        envHostAuth = '';
        envServerConfig = Deno.env.get('LOCAL_CONFIG');
        if (!envServerConfig || !envHostRoot) {
            error('Local host is not properly configured. Please check that your environment variables are set correctly.');
            Deno.exit(0);
        }
    } else {
        envHostName = Deno.env.get('REMOTE_HOST');
        envHostRoot = Deno.env.get('REMOTE_ROOT');
        envHostAuth = Deno.env.get('REMOTE_AUTH');
        envServerConfig = Deno.env.get('REMOTE_CONFIG');
        if (!envHostName || !envHostRoot || !envServerConfig) {
            error('Remote host is not properly configured. Please check that your environment variables are set correctly.');
            Deno.exit(0);
        }
    }
    const Host = hostProviders[envHostName];
    if (Host) host = new Host({
        name: envHostName,
        root: envHostRoot,
        auth: envHostAuth,
        repo: envServerConfig
    });
    else warning(`Unsupported host '${envHostName}'. Defaulting to FileSystem.`);
    if (host == null) host = new FileSystemProvider({});
    info(`Host Name: ${envHostName}`);
    info(`Host Root: ${envHostRoot}`);
}
async function setServerConfig() {
    let envServerConfig;
    const path64 = `server.json`;
    if (host.name == 'FileSystem') {
        envServerConfig = Deno.env.get('LOCAL_CONFIG');
    } else {
        envServerConfig = Deno.env.get('REMOTE_CONFIG');
    }
    const content = await host.getConfigFile(path64);
    if (content) {
        const serverConfig = JSON.parse(content);
        Object.assign(config2, serverConfig);
        info(`Server Config: ${envServerConfig}/${path64}`);
    } else warning(`Could not retrieve server configuration '${envServerConfig}/${path64}'.`);
}
function setRequestHandlers() {
    handlers.push(mod6);
    handlers.push(mod7);
    handlers.push(mod8);
    handlers.push(mod9);
    handlers.push(mod10);
    handlers.push(mod11);
    handlers.push(mod12);
}
function parseContent(content, eTag) {
    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();
    let parsedContent = textDecoder.decode(content);
    const found = parsedContent.match(/(import|export)[ ]+[ {}a-z,\*]+[ ]+from[ ]+("|')(?<path>[a-z\/.\-_]+)("|')/gi);
    if (found) {
        for (const entry of found){
            const temp = entry.replace(".ts", `.ts?eTag=${eTag}`);
            parsedContent = parsedContent.replace(entry, temp);
        }
    }
    return textEncoder.encode(parsedContent);
}
async function getAPIContext(request, routeParams) {
    const url = new URL(request.url);
    const tenant = mod5.getTenant(url.hostname);
    const contextExtensions = tenant.tenantConfig.contextExtensions;
    const apiContext = {
        tenant: await getTenantContext(request),
        request: await getRequestContext(request, routeParams),
        response: getResponseContext(request),
        settings: tenant.appConfig.settings || {},
        cache: tenant.cache,
        utils: new Utils()
    };
    apiContext.feature = new Feature(apiContext);
    for(const prop in contextExtensions){
        const module = await import(contextExtensions[prop]);
        apiContext[prop] = await module.createInstance({
            tenantId: tenant.tenantConfig.tenantId,
            hostname: url.hostname,
            tenantConfig: tenant.tenantConfig,
            appConfig: tenant.appConfig,
            state: tenant.state
        }, new Utils());
    }
    return apiContext;
}
async function getTenantContext(request) {
    const url = new URL(request.url);
    const tenant = mod5.getTenant(url.hostname);
    const tenantContext = {
        tenantId: tenant.tenantConfig.tenantId,
        hostname: url.hostname
    };
    return tenantContext;
}
async function getRequestContext(request, routeParams) {
    const url = new URL(request.url);
    const contentType = request.headers.get('content-type');
    const requestContext = {
        headers: {},
        cookies: {},
        params: {},
        data: {},
        files: []
    };
    requestContext.headers = request.headers;
    requestContext.cookies = mod4.getCookies(request.headers);
    requestContext.params = routeParams;
    url.searchParams.forEach((value, key39)=>{
        requestContext.params[key39] = value;
    });
    if (contentType?.startsWith('application/json')) {
        requestContext.data = await request.json();
    } else if (contentType?.startsWith('multipart/form-data') || contentType?.startsWith('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        for await (const [key40, value] of formData){
            if (value instanceof File) {
                requestContext.files.push({
                    content: new Uint8Array(await value.arrayBuffer()),
                    filename: value.name,
                    size: value.size,
                    type: value.type
                });
            } else {
                requestContext.data[key40] = value;
            }
        }
    } else {
        requestContext.data = await request.blob();
    }
    return requestContext;
}
function getResponseContext(request) {
    return new ResponseObject();
}
class ResponseObject {
    constructor(){}
    redirect = (url, status)=>{
        return Response.redirect(url, status);
    };
    send = (body, init1)=>{
        return new Response(body, init1);
    };
    json = (body, status)=>{
        return new Response(JSON.stringify(body), {
            status: status || 200,
            headers: {
                'content-type': 'application/json'
            }
        });
    };
    text = (body, status)=>{
        return new Response(body, {
            status: status || 200,
            headers: {
                'content-type': 'text/plain'
            }
        });
    };
    html = (body, status)=>{
        return new Response(body, {
            status: status || 200,
            headers: {
                'content-type': 'text/html'
            }
        });
    };
}
const cmdArgs = parse1(Deno.args);
const projectName = cmdArgs._[0] ? cmdArgs._[0].toString() : '';
const path4 = `${Deno.cwd()}/${projectName ? projectName + '/' : ''}.env`;
const env = await config({
    path: path4
});
for(const key in env){
    if (!Deno.env.get(key)) Deno.env.set(key, env[key]);
}
await mod5.init();
const serverPort = parseInt(Deno.env.get('SERVER_HTTP_PORT') || '80');
const httpServer = new Server({
    handler: mod5.handleRequest
});
const listener = Deno.listen({
    hostname: '0.0.0.0',
    port: serverPort
});
info(`JSphere Application Server is running.`);
await httpServer.serve(listener);
