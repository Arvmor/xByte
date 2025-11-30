use base64::{Engine, engine::general_purpose};
use openlibx402_actix::{X402Config, X402State};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::future::{Ready, ready};

/// The URL of the X402 facilitator
const FACILITATOR_URL: &str = "https://www.x402.org/facilitator";

/// The configuration for the X402 state
pub struct ConfigX402(X402State);

impl ConfigX402 {
    /// Build a new ConfigX402
    pub fn build() -> Self {
        let config = X402Config {
            payment_address: "0xaeeb8456f598F7242Ed32bC9658BA20f6B4557fd".to_string(),
            token_mint: "0x036CbD53842c5426634e7929541eC2318f3dCF7e".to_string(),
            network: "base-sepolia".to_string(),
            rpc_url: Some("https://public.pimlico.io/v2/84532/rpc".to_string()),
            auto_verify: true,
        };

        Self(X402State { config })
    }
}

impl std::ops::Deref for ConfigX402 {
    type Target = X402State;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

/// The payment request from x402 server
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaymentRequest {
    pub scheme: String,
    pub network: String,
    pub max_amount_required: String,
    pub resource: String,
    pub description: Option<String>,
    pub mime_type: String,
    pub pay_to: String,
    pub max_timeout_seconds: u64,
    pub extra: HashMap<&'static str, &'static str>,
    pub asset: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct X402Response {
    pub x402_version: u32,
    pub accepts: Vec<PaymentRequest>,
}

impl From<(X402Config, openlibx402_core::models::PaymentRequest)> for X402Response {
    fn from(
        (config, payment_request): (X402Config, openlibx402_core::models::PaymentRequest),
    ) -> Self {
        let payment_request = PaymentRequest {
            scheme: "exact".to_string(),
            network: config.network.clone(),
            max_amount_required: payment_request.max_amount_required,
            resource: payment_request.resource,
            description: payment_request.description,
            mime_type: "application/json".to_string(),
            pay_to: config.payment_address,
            max_timeout_seconds: 60,
            asset: config.token_mint,
            extra: HashMap::from([("name", "USDC"), ("version", "2")]),
        };

        Self {
            x402_version: 1,
            accepts: vec![payment_request],
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

/// The request to the x402 facilitator
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FacilitatorRequest {
    pub x402_version: u32,
    pub payment_payload: PaymentExtractor,
    pub payment_requirements: PaymentRequest,
}

impl FacilitatorRequest {
    /// Create a new FacilitatorRequest
    pub fn new(payment_payload: PaymentExtractor, payment_requirements: PaymentRequest) -> Self {
        Self {
            x402_version: payment_payload.x402_version,
            payment_payload: payment_payload,
            payment_requirements,
        }
    }
    /// Verify the payment
    pub fn verify(&self) -> anyhow::Result<FacilitatorResponse> {
        let url = format!("{FACILITATOR_URL}/verify");
        let response = ureq::post(&url).send_json(self)?;
        Ok(response.into_json()?)
    }
    /// Settle the payment
    pub fn settle(&self) -> anyhow::Result<FacilitatorResponse> {
        let url = format!("{FACILITATOR_URL}/settle");
        let response = ureq::post(&url).send_json(self)?;
        Ok(response.into_json()?)
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
