use crate::{Client, Database, MemoryDB, ResultAPI};
use actix_web::dev::HttpServiceFactory;
use actix_web::{Responder, post, web};

#[derive(Debug)]
pub enum ClientRoute {
    /// Create a new client
    CreateClient,
}

impl HttpServiceFactory for ClientRoute {
    fn register(self, config: &mut actix_web::dev::AppService) {
        match self {
            Self::CreateClient => create_client.register(config),
        }
    }
}

#[post("/client")]
async fn create_client(
    web::ThinData(db): web::ThinData<MemoryDB>,
    web::Json(data): web::Json<Client>,
) -> impl Responder {
    // Create a new client
    let client = Client::new(data.name, data.wallet);

    // Insert to DB
    if let Err(error) = db.set_client(client.id.unwrap(), client.clone()) {
        tracing::error!(?error, ?client, "Failed to create client");
        return ResultAPI::failure("Failed to create client");
    }

    ResultAPI::okay(client)
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::{App, http::StatusCode, test, web::ThinData};
    use alloy_primitives::address;

    #[actix_web::test]
    async fn test_create_client_api() -> anyhow::Result<()> {
        // Run the server
        let db = ThinData(MemoryDB::default());
        let app = App::new().app_data(db.clone()).service(create_client);
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
}
