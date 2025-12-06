use crate::{ConfigX402, HealthRoute, PlayerRoute, PricingRoute};
use actix_web::web::Data;
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
        let app = || {
            App::new()
                .app_data(Data::new(ConfigX402::build()))
                .service(PlayerRoute::Play)
                .service(HealthRoute::Status)
                .service(HealthRoute::Index)
                .service(PricingRoute::SetPrice)
                .service(PricingRoute::GetPrice)
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
    async fn test_new() -> anyhow::Result<()> {
        let server = Server::new("127.0.0.1:80");
        server.run().await?;

        Ok(())
    }
}
