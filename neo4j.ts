import type { Session } from "https://deno.land/x/neo4j_lite_client@4.4.1-preview2/mod.ts";    
import neo4j from "https://deno.land/x/neo4j_lite_client@4.4.1-preview2/mod.ts";    
import * as log from "https://deno.land/std@0.142.0/log/mod.ts";

const tenants:Record<string, any> = {};

export const createInstance = async (tenant: any, utils: any) : Promise<Session|null> => {
    let encrypted, hostname, database, username, password;
    
    if (!tenants[tenant.hostname]) tenants[tenant.hostname] = {};

    if (tenant.tenantConfig.appSettings) {
        encrypted = tenant.tenantConfig.appSettings.encrypted;
        hostname = tenant.tenantConfig.appSettings.dbHostname;
        database = tenant.tenantConfig.appSettings.dbDatabase;
        username = tenant.tenantConfig.appSettings.dbUsername;
        password = tenant.tenantConfig.appSettings.dbPassword;
    }

    if (tenant.state.neo4j === undefined) {
        if (tenants[tenant.hostname].conn) {
            tenants[tenant.hostname].conn.close();
        }
        try {
            if (encrypted && Array.isArray(encrypted) && encrypted.includes('dbPassword')) password = await utils.decrypt(password);
            const authToken = neo4j.auth.basic(username, password);
            tenants[tenant.hostname].conn = neo4j.driver(hostname, authToken);
            tenant.state.neo4j = true;
        }
        catch(e) {
            log.error(`Could not create a database session: neo4j`, e.message);
            return null;
        }
    }

    const session = tenants[tenant.hostname].conn.session({ database });
    return session;
}
