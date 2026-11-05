// One-time mailbox for QR login. Stores an opaque ciphertext for a few minutes;
// the decryption key never reaches this service. Reading deletes the entry.
import { DynamoDBClient, PutItemCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";

const db = new DynamoDBClient({});
const TableName = process.env.TABLE;
const TTL_SECONDS = 180;
const MAX_BODY = 16 * 1024;

const reply = (statusCode, body) => ({
  statusCode,
  headers: { "content-type": "application/json", "cache-control": "no-store" },
  body: body === undefined ? "" : JSON.stringify(body),
});

export const handler = async (event) => {
  const id = event.rawPath.match(/^\/s\/([0-9a-f]{32})$/)?.[1];
  if (!id) return reply(404, { error: "not found" });
  const method = event.requestContext.http.method;

  if (method === "PUT") {
    const body = event.isBase64Encoded
      ? Buffer.from(event.body || "", "base64").toString("utf8")
      : event.body || "";
    if (!body || body.length > MAX_BODY) return reply(413, { error: "bad size" });
    try {
      await db.send(new PutItemCommand({
        TableName,
        Item: {
          id: { S: id },
          payload: { S: body },
          ttl: { N: String(Math.floor(Date.now() / 1000) + TTL_SECONDS) },
        },
        ConditionExpression: "attribute_not_exists(id)",
      }));
    } catch (e) {
      if (e.name === "ConditionalCheckFailedException") return reply(409, { error: "already used" });
      throw e;
    }
    return reply(201, { ok: true });
  }

  if (method === "GET") {
    const { Attributes: item } = await db.send(new DeleteItemCommand({
      TableName, Key: { id: { S: id } }, ReturnValues: "ALL_OLD",
    }));
    const live = item && Number(item.ttl.N) > Date.now() / 1000;
    return live ? reply(200, { payload: item.payload.S }) : reply(204);
  }

  return reply(405, { error: "method not allowed" });
};
