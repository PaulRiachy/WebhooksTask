# Node.js Webhooks Exercise

Two Express applications communicate using a webhook.

## Applications

* App A — Order System: port 3000
* App B — Notification System: port 4000
* MongoDB is used by both applications.

## Flow

```text
Postman
   |
   v
POST /orders
   |
   v
App A
   |
   | webhook
   v
App B
   |
   v
MongoDB
```

## App A

POST http://localhost:3000/orders

Example body:

```json
{
  "customer": "Elie",
  "amount": 50
}
```

The order is saved to MongoDB and App A automatically sends an order.created webhook to App B.

## App B

POST /webhook/order-created

App B receives the webhook, logs it, verifies its signature, and stores the event in MongoDB.

## Retry

App A attempts webhook delivery up to 3 times.

If App B is offline:

```text
Webhook attempt 1 failed
Webhook attempt 2 failed
Webhook attempt 3 failed
Webhook delivery failed after 3 attempts
```

If delivery succeeds:

```text
Webhook attempt 1
Webhook delivered successfully
```

## Security

App A signs each webhook using HMAC-SHA256.

App B verifies the x-webhook-signature header and rejects invalid signatures with HTTP 401.

## Testing

1. Start MongoDB.
2. Start App A on port 3000.
3. Start App B on port 4000.
4. Use Postman to call POST /orders on App A.
5. Verify that App A saves the order.
6. Verify that App B automatically receives and stores the webhook.
7. Create several orders and verify each event.
8. Stop App B and create an order to test the 3 retry attempts.
9. Test an invalid signature and verify the 401 response.

## Questions

### 1. What is a webhook?

A webhook is an automatic HTTP request sent from one application to another when an event occurs.

### 2. What event triggers the webhook?

Creating an order triggers the `order.created` webhook.

### 3. What is the difference between a normal API request and a webhook?

A normal API request is made when a client asks for something. A webhook is automatically sent by the server when a specific event occurs.

### 4. Why do webhook systems need retry logic?

The receiving application may temporarily be offline or unavailable. Retries give the webhook another chance to be delivered.

### 5. What happens if App B is offline?

App A fails to deliver the webhook, retries up to 3 times, and logs the failure if all attempts fail.

### 6. Why should a webhook have a secret or signature?

A signature allows the receiving application to verify that the webhook came from a trusted sender and was not modified.
