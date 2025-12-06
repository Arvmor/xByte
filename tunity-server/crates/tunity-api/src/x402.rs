use base64::{Engine, engine::general_purpose};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::future::{Ready, ready};
use url::Url;

/// The URL of the X402 facilitator
const FACILITATOR_URL: &str = "https://www.x402.org/facilitator";

/// The configuration for the X402 state
pub struct ConfigX402<S> {
    pub scheme: S,
    pub payment_address: S,
    pub token: S,
    pub network: S,
    pub mime_type: S,
    pub extra: HashMap<S, S>,
}

impl ConfigX402<&'static str> {
    /// Build a new ConfigX402
    pub fn build() -> Self {
        let scheme = "exact";
        let payment_address = "0xaeeb8456f598F7242Ed32bC9658BA20f6B4557fd";
        let token = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
        let network = "base-sepolia";
        let mime_type = "application/json";
        let extra = HashMap::from([("name", "USDC"), ("version", "2")]);

        Self {
            scheme,
            payment_address,
            token,
            network,
            mime_type,
            extra,
        }
    }
}

/// The payment request from x402 server
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaymentRequest<S, T> {
    pub scheme: S,
    pub network: S,
    pub max_amount_required: T,
    pub resource: Url,
    pub description: Option<S>,
    pub mime_type: S,
    pub pay_to: S,
    pub max_timeout_seconds: u64,
    pub extra: HashMap<S, S>,
    pub asset: S,
}

impl<S, T> PaymentRequest<S, T>
where
    S: AsRef<str> + Copy,
{
    /// Create a new PaymentRequest
    pub fn new(
        config: &ConfigX402<S>,
        max_amount_required: T,
        description: S,
        resource: Url,
    ) -> Self {
        Self {
            scheme: config.scheme,
            network: config.network,
            max_amount_required,
            resource,
            description: Some(description),
            mime_type: config.mime_type,
            pay_to: config.payment_address,
            max_timeout_seconds: 60,
            asset: config.token,
            extra: config.extra.clone(),
        }
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct X402Response<S, T> {
    pub x402_version: u32,
    pub accepts: Vec<PaymentRequest<S, T>>,
}

impl<S: Copy, T: Clone> X402Response<S, T> {
    /// Create a new X402Response
    pub fn new(payment_requests: &[PaymentRequest<S, T>]) -> Self {
        let x402_version = 1;
        let accepts = payment_requests.to_vec();

        Self {
            x402_version,
            accepts,
        }
    }
}

/// The response from the x402 facilitator
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FacilitatorResponse {
    pub success: Option<bool>,
    pub is_valid: Option<bool>,
    pub network: Option<String>,
    pub transaction: Option<String>,
    pub payer: Option<String>,
    pub error_reason: Option<String>,
}

impl FacilitatorResponse {
    /// Check if the response is valid
    pub fn is_valid(&self) -> bool {
        matches!(
            (self.success, self.is_valid),
            (Some(true), _) | (_, Some(true))
        )
    }
}

/// The request to the x402 facilitator
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FacilitatorRequest<S, T> {
    pub x402_version: u32,
    pub payment_payload: PaymentExtractor,
    pub payment_requirements: PaymentRequest<S, T>,
}

impl<S: Copy + Serialize, T: Clone + Serialize> FacilitatorRequest<S, T> {
    /// Create a new FacilitatorRequest
    pub fn new(
        payment_payload: PaymentExtractor,
        payment_requirements: PaymentRequest<S, T>,
    ) -> Self {
        Self {
            x402_version: payment_payload.x402_version,
            payment_payload,
            payment_requirements,
        }
    }
    /// Verify the payment
    pub fn verify(&self) -> anyhow::Result<FacilitatorResponse> {
        let url = format!("{FACILITATOR_URL}/verify");
        let response = ureq::post(&url).send_json(self)?;
        Ok(response.into_body().read_json()?)
    }
    /// Settle the payment
    pub fn settle(&self) -> anyhow::Result<FacilitatorResponse> {
        let url = format!("{FACILITATOR_URL}/settle");
        let response = ureq::post(&url).send_json(self)?;
        Ok(response.into_body().read_json()?)
    }
}

/// The payment extractor from the client
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PaymentExtractor {
    pub x402_version: u32,
    pub scheme: String,
    pub network: String,
    pub payload: PaymentPayload,
}

/// The payment payload received from the client
#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaymentPayload {
    pub signature: String,
    pub authorization: PaymentAuthorization,
}

/// The payment authorization received from the client
#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaymentAuthorization {
    pub from: String,
    pub to: String,
    pub value: String,
    pub valid_after: String,
    pub valid_before: String,
    pub nonce: String,
}

impl actix_web::FromRequest for PaymentExtractor {
    type Error = actix_web::Error;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(req: &actix_web::HttpRequest, _: &mut actix_web::dev::Payload) -> Self::Future {
        // Get payment authorization header
        let Some(header_value) = req.headers().get("X-Payment") else {
            let error = actix_web::error::ErrorPaymentRequired("Missing X-Payment header");
            return ready(Err(error));
        };

        let Ok(bytes) = general_purpose::STANDARD.decode(header_value) else {
            let error = actix_web::error::ErrorPaymentRequired("Invalid X-Payment Encoding");
            return ready(Err(error));
        };

        let Ok(authorization) = serde_json::from_slice(&bytes) else {
            let error = actix_web::error::ErrorPaymentRequired("Invalid X-Payment value");
            return ready(Err(error));
        };

        ready(Ok(authorization))
    }
}
