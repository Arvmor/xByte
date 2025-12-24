use crate::{
    ClientRoute, ConfigX402, HealthRoute, MemoryDB, PlayerRoute, PricingRoute, S3Route, XByteS3,
};
use actix_web::web::{Data, ThinData};
use actix_web::{App, HttpServer};
use std::net;

/// A server that can be used to start the API
pub struct Server<A: net::ToSocketAddrs> {
    /// The address to bind the server to
    addr: A,
}

impl<A: net::ToSocketAddrs> Server<A> {
    /// Create a new server
    ///
    /// # Arguments
    ///
    /// * `addr` - The address to bind the server to
    pub fn new(addr: A) -> Self {
        Self { addr }
    }

    /// Run the API server
    pub async fn run(self) -> anyhow::Result<()> {
        // Initialize data
        let db = MemoryDB::default();
        let config = Data::new(ConfigX402::build());
        let s3 = XByteS3::new().await;

        let app = move || {
            App::new()
                .app_data(config.clone())
                .app_data(ThinData(db.clone()))
                .app_data(ThinData(s3.clone()))
                // Player routes
                .service(PlayerRoute::Play)
                .service(PlayerRoute::SetContent)
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
        let server = Server::new(addr);

        assert_eq!(server.addr, addr);
    }

    #[actix_web::test]
    #[ignore = "For development purposes"]
    async fn test_new() -> anyhow::Result<()> {
        let server = Server::new("127.0.0.1:80");
        server.run().await?;

        Ok(())
    }
}
