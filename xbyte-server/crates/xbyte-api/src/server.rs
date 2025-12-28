use crate::{ClientRoute, ConfigX402, HealthRoute, MemoryDB, PricingRoute, S3Route, XByteS3};
use actix_web::web::{Data, ThinData};
use actix_web::{App, HttpServer};
use std::net;

/// A server that can be used to start the API
pub struct Server<A: net::ToSocketAddrs, R: AsRef<str>> {
    /// The address to bind the server to
    addr: A,
    /// The RPC URL (e.g. ethereum, base, etc.)
    rpc: R,
}

impl<A: net::ToSocketAddrs, R: AsRef<str>> Server<A, R> {
    /// Create a new server
    pub fn new(addr: A, rpc: R) -> Self {
        Self { addr, rpc }
    }

    /// Run the API server
    pub async fn run(self) -> anyhow::Result<()> {
        // Initialize data
        let provider = xbyte_evm::Client::new(self.rpc.as_ref())?;
        let db = MemoryDB::default();
        let config = Data::new(ConfigX402::build());
        let s3 = XByteS3::new().await;

        let app = move || {
            App::new()
                .app_data(config.clone())
                .app_data(ThinData(provider.clone()))
                .app_data(ThinData(db.clone()))
                .app_data(ThinData(s3.clone()))
                // Health routes
                .service(HealthRoute::Status)
                .service(HealthRoute::Index)
                // Pricing routes
                .service(PricingRoute::SetPrice)
                .service(PricingRoute::GetPrice)
                // Client / Customer routes
                .service(ClientRoute::CreateClient)
                .service(ClientRoute::GetClient)
                // S3 routes
                .service(S3Route::GetAllBuckets)
                .service(S3Route::GetAllObjects)
                .service(S3Route::GetObject)
                .wrap(actix_cors::Cors::permissive())
        };

        HttpServer::new(app).bind(self.addr)?.run().await?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_constructor() {
        let addr = "127.0.0.1:80";
        let rpc = "http://localhost:8545";
        let server = Server::new(addr, rpc);

        assert_eq!(server.addr, addr);
        assert_eq!(server.rpc, rpc);
    }
}
