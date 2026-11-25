import test from "node:test";
import assert from "node:assert/strict";

const URL = "http://127.0.0.1:3000/api/triage";

async function triage(text) {
  return fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
}

const failureCases = [
  "[timeout]",
  "[error]",
  "[bad-json]",
  "[bad-topic]",
  "[empty-draft]",
];

for (const failure of failureCases) {
  test(`Manual review: ${failure}`, async () => {
    const response = await triage(failure);

    assert.equal(response.status, 200);

    assert.deepEqual(await response.json(), {
      status: "manual_review",
      topic: null,
      draft: null,
    });
  });
}

test("Empty input", async () => {
  const response = await triage("   ");

  assert.equal(response.status, 400);

  assert.deepEqual(await response.json(), {
    status: "invalid_input",
  });
});

test("Successful response", async () => {
  const response = await triage("Когда будет доставка?");
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.status, "ready");
  assert.equal(data.topic, "delivery");
  assert.equal(typeof data.draft, "string");
  assert.ok(data.draft.trim());
});
