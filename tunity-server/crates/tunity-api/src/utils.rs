use actix_web::http::StatusCode;
use serde::Serialize;
use std::io::{BufReader, Read, Seek, SeekFrom};
use std::path::Path;

/// The version of the API
pub const API_VERSION: &str = std::env!("CARGO_PKG_VERSION");

/// The result of an API call
#[derive(Debug, Serialize)]
#[serde(tag = "status", content = "data")]
pub enum ResultAPI<D, E> {
    /// The result is successful
    Success(D),
    /// The result is an error
    Error(E),
    /// The result is a payment required
    #[serde(untagged)]
    PaymentRequired(E),
}

impl<D> ResultAPI<D, ()> {
    /// Create a successful result
    pub fn success(data: D) -> Self {
        Self::Success(data)
    }
}

impl<E> ResultAPI<(), E> {
    /// Create an error result
    pub fn error(error: E) -> Self {
        Self::Error(error)
    }
}

impl<D, E> ResultAPI<D, E> {
    /// Create a successful result
    pub fn verified_payment(data: D) -> Self {
        Self::Success(data)
    }
    /// Create a payment required result
    pub fn payment_required(payment: E) -> Self {
        Self::PaymentRequired(payment)
    }
    /// Get Status Code
    pub fn get_status(&self) -> StatusCode {
        match self {
            Self::Success(_) => StatusCode::OK,
            Self::Error(_) => StatusCode::BAD_REQUEST,
            Self::PaymentRequired(_) => StatusCode::PAYMENT_REQUIRED,
        }
    }
}

impl<D, E> actix_web::Responder for ResultAPI<D, E>
where
    D: Serialize,
    E: Serialize,
{
    type Body = actix_web::body::BoxBody;

    fn respond_to(self, req: &actix_web::HttpRequest) -> actix_web::HttpResponse<Self::Body> {
        actix_web::HttpResponseBuilder::new(self.get_status())
            .json(self)
            .respond_to(req)
    }
}

/// Get a chunk of data from a file
pub fn get_chunk<F: AsRef<Path>>(file: F, offset: u64, length: usize) -> anyhow::Result<Vec<u8>> {
    let file = std::fs::File::open(file)?;
    let mut reader = BufReader::new(file);

    reader.seek(SeekFrom::Start(offset))?;
    let mut bytes = vec![0u8; length];
    reader.read_exact(&mut bytes)?;

    Ok(bytes)
}
