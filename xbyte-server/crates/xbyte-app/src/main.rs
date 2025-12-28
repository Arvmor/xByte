use xbyte_api::Server;

const SERVER_ADDR: &str = "127.0.0.1:80";
const RPC_URL: &str = "https://sepolia.base.org";

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize Logging
    tracing_subscriber::fmt::fmt()
        .with_env_filter("xbyte_api=debug,xbyte_app=debug")
        .init();

    #[cfg(debug_assertions)]
    dotenv::dotenv().ok();

    // Start the API server
    let server = Server::new(SERVER_ADDR, RPC_URL);
    server.run().await?;

    Ok(())
}
