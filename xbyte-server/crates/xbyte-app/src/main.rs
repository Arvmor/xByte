use xbyte_api::Server;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize Logging
    tracing_subscriber::fmt::fmt()
        .with_env_filter("xbyte_api=debug,xbyte_app=debug")
        .init();

    #[cfg(debug_assertions)]
    dotenv::dotenv().ok();

    let rpc_url = std::env::var("RPC_URL").expect("ENV Variable RPC_URL is not set");
    let server_addr = std::env::var("SERVER_ADDR").expect("ENV Variable SERVER_ADDR is not set");

    // Start the API server
    let server = Server::new(server_addr, rpc_url);
    server.run().await?;

    Ok(())
}
