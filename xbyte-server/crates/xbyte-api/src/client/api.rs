use crate::{Client, Database, MemoryDB, ResultAPI};
use actix_web::dev::HttpServiceFactory;
use actix_web::{Responder, get, post, web};
use uuid::Uuid;

#[derive(Debug)]
pub enum ClientRoute {
    /// Create a new client
    CreateClient,
    /// Get a client
    GetClient,
}

impl HttpServiceFactory for ClientRoute {
    fn register(self, config: &mut actix_web::dev::AppService) {
        match self {
            Self::CreateClient => create_client.register(config),
            Self::GetClient => get_client.register(config),
        }
    }
}

#[post("/client")]
async fn create_client(
    web::ThinData(db): web::ThinData<MemoryDB>,
    web::ThinData(provider): web::ThinData<xbyte_evm::Client>,
    web::Json(data): web::Json<Client>,
) -> impl Responder {
    // Create a new client
    let client = Client::new(data.name, data.wallet);

    // Insert to DB
    if let Err(error) = db.set_client(client.id.unwrap(), client.clone()) {
        tracing::error!(?error, ?client, "Failed to create client");
        return ResultAPI::failure("Failed to create client");
    }

    let factory = xbyte_evm::Factory::new(provider);
    let address = factory.compute_vault_address_sync(data.wallet);
    tracing::info!(?address, ?data.wallet, "Vault address computed");

    ResultAPI::okay(client)
}

#[get("/client/{id}")]
async fn get_client(id: web::Path<Uuid>, db: web::ThinData<MemoryDB>) -> impl Responder {
    // Get the client
    match db.get_client(&id) {
        Ok(client) => ResultAPI::okay(client),
        Err(error) => {
            tracing::error!(?error, ?id, "Failed to get client");
            ResultAPI::failure("Client does not exist")
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::{App, http::StatusCode, test, web::ThinData};
    use alloy_primitives::address;

    #[actix_web::test]
    async fn test_create_client_api() -> anyhow::Result<()> {
        // Run the server
        let provider = ThinData(xbyte_evm::Client::new("https://sepolia.base.org")?);
        let db = ThinData(MemoryDB::default());
        let app = App::new()
            .app_data(db.clone())
            .app_data(provider)
            .service(create_client);
        let server = test::init_service(app).await;

        // Create a new client
        let name = "platformA";
        let wallet = address!("0xc0ffee1234567890123456789012345678901234");
        let client = Client::new(name, wallet);

        // Request & Response
        let req = test::TestRequest::post()
            .uri("/client")
            .set_json(&client)
            .to_request();

        let res: ResultAPI<Client, ()> = test::call_and_read_body_json(&server, req).await;
        assert_eq!(res.get_status(), StatusCode::OK);
        let body = res.get_data().unwrap();

        // Verify the data
        let data = db.get_client(&body.id.unwrap())?;
        assert_eq!(data.id, body.id);
        assert_eq!(data.name, name);
        assert_eq!(data.name, body.name);
        assert_eq!(data.wallet, wallet);
        assert_eq!(data.wallet, body.wallet);
        Ok(())
    }

    #[actix_web::test]
    async fn test_get_client_api() -> anyhow::Result<()> {
        // Run the server
        let db = ThinData(MemoryDB::default());
        let app = App::new().app_data(db.clone()).service(get_client);
        let server = test::init_service(app).await;

        // Create a new client
        let name = String::from("platformA");
        let wallet = address!("0xc0ffee1234567890123456789012345678901234");
        let client = Client::new(name.clone(), wallet);

        // Insert to DB
        db.set_client(client.id.unwrap(), client.clone())?;

        // Request & Response
        let url = format!("/client/{}", client.id.as_ref().unwrap());
        let req = test::TestRequest::get().uri(&url).to_request();
        let res: ResultAPI<Client, ()> = test::call_and_read_body_json(&server, req).await;
        assert_eq!(res.get_status(), StatusCode::OK);

        // Verify the data
        let body = res.get_data().unwrap();
        assert_eq!(body.id, client.id);
        assert_eq!(body.name, name);
        assert_eq!(body.wallet, wallet);
        Ok(())
    }
}
