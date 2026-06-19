const mlConfig = require('../config/mlConfig');

/**
 * POST variant payload to Python/FastAPI ML service when ML_SERVICE_URL is configured.
 */
async function postMlPredict(model, variantPayload) {
  const base = mlConfig.mlServiceUrl.replace(/\/$/, '');
  const url = `${base}/predict/${model}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rsid: variantPayload.rsid,
      variant: variantPayload,
      model,
    }),
    signal: AbortSignal.timeout(30000),
  });

  let body;
  try {
    body = await response.json();
  } catch {
    body = {};
  }

  if (!response.ok) {
    const message =
      body.detail || body.message || `ML service returned ${response.status}`;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  return body;
}

module.exports = { postMlPredict };
