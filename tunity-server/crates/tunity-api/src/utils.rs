use serde::Serialize;

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

impl<D, E> actix_web::Responder for ResultAPI<D, E>
where
    D: Serialize,
    E: Serialize,
{
    type Body = actix_web::body::BoxBody;

    fn respond_to(self, req: &actix_web::HttpRequest) -> actix_web::HttpResponse<Self::Body> {
        actix_web::HttpResponse::Ok().json(self).respond_to(req)
    }
}
