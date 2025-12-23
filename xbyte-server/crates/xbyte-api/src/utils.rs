use actix_web::http::StatusCode;
use serde::{Deserialize, Serialize};

/// The version of the API
pub const API_VERSION: &str = std::env!("CARGO_PKG_VERSION");
/// One MB in bytes
pub const ONE_MEGA_BYTE: u64 = 1024 * 1024;

/// The result of an API call
#[derive(Debug, Serialize, Deserialize)]
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
    /// Create a Ok result
    pub fn okay(data: D) -> Self {
        Self::Success(data)
    }
    /// Create an error result
    pub fn failure(error: E) -> Self {
        Self::Error(error)
    }
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
    /// Get the data
    pub fn get_data(&self) -> Option<&D> {
        match self {
            Self::Success(d) => Some(d),
            Self::Error(_) => None,
            Self::PaymentRequired(_) => None,
        }
    }
    /// Get the error
    pub fn get_error(&self) -> Option<&E> {
        match self {
            Self::Success(_) => None,
            Self::Error(e) => Some(e),
            Self::PaymentRequired(e) => Some(e),
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

/// Calculate the price for a given length
pub fn calculate_price(price: f32, length: f32) -> u64 {
    let price_per_mb = length / ONE_MEGA_BYTE as f32;
    (price * price_per_mb) as u64
}

/// Calculate the range header for a given offset and length
pub fn calculate_range_header(offset: u64, len: u64) -> Option<String> {
    let end = offset.checked_add(len)?.checked_sub(1)?;
    let range = format!("bytes={offset}-{end}");

    Some(range)
}
