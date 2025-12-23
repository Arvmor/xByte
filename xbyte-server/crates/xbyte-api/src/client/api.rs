use crate::{Client, ResultAPI};
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
async fn create_client(data: web::Json<Client>) -> impl Responder {
    ResultAPI::success(data)
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::{App, http::StatusCode, test};
    use alloy_primitives::address;

    #[actix_web::test]
    async fn test_create_client_api() -> anyhow::Result<()> {
        // Run the server
        let app = App::new().service(create_client);
        let server = test::init_service(app).await;

        // Create a new client
        let name = "platformA";
        let wallet = address!("0xc0ffee1234567890123456789012345678901234");
        let client = Client::new(name, wallet);

        let req = test::TestRequest::post()
            .uri("/client")
            .set_json(&client)
            .to_request();

        // Response
        let res: ResultAPI<Client, ()> = test::call_and_read_body_json(&server, req).await;
        let data = res.get_data().unwrap();

        assert_eq!(res.get_status(), StatusCode::OK);
        assert_eq!(data.name, client.name);
        assert_eq!(data.wallet, client.wallet);
        assert_eq!(data.id, client.id);
        Ok(())
    }
}
