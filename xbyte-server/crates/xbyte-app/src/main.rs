use xbyte_api::Server;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize Logging
    tracing_subscriber::fmt::fmt()
        .with_env_filter("xbyte_api=debug,xbyte_app=debug")
        .init();

    #[cfg(debug_assertions)]
    dotenv::dotenv().ok();

    // Start the API server
    let server = Server::new("127.0.0.1:80");
    server.run().await?;

    Ok(())
}
